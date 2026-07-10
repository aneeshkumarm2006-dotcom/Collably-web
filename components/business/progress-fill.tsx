'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

/**
 * The colored fill inside a progress track. Grows from 0 to `pct` on mount via a
 * pure CSS width transition — one `requestAnimationFrame` flips the width, the
 * browser animates it, no timers or springs.
 *
 * Reduced-motion lands on the real width instantly. Aria lives on the parent
 * track, so this fill is decorative (`aria-hidden`). These bars only render in
 * client-rendered lists, so there is no no-JS regression: the track is empty
 * until the fill mounts either way.
 */
export function ProgressFill({ pct, className }: { pct: number; className?: string }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setWidth(pct);
      return;
    }
    const frame = requestAnimationFrame(() => setWidth(pct));
    return () => cancelAnimationFrame(frame);
  }, [pct]);

  return (
    <div
      aria-hidden
      className={cn('h-full rounded-full transition-[width] duration-700 ease-out', className)}
      style={{ width: `${width}%` }}
    />
  );
}
