'use client';

import { useCountUp } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { Reveal } from './reveal';
import { TiltCard } from './tilt-card';

/**
 * Four pastel sticker tiles with count-up figures, each in its own accent (blue,
 * green, amber, red) to match the design. The count-up hook animates integers,
 * so the rewards figure counts 1200 and formats down to "$1.2M".
 */
type Tile = {
  target: number;
  divisor?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  bg: string;
  ink: string;
};

const TILES: Tile[] = [
  { target: 8400, suffix: '+', label: 'Active creators', bg: 'bg-brand-soft', ink: 'text-brand' },
  { target: 2100, suffix: '+', label: 'Local businesses', bg: 'bg-money-soft', ink: 'text-money-ink' },
  { target: 142, label: 'Live campaigns', bg: 'bg-warn-soft', ink: 'text-warn' },
  {
    target: 1200,
    divisor: 1000,
    decimals: 1,
    prefix: '$',
    suffix: 'M',
    label: 'Rewards claimed',
    bg: 'bg-danger-soft',
    ink: 'text-danger-ink',
  },
];

export function StatsBand() {
  return (
    <section className="bg-page py-16 sm:py-20">
      <Reveal className="mx-auto grid max-w-shell gap-[18px] px-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
        {TILES.map((t) => (
          <StatTile key={t.label} tile={t} />
        ))}
      </Reveal>
    </section>
  );
}

function StatTile({ tile }: { tile: Tile }) {
  const { ref, value } = useCountUp<HTMLDivElement>(tile.target);
  const shown = tile.divisor
    ? (value / tile.divisor).toFixed(tile.decimals ?? 0)
    : value.toLocaleString('en-CA');

  return (
    <TiltCard className={cn('pop sticker rounded-[20px] px-5 py-7 text-center', tile.bg)}>
      <div ref={ref}>
        <div className={cn('num font-mono text-[44px] font-semibold tracking-[-0.02em]', tile.ink)}>
          {tile.prefix}
          {shown}
          {tile.suffix}
        </div>
        <div className={cn('mt-0.5 text-sm font-semibold opacity-80', tile.ink)}>{tile.label}</div>
      </div>
    </TiltCard>
  );
}
