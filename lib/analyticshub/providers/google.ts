/**
 * Analytics Hub — Google provider (GA4 + Search Console).
 *
 * Server-only. Every third-party call is a raw `fetch` (no googleapis SDK); the
 * only crypto is node:crypto for signing the service-account RS256 JWT. Two auth
 * paths are supported and mutually exclusive at connect time:
 *   - OAuth (offline refresh_token) — for a human granting access.
 *   - Service account (JWT-bearer) — for headless / shared access.
 *
 * Secrets (OAuth tokens, the SA private key) are persisted only through the
 * AES-encrypting store under `google:*` keys — never logged, never returned.
 * Client input (property ids, site urls, uploaded SA JSON, date ranges) is
 * validated at the boundary and re-validated with a live 1-row probe before we
 * persist a connection. Anything ambiguous fails closed.
 */
import 'server-only';
import { createSign } from 'node:crypto';

import { getJSON, setJSON, getValue, setValue, delValue } from '@/lib/analyticshub/store';
import {
  emptyResult,
  type ConnectionState,
  type DetailTable,
  type SeriesPoint,
  type SourceResult,
} from '@/lib/analyticshub/types';

// ── Constants ────────────────────────────────────────────────────────────────

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const SCOPES = [
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/webmasters.readonly',
].join(' ');

const K_TOKENS = 'google:tokens';
const K_CONN = 'google:conn';
const K_SA = 'google:sa';

// Refresh a little before actual expiry to avoid edge-of-expiry 401s.
const EXPIRY_SKEW_MS = 60_000;
// Guard against a pathological date range producing an unbounded loop.
const MAX_RANGE_DAYS = 400;

// ── Persisted / in-memory shapes ─────────────────────────────────────────────

interface Tokens {
  refresh_token?: string;
  access_token?: string;
  expiry?: number; // epoch ms
}

interface GoogleConn {
  mode?: 'oauth' | 'sa';
  propertyId?: string; // 'properties/123456' or '123456'
  siteUrl?: string;
  ga4Label?: string;
  gscLabel?: string;
  reconnectNeeded?: boolean;
}

interface ServiceAccount {
  client_email: string;
  private_key: string;
  token_uri?: string;
  type?: string;
  project_id?: string;
}

interface TokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

// GA4 Data API
interface RunReportResponse {
  rows?: { dimensionValues?: { value?: string }[]; metricValues?: { value?: string }[] }[];
  totals?: { metricValues?: { value?: string }[] }[];
}

// GA4 Admin API
interface AccountSummariesResponse {
  accountSummaries?: {
    propertySummaries?: { property?: string; displayName?: string }[];
  }[];
}

// Search Console (webmasters v3)
interface SitesResponse {
  siteEntry?: { siteUrl?: string }[];
}
interface SearchAnalyticsResponse {
  rows?: { keys?: string[]; clicks?: number; impressions?: number; ctr?: number; position?: number }[];
}

// In-memory SA access-token cache (survives within a warm lambda only).
let saTokenCache: { token: string; expiry: number; email: string } | null = null;

// ── Small helpers ────────────────────────────────────────────────────────────

function optStr(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  return t.length ? t : undefined;
}

function redirectUri(origin: string): string {
  return `${origin}/api/analyticshub/oauth/google/callback`;
}

/** Strip the `properties/` prefix so we can build report/list URLs uniformly. */
function propertyNumericId(propertyId: string): string {
  return propertyId.replace(/^properties\//, '').trim();
}

function isIsoDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

/** Validate + normalize a caller-supplied date window; fail closed on garbage. */
function assertRange(from: string, to: string): void {
  if (!isIsoDate(from) || !isIsoDate(to)) {
    throw new Error('Invalid date range: expected YYYY-MM-DD values.');
  }
}

/** Inclusive list of YYYY-MM-DD dates, for zero-filling gaps. */
function dateRange(from: string, to: string): string[] {
  const out: string[] = [];
  const start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return out;
  const cursor = new Date(start);
  for (let i = 0; cursor <= end && i < MAX_RANGE_DAYS; i += 1) {
    out.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return out;
}

/** GA4 returns dates as `YYYYMMDD`; normalize to `YYYY-MM-DD`. */
function ga4Date(v: string): string {
  return /^\d{8}$/.test(v) ? `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}` : v;
}

function b64url(input: Buffer | string): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input;
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Extract a human message from a Google error body without leaking internals. */
function extractError(data: unknown, status: number): string {
  if (data && typeof data === 'object') {
    const d = data as { error?: unknown; error_description?: string };
    if (typeof d.error_description === 'string') return d.error_description;
    const err = d.error;
    if (typeof err === 'string') return err;
    if (err && typeof err === 'object') {
      const m = (err as { message?: unknown }).message;
      if (typeof m === 'string') return m;
    }
  }
  return `Google API request failed (HTTP ${status}).`;
}

async function getConn(): Promise<GoogleConn> {
  return (await getJSON<GoogleConn>(K_CONN)) ?? {};
}

async function markReconnect(): Promise<void> {
  const conn = await getConn();
  await setJSON(K_CONN, { ...conn, reconnectNeeded: true });
}

// ── Token endpoint (no auth header) ──────────────────────────────────────────

async function tokenEndpoint(params: URLSearchParams): Promise<{ ok: boolean; data: TokenResponse }> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: params.toString(),
  });
  const text = await res.text();
  let data: TokenResponse = {};
  if (text) {
    try {
      data = JSON.parse(text) as TokenResponse;
    } catch {
      data = { error: 'invalid_response', error_description: `HTTP ${res.status}` };
    }
  }
  return { ok: res.ok, data };
}

