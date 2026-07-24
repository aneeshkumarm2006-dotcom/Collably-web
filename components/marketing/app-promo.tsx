'use client';

import { Apple, Play } from 'lucide-react';

import { Container } from '@/components/marketing/section';
import { LiveDot } from '@/components/shared/sticker';

/**
 * "Get the app" promo band: announces the upcoming iOS + Android apps as coming
 * soon, with a notify-me email capture. The notify form and store badges are
 * intentionally non-interactive (no endpoint / store links yet, pre-launch).
 */
export function AppPromo() {
  return (
    <section className="bg-page py-16 sm:py-20">
      <Container>
        <div className="sticker relative overflow-hidden rounded-3xl bg-band px-6 py-14 text-white shadow-sticker-lg sm:px-12 sm:py-16">
          {/* Decorative sticker shapes */}
          <span
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-3xl border-outline border-ink bg-yellow animate-ls-float"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-12 -left-8 h-36 w-36 rounded-full border-outline border-ink bg-coral animate-ls-float-r"
          />
          <div className="relative mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border-outline border-ink bg-band-card px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-white">
              <LiveDot /> Coming soon
            </span>
            <h2 className="mt-5 text-balance font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-[46px]">
              Local Creator Crew in your pocket.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-pretty text-base leading-relaxed text-white/70">
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
                className="h-12 flex-1 rounded-md border-outline border-ink bg-white px-5 text-[15px] text-ink placeholder:text-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow"
              />
              <button
                type="submit"
                className="sticker press inline-flex h-12 items-center justify-center rounded-md bg-yellow px-7 font-display text-[15px] font-semibold text-ink"
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
      className="inline-flex cursor-default items-center gap-3 rounded-md border-outline border-ink bg-band-card px-4 py-2.5"
    >
      <Icon className="h-6 w-6 text-white/80" />
      <span className="flex flex-col text-left leading-tight">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/50">
          {caption}
        </span>
        <span className="text-[15px] font-semibold text-white">{store}</span>
      </span>
    </div>
  );
}
