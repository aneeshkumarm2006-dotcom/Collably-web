import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Coffee,
  Dumbbell,
  Gift,
  MapPin,
  Scissors,
  Sparkles,
  Star,
  Users,
  Utensils,
} from 'lucide-react';
import type { Metadata } from 'next';

import { publicApi } from '@/lib/api/public';
import { toCampaignCardData } from '@/lib/campaign-card';
import type { PublicCampaign } from '@/lib/api/types';
import {
  buildMetadata,
  organizationJsonLd,
  websiteJsonLd,
  SITE_DESCRIPTION,
} from '@/lib/seo';
import {
  FEATURES,
  GENERAL_FAQS,
  HOW_IT_WORKS,
  MARQUEE_BUSINESSES,
  PLATFORM_STATS,
  SAMPLE_REWARDS,
  TESTIMONIALS,
} from '@/lib/marketing-content';
import { Container, Section, SectionLabel } from '@/components/marketing/section';
import { CtaBand } from '@/components/marketing/cta-band';
import { Faq } from '@/components/marketing/faq';
import { faqPageJsonLd } from '@/lib/faq';
import { CampaignCard } from '@/components/shared/campaign-card';
import { BrandGlyph } from '@/components/shared/brand-mark';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/shared/avatar';
import { JsonLd } from '@/components/shared/json-ld';
import { HeroCta, GuestApplyButton } from '@/components/marketing/hero-cta';
import { AppPromo } from '@/components/marketing/app-promo';

export const metadata: Metadata = buildMetadata({
  description: SITE_DESCRIPTION,
  path: '/',
});

const FEATURE_ICONS = { users: Users, gift: Gift, 'badge-check': BadgeCheck, 'map-pin': MapPin };

/** Illustrative campaign cards for the hero phone's auto-scrolling app feed. */
const PHONE_FEED = [
  { initial: 'M', name: 'Maple & Oat', category: 'Café', reward: 'Brunch · $65', grad: 'linear-gradient(135deg,#0064E0,#3E8BFF)' },
  { initial: 'G', name: 'Glow Bar', category: 'Beauty', reward: 'Facial · $210', grad: 'linear-gradient(135deg,#FF6A3D,#FF9E6B)' },
  { initial: 'P', name: 'Peak Pilates', category: 'Fitness', reward: 'Membership · $220', grad: 'linear-gradient(135deg,#16C79A,#4FE0BC)' },
  { initial: 'N', name: 'North Goods', category: 'Retail', reward: '$150 credit', grad: 'linear-gradient(135deg,#7B61FF,#A48CFF)' },
  { initial: 'H', name: 'Harbour Tacos', category: 'Food', reward: 'Dinner · $90', grad: 'linear-gradient(135deg,#FF6A3D,#FFB020)' },
];
const REWARD_ICONS = {
  coffee: Coffee,
  sparkles: Sparkles,
  dumbbell: Dumbbell,
  utensils: Utensils,
  scissors: Scissors,
};

/** Accent-tone → soft chip tint (bg + fg) for glyph tiles. */
const TONE: Record<string, string> = {
  brand: 'bg-brand-soft text-brand',
  warm: 'bg-warm-soft text-warm',
  grape: 'bg-grape-soft text-grape',
  mint: 'bg-mint-soft text-mint',
};

// Statically rendered + revalidated; the live rail refreshes in the background.
export const revalidate = 300;

/** Pull a handful of active campaigns for the live rail (graceful on error). */
async function getLiveCampaigns(): Promise<PublicCampaign[]> {
  try {
    const res = await publicApi.campaigns.list({ status: 'Active', sort: 'newest', limit: 8 });
    return res.data;
  } catch {
    return [];
  }
}

const HERO_AVATARS = [
  { initials: 'MK', bg: '#0064E0' },
  { initials: 'JD', bg: '#FF6A3D' },
  { initials: 'AL', bg: '#7B61FF' },
  { initials: 'RN', bg: '#16C79A' },
];

