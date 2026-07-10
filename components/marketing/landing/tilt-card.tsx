'use client';

import { useTilt } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * Cursor-tracking 3D tilt with a glare highlight, per the v3 landing cards.
 *
 * A client leaf, so the sections that use it stay Server Components — the tilt
 * only needs pointer handlers, not the card's content, on the client.
 *
 * Degrades to a plain card: `useTilt` no-ops for reduced-motion users and for
 * coarse pointers, and with JS off the CSS vars simply never get set (the
 * `.tilt` transform resolves to 0deg).
 */
export function TiltCard({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  const { ref, tiltProps } = useTilt<HTMLDivElement>();

  return (
    <div ref={ref} {...tiltProps} className={cn('tilt', className)} {...rest}>
      {children}
    </div>
  );
}
