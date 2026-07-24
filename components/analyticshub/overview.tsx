'use client';
/**
 * Overview page body. KPI row (GA4 sessions + key events, GSC clicks, combined
 * ad spend when Meta/Ads are connected, plus a "Users unavailable" note), a
 * multi-source comparison chart with a persisted metric picker, and top-5
 * strips that deep-link to each source page. Fetches /all for the current +
 * previous range once and derives everything from it.
 */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Users } from 'lucide-react';
import type { DetailTable, SourceId, SourceResult } from '@/lib/analyticshub/types';
import { type AllResult, eachDate, fetchAll } from './api';
import { useHub, useHubQuery } from './context';
import { KpiCard } from './kpi-card';
import { LineChart, type ChartSeries } from './line-chart';
import { MetricPicker, type MetricGroup, metricKey } from './metric-picker';
import { ChartSkeleton, KpiRowSkeleton, StripSkeleton } from './skeletons';
import { ErrorState } from './states';
import { safeHexColor, seriesColor } from './colors';
import {
  availableMetrics,
  formatMetricValue,
  metricLabel,
  pickTotal,
  seriesForMetric,
} from './metrics';

const SELECTED_KEY = 'ahub:overviewMetrics';
const DATA_SOURCES: Exclude<SourceId, 'users'>[] = ['ga4', 'gsc', 'meta', 'gads'];

