'use client';

import { useEffect, useRef } from 'react';

/**
 * Scroll reveal with sibling stagger.
 *
 * Attach the returned ref to any container. Every `.r` (rise) and `.pop`
 * (spring) descendant is revealed once as it enters the viewport, with siblings
 * offset so a row of cards cascades rather than snapping in together.
 *
 * Elements start hidden via CSS, so if this effect never runs — no JS, or a
 * hydration failure — they'd be stuck invisible. The reduced-motion block in
 * `globals.css` un-hides them for that audience, and we bail out early here so
 * they aren't animated. For the no-JS case the risk is real but accepted: the
 * `.r`/`.pop` classes are only ever applied by client components.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>('.r, .pop'));
    if (targets.length === 0) return;

    // Reduced motion: CSS already reveals these. Don't observe or delay.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      targets.forEach((el) => el.classList.add('in'));
      return;
    }

    // Stagger is computed per parent, so each row/grid cascades independently.
    const indexWithinParent = new Map<HTMLElement, number>();
    const seen = new Map<Element, number>();
    for (const el of targets) {
      const parent = el.parentElement;
      if (!parent) continue;
      const next = seen.get(parent) ?? 0;
      indexWithinParent.set(el, next);
      seen.set(parent, next + 1);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          const i = indexWithinParent.get(el) ?? 0;
          el.style.transitionDelay = `${Math.min(i * 0.08, 0.48)}s`;
          el.classList.add('in');
          // Reveal is one-way: stop observing so scrolling back up doesn't reset it.
          observer.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return ref;
}
