'use client';

import { Apple, Play } from 'lucide-react';

import { Container } from '@/components/marketing/section';

/**
 * "Get the app" promo band: announces the upcoming iOS + Android apps as coming
 * soon, with a notify-me email capture. The notify form and store badges are
 * intentionally non-interactive (no endpoint / store links yet, pre-launch).
 */
export function AppPromo() {
  return (
    <section className="bg-page py-16 sm:py-20">
      <Container>
        <div
          className="relative overflow-hidden rounded-[26px] px-6 py-14 text-white sm:px-12 sm:py-16"
          style={{ background: '#0A1526' }}
        >
          {/* Faint radial blobs */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(680px 380px at 88% 10%, rgba(24,119,242,0.28), transparent 60%), radial-gradient(520px 320px at 6% 90%, rgba(123,97,255,0.22), transparent 60%)',
            }}
          />
          <div className="relative mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-white/80">
              <span className="h-1.5 w-1.5 rounded-full bg-mint" /> Coming soon
            </span>
            <h2 className="mt-5 text-balance font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-[46px]">
              Collably in your pocket.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-pretty text-base leading-relaxed text-white/65">
              Apply to collabs in a tap, chat with brands, and get push alerts for new local
              campaigns. Drop your email and we&apos;ll let you know the moment it launches.
            </p>

            {/* Notify-me (pre-launch: non-submitting) */}
            <form
              className="mx-auto mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row"
              onSubmit={(e) => e.preventDefault()}
              aria-label="Notify me when the app launches"
            >
              <label htmlFor="app-notify-email" className="sr-only">
                Email address
              </label>
              <input
                id="app-notify-email"
                type="email"
                name="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="h-12 flex-1 rounded-full border-[1.5px] border-white/15 bg-white/10 px-5 text-[15px] text-white placeholder:text-white/45 focus-visible:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              />
              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center rounded-full bg-warm px-7 text-[15px] font-semibold text-white transition-colors hover:bg-[#e85a30]"
              >
                Notify me
              </button>
            </form>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <StoreBadge icon={Apple} caption="Coming soon to the" store="App Store" />
              <StoreBadge icon={Play} caption="Coming soon to" store="Google Play" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/** A disabled app-store badge (no store links yet — apps are pre-launch). */
function StoreBadge({
  icon: Icon,
  caption,
  store,
}: {
  icon: React.ComponentType<{ className?: string }>;
  caption: string;
  store: string;
}) {
  return (
    <div
      aria-disabled
      className="inline-flex cursor-default items-center gap-3 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2.5 opacity-90"
    >
      <Icon className="h-6 w-6 text-white/80" />
      <span className="flex flex-col text-left leading-tight">
        <span className="text-[10px] uppercase tracking-[0.12em] text-white/50">{caption}</span>
        <span className="text-[15px] font-semibold text-white">{store}</span>
      </span>
    </div>
  );
}