export function Overview() {
  const { range, status } = useHub();
  const accent = safeHexColor(status.project.primary);
  const dates = eachDate(range);

  const metaConn = status.connections?.find((c) => c.source === 'meta')?.connected;
  const gadsConn = status.connections?.find((c) => c.source === 'gads')?.connected;
  const showSpend = Boolean(metaConn || gadsConn);

  const query = useHubQuery<AllResult>(async ({ current, previous, refresh, signal }) => {
    const [cur, prev] = await Promise.all([
      fetchAll(current, refresh, signal),
      fetchAll(previous, refresh, signal),
    ]);
    return { current: cur, previous: prev };
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink">{status.project.name || 'Overview'}</h1>
        <p className="mt-1 text-sm text-muted">Cross-source snapshot for the selected range.</p>
      </header>

      {query.loading && (
        <div className="space-y-6">
          <KpiRowSkeleton count={4} />
          <ChartSkeleton />
          <div className="grid gap-4 md:grid-cols-3">
            <StripSkeleton />
            <StripSkeleton />
            <StripSkeleton />
          </div>
        </div>
      )}

      {!query.loading && query.error && (
        <ErrorState title="Couldn’t load overview" error={query.error} />
      )}

      {!query.loading && !query.error && query.data && (
        <Body
          data={query.data}
          previous={query.previous}
          dates={dates}
          accent={accent}
          showSpend={showSpend}
        />
      )}
    </div>
  );
}

function sumSeries(a: number[], b: number[]): number[] {
  const len = Math.max(a.length, b.length);
  return Array.from({ length: len }, (_, i) => (a[i] ?? 0) + (b[i] ?? 0));
}

function Body({
  data,
  previous,
  dates,
  accent,
  showSpend,
}: {
  data: AllResult;
  previous: AllResult | null;
  dates: string[];
  accent: string;
  showSpend: boolean;
}) {
  // --- KPI values -----------------------------------------------------------
  const sessions = pickTotal(data.ga4, ['sessions']);
  const keyEvents = pickTotal(data.ga4, ['keyEvents', 'conversions']);
  const clicks = pickTotal(data.gsc, ['clicks']);
  const spend = pickTotal(data.meta, ['spend']) + pickTotal(data.gads, ['cost']);

  const prevSessions = previous ? pickTotal(previous.ga4, ['sessions']) : null;
  const prevKeyEvents = previous ? pickTotal(previous.ga4, ['keyEvents', 'conversions']) : null;
  const prevClicks = previous ? pickTotal(previous.gsc, ['clicks']) : null;
  const prevSpend = previous
    ? pickTotal(previous.meta, ['spend']) + pickTotal(previous.gads, ['cost'])
    : null;

  const spendSeries = sumSeries(
    seriesForMetric(data.meta, 'spend', dates),
    seriesForMetric(data.gads, 'cost', dates),
  );

  // --- Comparison chart -----------------------------------------------------
  const groups: MetricGroup[] = DATA_SOURCES.map((source) => ({
    source,
    metrics: availableMetrics(source, data[source]),
  })).filter((g) => g.metrics.length > 0);

  const availableKeys = new Set(
    groups.flatMap((g) => g.metrics.map((m) => metricKey(g.source, m))),
  );

  const [selected, setSelected] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SELECTED_KEY);
      if (raw) setSelected(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  function updateSelected(next: string[]) {
    setSelected(next);
    try {
      window.localStorage.setItem(SELECTED_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  // Seed sensible defaults once data + storage are ready and nothing's chosen.
  useEffect(() => {
    if (!hydrated || initialized.current) return;
    initialized.current = true;
    const valid = selected.filter((k) => availableKeys.has(k));
    if (valid.length === 0) {
      const prefer = ['ga4:sessions', 'gsc:clicks', 'ga4:keyEvents'].filter((k) =>
        availableKeys.has(k),
      );
      const defaults = prefer.length ? prefer : Array.from(availableKeys).slice(0, 2);
      if (defaults.length) updateSelected(defaults);
    } else if (valid.length !== selected.length) {
      updateSelected(valid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const effective = selected.filter((k) => availableKeys.has(k));

  // Assign colors: index within each source's selected metrics.
  const perSourceIndex = new Map<SourceId, number>();
  const perSourceCount = new Map<SourceId, number>();
  for (const k of effective) {
    const src = k.split(':')[0] as SourceId;
    perSourceCount.set(src, (perSourceCount.get(src) ?? 0) + 1);
  }
  const chartSeries: ChartSeries[] = effective.map((k) => {
    const [src, metric] = k.split(':') as [Exclude<SourceId, 'users'>, string];
    const idx = perSourceIndex.get(src) ?? 0;
    perSourceIndex.set(src, idx + 1);
    return {
      key: k,
      label: `${metricLabel(metric)}`,
      color: seriesColor(src, idx, perSourceCount.get(src) ?? 1),
      format: (n: number) => formatMetricValue(metric, n),
      points: seriesForMetric(data[src], metric, dates),
    };
  });

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Sessions"
          metric="sessions"
          value={sessions}
          previous={prevSessions}
          series={seriesForMetric(data.ga4, 'sessions', dates)}
          format={(n) => formatMetricValue('sessions', n)}
          accent={accent}
        />
        <KpiCard
          label="Key events"
          metric="keyEvents"
          value={keyEvents}
          previous={prevKeyEvents}
          series={seriesForMetric(data.ga4, 'keyEvents', dates)}
          format={(n) => formatMetricValue('keyEvents', n)}
          accent={accent}
        />
        <KpiCard
          label="Search clicks"
          metric="clicks"
          value={clicks}
          previous={prevClicks}
          series={seriesForMetric(data.gsc, 'clicks', dates)}
          format={(n) => formatMetricValue('clicks', n)}
          accent={accent}
        />
        {showSpend ? (
          <KpiCard
            label="Ad spend"
            metric="spend"
            value={spend}
            previous={prevSpend}
            series={spendSeries}
            format={(n) => formatMetricValue('spend', n)}
            accent={accent}
          />
        ) : (
          <UsersNote />
        )}
      </div>

      {/* Comparison chart */}
      <section className="rounded-xl border border-hair bg-card p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-base font-bold text-ink">Compare metrics</h2>
          <MetricPicker groups={groups} selected={effective} onChange={updateSelected} max={5} />
        </div>
        {chartSeries.length > 0 ? (
          <LineChart dates={dates} series={chartSeries} />
        ) : (
          <div className="flex h-[220px] items-center justify-center text-center text-sm text-muted">
            {groups.length === 0
              ? 'Connect a source to compare metrics here.'
              : 'Pick 1–5 metrics to compare.'}
          </div>
        )}
      </section>

      {/* Top strips */}
      <div className="grid gap-4 md:grid-cols-3">
        <Strip
          title="Top search queries"
          table={firstDetail(data.gsc, ['quer'])}
          href="/analyticshub/gsc"
          notConnected={data.gsc.status === 'not_connected'}
        />
        <Strip
          title="Top pages"
          table={firstDetail(data.ga4, ['page', 'path'])}
          href="/analyticshub/ga4"
          notConnected={data.ga4.status === 'not_connected'}
        />
        <SignupsStrip />
      </div>
    </div>
  );
}

function UsersNote() {
  return (
    <div className="flex flex-col justify-center rounded-xl border border-dashed border-hair-strong bg-card p-4 shadow-card">
      <div className="flex items-center gap-2 text-muted">
        <Users className="h-4 w-4" />
        <p className="text-[13px] font-medium">Users unavailable</p>
      </div>
      <p className="mt-1 text-xs text-faint">Signups live in the Local Creator Crew backend, not this hub.</p>
    </div>
  );
}

function SignupsStrip() {
  return (
    <section className="rounded-xl border border-hair bg-card p-4 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <Users className="h-4 w-4 text-muted" />
        <h3 className="font-display text-sm font-bold text-ink">Recent signups</h3>
      </div>
      <p className="text-sm text-muted">
        User analytics aren&apos;t part of this dashboard — signups live in the Local Creator Crew backend.
      </p>
      <Link
        href="/analyticshub/users"
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
      >
        Learn more <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}

function firstDetail(result: SourceResult, match: string[]): DetailTable | undefined {
  const tables = result.detail ?? [];
  return (
    tables.find((t) =>
      match.some(
        (m) => t.id?.toLowerCase().includes(m) || t.title?.toLowerCase().includes(m),
      ),
    ) ?? tables[0]
  );
}

function Strip({
  title,
  table,
  href,
  notConnected,
}: {
  title: string;
  table: { columns: string[]; rows: (string | number)[][] } | undefined;
  href: string;
  notConnected: boolean;
}) {
  const rows = (table?.rows ?? []).slice(0, 5);
  return (
    <section className="flex flex-col rounded-xl border border-hair bg-card p-4 shadow-card">
      <h3 className="mb-3 font-display text-sm font-bold text-ink">{title}</h3>
      {notConnected ? (
        <p className="flex-1 text-sm text-muted">Not connected yet.</p>
      ) : rows.length === 0 ? (
        <p className="flex-1 text-sm text-muted">No data for this range.</p>
      ) : (
        <ul className="flex-1 space-y-2">
          {rows.map((row, i) => (
            <li key={i} className="flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0 truncate text-ink" title={String(row[0])}>
                {String(row[0])}
              </span>
              <span className="shrink-0 font-mono tabular-nums text-muted">
                {formatCell(row[row.length - 1])}
              </span>
            </li>
          ))}
        </ul>
      )}
      <Link
        href={href}
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
      >
        View page <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}

function formatCell(cell: string | number | undefined): string {
  if (typeof cell === 'number') return new Intl.NumberFormat('en-US').format(cell);
  return String(cell ?? '');
}
