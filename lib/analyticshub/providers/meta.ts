/**
 * Analytics Hub — Meta Ads provider (Facebook Graph API v21.0, raw fetch only).
 *
 * OPTIONAL source: never blocks the hub. Not connected -> emptyResult('not_connected').
 * A dead/expired token flips meta:conn.reconnectNeeded and returns
 * emptyResult('reconnect_needed'); only genuine API errors throw (the API handler
 * wraps those to status:'error'). Stores two encrypted keys via the shared store:
 *   meta:token -> { token }
 *   meta:conn  -> { accountId, accountName, reconnectNeeded? }
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

const GRAPH = 'https://graph.facebook.com/v21.0';

interface MetaTokenRec {
  token: string;
}
interface MetaConnRec {
  accountId: string;
  accountName: string;
  reconnectNeeded?: boolean;
}

interface GraphError {
  message: string;
  code?: number;
  type?: string;
  error_subcode?: number;
}
interface GraphEnvelope<T> {
  data?: T[];
  paging?: { next?: string };
  error?: GraphError;
}
interface AdAccount {
  account_id: string;
  name: string;
}
interface ActionValue {
  action_type: string;
  value: string;
}
interface InsightRow {
  date_start: string;
  spend?: string;
  impressions?: string;
  clicks?: string;
  cpc?: string;
  cpm?: string;
  actions?: ActionValue[];
  purchase_roas?: ActionValue[];
}

/** Additive per-day accumulator before we compute derived rates. */
interface DayAgg {
  spend: number;
  impressions: number;
  clicks: number;
  results: number;
  roasWeighted: number; // roas * spend, so totals can be spend-weighted
}

// ── helpers ──────────────────────────────────────────────────────────────────

const num = (v: unknown): number => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** Strip an optional `act_` prefix and any stray whitespace. */
const normalizeAccountId = (id: string): string => id.trim().replace(/^act_/i, '');

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

/** A Graph OAuth failure means the token is dead — the user must reconnect. */
function isReauthError(err: GraphError | undefined): boolean {
  if (!err) return false;
  return err.code === 190 || err.type === 'OAuthException';
}

/**
 * Follow Graph cursor pagination, collecting every `data[]` element. Throws the
 * Graph error message verbatim on failure. `authErr` is returned via the second
 * tuple slot so callers can distinguish "reconnect" from "hard error".
 */
async function collectData<T>(
  firstUrl: string,
): Promise<{ rows: T[]; authError: boolean; errorMessage?: string }> {
  const rows: T[] = [];
  let url: string | undefined = firstUrl;
  for (let guard = 0; url && guard < 50; guard += 1) {
    const res = await fetch(url, { cache: 'no-store' });
    const body = (await res.json()) as GraphEnvelope<T>;
    if (body.error) {
      return { rows, authError: isReauthError(body.error), errorMessage: body.error.message };
    }
    if (Array.isArray(body.data)) rows.push(...body.data);
    url = body.paging?.next;
  }
  return { rows, authError: false };
}

/** Sum a Graph action/roas array's numeric `value`s. */
function sumActions(list: ActionValue[] | undefined): number {
  if (!Array.isArray(list)) return 0;
  return list.reduce((acc, a) => acc + num(a.value), 0);
}

// ── exports ────────────────────────────────────────────────────────────────

export async function connectionState(): Promise<ConnectionState> {
  const conn = await getJSON<MetaConnRec>('meta:conn');
  if (!conn) {
    return { source: 'meta', connected: false, reconnectNeeded: false };
  }
  return {
    source: 'meta',
    connected: true,
    reconnectNeeded: Boolean(conn.reconnectNeeded),
    label: conn.accountName,
  };
}

/** Validate a user-supplied token by listing the ad accounts it can see. */
export async function listAccounts(
  token: string,
): Promise<{ accounts: { id: string; name: string }[] }> {
  const clean = token.trim();
  if (!clean) throw new Error('Access token is required.');

  const params = new URLSearchParams({
    fields: 'account_id,name',
    access_token: clean,
    limit: '500',
  });
  const { rows, errorMessage } = await collectData<AdAccount>(
    `${GRAPH}/me/adaccounts?${params.toString()}`,
  );
  if (errorMessage) throw new Error(errorMessage);

  return {
    accounts: rows
      .filter((a) => a.account_id)
      .map((a) => ({ id: a.account_id, name: a.name || a.account_id })),
  };
}

