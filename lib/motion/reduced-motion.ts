/**
 * True when the user has asked for reduced motion.
 *
 * The CSS in `globals.css` already neutralizes every keyframe and transition for
 * these users. This is for the JS-driven effects (count-up, cursor tilt) that
 * CSS can't reach — they must be skipped outright, not merely sped up.
 *
 * Returns `false` during SSR, which is correct: nothing animates until an effect
 * runs on the client anyway.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
