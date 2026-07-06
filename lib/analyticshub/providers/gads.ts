/**
 * Analytics Hub — Google Ads provider (REST v18, raw fetch only). Advanced /
 * optional: the operator pastes an OAuth client + refresh token + developer
 * token, we mint access tokens on demand.
 *
 * OPTIONAL source: never blocks the hub. Not connected -> emptyResult('not_connected').
 * A dead refresh token (invalid_grant) flips gads:conn.reconnectNeeded and
 * returns emptyResult('reconnect_needed'); only genuine API errors throw (the
 * API handler wraps those to status:'error'). Stores two encrypted keys:
 *   gads:conf -> full credential set
 *   gads:conn -> { customerId, reconnectNeeded? }
 * Server-only — must never reach the client bundle.
 */
import 'server-only';
import { getJSON, setJSON, delValue } from '@/lib/analyticshub/store';
import {
  emptyResult,
  type ConnectionState,
  type SeriesPoint,
  type SourceResult,
} from '@/lib/analyticshub/types';

const OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const ADS_API = 'https://googleads.googleapis.com/v18';

interface GadsConf {
  developerToken: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  customerId: string;
  loginCustomerId?: string;
}
interface GadsConn {
  customerId: string;
  reconnectNeeded?: boolean;
}

interface TokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}
interface GadsApiError {
  error?: { message?: string; status?: string };
}
interface SearchRow {
  segments?: { date?: string };
  metrics?: {
    costMicros?: string;
    impressions?: string;
    clicks?: string;
    conversions?: number | string;
    costPerConversion?: number | string;
  };
}
interface SearchStreamChunk {
  results?: SearchRow[];
}