// ── Access-token acquisition ─────────────────────────────────────────────────

/** Sign the RS256 assertion for the JWT-bearer grant. */
function signSaJwt(sa: ServiceAccount): string {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: sa.client_email,
    scope: SCOPES,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  };
  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claim))}`;
  const signer = createSign('RSA-SHA256');
  signer.update(signingInput);
  signer.end();
  const signature = signer.sign(sa.private_key);
  return `${signingInput}.${b64url(signature)}`;
}

async function getServiceAccountToken(sa: ServiceAccount): Promise<string> {
  const now = Date.now();
  if (saTokenCache && saTokenCache.email === sa.client_email && saTokenCache.expiry - EXPIRY_SKEW_MS > now) {
    return saTokenCache.token;
  }
  const params = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: signSaJwt(sa),
  });
  const { ok, data } = await tokenEndpoint(params);
  if (!ok || !data.access_token) {
    throw new Error(data.error_description || data.error || 'Service account authentication failed.');
  }
  saTokenCache = {
    token: data.access_token,
    expiry: now + (data.expires_in ?? 3600) * 1000,
    email: sa.client_email,
  };
  return data.access_token;
}

async function getOAuthToken(): Promise<string> {
  const tokens = await getJSON<Tokens>(K_TOKENS);
  if (!tokens || (!tokens.access_token && !tokens.refresh_token)) {
    throw new Error('Google is not connected. Complete the OAuth connection first.');
  }
  if (tokens.access_token && tokens.expiry && tokens.expiry - EXPIRY_SKEW_MS > Date.now()) {
    return tokens.access_token;
  }
  if (!tokens.refresh_token) {
    await markReconnect();
    throw new Error('Google session expired. Reconnect Google to continue.');
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth is not configured (GOOGLE_OAUTH_CLIENT_ID/SECRET missing).');
  }

  const { ok, data } = await tokenEndpoint(
    new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: tokens.refresh_token,
    }),
  );
  if (!ok || !data.access_token) {
    if (data.error === 'invalid_grant') {
      await markReconnect();
      throw new Error('Google authorization was revoked or expired. Reconnect Google to continue.');
    }
    throw new Error(data.error_description || data.error || 'Failed to refresh Google access token.');
  }
  await setJSON(K_TOKENS, {
    refresh_token: tokens.refresh_token, // Google does not re-issue this on refresh
    access_token: data.access_token,
    expiry: Date.now() + (data.expires_in ?? 3600) * 1000,
  } satisfies Tokens);
  return data.access_token;
}

/** A valid access token for whichever credential is configured (SA preferred). */
async function getAccessToken(): Promise<string> {
  const sa = await getJSON<ServiceAccount>(K_SA);
  if (sa?.client_email && sa.private_key) return getServiceAccountToken(sa);
  return getOAuthToken();
}

// ── Authenticated Google API fetch ───────────────────────────────────────────

async function gfetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  };
  if (init.body) headers['Content-Type'] = 'application/json';
  const res = await fetch(url, { ...init, headers: { ...headers, ...(init.headers as Record<string, string> | undefined) } });
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) throw new Error(extractError(data, res.status));
  return data as T;
}

// ── OAuth ────────────────────────────────────────────────────────────────────

export function oauthStartUrl(origin: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID ?? '',
    redirect_uri: redirectUri(origin),
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export async function handleCallback(code: string, origin: string): Promise<void> {
  const trimmed = optStr(code);
  if (!trimmed) throw new Error('Missing authorization code.');

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth is not configured (GOOGLE_OAUTH_CLIENT_ID/SECRET missing).');
  }

  const { ok, data } = await tokenEndpoint(
    new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code: trimmed,
      redirect_uri: redirectUri(origin),
    }),
  );
  if (!ok || !data.access_token) {
    throw new Error(data.error_description || data.error || 'Google token exchange failed.');
  }

  const prev = await getJSON<Tokens>(K_TOKENS);
  await setJSON(K_TOKENS, {
    // Preserve an existing refresh_token when Google omits one on re-grant.
    refresh_token: data.refresh_token ?? prev?.refresh_token,
    access_token: data.access_token,
    expiry: Date.now() + (data.expires_in ?? 3600) * 1000,
  } satisfies Tokens);

  // A fresh grant clears any stale reconnect flag.
  const conn = await getConn();
  if (conn.reconnectNeeded) await setJSON(K_CONN, { ...conn, reconnectNeeded: false });
}

// ── Discovery ────────────────────────────────────────────────────────────────

export async function listOptions(): Promise<{ properties: { id: string; name: string }[]; sites: { url: string }[] }> {
  const summaries = await gfetch<AccountSummariesResponse>(
    'https://analyticsadmin.googleapis.com/v1beta/accountSummaries',
  );
  const properties: { id: string; name: string }[] = [];
  for (const acc of summaries.accountSummaries ?? []) {
    for (const p of acc.propertySummaries ?? []) {
      if (p.property) properties.push({ id: p.property, name: p.displayName ?? p.property });
    }
  }

  const sitesResp = await gfetch<SitesResponse>('https://www.googleapis.com/webmasters/v3/sites');
  const sites: { url: string }[] = [];
  for (const e of sitesResp.siteEntry ?? []) {
    if (e.siteUrl) sites.push({ url: e.siteUrl });
  }

  return { properties, sites };
}

/** Resolve a friendly GA4 property label (falls back to the id). */
async function resolveGA4Label(propertyId: string): Promise<string> {
  try {
    const summaries = await gfetch<AccountSummariesResponse>(
      'https://analyticsadmin.googleapis.com/v1beta/accountSummaries',
    );
    const wantNumeric = propertyNumericId(propertyId);
    for (const acc of summaries.accountSummaries ?? []) {
      for (const p of acc.propertySummaries ?? []) {
        if (p.property && propertyNumericId(p.property) === wantNumeric) {
          return p.displayName ?? propertyId;
        }
      }
    }
  } catch {
    // Non-fatal: label is cosmetic, the probe already proved access.
  }
  return propertyId;
}

// ── Live validation probes (1 row) ───────────────────────────────────────────

async function probeGA4(propertyId: string): Promise<void> {
  const id = propertyNumericId(propertyId);
  if (!/^\d+$/.test(id)) throw new Error('GA4 property id must be numeric (e.g. 123456789 or properties/123456789).');
  await gfetch<RunReportResponse>(`https://analyticsdata.googleapis.com/v1beta/properties/${id}:runReport`, {
    method: 'POST',
    body: JSON.stringify({
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      metrics: [{ name: 'sessions' }],
      limit: '1',
    }),
  });
}

