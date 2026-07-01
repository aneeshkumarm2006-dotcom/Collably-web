'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface CreatorBanner {
  title: string;
  subtitle: string;
  cta: { label: string; href: string };
}

export interface BusinessTier {
  name: string;
  monthly: number;
  annual: number;
  note: string;
  cta: { label: string; href: string };
  features: string[];
  featured?: boolean;
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
          className="inline-flex items-center gap-1 rounded-full border border-hair bg-card p-1 shadow-card"
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
                    annual ? 'bg-white/20 text-white' : 'bg-mint-soft text-money',
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
      <div
        className="relative mb-8 overflow-hidden rounded-[26px] px-6 py-8 text-white sm:px-10"
        style={{ background: 'linear-gradient(130deg,#0064E0,#7B61FF)' }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"
        />
        <div className="relative flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-extrabold tracking-[-0.02em] sm:text-3xl">
              {banner.title}
            </h2>
            <p className="mt-2 max-w-xl text-[15px] text-white/85">{banner.subtitle}</p>
          </div>
          <Button asChild size="pill" className="shrink-0 bg-white text-brand hover:bg-white/90">
            <Link href={banner.cta.href}>
              {banner.cta.label} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Business tiers */}
      <div className="mb-6 text-center text-[13px] font-bold uppercase tracking-[0.1em] text-faint">
        For businesses
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {tiers.map((tier) => {
          const price = annual ? tier.annual : tier.monthly;
          return (
            <div
              key={tier.name}
              className={cn(
                'relative flex flex-col rounded-2xl bg-card p-7 transition',
                tier.featured
                  ? 'border-2 border-brand shadow-[0_20px_50px_-16px_rgba(0,100,224,0.4)]'
                  : 'border border-hair shadow-card',
              )}
            >
              {tier.featured && (
                <span className="absolute -top-3 left-7 rounded-full bg-brand px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                  Most popular
                </span>
              )}
              <h3 className="font-display text-lg font-bold text-ink">{tier.name}</h3>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="font-display text-5xl font-extrabold tracking-[-0.03em] text-ink">
                  ${price}
                </span>
                <span className="text-sm text-muted">/mo</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">{tier.note}</p>

              <Button
                asChild
                size="pill"
                className="mt-6"
                variant={tier.featured ? 'default' : 'outline'}
              >
                <Link href={tier.cta.href}>
                  {tier.cta.label} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <ul className="mt-7 flex flex-col gap-3 border-t border-hair pt-6">
                {tier.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-3 text-sm text-ink">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                      <Check className="h-3 w-3" />
                    </span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
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
