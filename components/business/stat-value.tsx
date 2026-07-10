'use client';

import { useCountUp } from '@/lib/motion';
import { formatCompactCurrency, formatCompactNumber } from '@/lib/format';

/** How the running figure is formatted while it counts up. */
type Format = 'number' | 'compactNumber' | 'compactCurrency';

/**
 * Count-up leaf for the business Overview stat tiles. Animates 0 → target once
 * the tile scrolls into view (via `useCountUp`), then holds the real figure.
 *
 * Degrades gracefully: with JS off or reduced-motion set it renders the final
 * value immediately, so the number is never stuck at zero. `format` mirrors the
 * server-side formatting so the figure reads identically once settled.
 */
export function StatValue({ value, format = 'number' }: { value: number; format?: Format }) {
  const { ref, value: n } = useCountUp<HTMLSpanElement>(value);
  const text =
    format === 'compactCurrency'
      ? formatCompactCurrency(n)
      : format === 'compactNumber'
        ? formatCompactNumber(n)
        : n;
  return <span ref={ref}>{text}</span>;
}
