import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * StatCard: dashboard metric tile. Mono number (optionally money-green),
 * a rounded icon chip, and an optional up/down delta.
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
        'relative overflow-hidden rounded-2xl border border-hair bg-card p-[18px] shadow-card',
        className,
      )}
    >
      {/* Soft tinted corner blob, matching the design's stat tiles. */}
      <span className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-brand-soft opacity-60" />
      {icon && (
        <div className="relative z-10 inline-flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-brand-soft text-brand [&_svg]:h-[18px] [&_svg]:w-[18px]">
          {icon}
        </div>
      )}
      <div className="relative z-10 mt-3 text-[12.5px] font-semibold text-faint">{label}</div>
      <div
        className={cn(
          'relative z-10 mt-0.5 font-display text-[28px] font-extrabold leading-none tracking-tight',
          money ? 'text-money' : 'text-ink',
        )}
      >
        {value}
      </div>
      {delta && (
        <div
          className={cn(
            'relative z-10 mt-1.5 inline-flex items-center gap-1 text-xs font-bold',
            delta.direction === 'up' ? 'text-success' : 'text-danger',
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
