'use client';
/**
 * Grouped multi-select for the Overview comparison chart. Metrics are grouped
 * by source; 1–5 can be overlaid. Selection is a set of "source:metric" keys
 * (persisted by the caller). Enforces the 1–5 cap and keeps keyboard access via
 * the Popover + checkbox primitives.
 */
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { SourceId } from '@/lib/analyticshub/types';
import { SOURCE_LABELS } from '@/lib/analyticshub/types';
import { metricLabel } from './metrics';
import { seriesColor } from './colors';

export interface MetricGroup {
  source: SourceId;
  metrics: string[];
}

export const metricKey = (source: SourceId, metric: string) => `${source}:${metric}`;

export function MetricPicker({
  groups,
  selected,
  onChange,
  max = 5,
}: {
  groups: MetricGroup[];
  selected: string[];
  onChange: (next: string[]) => void;
  max?: number;
}) {
  const atMax = selected.length >= max;

  function toggle(key: string) {
    if (selected.includes(key)) {
      onChange(selected.filter((k) => k !== key));
    } else if (!atMax) {
      onChange([...selected, key]);
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <SlidersHorizontal className="h-4 w-4" />
          Metrics ({selected.length}/{max})
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="max-h-[70vh] w-72 overflow-y-auto p-2">
        {groups.length === 0 ? (
          <p className="px-2 py-3 text-sm text-muted">No metrics available yet.</p>
        ) : (
          groups.map((group) => (
            <div key={group.source} className="mb-2 last:mb-0">
              <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-faint">
                {SOURCE_LABELS[group.source]}
              </p>
              {group.metrics.map((metric, i) => {
                const key = metricKey(group.source, metric);
                const checked = selected.includes(key);
                const disabled = !checked && atMax;
                return (
                  <label
                    key={key}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm ${
                      disabled ? 'opacity-50' : 'hover:bg-secondary'
                    }`}
                  >
                    <Checkbox
                      checked={checked}
                      disabled={disabled}
                      onCheckedChange={() => toggle(key)}
                    />
                    <span
                      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: seriesColor(group.source, i, group.metrics.length) }}
                    />
                    <span className="text-ink">{metricLabel(metric)}</span>
                  </label>
                );
              })}
            </div>
          ))
        )}
      </PopoverContent>
    </Popover>
  );
}
