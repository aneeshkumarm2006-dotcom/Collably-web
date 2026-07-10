'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

import { cn } from '@/lib/utils';
import { StickerButton, Pill } from '@/components/shared/sticker';
import { Reveal } from '@/components/shared/reveal';
import { CountUpPrice } from '@/components/marketing/count-up';
import type { BusinessTier } from '@/lib/marketing-content';

export interface CreatorBanner {
  title: string;
  subtitle: string;
  cta: { label: string; href: string };
}



/**
 * Client island: monthly/annual billing toggle + the free creators banner and
 * the three business tier cards. Kept separate so the pricing page stays a
 * server component (metadata export).
 */
export function PricingTiers({ banner, tiers }: { banner: CreatorBanner; tiers: BusinessTier[] }) {
  const [annual, setAnnual] = useState(false);

  return (
    <div>
      {/* Billing toggle */}
      <div className="mb-10 flex justify-center">
        <div
          role="radiogroup"
          aria-label="Billing period"
          className="sticker inline-flex items-center gap-1 rounded-full bg-card p-1"
        >
          <ToggleOption selected={!annual} onClick={() => setAnnual(false)} label="Monthly" />
          <ToggleOption
            selected={annual}
            onClick={() => setAnnual(true)}
            label={
              <>
                Annual
                <span
                  className={cn(
                    'ml-2 rounded-full px-2 py-0.5 text-[11px] font-bold',
                    annual ? 'bg-white/20 text-white' : 'bg-money-soft text-money-ink',
                  )}
                >
                  save 20%
                </span>
              </>
            }
          />
        </div>
      </div>

      {/* Creators — free forever banner */}
      <div className="sticker relative mb-8 overflow-hidden rounded-3xl bg-brand px-6 py-8 text-white shadow-sticker-lg sm:px-10">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-3xl border-outline border-ink bg-yellow animate-ls-float"
        />
        <div className="relative flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-extrabold tracking-[-0.02em] sm:text-3xl">
              {banner.title}
            </h2>
            <p className="mt-2 max-w-xl text-[15px] text-white/90">{banner.subtitle}</p>
          </div>
          <StickerButton asChild tone="yellow" size="lg" className="shrink-0">
            <Link href={banner.cta.href}>
              {banner.cta.label} <ArrowRight className="h-4 w-4" />
            </Link>
          </StickerButton>
        </div>
      </div>

      {/* Business tiers */}
      <div className="mb-6 text-center font-mono text-[12px] font-semibold uppercase tracking-[0.14em] text-coral">
        For businesses
      </div>
      <Reveal className="grid gap-6 lg:grid-cols-3">
        {tiers.map((tier) => {
          const price = annual ? tier.annual : tier.monthly;
          return (
            <div
              key={tier.name}
              className={cn(
                'pop sticker relative flex flex-col rounded-card bg-card p-7',
                'transition-[transform,box-shadow] duration-200 hover:!-translate-y-1 hover:shadow-sticker-lg',
                tier.featured && 'bg-brand-soft shadow-sticker-lg',
              )}
            >
              {tier.featured && (
                <span className="absolute -top-3 left-7">
                  <Pill tone="ink">Most popular</Pill>
                </span>
              )}
              <h3 className="font-display text-lg font-bold text-ink">{tier.name}</h3>
              <div className="mt-4 flex items-baseline gap-1.5">
                <CountUpPrice
                  value={price}
                  className="font-display text-5xl font-extrabold tracking-[-0.03em] text-ink"
                />
                <span className="font-mono text-sm text-muted">/mo</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">{tier.note}</p>

              <StickerButton asChild size="lg" tone={tier.featured ? 'brand' : 'white'} className="mt-6">
                <Link href={tier.cta.href}>
                  {tier.cta.label} <ArrowRight className="h-4 w-4" />
                </Link>
              </StickerButton>

              <ul className="mt-7 flex flex-col gap-3 border-t-2 border-hair-strong pt-6">
                {tier.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-3 text-sm text-ink">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-outline border-ink bg-money text-white">
                      <Check className="h-3 w-3" />
                    </span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </Reveal>
    </div>
  );
}

function ToggleOption({
  selected,
  onClick,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  label: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-full px-5 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
        selected ? 'bg-brand text-white' : 'text-muted hover:text-ink',
      )}
    >
      {label}
    </button>
  );
}
