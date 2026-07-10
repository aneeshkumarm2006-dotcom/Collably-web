'use client';

import { useEffect, useRef, useState } from 'react';

const DURATION_MS = 1300;

/** Cubic ease-out: fast start, long settle. Matches the design's stat tiles. */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Counts from 0 to `target` once the element scrolls into view.
 *
 * Returns the current value plus a ref to attach to the element being watched.
 * The value starts at `target`, not 0, so server-rendered HTML and the
 * reduced-motion path both show the real figure — a crawler or a user who never
 * scrolls will never see a stat frozen at zero.
 */
export function useCountUp<T extends HTMLElement = HTMLSpanElement>(target: number) {
  const ref = useRef<T>(null);
  const [value, setValue] = useState(target);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    let started = false;

    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / DURATION_MS, 1);
        setValue(Math.round(easeOut(t) * target));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || started) continue;
          started = true;
          setValue(0);
          run();
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [target]);

  return { ref, value };
}
