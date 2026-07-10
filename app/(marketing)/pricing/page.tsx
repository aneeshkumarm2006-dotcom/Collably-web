import type { Metadata } from 'next';

import { buildMetadata } from '@/lib/seo';
import { BUSINESS_TIERS } from '@/lib/marketing-content';
import { Section, SectionLabel } from '@/components/marketing/section';
import { CtaBand } from '@/components/marketing/cta-band';
import { Faq } from '@/components/marketing/faq';
import { PricingTiers, type CreatorBanner } from './pricing-tiers';

export const metadata: Metadata = buildMetadata({
  title: 'Pricing',
  description:
    'LocalShout is free for creators and fair for businesses. Post collabs and pay only in the rewards you offer, with no agency retainers. Upgrade for advanced reach and analytics.',
  path: '/pricing',
  ogEyebrow: 'Pricing',
});

const CREATOR_BANNER: CreatorBanner = {
  title: 'Creators — Free, forever',
  subtitle:
    'Browse collabs, apply with a pitch, and unlock real rewards. No fees, no follower minimums, no catch.',
  cta: { label: 'Join as a creator', href: '/signup' },
};


const PRICING_FAQS = [
  {
    q: 'Is LocalShout really free for creators?',
    a: 'Yes. Creating an account, building a profile, browsing, applying, and unlocking rewards are all free for creators, forever.',
  },
  {
    q: 'What does "pay only in rewards" mean on Starter?',
    a: 'Instead of a cash retainer to an agency, you reward creators with what you already have: real meals, services, products, vouchers or memberships. You set the reward and its value, and only reward verified work.',
  },
  {
    q: 'Can I switch between monthly and annual?',
    a: 'Anytime. Annual billing saves you 20% versus paying monthly, and you can upgrade, downgrade, or cancel whenever your needs change.',
  },
  {
    q: 'When should I consider Pro?',
    a: 'Pro is for brands running many collabs at once, across multiple locations or a team, who want unlimited campaigns, deeper analytics and priority support.',
  },
];

export default function PricingPage() {
  return (
    <>
      <Section tone="page">
        <div className="mb-10 text-center">
          <SectionLabel className="justify-center">Pricing</SectionLabel>
          <h1 className="mt-5 text-balance font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-[52px]">
            Free for creators.
            <br />
            Fair for businesses.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-muted">
            Creators never pay a cent. Businesses start free and pay only in the rewards they offer —
            upgrade when you&apos;re ready to scale.
          </p>
        </div>

        <PricingTiers banner={CREATOR_BANNER} tiers={BUSINESS_TIERS} />

        <p className="mt-8 text-center text-sm text-muted">
          Prices in CAD. Rewards are provided directly by businesses to creators.
        </p>
      </Section>

      <Section tone="card" className="border-t-outline border-ink">
        <div className="mb-12 text-center">
          <SectionLabel className="justify-center">FAQ</SectionLabel>
          <h2 className="text-balance font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-[46px]">
            Pricing questions
          </h2>
        </div>
        <div className="mx-auto max-w-3xl">
          <Faq items={PRICING_FAQS} />
        </div>
      </Section>

      <CtaBand
        className="border-t-outline border-ink"
        title="Start free, today."
        subtitle="Join as a creator or list your business. No card required to get started."
        primary={{ label: 'Join as a creator', href: '/for-creators' }}
        secondary={{ label: "I'm a business", href: '/for-businesses' }}
      />
    </>
  );
}