/** Re-validate { token, accountId }, then persist meta:token + meta:conn. */
export async function select(body: Record<string, unknown>): Promise<void> {
  const token = typeof body.token === 'string' ? body.token.trim() : '';
  const rawId = typeof body.accountId === 'string' ? body.accountId : '';
  if (!token) throw new Error('Access token is required.');
  if (!rawId.trim()) throw new Error('Ad account is required.');

  const accountId = normalizeAccountId(rawId);
  if (!/^\d+$/.test(accountId)) throw new Error('Ad account id must be numeric.');

  // Hit the specific account so we validate the token AND access to this account.
  const params = new URLSearchParams({ fields: 'account_id,name', access_token: token });
  const res = await fetch(`${GRAPH}/act_${accountId}?${params.toString()}`, { cache: 'no-store' });
  const data = (await res.json()) as AdAccount & { error?: GraphError };
  if (data.error) throw new Error(data.error.message);
  if (!data.account_id) throw new Error('Ad account not accessible with this token.');

  await setJSON('meta:token', { token } satisfies MetaTokenRec);
  await setJSON('meta:conn', {
    accountId,
    accountName: data.name || `act_${accountId}`,
  } satisfies MetaConnRec);
}

export async function disconnect(): Promise<void> {
  await delValue('meta:token');
  await delValue('meta:conn');
}

export async function fetchMeta(from: string, to: string): Promise<SourceResult> {
  const tokenRec = await getJSON<MetaTokenRec>('meta:token');
  const conn = await getJSON<MetaConnRec>('meta:conn');
  if (!tokenRec?.token || !conn?.accountId) return emptyResult('not_connected');

  const params = new URLSearchParams({
    time_increment: '1',
    time_range: JSON.stringify({ since: from, until: to }),
    fields: 'spend,impressions,clicks,cpc,cpm,actions,purchase_roas',
    access_token: tokenRec.token,
    limit: '500',
  });
  const { rows, authError, errorMessage } = await collectData<InsightRow>(
    `${GRAPH}/act_${conn.accountId}/insights?${params.toString()}`,
  );

  if (authError) {
    await setJSON('meta:conn', { ...conn, reconnectNeeded: true } satisfies MetaConnRec);
    return emptyResult('reconnect_needed');
  }
  if (errorMessage) throw new Error(errorMessage);

  // Aggregate into a per-day map (Graph normally emits one row per day, but sum
  // defensively in case of duplicates).
  const byDay = new Map<string, DayAgg>();
  for (const r of rows) {
    const day = r.date_start;
    if (!day) continue;
    const spend = num(r.spend);
    const roas = sumActions(r.purchase_roas);
    const prev = byDay.get(day) ?? { spend: 0, impressions: 0, clicks: 0, results: 0, roasWeighted: 0 };
    byDay.set(day, {
      spend: prev.spend + spend,
      impressions: prev.impressions + num(r.impressions),
      clicks: prev.clicks + num(r.clicks),
      results: prev.results + sumActions(r.actions),
      roasWeighted: prev.roasWeighted + roas * spend,
    });
  }

  const series: SeriesPoint[] = [];
  let tSpend = 0;
  let tImpr = 0;
  let tClicks = 0;
  let tResults = 0;
  let tRoasWeighted = 0;

  for (const date of enumerateDates(from, to)) {
    const d = byDay.get(date) ?? { spend: 0, impressions: 0, clicks: 0, results: 0, roasWeighted: 0 };
    const cpc = d.clicks > 0 ? d.spend / d.clicks : 0;
    const cpm = d.impressions > 0 ? (d.spend / d.impressions) * 1000 : 0;
    const roas = d.spend > 0 ? d.roasWeighted / d.spend : 0;

    series.push(
      { source: 'meta', metric: 'spend', date, value: d.spend },
      { source: 'meta', metric: 'impressions', date, value: d.impressions },
      { source: 'meta', metric: 'clicks', date, value: d.clicks },
      { source: 'meta', metric: 'cpc', date, value: cpc },
      { source: 'meta', metric: 'cpm', date, value: cpm },
      { source: 'meta', metric: 'results', date, value: d.results },
      { source: 'meta', metric: 'roas', date, value: roas },
    );

    tSpend += d.spend;
    tImpr += d.impressions;
    tClicks += d.clicks;
    tResults += d.results;
    tRoasWeighted += d.roasWeighted;
  }

  const totals: Record<string, number> = {
    spend: tSpend,
    impressions: tImpr,
    clicks: tClicks,
    results: tResults,
    cpc: tClicks > 0 ? tSpend / tClicks : 0,
    cpm: tImpr > 0 ? (tSpend / tImpr) * 1000 : 0,
    roas: tSpend > 0 ? tRoasWeighted / tSpend : 0,
  };

  // A successful fetch proves the token recovered — clear any stale flag.
  if (conn.reconnectNeeded) {
    await setJSON('meta:conn', { ...conn, reconnectNeeded: false } satisfies MetaConnRec);
  }

  return { status: 'ok', series, totals };
}
