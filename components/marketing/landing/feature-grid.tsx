import { BarChart3, Gift, MapPin, MessageCircle, ShieldCheck, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Eyebrow } from '@/components/shared/sticker';
import { TiltCard } from './tilt-card';
import { Reveal } from './reveal';

type Feature = { icon: LucideIcon; tint: string; title: string; body: string };

// The design's six features (icon + tinted tile). Its copy differs from
// lib/FEATURES, so the list lives here rather than editing the shared content.
const FEATURES: Feature[] = [
  {
    icon: MapPin,
    tint: 'bg-brand-soft',
    title: 'Hyper-local matching',
    body: 'Discovery is distance-first. Every campaign is someone within a few miles of you.',
  },
  {
    icon: Gift,
    tint: 'bg-money-soft',
    title: 'Rewards, not invoices',
    body: 'Skip the paperwork. Perks and product swap hands the moment content is approved.',
  },
  {
    icon: MessageCircle,
    tint: 'bg-warn-soft',
    title: 'Built-in messaging',
    body: 'Businesses and creators coordinate in real time, right inside every collab.',
  },
  {
    icon: ShieldCheck,
    tint: 'bg-danger-soft',
    title: 'Verified both ways',
    body: 'Real businesses, real creators. Handles and locations are checked before you match.',
  },
  {
    icon: BarChart3,
    tint: 'bg-brand-soft',
    title: 'Track every collab',
    body: 'Applications, active deals, and submissions — all in one clean dashboard.',
  },
  {
    icon: Zap,
    tint: 'bg-money-soft',
    title: 'Live in minutes',
    body: "No agency, no contracts. Post a campaign or apply and you're moving today.",
  },
];

/** "Built for the block" — a 3x2 grid of sticker feature cards. */
export function FeatureGrid() {
  return (
    <section id="creators" className="bg-page py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-shell px-6 lg:px-10">
        <div className="mb-10 max-w-2xl">
          <Eyebrow>Built for the block</Eyebrow>
          <h2 className="mt-3 text-balance font-display text-4xl font-bold leading-[1.02] tracking-[-0.03em] text-ink sm:text-[46px]">
            Everything you need to run local right
          </h2>
        </div>

        <Reveal className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <TiltCard key={f.title} className="pop sticker rounded-[22px] bg-card p-[26px]">
              <span
                className={`sticker flex h-14 w-14 -rotate-[4deg] items-center justify-center rounded-2xl text-ink shadow-[3px_3px_0_#14181F] ${f.tint}`}
                aria-hidden
              >
                <f.icon size={26} strokeWidth={2.25} />
              </span>
              <h3 className="mt-5 font-display text-[19px] font-bold tracking-[-0.01em] text-ink">
                {f.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-body">{f.body}</p>
            </TiltCard>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