interface DayAgg {
  cost: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

/** Marker error so fetchGads can turn a dead refresh token into reconnect_needed. */
class InvalidGrantError extends Error {}

// ── helpers ──────────────────────────────────────────────────────────────────

const num = (v: unknown): number => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** Google customer IDs are 10 digits; accept dashed/spaced input, store digits. */
const digitsOnly = (s: string): string => s.replace(/[^0-9]/g, '');

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

/** Inclusive list of YYYY-MM-DD dates from `from` to `to` (UTC), capped. */
function enumerateDates(from: string, to: string): string[] {
  const out: string[] = [];
  const start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return out;
  const cur = new Date(start);
  for (let guard = 0; cur <= end && guard < 400; guard += 1) {
    out.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
}

/**
 * Exchange the refresh token for a short-lived access token. Throws an
 * InvalidGrantError specifically on `invalid_grant` (revoked/expired) so callers
 * can decide reconnect-vs-hard-error; other failures throw a verbatim message.
 */
async function accessToken(conf: GadsConf): Promise<string> {
  const res = await fetch(OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    cache: 'no-store',
    body: new URLSearchParams({
      client_id: conf.clientId,
      client_secret: conf.clientSecret,
      refresh_token: conf.refreshToken,
      grant_type: 'refresh_token',
    }).toString(),
  });
  const body = (await res.json()) as TokenResponse;
  if (!res.ok || !body.access_token) {
    const code = body.error || 'token_refresh_failed';
    const desc = body.error_description ? `: ${body.error_description}` : '';
    const message = `${code}${desc}`;
    if (code === 'invalid_grant') throw new InvalidGrantError(message);
    throw new Error(message);
  }
  return body.access_token;
}

/** Extract a Google Ads REST error message verbatim (best effort). */
function adsErrorMessage(body: unknown): string {
  const e = (body as GadsApiError)?.error;
  if (e?.message) return e.message;
  try {
    return JSON.stringify(body);
  } catch {
    return 'Google Ads API request failed.';
  }
}

/**
 * Run a GAQL query against searchStream and return the concatenated result rows.
 * searchStream returns a JSON array of chunks (each with a `results[]`); on
 * failure it returns an `{ error }` object with a non-2xx status.
 */
async function searchStream(conf: GadsConf, token: string, query: string): Promise<SearchRow[]> {
  const cid = digitsOnly(conf.customerId);
  const headers: Record<string, string> = {
    'developer-token': conf.developerToken,
    Authorization: `Bearer ${token}`,
    'content-type': 'application/json',
  };
  const loginCid = conf.loginCustomerId ? digitsOnly(conf.loginCustomerId) : '';
  if (loginCid) headers['login-customer-id'] = loginCid;

  const res = await fetch(`${ADS_API}/customers/${cid}/googleAds:searchStream`, {
    method: 'POST',
    headers,
    cache: 'no-store',
    body: JSON.stringify({ query }),
  });
  const body = (await res.json()) as SearchStreamChunk[] | GadsApiError;
  if (!res.ok) throw new Error(adsErrorMessage(body));

  const chunks: SearchStreamChunk[] = Array.isArray(body) ? body : [];
  return chunks.flatMap((c) => c.results ?? []);
}

// ── exports ────────────────────────────────────────────────────────────────

export async function connectionState(): Promise<ConnectionState> {
  const conn = await getJSON<GadsConn>('gads:conn');
  if (!conn) {
    return { source: 'gads', connected: false, reconnectNeeded: false };
  }
  return {
    source: 'gads',
    connected: true,
    reconnectNeeded: Boolean(conn.reconnectNeeded),
    label: conn.customerId,
  };
}

/** Validate the full credential set with a 1-row query, then persist. */
export async function save(body: Record<string, unknown>): Promise<void> {
  const conf: GadsConf = {
    developerToken: str(body.developerToken),
    clientId: str(body.clientId),
    clientSecret: str(body.clientSecret),
    refreshToken: str(body.refreshToken),
    customerId: str(body.customerId),
  };
  const loginCustomerId = str(body.loginCustomerId);
  if (loginCustomerId) conf.loginCustomerId = loginCustomerId;

  if (!conf.developerToken) throw new Error('Developer token is required.');
  if (!conf.clientId) throw new Error('OAuth client id is required.');
  if (!conf.clientSecret) throw new Error('OAuth client secret is required.');
  if (!conf.refreshToken) throw new Error('Refresh token is required.');
  if (!digitsOnly(conf.customerId)) throw new Error('Customer id is required (10 digits).');
  if (conf.loginCustomerId && !digitsOnly(conf.loginCustomerId)) {
    throw new Error('Login customer id must be numeric.');
  }

  // Live validation: refresh a token, then run a trivial 1-row query. Any
  // failure (bad developer token, wrong customer, revoked grant) throws verbatim.
  const token = await accessToken(conf);
  await searchStream(conf, token, 'SELECT customer.id FROM customer LIMIT 1');

  await setJSON('gads:conf', conf satisfies GadsConf);
  await setJSON('gads:conn', { customerId: conf.customerId } satisfies GadsConn);
}

export async function disconnect(): Promise<void> {
  await delValue('gads:conf');
  await delValue('gads:conn');
}

export async function fetchGads(from: string, to: string): Promise<SourceResult> {
  const conf = await getJSON<GadsConf>('gads:conf');
  const conn = await getJSON<GadsConn>('gads:conn');
  if (!conf?.refreshToken || !conf.customerId) return emptyResult('not_connected');

  let token: string;
  try {
    token = await accessToken(conf);
  } catch (e) {
    if (e instanceof InvalidGrantError) {
      const base = conn ?? { customerId: conf.customerId };
      await setJSON('gads:conn', { ...base, reconnectNeeded: true } satisfies GadsConn);
      return emptyResult('reconnect_needed');
    }
    throw e; // genuine error -> handler maps to status:'error'
  }

  const query =
    'SELECT segments.date, metrics.cost_micros, metrics.impressions, metrics.clicks, ' +
    'metrics.conversions, metrics.cost_per_conversion FROM customer ' +
    `WHERE segments.date BETWEEN '${from}' AND '${to}'`;
  const rows = await searchStream(conf, token, query);

  const byDay = new Map<string, DayAgg>();
  for (const r of rows) {
    const day = r.segments?.date;
    if (!day) continue;
    const m = r.metrics ?? {};
    const prev = byDay.get(day) ?? { cost: 0, impressions: 0, clicks: 0, conversions: 0 };
    byDay.set(day, {
      cost: prev.cost + num(m.costMicros) / 1e6,
      impressions: prev.impressions + num(m.impressions),
      clicks: prev.clicks + num(m.clicks),
      conversions: prev.conversions + num(m.conversions),
    });
  }

  const series: SeriesPoint[] = [];
  let tCost = 0;
  let tImpr = 0;
  let tClicks = 0;
  let tConv = 0;

  for (const date of enumerateDates(from, to)) {
    const d = byDay.get(date) ?? { cost: 0, impressions: 0, clicks: 0, conversions: 0 };
    const costPerConversion = d.conversions > 0 ? d.cost / d.conversions : 0;

    series.push(
      { source: 'gads', metric: 'cost', date, value: d.cost },
      { source: 'gads', metric: 'impressions', date, value: d.impressions },
      { source: 'gads', metric: 'clicks', date, value: d.clicks },
      { source: 'gads', metric: 'conversions', date, value: d.conversions },
      { source: 'gads', metric: 'costPerConversion', date, value: costPerConversion },
    );

    tCost += d.cost;
    tImpr += d.impressions;
    tClicks += d.clicks;
    tConv += d.conversions;
  }

  const totals: Record<string, number> = {
    cost: tCost,
    impressions: tImpr,
    clicks: tClicks,
    conversions: tConv,
    costPerConversion: tConv > 0 ? tCost / tConv : 0,
  };

  // A successful fetch proves the grant recovered — clear any stale flag.
  if (conn?.reconnectNeeded) {
    await setJSON('gads:conn', { ...conn, reconnectNeeded: false } satisfies GadsConn);
  }

  return { status: 'ok', series, totals };
}
