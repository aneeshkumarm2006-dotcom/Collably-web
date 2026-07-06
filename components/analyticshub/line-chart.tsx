'use client';
/**
 * Hand-rolled multi-line chart — inline SVG, no chart library.
 *
 * - 2px non-scaling lines, recessive grid, ~6 x-labels, always-on legend.
 * - Hover crosshair + tooltip showing REAL values (never the indexed value).
 * - NEVER a dual y-axis. If the selected series' maxima differ by >30×, it
 *   switches to "indexed" mode (each line scaled to its own max, badge shown);
 *   the tooltip still reports the true values.
 */
import { useLayoutEffect, useMemo, useRef, useState } from 'react';

export interface ChartSeries {
  key: string;
  label: string;
  color: string;
  format: (n: number) => string;
  points: number[]; // aligned to `dates`
}

const PAD = { top: 14, right: 14, bottom: 26, left: 48 };
const HEIGHT = 300;
const INDEX_THRESHOLD = 30;

export function LineChart({
  dates,
  series,
  height = HEIGHT,
}: {
  dates: string[];
  series: ChartSeries[];
  height?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(720);
  const [hover, setHover] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(Math.max(280, Math.round(w)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const n = dates.length;
  const plotW = width - PAD.left - PAD.right;
  const plotH = height - PAD.top - PAD.bottom;

  const { indexed, yMax, scaled } = useMemo(() => {
    const maxes = series.map((s) => Math.max(0, ...s.points.map((v) => (Number.isFinite(v) ? v : 0))));
    const positive = maxes.filter((m) => m > 0);
    const ratio = positive.length > 1 ? Math.max(...positive) / Math.min(...positive) : 1;
    const useIndexed = ratio > INDEX_THRESHOLD;
    if (useIndexed) {
      return {
        indexed: true,
        yMax: 100,
        scaled: series.map((s, i) => {
          const m = maxes[i] || 1;
          return s.points.map((v) => ((Number.isFinite(v) ? v : 0) / m) * 100);
        }),
      };
    }
    const globalMax = Math.max(1, ...maxes);
    return { indexed: false, yMax: globalMax, scaled: series.map((s) => s.points) };
  }, [series]);

  const x = (i: number) => (n <= 1 ? PAD.left + plotW / 2 : PAD.left + (i / (n - 1)) * plotW);
  const y = (v: number) => PAD.top + (1 - v / yMax) * plotH;

  const gridLines = 4;
  const gridYs = Array.from({ length: gridLines + 1 }, (_, i) => (i / gridLines) * yMax);

  // ~6 evenly spaced x labels.
  const labelStep = Math.max(1, Math.ceil(n / 6));
  const xLabelIdx = dates.map((_, i) => i).filter((i) => i % labelStep === 0 || i === n - 1);

  function onMove(e: React.MouseEvent<SVGRectElement>) {
    if (n === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const rel = e.clientX - rect.left;
    const ratio = plotW <= 0 ? 0 : (rel - 0) / plotW;
    const idx = Math.round(ratio * (n - 1));
    setHover(Math.min(n - 1, Math.max(0, idx)));
  }

  const tipX = hover != null ? x(hover) : 0;
  const tipRight = tipX > width / 2;

  return (
    <div ref={wrapRef} className="w-full">
      <div className="relative">
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={`Line chart of ${series.map((s) => s.label).join(', ')}`}
        >
          {/* grid + y labels */}
          {gridYs.map((gv, i) => {
            const gy = y(gv);
            return (
              <g key={i}>
                <line
                  x1={PAD.left}
                  x2={width - PAD.right}
                  y1={gy}
                  y2={gy}
                  className="stroke-hair"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
                {!indexed && (
                  <text
                    x={PAD.left - 8}
                    y={gy + 3}
                    textAnchor="end"
                    className="fill-faint text-[10px] font-mono"
                  >
                    {series[0]?.format(gv) ?? Math.round(gv)}
                  </text>
                )}
              </g>
            );
          })}

          {/* x labels */}
          {xLabelIdx.map((i) => (
            <text
              key={i}
              x={x(i)}
              y={height - 8}
              textAnchor="middle"
              className="fill-faint text-[10px]"
            >
              {formatDay(dates[i])}
            </text>
          ))}

          {/* series */}
          {series.map((s, si) => {
            const pts = scaled[si];
            const d = pts
              .map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
              .join(' ');
            return (
              <path
                key={s.key}
                d={d}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}

          {/* crosshair + dots */}
          {hover != null && (
            <>
              <line
                x1={tipX}
                x2={tipX}
                y1={PAD.top}
                y2={height - PAD.bottom}
                className="stroke-faint"
                strokeWidth={1}
                strokeDasharray="3 3"
                vectorEffect="non-scaling-stroke"
              />
              {series.map((s, si) => (
                <circle
                  key={s.key}
                  cx={tipX}
                  cy={y(scaled[si][hover])}
                  r={3.5}
                  fill="var(--surface-card)"
                  stroke={s.color}
                  strokeWidth={2}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </>
          )}

          {/* hover capture */}
          <rect
            x={PAD.left}
            y={PAD.top}
            width={Math.max(0, plotW)}
            height={Math.max(0, plotH)}
            fill="transparent"
            onMouseMove={onMove}
            onMouseLeave={() => setHover(null)}
          />
        </svg>

        {indexed && (
          <span className="absolute right-2 top-2 rounded-full border border-hair bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted">
            indexed
          </span>
        )}

        {hover != null && (
          <div
            className="pointer-events-none absolute top-3 z-10 min-w-[150px] rounded-lg border border-hair bg-card p-2.5 text-xs shadow-dropdown"
            style={tipRight ? { right: 12 } : { left: 12 }}
          >
            <div className="mb-1.5 font-mono text-[11px] text-faint">{formatDay(dates[hover], true)}</div>
            <ul className="space-y-1">
              {series.map((s) => (
                <li key={s.key} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-muted">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    {s.label}
                  </span>
                  <span className="font-mono font-semibold text-ink">
                    {s.format(s.points[hover] ?? 0)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* legend (always on) */}
      <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {series.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5 text-xs text-muted">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatDay(date: string | undefined, withYear = false): string {
  if (!date) return '';
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(withYear ? { year: 'numeric' } : {}),
  });
}
