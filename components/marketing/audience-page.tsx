import Link from 'next/link';
import { ArrowRight, BadgeCheck, type LucideIcon } from 'lucide-react';

import { Container, Section, SectionLabel } from '@/components/marketing/section';
import { CtaBand } from '@/components/marketing/cta-band';
import { Faq, type FaqItem } from '@/components/marketing/faq';
import { Reveal } from '@/components/shared/reveal';
import { StickerButton, StickerCard, Pill } from '@/components/shared/sticker';

export interface AudiencePageConfig {
  /** Accent theme for the page: creators = brand blue, businesses = coral. */
  tone: 'creator' | 'business';
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  /** Quick trust chips under the hero CTAs. */
  highlights: string[];
  /** Floating info card shown on the hero panel. */
  heroCard: { label: string; title: string; sub: string };
  benefitsTitle: string;
  benefitsLabel: string;
  benefits: { icon: LucideIcon; title: string; body: string }[];
  stepsTitle: string;
  stepsLabel: string;
  steps: { title: string; body: string }[];
  faqsTitle?: string;
  faqs: FaqItem[];
  cta: { title: React.ReactNode; subtitle: string; primary: { label: string; href: string } };
}

const THEME = {
  creator: {
    panel: 'bg-brand',
    glyph: 'bg-yellow text-ink',
    num: 'bg-brand text-white',
  },
  business: {
    panel: 'bg-coral',
    glyph: 'bg-yellow text-ink',
    num: 'bg-coral text-white',
  },
} as const;

/** Rotating soft-tint glyph tiles for the benefits grid. */
const GLYPH_TONES = [
  'bg-brand-soft text-brand',
  'bg-coral text-white',
  'bg-grape-soft text-grape',
  'bg-money-soft text-money-ink',
];

/**
 * Shared audience landing template (For Creators / For Businesses). A 2-column
 * hero with a solid sticker panel, a benefits grid, numbered steps, FAQ, and a
 * closing CTA, driven by config so the two pages stay structurally identical.
 */
export function AudiencePage({ config }: { config: AudiencePageConfig }) {
  const theme = THEME[config.tone];

  return (
    <>
      {/* Hero */}
      <header className="relative overflow-hidden bg-page text-ink">
        <Container className="relative py-16 sm:py-20 lg:py-24">
          <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr]">
            <div>
              <Pill tone={config.tone === 'creator' ? 'brand' : 'yellow'}>{config.eyebrow}</Pill>
              <h1 className="mt-6 text-balance font-display text-[40px] font-extrabold leading-[1.0] tracking-[-0.03em] sm:text-[52px] lg:text-[58px]">
                {config.title}
              </h1>
              <p className="mt-6 max-w-lg text-pretty text-lg leading-relaxed text-muted">
                {config.subtitle}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <StickerButton asChild size="lg">
                  <Link href={config.primaryCta.href}>
                    {config.primaryCta.label} <ArrowRight className="h-4 w-4" />
                  </Link>
                </StickerButton>
                {config.secondaryCta && (
                  <StickerButton asChild tone="white" size="lg">
                    <Link href={config.secondaryCta.href}>{config.secondaryCta.label}</Link>
                  </StickerButton>
                )}
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
                {config.highlights.map((h, i) => (
                  <span key={h} className="flex items-center gap-4">
                    {i > 0 && <span className="h-1 w-1 rounded-full bg-hair-strong" />}
                    {h}
                  </span>
                ))}
              </div>
            </div>

            {/* Sticker panel with floating info card */}
            <div className="relative mx-auto w-full max-w-[440px]">
              <div
                className={`sticker relative h-[340px] w-full overflow-hidden rounded-3xl shadow-sticker-lg ${theme.panel}`}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-3xl border-outline border-ink bg-yellow animate-ls-float"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute -bottom-10 -left-6 h-36 w-36 rounded-full border-outline border-ink bg-page/90 animate-ls-float-r"
                />
              </div>
              <StickerCard className="absolute -bottom-6 left-6 right-6 flex items-center gap-3.5 p-4 animate-ls-bob">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-card border-outline border-ink ${theme.glyph}`}
                >
                  <BadgeCheck className="h-5 w-5" />
                </span>
                <div className="text-sm">
                  <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-coral">
                    {config.heroCard.label}
                  </div>
                  <div className="mt-0.5 font-display font-bold text-ink">{config.heroCard.title}</div>
                  <div className="text-xs text-muted">{config.heroCard.sub}</div>
                </div>
              </StickerCard>
            </div>
          </div>
        </Container>
      </header>

      {/* Benefits */}
      <Section tone="card" className="border-t-outline border-ink">
        <div className="mb-12 text-center">
          <SectionLabel className="justify-center">{config.benefitsLabel}</SectionLabel>
          <h2 className="mt-4 text-balance font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-[46px]">
            {config.benefitsTitle}
          </h2>
        </div>
        <Reveal className="grid gap-6 md:grid-cols-3">
          {config.benefits.map((b, i) => (
            <StickerCard key={b.title} lift className="group r p-7 hover:!-translate-y-1">
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-card border-outline border-ink transition-transform duration-150 group-hover:rotate-3 ${GLYPH_TONES[i % GLYPH_TONES.length]}`}
              >
                <b.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-lg font-bold text-ink">{b.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{b.body}</p>
            </StickerCard>
          ))}
        </Reveal>
      </Section>

      {/* Steps */}
      <Section tone="page" className="border-t-outline border-ink">
        <div className="mb-12 text-center">
          <SectionLabel className="justify-center">{config.stepsLabel}</SectionLabel>
          <h2 className="mt-4 text-balance font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-[46px]">
            {config.stepsTitle}
          </h2>
        </div>
        <Reveal className="grid gap-6 md:grid-cols-3">
          {config.steps.map((step, i) => (
            <StickerCard
              key={step.title}
              className="group r p-7 transition-[transform,box-shadow] duration-200 hover:!-translate-y-1 hover:shadow-sticker-lg"
            >
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full border-outline border-ink font-display text-sm font-bold transition-transform duration-150 group-hover:-rotate-6 ${theme.num}`}
              >
                {i + 1}
              </span>
              <h3 className="mt-5 font-display text-lg font-bold text-ink">{step.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{step.body}</p>
            </StickerCard>
          ))}
        </Reveal>
      </Section>

      {/* FAQ */}
      <Section tone="card" className="border-t-outline border-ink">
        <div className="mb-12 text-center">
          <SectionLabel className="justify-center">FAQ</SectionLabel>
          <h2 className="mt-4 text-balance font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-[46px]">
            {config.faqsTitle ?? 'Questions, answered'}
          </h2>
        </div>
        <div className="mx-auto max-w-3xl">
          <Faq items={config.faqs} />
        </div>
      </Section>

      <CtaBand
        className="border-t-outline border-ink"
        title={config.cta.title}
        subtitle={config.cta.subtitle}
        primary={config.cta.primary}
      />
    </>
  );
}