export default async function LandingPage() {
  const campaigns = await getLiveCampaigns();
  const liveCampaigns = campaigns.slice(0, 4);

  return (
    <>
      <JsonLd data={[organizationJsonLd(), websiteJsonLd(), faqPageJsonLd(GENERAL_FAQS)]} />

      {/* ===== Hero ===== */}
      <header className="relative overflow-hidden bg-page text-ink">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(900px 520px at 82% 8%, rgba(24,119,242,0.12), transparent 60%), radial-gradient(680px 460px at 12% 30%, rgba(123,97,255,0.08), transparent 60%)',
          }}
        />
        <Container className="relative py-16 sm:py-20 lg:py-24">
          <div className="mx-auto grid max-w-[1360px] items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] xl:gap-12">
            <div>
              <span
                className="inline-flex items-center gap-2 rounded-full border border-hair bg-card px-3 py-1 text-[13px] font-bold text-brand shadow-card animate-cb-rise"
                style={{ animationDelay: '0ms' }}
              >
                Canada-first · Local collabs, easy ahead
              </span>
              <h1 className="mt-6 text-balance font-display text-[44px] font-extrabold leading-[0.96] tracking-[-0.04em] sm:text-6xl lg:text-[74px]">
                <span className="block animate-cb-rise" style={{ animationDelay: '90ms' }}>
                  Real collabs.
                </span>
                <span className="block animate-cb-rise" style={{ animationDelay: '180ms' }}>
                  Real <span className="cb-text-shine">rewards.</span>
                </span>
                <span className="block animate-cb-rise" style={{ animationDelay: '270ms' }}>
                  Zero gatekeeping.
                </span>
              </h1>
              <p
                className="mt-6 max-w-[500px] text-pretty text-[19px] leading-relaxed text-muted animate-cb-rise"
                style={{ animationDelay: '380ms' }}
              >
                LocalShout matches Canadian creators with local spots for collabs that pay in real
                meals, services and products. No agencies. No follower minimums. Just show up and
                create.
              </p>
              <div className="animate-cb-rise" style={{ animationDelay: '480ms' }}>
                <HeroCta />
              </div>

              <div
                className="mt-9 flex flex-wrap items-center gap-4 animate-cb-rise"
                style={{ animationDelay: '580ms' }}
              >
                <div className="flex -space-x-3">
                  {HERO_AVATARS.map((a) => (
                    <span
                      key={a.initials}
                      className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-page text-xs font-bold text-white"
                      style={{ background: a.bg }}
                    >
                      {a.initials}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-muted">
                  <b className="font-bold text-ink">3,200+ creators</b> · 640+ local spots ·{' '}
                  <b className="font-bold text-ink">18 cities</b>
                </p>
              </div>
            </div>

            {/* Right: floating phone app mockup */}
            <div className="relative mx-auto w-full max-w-[440px] animate-cb-rise" style={{ animationDelay: '260ms' }}>
              {/* Decorative floating blobs */}
              <span
                aria-hidden
                className="pointer-events-none absolute -left-8 top-10 -z-0 h-16 w-16 rounded-full bg-mint-soft animate-cb-float"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute -right-6 bottom-8 -z-0 h-20 w-20 rounded-[22px] bg-grape-soft animate-cb-float-b"
              />

              {/* Phone */}
              <div className="relative mx-auto w-[300px] animate-cb-float">
                <div className="relative rounded-[48px] border-[12px] border-dark-sidebar bg-dark-sidebar shadow-card-hover">
                  {/* Notch */}
                  <span className="absolute left-1/2 top-0 z-20 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-dark-sidebar" />
                  {/* Screen */}
                  <div className="relative h-[600px] overflow-hidden rounded-[36px] bg-page">
                    {/* App top bar */}
                    <div className="flex items-center justify-between border-b border-hair bg-card px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-white">
                          <BrandGlyph className="h-3.5 w-3.5" />
                        </span>
                        <span className="font-display text-[15px] font-extrabold tracking-tight text-ink">
                          Explore
                        </span>
                      </div>
                      <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted">
                        <Bell className="h-4 w-4" />
                        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-warm ring-2 ring-card" />
                      </span>
                    </div>
                    {/* Location + live pill */}
                    <div className="flex items-center justify-between px-4 pb-1 pt-3">
                      <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-muted">
                        <MapPin className="h-3.5 w-3.5 text-brand" /> Toronto, ON
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-mint-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-mint">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-mint animate-cb-pulse" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint" />
                        </span>
                        18 live
                      </span>
                    </div>
                    {/* Auto-scrolling feed (masked, duplicated for a seamless loop) */}
                    <div
                      className="h-[520px] overflow-hidden px-4"
                      style={{
                        maskImage: 'linear-gradient(180deg, transparent, #000 8%, #000 82%, transparent)',
                        WebkitMaskImage:
                          'linear-gradient(180deg, transparent, #000 8%, #000 82%, transparent)',
                      }}
                    >
                      <div className="flex flex-col gap-3 pt-3 animate-cb-scroll-y">
                        {[...PHONE_FEED, ...PHONE_FEED].map((c, i) => (
                          <div
                            key={`${c.name}-${i}`}
                            className="overflow-hidden rounded-2xl border border-hair bg-card shadow-sm"
                          >
                            <div
                              className="flex h-16 items-center justify-between px-3"
                              style={{ background: c.grad }}
                            >
                              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/95 font-display text-base font-extrabold text-ink">
                                {c.initial}
                              </span>
                              <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-ink">
                                {c.category}
                              </span>
                            </div>
                            <div className="p-3">
                              <div className="text-[13px] font-bold text-ink">{c.name}</div>
                              <div className="mt-1 flex items-center justify-between">
                                <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-bold text-brand">
                                  {c.reward}
                                </span>
                                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-brand">
                                  Apply <ArrowRight className="h-3 w-3" />
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating "Reward unlocked" toast */}
              <div className="absolute -left-4 top-28 z-20 flex items-center gap-2.5 rounded-2xl border border-hair bg-card px-3.5 py-2.5 shadow-card-hover animate-cb-float">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mint-soft text-mint">
                  <BadgeCheck className="h-4 w-4" />
                </span>
                <div className="text-xs">
                  <div className="font-bold text-ink">Reward unlocked</div>
                  <div className="text-muted">Brunch for 2 · $65</div>
                </div>
              </div>

              {/* Floating dark chip */}
              <div className="absolute -bottom-2 right-0 z-20 rounded-full bg-dark-sidebar px-4 py-2 text-xs font-semibold text-white shadow-card-hover animate-cb-float-b">
                +142 new collabs this week
              </div>
            </div>
          </div>
        </Container>
      </header>

      {/* ===== Logo marquee ===== */}
      <div className="border-y border-hair bg-card py-10">
        <Container>
          <p className="text-center text-[13px] font-bold uppercase tracking-[0.1em] text-faint">
            Trusted by local favourites across Canada
          </p>
        </Container>
        <div
          className="relative mt-6 overflow-hidden"
          style={{
            maskImage:
              'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
            WebkitMaskImage:
              'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
          }}
        >
          <div className="flex w-max animate-cb-marquee items-center gap-12 pr-12">
            {[...MARQUEE_BUSINESSES, ...MARQUEE_BUSINESSES].map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="whitespace-nowrap font-display text-xl font-bold text-faint"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Stats band ===== */}
      <section className="bg-page py-16 sm:py-20">
        <Container>
          <div
            className="relative overflow-hidden rounded-[26px] px-6 py-12 text-white sm:px-12 sm:py-14"
            style={{ background: '#0A1526' }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(520px 320px at 88% 12%, rgba(24,119,242,0.22), transparent 60%), radial-gradient(420px 300px at 6% 90%, rgba(123,97,255,0.18), transparent 60%)',
              }}
            />
            <div className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {PLATFORM_STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-display text-5xl font-extrabold tracking-[-0.03em] sm:text-6xl">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-sm font-medium text-[#9DB2C9]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ===== How it works ===== */}
      <Section tone="page" id="how">
        <div className="mb-12 text-center">
          <SectionLabel className="justify-center">How LocalShout works</SectionLabel>
          <h2 className="mt-4 text-balance font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-[46px]">
            Two sides. One easy flow.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <HowCard heading="For creators" tone="brand" icon={Users} steps={HOW_IT_WORKS.creator} />
          <HowCard heading="For businesses" tone="warm" icon={Gift} steps={HOW_IT_WORKS.business} />
        </div>
      </Section>

      {/* ===== Features ===== */}
      <Section tone="card">
        <div className="mb-12 text-center">
          <SectionLabel className="justify-center">Why LocalShout</SectionLabel>
          <h2 className="mt-4 text-balance font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-[46px]">
            Built for real, local collabs.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {FEATURES.map((feat) => {
            const Icon = FEATURE_ICONS[feat.icon as keyof typeof FEATURE_ICONS] ?? Gift;
            return (
              <div
                key={feat.title}
                className="rounded-2xl border border-hair bg-card p-7 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover"
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${TONE[feat.tone] ?? TONE.brand}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold text-ink">{feat.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{feat.body}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ===== Product showcase ===== */}
      <Section tone="page">
        <div className="mb-12 text-center">
          <SectionLabel className="justify-center text-grape">See it in action</SectionLabel>
          <h2 className="mt-4 text-balance font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-[46px]">
            One dashboard for every collab.
          </h2>
        </div>
        <DashboardMockup />
      </Section>

      {/* ===== Live campaigns ===== */}
      {liveCampaigns.length > 0 && (
        <Section tone="card">
          <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <SectionLabel className="text-mint">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-mint animate-cb-pulse" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-mint" />
                </span>
                Live right now
              </SectionLabel>
              <h2 className="mt-4 text-balance font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-[46px]">
                Fresh local campaigns.
              </h2>
            </div>
            <Button asChild variant="outline" size="pill">
              <Link href="/explore">
                Explore all <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {liveCampaigns.map((c) => (
              <div
                key={c._id}
                className="flex w-full flex-col gap-4 sm:w-[340px] lg:w-[300px] xl:w-[340px]"
              >
                <CampaignCard campaign={toCampaignCardData(c)} className="h-full" />
                <GuestApplyButton />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ===== Real rewards ===== */}
      <Section tone="page">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <SectionLabel className="text-warm">Real rewards</SectionLabel>
            <h2 className="mt-4 text-balance font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-[46px]">
              Rewards you can actually spend.
            </h2>
            <p className="mt-5 max-w-md text-pretty text-base leading-relaxed text-muted">
              No vague &quot;exposure.&quot; Every collab spells out exactly what you earn — real
              meals, services and products — with the dollar value up front.
            </p>
            <Button asChild size="pill" className="mt-7">
              <Link href="/explore">
                Start earning <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl border border-hair bg-card p-4 shadow-card sm:p-6">
            {SAMPLE_REWARDS.map((r) => {
              const Icon = REWARD_ICONS[r.icon as keyof typeof REWARD_ICONS] ?? Gift;
              return (
                <div
                  key={r.name}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-hair bg-page px-4 py-3.5"
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${TONE[r.tone] ?? TONE.brand}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="text-[15px] font-bold text-ink">{r.name}</div>
                      <div className="mt-0.5 text-xs text-muted">{r.sub}</div>
                    </div>
                  </div>
                  <span className="rounded-full bg-money-soft px-3 py-1 text-sm font-bold text-money">
                    {r.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ===== Testimonials ===== */}
      <Section tone="card">
        <div className="mb-12 text-center">
          <SectionLabel className="justify-center text-mint">Loved locally</SectionLabel>
          <h2 className="mt-4 text-balance font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-[46px]">
            From creators &amp; businesses.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-2xl border border-hair bg-card p-7 shadow-card"
            >
              <div className="mb-4 flex gap-1 text-warm">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="flex-1 text-[15px] leading-relaxed text-ink">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <Avatar name={t.name} size={40} />
                <div className="text-sm">
                  <div className="font-bold text-ink">{t.name}</div>
                  <div className="text-xs text-muted">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* ===== App (coming soon) ===== */}
      <AppPromo />

      {/* ===== FAQ ===== */}
      <Section tone="card">
        <div className="mb-12 text-center">
          <SectionLabel className="justify-center">FAQ</SectionLabel>
          <h2 className="mt-4 text-balance font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-[46px]">
            Questions, answered.
          </h2>
        </div>
        <div className="mx-auto max-w-3xl">
          <Faq items={GENERAL_FAQS} />
        </div>
      </Section>

      {/* ===== Final CTA ===== */}
      <CtaBand
        title="Ready to start collabbing?"
        subtitle="Join thousands of Canadian creators and local spots already making collabs happen on LocalShout."
        primary={{ label: 'Join as a creator', href: '/for-creators' }}
        secondary={{ label: "I'm a business", href: '/for-businesses' }}
      />
    </>
  );
}

function HowCard({
  heading,
  tone,
  icon: Icon,
  steps,
}: {
  heading: string;
  tone: string;
  icon: React.ComponentType<{ className?: string }>;
  steps: readonly { title: string; body: string }[];
}) {
  const numTone = tone === 'warm' ? 'bg-warm text-white' : 'bg-brand text-white';
  return (
    <div className="rounded-2xl border border-hair bg-card p-8 shadow-card">
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${TONE[tone] ?? TONE.brand}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-5 font-display text-2xl font-bold text-ink">{heading}</h3>
      <ol className="mt-6 flex flex-col gap-5">
        {steps.map((step, i) => (
          <li key={step.title} className="flex items-start gap-4">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${numTone}`}
            >
              {i + 1}
            </span>
            <div>
              <div className="text-[15px] font-bold text-ink">{step.title}</div>
              <p className="mt-0.5 text-sm leading-relaxed text-muted">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** A browser-window mockup showing the in-app dashboard, for the product showcase. */
function DashboardMockup() {
  const stats = [
    { label: 'Active collabs', value: '8', tone: 'brand' },
    { label: 'Rewards unlocked', value: '$1,240', tone: 'mint' },
    { label: 'New applicants', value: '32', tone: 'grape' },
  ];
  const bars = [42, 68, 55, 80, 61, 92, 74];
  return (
    <div className="relative mx-auto max-w-4xl">
      <div className="overflow-hidden rounded-[26px] border border-hair bg-card shadow-card-hover">
        {/* Browser chrome */}
        <div className="flex items-center gap-3 border-b border-hair bg-page px-5 py-3.5">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
            <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
            <span className="h-3 w-3 rounded-full bg-[#28C840]" />
          </div>
          <div className="ml-2 flex-1 rounded-full bg-card px-4 py-1 text-xs text-faint">
            app.localshout.ca / dashboard
          </div>
        </div>

        <div className="grid grid-cols-[180px_1fr] sm:grid-cols-[220px_1fr]">
          {/* Sidebar */}
          <div className="hidden bg-dark-sidebar p-5 text-white sm:block">
            <div className="mb-8 font-display text-lg font-bold">LocalShout</div>
            <ul className="flex flex-col gap-1.5 text-sm">
              {['Dashboard', 'Collabs', 'Applicants', 'Rewards', 'Messages'].map((item, i) => (
                <li
                  key={item}
                  className={`rounded-xl px-3 py-2 ${i === 0 ? 'bg-white/10 font-semibold text-white' : 'text-white/60'}`}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            <div className="text-sm text-muted">Welcome back,</div>
            <h3 className="font-display text-2xl font-bold text-ink">Maple &amp; Oat</h3>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {stats.map((s) => (
                <div key={s.label} className="rounded-2xl border border-hair bg-page p-4">
                  <div
                    className={`font-display text-2xl font-extrabold ${
                      s.tone === 'mint' ? 'text-money' : s.tone === 'grape' ? 'text-grape' : 'text-brand'
                    }`}
                  >
                    {s.value}
                  </div>
                  <div className="mt-1 text-[11px] text-muted">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-hair bg-page p-5">
              <div className="mb-4 text-xs font-bold uppercase tracking-[0.1em] text-faint">
                Applications this week
              </div>
              <div className="flex h-28 items-end justify-between gap-2">
                {bars.map((h, i) => (
                  <span
                    key={i}
                    className="flex-1 rounded-t-md bg-brand-soft"
                    style={{ height: `${h}%` }}
                  >
                    <span
                      className="block h-full w-full rounded-t-md bg-brand"
                      style={{ opacity: 0.2 + (h / 100) * 0.8 }}
                    />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating "New reward" card */}
      <div className="absolute -bottom-5 -right-3 hidden items-center gap-2.5 rounded-2xl border border-hair bg-card px-4 py-3 shadow-card-hover animate-cb-float sm:flex">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mint-soft text-mint">
          <Gift className="h-4 w-4" />
        </span>
        <div className="text-xs">
          <div className="font-bold text-ink">New reward</div>
          <div className="text-muted">Tasting menu · $140</div>
        </div>
      </div>
    </div>
  );
}
