import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * StatCard: dashboard metric tile in the sticker language — ink outline, solid
 * offset shadow, an ink-outlined tinted icon chip, a Space Grotesk figure, and
 * an optional up/down delta. Lifts on hover.
 */
export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  /** e.g. { value: '+12%', direction: 'up' }. */
  delta?: { value: string; direction: 'up' | 'down' };
  /** Render the value in the money/green accent (rewards $). */
  money?: boolean;
  className?: string;
}

export function StatCard({ label, value, icon, delta, money, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'sticker lift relative overflow-hidden rounded-card bg-card p-[18px]',
        className,
      )}
    >
      {icon && (
        <div className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-[11px] border-2 border-ink bg-brand-soft text-brand [&_svg]:h-[18px] [&_svg]:w-[18px]">
          {icon}
        </div>
      )}
      <div className="mt-3 text-[12.5px] font-semibold text-muted">{label}</div>
      <div
        className={cn(
          'num mt-0.5 font-display text-[28px] font-bold leading-none tracking-tight',
          money ? 'text-money-ink' : 'text-ink',
        )}
      >
        {value}
      </div>
      {delta && (
        <div
          className={cn(
            'relative z-10 mt-1.5 inline-flex items-center gap-1 font-mono text-xs font-bold',
            delta.direction === 'up' ? 'text-money-ink' : 'text-danger',
          )}
        >
          {delta.direction === 'up' ? (
            <ArrowUpRight className="h-3.5 w-3.5" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5" />
          )}
          {delta.value}
        </div>
      )}
    </div>
  );
}
