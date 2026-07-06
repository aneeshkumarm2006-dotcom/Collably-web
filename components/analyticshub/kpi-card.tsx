'use client';
/**
 * KPI tile: label, big value, sparkline, and % delta vs the previous
 * equal-length period. Up = green / down = red — INVERTED for cost metrics
 * (spend, cost, cpc, cpm…) where a decrease is the win. Accent color comes from
 * the caller (the hub's project.primary/accent, falling back to a source hue).
 */
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sparkline } from './sparkline';
import { isCostMetric } from './metrics';

export function KpiCard({
  label,
  metric,
  value,
  previous,
  series,
  format,
  accent,
  className,
}: {
  label: string;
  metric: string;
  value: number;
  previous: number | null;
  series: number[];
  format: (n: number) => string;
  accent: string;
  className?: string;
}) {
  const delta = computeDelta(value, previous);
  const cost = isCostMetric(metric);
  // Good = value went the "right" way. For cost metrics, down is good.
  const good = delta == null ? null : cost ? delta < 0 : delta > 0;
  const flat = delta === 0 || delta == null;

  return (
    <div className={cn('rounded-xl border border-hair bg-card p-4 shadow-card', className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-medium text-muted">{label}</p>
        <DeltaBadge delta={delta} good={good} flat={flat} />
      </div>
      <p className="mt-1.5 font-display text-2xl font-bold tabular-nums text-ink">{format(value)}</p>
      <div className="mt-2 h-[30px]">
        <Sparkline points={series} color={accent} />
      </div>
    </div>
  );
}

function DeltaBadge({
  delta,
  good,
  flat,
}: {
  delta: number | null;
  good: boolean | null;
  flat: boolean;
}) {
  if (delta == null) {
    return <span className="text-[11px] font-medium text-faint">no prior data</span>;
  }
  const Icon = flat ? Minus : good ? ArrowUpRight : ArrowDownRight;
  const tone = flat ? 'text-faint' : good ? 'text-success' : 'text-danger';
  const pct = Math.abs(delta * 100);
  const shown = pct >= 100 ? Math.round(pct) : Math.round(pct * 10) / 10;
  return (
    <span className={cn('inline-flex items-center gap-0.5 text-[11px] font-semibold tabular-nums', tone)}>
      <Icon className="h-3.5 w-3.5" />
      {flat ? '0%' : `${shown}%`}
    </span>
  );
}

function computeDelta(value: number, previous: number | null): number | null {
  if (previous == null || !Number.isFinite(previous)) return null;
  if (previous === 0) return value === 0 ? 0 : null; // undefined growth from zero
  return (value - previous) / Math.abs(previous);
}
