/**
 * Metric metadata: human labels, value formatters, and cost detection.
 *
 * The API returns free-form metric keys per source; we never hard-depend on a
 * fixed list. These helpers give every key a sensible label + formatter and
 * flag "cost" metrics (spend/cost/cpc/cpm/…) so KPI deltas invert their color
 * (spending less is good).
 */
import type { SourceId, SourceResult } from '@/lib/analyticshub/types';

/** Cost metrics: a lower value is an improvement, so the delta color inverts. */
export function isCostMetric(metric: string): boolean {
  return /(spend|cost|cpc|cpm)/i.test(metric);
}

function isRateMetric(metric: string): boolean {
  return /(ctr|rate)/i.test(metric);
}

function isCurrencyMetric(metric: string): boolean {
  return isCostMetric(metric);
}

const LABEL_OVERRIDES: Record<string, string> = {
  ctr: 'CTR',
  cpc: 'CPC',
  cpm: 'CPM',
  ga4: 'Analytics',
  gsc: 'Search Console',
  keyEvents: 'Key events',
  screenPageViews: 'Page views',
  activeUsers: 'Active users',
  newUsers: 'New users',
  totalUsers: 'Total users',
  averageSessionDuration: 'Avg. session',
  engagementRate: 'Engagement rate',
  bounceRate: 'Bounce rate',
  costPerConversion: 'Cost / conversion',
  loginCustomerId: 'Login customer ID',
  customerId: 'Customer ID',
};

/** camelCase / snake_case → "Title case", with per-key overrides. */
export function metricLabel(metric: string): string {
  if (LABEL_OVERRIDES[metric]) return LABEL_OVERRIDES[metric];
  const spaced = metric
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

const currencyFmt = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  maximumFractionDigits: 2,
});
const currencyWholeFmt = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  maximumFractionDigits: 0,
});

function compact(value: number): string {
  const abs = Math.abs(value);
  if (abs < 1000) return String(Math.round(value * 100) / 100);
  if (abs < 1_000_000) return `${trim(value / 1000)}K`;
  if (abs < 1_000_000_000) return `${trim(value / 1_000_000)}M`;
  return `${trim(value / 1_000_000_000)}B`;
}
function trim(n: number): string {
  return n.toFixed(1).replace(/\.0$/, '');
}

/** Format one value for a given metric key (currency, %, duration, compact). */
export function formatMetricValue(metric: string, value: number): string {
  if (!Number.isFinite(value)) return '—';
  if (isCurrencyMetric(metric)) {
    return Math.abs(value) >= 1000 ? currencyWholeFmt.format(value) : currencyFmt.format(value);
  }
  if (isRateMetric(metric)) {
    const pct = value <= 1 ? value * 100 : value;
    return `${trim(pct)}%`;
  }
  if (/position/i.test(metric)) return value.toFixed(1);
  if (/duration/i.test(metric)) {
    const s = Math.round(value);
    const m = Math.floor(s / 60);
    return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
  }
  return compact(value);
}

/** Compact axis/tooltip formatter that respects currency/% but stays short. */
export function formatAxisValue(metric: string, value: number): string {
  if (isCurrencyMetric(metric)) return `$${compact(value)}`;
  if (isRateMetric(metric)) return `${trim(value <= 1 ? value * 100 : value)}%`;
  return compact(value);
}

/**
 * The metrics a source actually returned, ordered by a preferred list first
 * (so the important tiles/lines lead) then any extras. Never empty when data
 * exists, and resilient to whatever keys the API sends.
 */
const PREFERRED: Record<SourceId, string[]> = {
  ga4: ['sessions', 'activeUsers', 'totalUsers', 'newUsers', 'keyEvents', 'conversions', 'screenPageViews'],
  gsc: ['clicks', 'impressions', 'ctr', 'position'],
  meta: ['spend', 'impressions', 'clicks', 'reach', 'conversions', 'ctr', 'cpc', 'cpm'],
  gads: ['cost', 'impressions', 'clicks', 'conversions', 'ctr', 'cpc'],
  users: [],
};

export function availableMetrics(source: SourceId, result: SourceResult | undefined): string[] {
  if (!result) return [];
  const set = new Set<string>();
  for (const k of Object.keys(result.totals ?? {})) set.add(k);
  for (const p of result.series ?? []) if (p.metric) set.add(p.metric);
  const all = Array.from(set);
  const pref = PREFERRED[source] ?? [];
  const ordered = [
    ...pref.filter((m) => all.includes(m)),
    ...all.filter((m) => !pref.includes(m)),
  ];
  return ordered;
}

/** Pick the first present total among candidate keys (case-sensitive). */
export function pickTotal(result: SourceResult | undefined, keys: string[]): number {
  if (!result) return 0;
  for (const k of keys) {
    const v = result.totals?.[k];
    if (typeof v === 'number' && Number.isFinite(v)) return v;
  }
  return 0;
}

/** Build a per-date value array for one metric, aligned to the given date axis. */
export function seriesForMetric(
  result: SourceResult | undefined,
  metric: string,
  dates: string[],
): number[] {
  const byDate = new Map<string, number>();
  for (const p of result?.series ?? []) {
    if (p.metric === metric) byDate.set(p.date, (byDate.get(p.date) ?? 0) + (p.value || 0));
  }
  return dates.map((d) => byDate.get(d) ?? 0);
}
