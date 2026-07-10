'use client';

import { useReveal } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * Scroll-reveal wrapper, usable on any surface. Attaches `useReveal()` to a
 * container so every `.r` (rise) and `.pop` (spring) descendant animates in with
 * sibling stagger. Keeps the surrounding section a Server Component — only this
 * thin island is client.
 *
 * SAFE BY DESIGN: the hidden state is gated on the `.js` class (added by the
 * client bundle, see app/providers.tsx). If the bundle never boots, descendants
 * stay fully visible — reveal is an enhancement, never a precondition for seeing
 * content. Pass `as` to change the wrapper element (e.g. "ul", "section").
 */
export function Reveal({
  as: Tag = 'div',
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLElement> & { as?: 'div' | 'section' | 'ul' | 'ol' }) {
  const ref = useReveal<HTMLElement>();
  return (
    <Tag ref={ref as never} className={cn(className)} {...rest}>
      {children}
    </Tag>
  );
}
