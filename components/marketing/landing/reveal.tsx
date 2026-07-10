'use client';

import { useReveal } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * Scroll-reveal wrapper. Attaches `useReveal()` to a container so every `.r`
 * (rise) and `.pop` (spring) descendant animates in with sibling stagger. Keeps
 * the surrounding section a Server Component — only this thin island is client.
 */
export function Reveal({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