async function probeGSC(siteUrl: string): Promise<void> {
  const end = new Date();
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - 7);
  await gfetch<SearchAnalyticsResponse>(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: 'POST',
      body: JSON.stringify({
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
        dimensions: [],
        rowLimit: 1,
      }),
    },
  );
}

// ── Selection / connection management ────────────────────────────────────────

export async function select(body: Record<string, unknown>): Promise<void> {
  const propertyId = optStr(body.propertyId);
  const siteUrl = optStr(body.siteUrl);
  if (!propertyId && !siteUrl) {
    throw new Error('Choose a GA4 property and/or a Search Console site to connect.');
  }

  const next: GoogleConn = { ...(await getConn()), mode: 'oauth', reconnectNeeded: false };

  if (propertyId) {
    await probeGA4(propertyId); // throws the provider's error verbatim on failure
    next.propertyId = propertyId;
    next.ga4Label = await resolveGA4Label(propertyId);
  }
  if (siteUrl) {
    await probeGSC(siteUrl); // throws verbatim on failure
    next.siteUrl = siteUrl;
    next.gscLabel = siteUrl;
  }

  await setJSON(K_CONN, next);
}

export async function saveServiceAccount(body: Record<string, unknown>): Promise<void> {
  const propertyId = optStr(body.propertyId);
  const siteUrl = optStr(body.siteUrl);
  if (!propertyId && !siteUrl) {
    throw new Error('Choose a GA4 property and/or a Search Console site to connect.');
  }

  // Accept the key as a raw JSON string or an already-parsed object.
  let parsed: unknown = body.keyJson;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      throw new Error('Service account key is not valid JSON.');
    }
  }
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Service account key is missing.');
  }
  const candidate = parsed as Partial<ServiceAccount>;
  if (typeof candidate.client_email !== 'string' || typeof candidate.private_key !== 'string') {
    throw new Error('Service account JSON must include client_email and private_key.');
  }
  const sa: ServiceAccount = {
    client_email: candidate.client_email,
    private_key: candidate.private_key,
    token_uri: candidate.token_uri,
    type: candidate.type,
    project_id: candidate.project_id,
  };

  // Persist the SA so the probes authenticate through it; roll back on failure
  // so a bad key never leaves us in a half-connected state.
  const prevSa = await getValue(K_SA);
  saTokenCache = null;
  await setJSON(K_SA, sa);
  const next: GoogleConn = { ...(await getConn()), mode: 'sa', reconnectNeeded: false };
  try {
    if (propertyId) {
      await probeGA4(propertyId);
      next.propertyId = propertyId;
      next.ga4Label = await resolveGA4Label(propertyId);
    }
    if (siteUrl) {
      await probeGSC(siteUrl);
      next.siteUrl = siteUrl;
      next.gscLabel = siteUrl;
    }
  } catch (e) {
    saTokenCache = null;
    if (prevSa !== null) await setValue(K_SA, prevSa);
    else await delValue(K_SA);
    throw e;
  }

  await setJSON(K_CONN, next);
}

