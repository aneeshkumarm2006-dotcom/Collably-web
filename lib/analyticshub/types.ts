/**
 * Shared Analytics Hub types — the normalized shape every source maps into, plus
 * status/config types. Client-safe (no secrets, no server imports), so both the
 * API layer and the dashboard UI import from here.
 */

/** The five data sources (Users is skipped in this repo — no local users table). */
export type SourceId = 'ga4' | 'gsc' | 'meta' | 'gads' | 'users';

export type SourceStatus = 'ok' | 'not_connected' | 'reconnect_needed' | 'error';

/** One daily datapoint in the normalized series. */
export interface SeriesPoint {
  source: SourceId;
  metric: string;
  date: string; // YYYY-MM-DD
  value: number;
}

/** A top-N detail table (e.g. top pages, top queries). */
export interface DetailTable {
  id: string;
  title: string;
  columns: string[];
  rows: (string | number)[][];
}

/** Everything a source data route returns. Failures are isolated per source. */
export interface SourceResult {
  status: SourceStatus;
  series: SeriesPoint[];
  totals: Record<string, number>;
  detail?: DetailTable[];
  error?: string;
}

export const emptyResult = (status: SourceStatus = 'not_connected'): SourceResult => ({
  status,
  series: [],
  totals: {},
});

/** Per-source connection state surfaced by GET /status. */
export interface ConnectionState {
  source: SourceId;
  connected: boolean;
  reconnectNeeded: boolean;
  label?: string; // e.g. GA4 property name, ad-account name
  note?: string; // e.g. "not available in this app" for users
}

/** GET /status payload. */
export interface HubStatus {
  needsSetup: boolean;
  authed: boolean;
  /** Detailed, fix-naming diagnostics for the operator. */
  config: {
    secret: { ok: boolean; reason?: string };
    store: { ok: boolean; reason?: string };
  };
  project: { name: string; primary: string; accent: string };
  googleOAuthAvailable: boolean;
  connections: ConnectionState[];
}

export const SOURCE_LABELS: Record<SourceId, string> = {
  ga4: 'Analytics',
  gsc: 'Search Console',
  meta: 'Meta Ads',
  gads: 'Google Ads',
  users: 'Users',
};
