import Link from 'next/link';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';
import { BUSINESS_TIERS } from '@/lib/marketing-content';
import { Eyebrow, StickerButton, Pill } from '@/components/shared/sticker';
import { TiltCard } from './tilt-card';
import { Reveal } from './reveal';

/**
 * Pricing plans, read from the canonical `BUSINESS_TIERS` that `/pricing` also
 * renders. The landing shows monthly rates only — the billing toggle lives on
 * the pricing page — so the annual rate is shown as a sub-line.
 *
 * The landing lists the first four features per tier to keep the three cards the
 * same height; the full list is on `/pricing`.
 */
const LANDING_FEATURE_COUNT = 4;

export function Pricing() {
  return (
    <section id="pricing" className="bg-page py-20">
      <div className="mx-auto max-w-shell px-6 lg:px-10">
        <div className="mx-auto mb-11 max-w-xl text-center">
          <Eyebrow className="justify-center text-brand">Simple pricing</Eyebrow>
          <h2 className="mt-3 text-balance font-display text-4xl font-bold leading-[1.02] tracking-[-0.03em] text-ink sm:text-[46px]">
            Free to start. Grow when you&apos;re ready.
          </h2>
        </div>

        <Reveal className="grid items-start gap-6 lg:grid-cols-3">
          {BUSINESS_TIERS.map((p) => {
            const free = p.monthly === 0;
            return (
              <TiltCard
                key={p.name}
                className={cn(
                  'r sticker relative flex flex-col rounded-[24px] p-8',
                  p.featured ? 'bg-brand text-white shadow-sticker-lg' : 'bg-card text-ink',
                )}
              >
                {p.featured && (
                  <div className="absolute -top-3 right-8">
                    <Pill tone="yellow">Most popular</Pill>
                  </div>
                )}
                <h3 className="font-display text-xl font-bold">{p.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="num font-mono text-[44px] font-bold tracking-[-0.02em]">
                    {free ? 'Free' : `$${p.monthly}`}
                  </span>
                  {!free && (
                    <span className={cn('text-sm', p.featured ? 'text-white/70' : 'text-muted')}>/mo</span>
                  )}
                </div>
                <p className={cn('mt-1 font-mono text-xs', p.featured ? 'text-white/70' : 'text-muted')}>
                  {free ? 'No monthly fee' : `$${p.annual}/mo billed annually`}
                </p>
                <p className={cn('mt-4 text-sm leading-relaxed', p.featured ? 'text-white/80' : 'text-body')}>
                  {p.note}
                </p>

                <ul className="mt-6 flex flex-1 flex-col gap-3">
                  {p.features.slice(0, LANDING_FEATURE_COUNT).map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[14px]">
                      <Check
                        className={cn('mt-0.5 h-4 w-4 shrink-0', p.featured ? 'text-yellow' : 'text-money-ink')}
                        aria-hidden
                      />
                      <span className={p.featured ? 'text-white/90' : 'text-body'}>{f}</span>
                    </li>
                  ))}
                </ul>

                <StickerButton
                  asChild
                  tone={p.featured ? 'yellow' : 'ink'}
                  size="lg"
                  className="mt-8 w-full"
                >
                  <Link href={p.cta.href}>{p.cta.label}</Link>
                </StickerButton>
              </TiltCard>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