export async function disconnect(): Promise<void> {
  saTokenCache = null;
  await delValue(K_TOKENS);
  await delValue(K_SA);
  await delValue(K_CONN);
}

// ── Connection state ─────────────────────────────────────────────────────────

export async function connectionState(source: 'ga4' | 'gsc'): Promise<ConnectionState> {
  const conn = await getJSON<GoogleConn>(K_CONN);
  if (source === 'ga4') {
    const connected = Boolean(conn?.propertyId);
    return {
      source: 'ga4',
      connected,
      reconnectNeeded: connected ? Boolean(conn?.reconnectNeeded) : false,
      label: connected ? conn?.ga4Label ?? conn?.propertyId : undefined,
    };
  }
  const connected = Boolean(conn?.siteUrl);
  return {
    source: 'gsc',
    connected,
    reconnectNeeded: connected ? Boolean(conn?.reconnectNeeded) : false,
    label: connected ? conn?.gscLabel ?? conn?.siteUrl : undefined,
  };
}

// ── GA4 report ───────────────────────────────────────────────────────────────

// API metric name → normalized output metric name.
const GA4_METRICS: { api: string; out: string }[] = [
  { api: 'sessions', out: 'sessions' },
  { api: 'totalUsers', out: 'totalUsers' },
  { api: 'newUsers', out: 'newUsers' },
  { api: 'engagedSessions', out: 'engagedSessions' },
  { api: 'keyEvents', out: 'keyEvents' },
  { api: 'userEngagementDuration', out: 'engagementTime' },
];

