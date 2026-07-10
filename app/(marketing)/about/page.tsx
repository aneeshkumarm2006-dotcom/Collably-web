import type { Metadata } from 'next';
import { Gift, MapPin, Sparkles } from 'lucide-react';

import { buildMetadata } from '@/lib/seo';
import { PLATFORM_STATS } from '@/lib/marketing-content';
import { Container, Section, SectionLabel } from '@/components/marketing/section';
import { CtaBand } from '@/components/marketing/cta-band';
import { StatFigure } from '@/components/marketing/count-up';
import { Reveal } from '@/components/shared/reveal';
import { StickerCard, Pill } from '@/components/shared/sticker';

export const metadata: Metadata = buildMetadata({
  title: 'About',
  description:
    'LocalShout is the local collab marketplace built to make creator and business partnerships fair, transparent, and effortless — for creators of every size and the local spots around them.',
  path: '/about',
  ogEyebrow: 'About',
});

const VALUES = [
  {
    icon: Gift,
    tone: 'bg-brand-soft text-brand',
    title: 'Real value, always',
    body: 'Every reward and its dollar value is clear before anyone applies. No vague "exposure," no surprises.',
  },
  {
    icon: Sparkles,
    tone: 'bg-coral text-white',
    title: 'No gatekeeping',
    body: 'Talent and fit beat follower counts. Nano and UGC creators deserve the same shot as anyone.',
  },
  {
    icon: MapPin,
    tone: 'bg-grape-soft text-grape',
    title: 'Local first',
    body: 'We connect creators with the businesses right in their neighbourhood, starting across Canada.',
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Story */}
      <Section tone="page" containerSize="narrow">
        <div className="text-center">
          <SectionLabel className="justify-center">Our story</SectionLabel>
          <h1 className="mt-5 text-balance font-display text-4xl font-extrabold leading-[1.03] tracking-[-0.03em] sm:text-[52px]">
            We&apos;re rebuilding local collabs — honestly.
          </h1>
        </div>
        <div className="mx-auto mt-8 max-w-2xl space-y-5 text-pretty text-lg leading-relaxed text-muted">
          <p>
            LocalShout started in a Toronto café in 2024. A brilliant local creator was turned away by
            an agency for not having &quot;enough&quot; followers — while the café down the street was
            being quoted thousands a month for content that never felt real. Both wanted the same
            thing: a genuine collab. There was just no fair, transparent place to make it happen.
          </p>
          <p>
            So we built one. On LocalShout, a local spot posts a collab with a clear reward and exactly
            what they need. Creators browse opportunities in their niche and city, apply with a quick
            pitch, and get rewarded in real meals, services and products for verified work. No
            middlemen. No follower minimums. No &quot;we&apos;ll pay you in exposure.&quot;
          </p>
        </div>
      </Section>

      {/* Stats band */}
      <section className="bg-page pb-16 sm:pb-20">
        <Container>
          <div className="sticker relative overflow-hidden rounded-3xl bg-band px-6 py-12 text-white shadow-sticker-lg sm:px-12">
            <Reveal className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {PLATFORM_STATS.map((stat) => (
                <div key={stat.label} className="pop text-center">
                  <div className="font-display text-5xl font-extrabold tracking-[-0.03em] text-yellow sm:text-6xl">
                    <StatFigure value={stat.value} />
                  </div>
                  <div className="mt-2 font-mono text-[12px] font-semibold uppercase tracking-[0.1em] text-white/70">
                    {stat.label}
                  </div>
                </div>
              ))}
            </Reveal>
          </div>
        </Container>
      </section>

      {/* What we believe */}
      <Section tone="card" className="border-t-outline border-ink">
        <div className="mb-12 text-center">
          <SectionLabel className="justify-center">Our values</SectionLabel>
          <h2 className="mt-4 text-balance font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-[46px]">
            What we believe
          </h2>
        </div>
        <Reveal className="grid gap-6 md:grid-cols-3">
          {VALUES.map((v) => (
            <StickerCard key={v.title} lift className="group r p-7 hover:!-translate-y-1">
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-card border-outline border-ink transition-transform duration-150 group-hover:rotate-3 ${v.tone}`}
              >
                <v.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-lg font-bold text-ink">{v.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{v.body}</p>
            </StickerCard>
          ))}
        </Reveal>
        <div className="mt-12 flex justify-center">
          <Pill tone="brand">Proudly built in Canada</Pill>
        </div>
      </Section>

      <CtaBand
        className="border-t-outline border-ink"
        title="Come build with us."
        subtitle="Whether you create or run a local business, there's a place for you on LocalShout."
        primary={{ label: 'Join as a creator', href: '/for-creators' }}
        secondary={{ label: "I'm a business", href: '/for-businesses' }}
      />
    </>
  );
}
