/**
 * Thin client for the Analytics Hub HTTP API (`/api/analyticshub/*`).
 *
 * The session cookie is httpOnly and set by the API, so every request just
 * sends `credentials: 'include'`. Validation/4xx errors return `{ error }`;
 * we surface that message verbatim via `HubError`. No secrets ever live here —
 * tokens are typed by the caller and POSTed straight to the API.
 */
import type { HubStatus, SourceId, SourceResult } from '@/lib/analyticshub/types';

const BASE = '/api/analyticshub';

export class HubError extends Error {
  status: number;
  constructor(message: string, status = 0) {
    super(message);
    this.name = 'HubError';
    this.status = status;
  }
}

type FetchOpts = { signal?: AbortSignal; method?: string; body?: unknown };

async function hubFetch<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method: opts.method ?? (opts.body ? 'POST' : 'GET'),
      credentials: 'include',
      headers: opts.body ? { 'content-type': 'application/json' } : undefined,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      signal: opts.signal,
    });
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') throw err;
    throw new HubError('Network error — check your connection and try again.');
  }
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const msg =
      (typeof data.error === 'string' && data.error) ||
      (typeof data.message === 'string' && data.message) ||
      `Request failed (${res.status})`;
    throw new HubError(msg, res.status);
  }
  return data as T;
}

// --- Status / auth ---------------------------------------------------------

export const getStatus = (signal?: AbortSignal) => hubFetch<HubStatus>('/status', { signal });
export const postSetup = (body: { password: string; project?: ProjectInput }) =>
  hubFetch<{ ok: boolean }>('/setup', { body });
export const postLogin = (password: string) => hubFetch<{ ok: boolean }>('/login', { body: { password } });
export const postLogout = () => hubFetch<{ ok: boolean }>('/logout', { method: 'POST' });
export const postPassword = (password: string) =>
  hubFetch<{ ok: boolean }>('/password', { body: { password } });

export type ProjectInput = { name: string; primary: string; accent: string };
export const postProject = (body: ProjectInput) => hubFetch<{ ok: boolean }>('/project', { body });

// --- Google (GA4 + Search Console) -----------------------------------------

export const getGoogleStart = () => hubFetch<{ url: string }>('/oauth/google/start');
export const getGoogleOptions = () =>
  hubFetch<{ properties: { id: string; name: string }[]; sites: { url: string }[] }>('/google/options');
export const postGoogleSelect = (body: { propertyId: string; siteUrl: string }) =>
  hubFetch<{ ok: boolean }>('/google/select', { body });
export const postGoogleServiceAccount = (body: {
  keyJson: string;
  propertyId: string;
  siteUrl: string;
}) => hubFetch<{ ok: boolean }>('/google/service-account', { body });
export const postGoogleDisconnect = () => hubFetch<{ ok: boolean }>('/google/disconnect', { method: 'POST' });

// --- Meta ------------------------------------------------------------------

export const postMetaAccounts = (token: string) =>
  hubFetch<{ accounts: { id: string; name: string }[] }>('/meta/accounts', { body: { token } });
export const postMetaSelect = (body: { token: string; accountId: string }) =>
  hubFetch<{ ok: boolean }>('/meta/select', { body });
export const postMetaDisconnect = () => hubFetch<{ ok: boolean }>('/meta/disconnect', { method: 'POST' });

// --- Google Ads ------------------------------------------------------------

export type GoogleAdsInput = {
  developerToken: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  customerId: string;
  loginCustomerId?: string;
};
export const postGadsSave = (body: GoogleAdsInput) => hubFetch<{ ok: boolean }>('/gads/save', { body });
export const postGadsDisconnect = () => hubFetch<{ ok: boolean }>('/gads/disconnect', { method: 'POST' });

// --- Data ------------------------------------------------------------------

export type Range = { from: string; to: string };

function q(range: Range, refresh?: boolean): string {
  const p = new URLSearchParams({ from: range.from, to: range.to });
  if (refresh) p.set('refresh', '1');
  return `?${p.toString()}`;
}

export const fetchSource = (
  source: Exclude<SourceId, 'users'>,
  range: Range,
  refresh?: boolean,
  signal?: AbortSignal,
) => hubFetch<SourceResult>(`/${source}${q(range, refresh)}`, { signal });

export type AllResult = {
  ga4: SourceResult;
  gsc: SourceResult;
  meta: SourceResult;
  gads: SourceResult;
};
export const fetchAll = (range: Range, refresh?: boolean, signal?: AbortSignal) =>
  hubFetch<AllResult>(`/all${q(range, refresh)}`, { signal });

// --- Date-range helpers ----------------------------------------------------

export type Preset = 'today' | 'yesterday' | '7d' | '28d' | '90d';

export const PRESETS: { id: Preset; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: '7d', label: 'Last 7 days' },
  { id: '28d', label: 'Last 28 days' },
  { id: '90d', label: 'Last 90 days' },
];

function pad(n: number): string {
  return String(n).padStart(2, '0');
}
export function ymd(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function addDays(d: Date, n: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

/** Resolve a preset into an inclusive {from,to} range in local time. */
export function rangeFromPreset(preset: Preset): Range {
  const today = new Date();
  switch (preset) {
    case 'today':
      return { from: ymd(today), to: ymd(today) };
    case 'yesterday': {
      const y = addDays(today, -1);
      return { from: ymd(y), to: ymd(y) };
    }
    case '7d':
      return { from: ymd(addDays(today, -6)), to: ymd(today) };
    case '28d':
      return { from: ymd(addDays(today, -27)), to: ymd(today) };
    case '90d':
      return { from: ymd(addDays(today, -89)), to: ymd(today) };
  }
}

/** Number of inclusive days in a range. */
export function rangeLength(range: Range): number {
  const from = new Date(`${range.from}T00:00:00`);
  const to = new Date(`${range.to}T00:00:00`);
  return Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1;
}

/** The equal-length window immediately BEFORE the given range (for deltas). */
export function previousRange(range: Range): Range {
  const len = rangeLength(range);
  const from = new Date(`${range.from}T00:00:00`);
  const prevTo = addDays(from, -1);
  const prevFrom = addDays(prevTo, -(len - 1));
  return { from: ymd(prevFrom), to: ymd(prevTo) };
}

/** Every inclusive date string in a range (the chart/sparkline x-axis). */
export function eachDate(range: Range): string[] {
  const out: string[] = [];
  let cur = new Date(`${range.from}T00:00:00`);
  const to = new Date(`${range.to}T00:00:00`);
  let guard = 0;
  while (cur.getTime() <= to.getTime() && guard < 400) {
    out.push(ymd(cur));
    cur = addDays(cur, 1);
    guard += 1;
  }
  return out;
}
