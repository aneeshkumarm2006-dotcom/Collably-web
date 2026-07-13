import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * StepProgress: onboarding stepper. Desktop shows numbered circles + labels
 * with connectors (done = filled brand + check, active = brand ring, upcoming =
 * muted). Mobile collapses to "current label · n/total" + a fill bar.
 */
export interface StepProgressProps {
  steps: string[];
  /** 0-based index of the active step. */
  current: number;
  className?: string;
}

export function StepProgress({ steps, current, className }: StepProgressProps) {
  const pct = steps.length > 1 ? ((current + 1) / steps.length) * 100 : 100;

  return (
    <div className={cn('w-full', className)}>
      {/* Mobile */}
      <div className="sm:hidden">
        <div className="mb-2 flex items-center justify-between text-[13px] font-semibold">
          <span className="text-ink">{steps[current]}</span>
          <span className="font-mono text-muted">
            {current + 1}/{steps.length}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full border-2 border-ink bg-card">
          <div
            className="h-full rounded-full bg-brand transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Desktop */}
      <ol className="hidden items-center sm:flex">
        {steps.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={label} className={cn('flex items-center', i < steps.length - 1 && 'flex-1')}>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-ink font-mono text-[13px] font-bold transition-colors',
                    done
                      ? 'bg-brand text-white shadow-[2px_2px_0_var(--ink)]'
                      : active
                        ? 'bg-yellow text-ink shadow-[2px_2px_0_var(--ink)]'
                        : 'border-ink/25 bg-card text-faint',
                  )}
                >
                  {done ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
                </span>
                <span
                  className={cn(
                    'whitespace-nowrap text-sm font-medium',
                    active ? 'text-ink' : 'text-muted',
                  )}
                >
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <span className={cn('mx-3 h-1 flex-1 rounded-full', done ? 'bg-brand' : 'bg-ink/15')} />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