async function ga4DimTable(
  numericId: string,
  dimension: string,
  from: string,
  to: string,
  id: string,
  title: string,
  columnLabel: string,
): Promise<DetailTable> {
  const data = await gfetch<RunReportResponse>(
    `https://analyticsdata.googleapis.com/v1beta/properties/${numericId}:runReport`,
    {
      method: 'POST',
      body: JSON.stringify({
        dateRanges: [{ startDate: from, endDate: to }],
        dimensions: [{ name: dimension }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: '10',
      }),
    },
  );
  const rows: (string | number)[][] = (data.rows ?? []).map((r) => [
    r.dimensionValues?.[0]?.value ?? '(not set)',
    Number(r.metricValues?.[0]?.value ?? 0) || 0,
  ]);
  return { id, title, columns: [columnLabel, 'Sessions'], rows };
}

export async function fetchGA4(from: string, to: string): Promise<SourceResult> {
  const conn = await getConn();
  if (!conn.propertyId) return emptyResult('not_connected');
  if (conn.reconnectNeeded) return emptyResult('reconnect_needed');
  assertRange(from, to);

  const numericId = propertyNumericId(conn.propertyId);
  const report = await gfetch<RunReportResponse>(
    `https://analyticsdata.googleapis.com/v1beta/properties/${numericId}:runReport`,
    {
      method: 'POST',
      body: JSON.stringify({
        dateRanges: [{ startDate: from, endDate: to }],
        dimensions: [{ name: 'date' }],
        metrics: GA4_METRICS.map((m) => ({ name: m.api })),
        metricAggregations: ['TOTAL'],
        orderBys: [{ dimension: { dimensionName: 'date' } }],
        limit: '10000',
      }),
    },
  );

  // metric out-name → date → value
  const byMetric: Record<string, Record<string, number>> = {};
  for (const m of GA4_METRICS) byMetric[m.out] = {};
  for (const row of report.rows ?? []) {
    const date = ga4Date(row.dimensionValues?.[0]?.value ?? '');
    row.metricValues?.forEach((mv, i) => {
      const m = GA4_METRICS[i];
      if (m) byMetric[m.out][date] = Number(mv.value ?? 0) || 0;
    });
  }

  const days = dateRange(from, to);
  const series: SeriesPoint[] = [];
  for (const m of GA4_METRICS) {
    for (const date of days) {
      series.push({ source: 'ga4', metric: m.out, date, value: byMetric[m.out][date] ?? 0 });
    }
  }

  const totalsRow = report.totals?.[0]?.metricValues;
  const totals: Record<string, number> = {};
  GA4_METRICS.forEach((m, i) => {
    const fromApi = totalsRow?.[i]?.value;
    totals[m.out] =
      fromApi != null
        ? Number(fromApi) || 0
        : Object.values(byMetric[m.out]).reduce((a, b) => a + b, 0);
  });

  const [pages, sources] = await Promise.all([
    ga4DimTable(numericId, 'pagePath', from, to, 'ga4-top-pages', 'Top pages', 'Page'),
    ga4DimTable(numericId, 'sessionSource', from, to, 'ga4-top-sources', 'Top sources', 'Source'),
  ]);

  return { status: 'ok', series, totals, detail: [pages, sources] };
}

// ── Search Console report ────────────────────────────────────────────────────

const GSC_METRICS = ['clicks', 'impressions', 'ctr', 'position'] as const;

export async function fetchGSC(from: string, to: string): Promise<SourceResult> {
  const conn = await getConn();
  if (!conn.siteUrl) return emptyResult('not_connected');
  if (conn.reconnectNeeded) return emptyResult('reconnect_needed');
  assertRange(from, to);

  const base = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(conn.siteUrl)}/searchAnalytics/query`;

  const daily = await gfetch<SearchAnalyticsResponse>(base, {
    method: 'POST',
    body: JSON.stringify({ startDate: from, endDate: to, dimensions: ['date'], rowLimit: 1000 }),
  });

  const byMetric: Record<string, Record<string, number>> = {
    clicks: {},
    impressions: {},
    ctr: {},
    position: {},
  };
  for (const row of daily.rows ?? []) {
    const date = row.keys?.[0] ?? '';
    if (!date) continue;
    byMetric.clicks[date] = row.clicks ?? 0;
    byMetric.impressions[date] = row.impressions ?? 0;
    byMetric.ctr[date] = row.ctr ?? 0;
    byMetric.position[date] = row.position ?? 0;
  }

  const days = dateRange(from, to);
  const series: SeriesPoint[] = [];
  for (const metric of GSC_METRICS) {
    for (const date of days) {
      series.push({ source: 'gsc', metric, date, value: byMetric[metric][date] ?? 0 });
    }
  }

  // Totals: sum clicks/impressions; CTR = clicks/impressions; position weighted by impressions.
  let clicks = 0;
  let impressions = 0;
  let weightedPosition = 0;
  for (const date of days) {
    const c = byMetric.clicks[date] ?? 0;
    const imp = byMetric.impressions[date] ?? 0;
    clicks += c;
    impressions += imp;
    weightedPosition += (byMetric.position[date] ?? 0) * imp;
  }
  const totals: Record<string, number> = {
    clicks,
    impressions,
    ctr: impressions > 0 ? clicks / impressions : 0,
    position: impressions > 0 ? weightedPosition / impressions : 0,
  };

  const queries = await gfetch<SearchAnalyticsResponse>(base, {
    method: 'POST',
    body: JSON.stringify({ startDate: from, endDate: to, dimensions: ['query'], rowLimit: 20 }),
  });
  const topQueries: DetailTable = {
    id: 'gsc-top-queries',
    title: 'Top queries',
    columns: ['Query', 'Clicks', 'Impressions', 'CTR', 'Position'],
    rows: (queries.rows ?? []).map((r) => [
      r.keys?.[0] ?? '(unknown)',
      r.clicks ?? 0,
      r.impressions ?? 0,
      `${((r.ctr ?? 0) * 100).toFixed(2)}%`,
      Number((r.position ?? 0).toFixed(1)),
    ]),
  };

  return { status: 'ok', series, totals, detail: [topQueries] };
}
