import Link from 'next/link';
import { ArrowRight, BadgeCheck, type LucideIcon } from 'lucide-react';

import { Container, Section, SectionLabel } from '@/components/marketing/section';
import { CtaBand } from '@/components/marketing/cta-band';
import { Faq, type FaqItem } from '@/components/marketing/faq';
import { Button } from '@/components/ui/button';

export interface AudiencePageConfig {
  /** Accent theme for the page: creators = blue, businesses = warm/orange. */
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
    badge: 'bg-brand-soft text-brand',
    glyph: 'bg-brand-soft text-brand',
    panel: 'linear-gradient(135deg,#0064E0,#7B61FF)',
    accent: 'bg-brand text-white',
    num: 'bg-brand text-white',
  },
  business: {
    badge: 'bg-warm-soft text-warm',
    glyph: 'bg-warm-soft text-warm',
    panel: 'linear-gradient(135deg,#FF6A3D,#FFB020)',
    accent: 'bg-warm text-white',
    num: 'bg-warm text-white',
  },
} as const;

const GLYPH_TONES = ['bg-brand-soft text-brand', 'bg-warm-soft text-warm', 'bg-grape-soft text-grape', 'bg-mint-soft text-mint'];

/**
 * Shared audience landing template (For Creators / For Businesses). A 2-column
 * hero with a gradient panel, a benefits grid, numbered steps, FAQ, and a closing
 * CTA, driven by config so the two pages stay structurally identical and on-brand.
 */
export function AudiencePage({ config }: { config: AudiencePageConfig }) {
  const theme = THEME[config.tone];

  return (
    <>
      {/* Hero */}
      <header className="relative overflow-hidden bg-page text-ink">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(820px 460px at 82% 6%, rgba(24,119,242,0.10), transparent 60%)',
          }}
        />
        <Container className="relative py-16 sm:py-20 lg:py-24">
          <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr]">
            <div>
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[13px] font-bold ${theme.badge}`}
              >
                {config.eyebrow}
              </span>
              <h1 className="mt-6 text-balance font-display text-[40px] font-extrabold leading-[1.0] tracking-[-0.03em] sm:text-[52px] lg:text-[58px]">
                {config.title}
              </h1>
              <p className="mt-6 max-w-lg text-pretty text-lg leading-relaxed text-muted">
                {config.subtitle}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="pill">
                  <Link href={config.primaryCta.href}>
                    {config.primaryCta.label} <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                {config.secondaryCta && (
                  <Button asChild size="pill" variant="outline">
                    <Link href={config.secondaryCta.href}>{config.secondaryCta.label}</Link>
                  </Button>
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

            {/* Gradient panel with floating info card */}
            <div className="relative mx-auto w-full max-w-[440px]">
              <div
                className="relative h-[340px] w-full overflow-hidden rounded-3xl shadow-card-hover"
                style={{ background: theme.panel }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute -bottom-12 -left-8 h-48 w-48 rounded-[40px] bg-white/10 blur-2xl"
                />
              </div>
              <div className="absolute -bottom-6 left-6 right-6 flex items-center gap-3.5 rounded-2xl border border-hair bg-card p-4 shadow-card-hover animate-cb-float">
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${theme.glyph}`}>
                  <BadgeCheck className="h-5 w-5" />
                </span>
                <div className="text-sm">
                  <div className="text-xs font-bold uppercase tracking-[0.08em] text-faint">
                    {config.heroCard.label}
                  </div>
                  <div className="mt-0.5 font-bold text-ink">{config.heroCard.title}</div>
                  <div className="text-xs text-muted">{config.heroCard.sub}</div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </header>

      {/* Benefits */}
      <Section tone="card">
        <div className="mb-12 text-center">
          <SectionLabel className="justify-center">{config.benefitsLabel}</SectionLabel>
          <h2 className="mt-4 text-balance font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-[46px]">
            {config.benefitsTitle}
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {config.benefits.map((b, i) => (
            <div
              key={b.title}
              className="rounded-2xl border border-hair bg-card p-7 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover"
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${GLYPH_TONES[i % GLYPH_TONES.length]}`}
              >
                <b.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-lg font-bold text-ink">{b.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{b.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Steps */}
      <Section tone="page">
        <div className="mb-12 text-center">
          <SectionLabel className="justify-center">{config.stepsLabel}</SectionLabel>
          <h2 className="mt-4 text-balance font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-[46px]">
            {config.stepsTitle}
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {config.steps.map((step, i) => (
            <div key={step.title} className="rounded-2xl border border-hair bg-card p-7 shadow-card">
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${theme.num}`}
              >
                {i + 1}
              </span>
              <h3 className="mt-5 font-display text-lg font-bold text-ink">{step.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{step.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section tone="card">
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

      <CtaBand title={config.cta.title} subtitle={config.cta.subtitle} primary={config.cta.primary} />
    </>
  );
}
