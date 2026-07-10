'use client';

import { useCountUp } from '@/lib/motion';

/**
 * A stat figure that counts up on scroll-in without ever altering the value the
 * server rendered. Only plain integer figures (optionally comma-grouped, with a
 * text prefix/suffix like "$" or "+") animate; anything with a decimal or unit
 * shorthand (e.g. "$1.2M+") is left exactly as-is so fidelity is preserved. The
 * count-up hook itself starts at the target, so no-JS / reduced-motion / crawler
 * paths always show the real number.
 */
export function StatFigure({ value, className }: { value: string; className?: string }) {
  const m = /^(\D*)([\d,]+)(\D*)$/.exec(value);
  if (!m) return <span className={className}>{value}</span>;
  return <AnimatedFigure prefix={m[1]} digits={m[2]} suffix={m[3]} className={className} />;
}

function AnimatedFigure({
  prefix,
  digits,
  suffix,
  className,
}: {
  prefix: string;
  digits: string;
  suffix: string;
  className?: string;
}) {
  const grouped = digits.includes(',');
  const { ref, value } = useCountUp<HTMLSpanElement>(Number(digits.replace(/,/g, '')));
  return (
    <span ref={ref} className={className}>
      {prefix}
      {grouped ? value.toLocaleString('en-US') : value}
      {suffix}
    </span>
  );
}

/** Count-up wrapper for a dollar price (integer CAD), e.g. the pricing tiers. */
export function CountUpPrice({ value, className }: { value: number; className?: string }) {
  const { ref, value: n } = useCountUp<HTMLSpanElement>(value);
  return (
    <span ref={ref} className={className}>
      ${n}
    </span>
  );
}
