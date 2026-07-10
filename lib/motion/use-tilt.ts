'use client';

import { useCallback, useEffect, useRef } from 'react';

const MAX_DEG = 11;

/**
 * Cursor-following 3D tilt with a glare highlight, ported from the v3 design.
 *
 * On pointer-move it writes an inline `perspective(...) rotateX/rotateY` transform
 * (overriding the CSS `.tilt:hover` lift while the cursor moves) and updates the
 * `--mx/--my` glare origin the `.tilt::before` highlight tracks. On pointer-leave
 * it clears the inline transform so the CSS hover state takes over, then rests.
 *
 * Skipped for reduced-motion users and for coarse pointers — a tilt that tracks a
 * finger is nausea, not delight. When skipped, the pure-CSS `.tilt:hover` lift
 * still fires, so hovering always does *something*.
 */
export function useTilt<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const enabled = useRef(false);

  useEffect(() => {
    enabled.current =
      !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches &&
      !!window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;
  }, []);

  const onPointerMove = useCallback((event: React.PointerEvent<T>) => {
    const el = ref.current;
    if (!el || !enabled.current) return;

    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width; // 0..1
    const y = (event.clientY - rect.top) / rect.height;

    el.style.setProperty('--mx', `${x * 100}%`);
    el.style.setProperty('--my', `${y * 100}%`);
    el.style.transition = 'transform 0.09s ease';
    el.style.transform =
      `perspective(820px) rotateY(${(x - 0.5) * MAX_DEG}deg) ` +
      `rotateX(${-(y - 0.5) * MAX_DEG}deg) translateZ(6px)`;
  }, []);

  const onPointerLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    // Hand control back to the CSS `.tilt:hover` / rest state.
    el.style.transition = '';
    el.style.transform = '';
  }, []);

  return { ref, tiltProps: { onPointerMove, onPointerLeave } };
}
