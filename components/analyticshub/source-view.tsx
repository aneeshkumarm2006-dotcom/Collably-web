'use client';
/**
 * Shared layout for a single source page (GA4 / GSC / Meta / Google Ads):
 * KPI tiles (sparkline + delta vs previous period), one fixed multi-line daily
 * chart of the source's key metrics, and its detail tables. Fetches ONLY this
 * source, for the current + previous range. Renders explicit empty / reconnect
 * / error states so a page is never blank.
 */
import type { SourceId, SourceResult } from '@/lib/analyticshub/types';
import { eachDate, fetchSource } from './api';
import { useHub, useHubQuery } from './context';
import { KpiCard } from './kpi-card';
import { LineChart, type ChartSeries } from './line-chart';
import { DetailTable } from './detail-table';
import { EmptyState, ErrorState } from './states';
import { ChartSkeleton, KpiRowSkeleton, TableSkeleton } from './skeletons';
import { safeHexColor, seriesColor } from './colors';
import { availableMetrics, formatMetricValue, metricLabel, seriesForMetric } from './metrics';

type DataSource = Exclude<SourceId, 'users'>;

export function SourceView({
  source,
  title,
  description,
  emptyMessage,
  maxKpis = 4,
  maxChart = 4,
}: {
  source: DataSource;
  title: string;
  description: string;
  emptyMessage: string;
  maxKpis?: number;
  maxChart?: number;
}) {
  const { range, status } = useHub();
  const accent = safeHexColor(status.project.primary);

  const query = useHubQuery<SourceResult>(async ({ current, previous, refresh, signal }) => {
    const [cur, prev] = await Promise.all([
      fetchSource(source, current, refresh, signal),
      fetchSource(source, previous, refresh, signal),
    ]);
    return { current: cur, previous: prev };
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </header>

      {query.loading && (
        <div className="space-y-6">
          <KpiRowSkeleton count={maxKpis} />
          <ChartSkeleton />
          <TableSkeleton />
        </div>
      )}

      {!query.loading && query.error && (
        <ErrorState title="Couldn’t load this source" error={query.error} />
      )}

      {!query.loading && !query.error && query.data && (
        <Body
          source={source}
          data={query.data}
          previous={query.previous}
          dates={eachDate(range)}
          accent={accent}
          emptyMessage={emptyMessage}
          maxKpis={maxKpis}
          maxChart={maxChart}
        />
      )}
    </div>
  );
}

function Body({
  source,
  data,
  previous,
  dates,
  accent,
  emptyMessage,
  maxKpis,
  maxChart,
}: {
  source: DataSource;
  data: SourceResult;
  previous: SourceResult | null;
  dates: string[];
  accent: string;
  emptyMessage: string;
  maxKpis: number;
  maxChart: number;
}) {
  if (data.status === 'not_connected') {
    return <EmptyState message={emptyMessage} />;
  }
  if (data.status === 'reconnect_needed') {
    return (
      <ErrorState
        title="Reconnect required"
        error={data.error || 'This connection expired or lost access. Reconnect it in settings.'}
        settingsLabel="Reconnect in settings"
      />
    );
  }
  if (data.status === 'error') {
    return <ErrorState title="Source error" error={data.error || 'The provider returned an error.'} />;
  }

  const metrics = availableMetrics(source, data);
  const kpiMetrics = metrics.slice(0, maxKpis);
  const chartMetrics = metrics.slice(0, maxChart);

  const chartSeries: ChartSeries[] = chartMetrics.map((metric, i) => ({
    key: metric,
    label: metricLabel(metric),
    color: seriesColor(source, i, chartMetrics.length),
    format: (n: number) => formatMetricValue(metric, n),
    points: seriesForMetric(data, metric, dates),
  }));

  const hasData = metrics.length > 0;

  return (
    <div className="space-y-6">
      {kpiMetrics.length > 0 && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpiMetrics.map((metric) => (
            <KpiCard
              key={metric}
              label={metricLabel(metric)}
              metric={metric}
              value={data.totals?.[metric] ?? 0}
              previous={previous?.totals?.[metric] ?? null}
              series={seriesForMetric(data, metric, dates)}
              format={(n) => formatMetricValue(metric, n)}
              accent={accent}
            />
          ))}
        </div>
      )}

      {chartSeries.length > 0 && (
        <section className="rounded-xl border border-hair bg-card p-5 shadow-card">
          <h2 className="mb-3 font-display text-base font-bold text-ink">Daily trend</h2>
          <LineChart dates={dates} series={chartSeries} />
        </section>
      )}

      {(data.detail ?? []).map((table) => (
        <DetailTable key={table.id} table={table} />
      ))}

      {!hasData && (
        <div className="rounded-xl border border-dashed border-hair-strong bg-card p-8 text-center text-sm text-muted">
          Connected, but no data for this range yet. Try a wider date range.
        </div>
      )}
    </div>
  );
}
