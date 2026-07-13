import { Coffee, Dumbbell, Sparkles, UtensilsCrossed } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Eyebrow } from '@/components/shared/sticker';
import { TiltCard } from './tilt-card';
import { Reveal } from './reveal';

type Reward = { icon: LucideIcon; title: string; by: string; value: string };

// The design's four sample rewards (perk → the local business → dollar value).
const REWARDS: Reward[] = [
  { icon: Coffee, title: 'A month of free coffee', by: 'Bloom Coffee Co.', value: '$120' },
  { icon: UtensilsCrossed, title: 'Dinner for two', by: 'Casa Verde', value: '$180' },
  { icon: Dumbbell, title: '3-month membership', by: 'RiverFit Studio', value: '$285' },
  { icon: Sparkles, title: 'Full spa day', by: 'Lumen Beauty Bar', value: '$240' },
];

/**
 * Dark rewards band. Copy on the left, a 2x2 grid of real reward offers (with
 * their dollar values) on the right — the "never exposure" proof point.
 */
export function RewardsBand() {
  return (
    <section className="relative overflow-hidden border-y-outline border-ink bg-band py-20 text-white">
      <svg
        aria-hidden
        viewBox="0 0 200 200"
        className="pointer-events-none absolute -right-5 -top-8 w-72 opacity-[0.14]"
      >
        <circle cx="100" cy="100" r="60" stroke="#5FD37F" strokeWidth="3" fill="none" />
        <circle cx="100" cy="100" r="90" stroke="#5FD37F" strokeWidth="3" fill="none" />
      </svg>

      <div className="relative mx-auto grid max-w-shell items-center gap-12 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
        <Reveal>
          <div className="r">
            <Eyebrow className="text-band-money">Real rewards</Eyebrow>
            <h2 className="mt-3 font-display text-4xl font-bold leading-[1.02] tracking-[-0.03em] sm:text-[46px]">
              Not points.
              <br />
              Not &ldquo;exposure.&rdquo;
              <br />
              <span className="text-yellow">Actual stuff.</span>
            </h2>
            <p className="mt-4 max-w-md text-[18px] leading-relaxed text-[#B7C4BC]">
              Creators cash in on things they&apos;d buy anyway — from the businesses right around the
              corner.
            </p>
          </div>
        </Reveal>

        <Reveal className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {REWARDS.map((r) => (
            <TiltCard
              key={r.title}
              className="pop rounded-[18px] border-outline border-band-border bg-band-card p-[22px] shadow-[5px_6px_0_#061810]"
            >
              <div className="text-yellow" aria-hidden>
                <r.icon size={30} strokeWidth={2} />
              </div>
              <div className="mt-3 font-display text-base font-bold text-white">{r.title}</div>
              <div className="mt-1 text-[13px] text-[#8FAE9C]">{r.by}</div>
              <span className="mt-3.5 inline-block rounded-[9px] bg-band-pill px-3 py-1.5 font-mono text-sm font-semibold text-band-money">
                {r.value}
              </span>
            </TiltCard>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
