'use client';

import { useCountUp } from '@/lib/motion';
import { formatCurrency } from '@/lib/format';

/**
 * Count-up leaf for the Overview stat tiles. Animates 0 → target once the tile
 * scrolls into view (via `useCountUp`), then holds the real figure. Degrades
 * gracefully: with JS off or reduced-motion set it renders the final value
 * immediately, so the number is never stuck at zero. `currency` formats the
 * running figure as money (rewards); otherwise a plain integer.
 */
export function StatValue({ value, currency = false }: { value: number; currency?: boolean }) {
  const { ref, value: n } = useCountUp<HTMLSpanElement>(value);
  return <span ref={ref}>{currency ? formatCurrency(n) : n}</span>;
}
