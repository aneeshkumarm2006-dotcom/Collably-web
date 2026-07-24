import Link from 'next/link';
import { Check, Coffee, Dumbbell, Handshake, Sparkles, Store } from 'lucide-react';

import { cn } from '@/lib/utils';
import { BrandMark } from '@/components/shared/brand-mark';
import { StickerCard } from '@/components/shared/sticker';
import { AuthToggle } from '@/components/auth/auth-toggle';

/**
 * Shared auth shell: the split-screen brand panel (left, solid brand blue) + form
 * panel (right, cream page). Used by every `(auth)` page so login / signup /
 * forgot / reset share one branded frame; only the form (`children`) changes.
 *
 * Server component (purely presentational). The brand panel collapses below `lg`
 * so the form gets the full width on mobile. `variant` swaps the panel between the
 * "welcome back" story (login / forgot / reset) and the "join" story (signup).
 */

export interface AuthLayoutProps {
  children: React.ReactNode;
  /** Which brand-panel story to show. `join` is the signup variant. */
  variant?: 'welcome' | 'join';
  /**
   * Post-auth redirect target, forwarded to the login/signup toggle so a
   * deep-link survives switching tabs. Threaded from the page's `searchParams`
   * rather than read from a client hook — see `AuthToggle`.
   */
  next?: string;
}

/** Overlapping avatar swatches under the welcome panel's social-proof line. */
const AVATARS = ['#ffb74d', '#a5d6a7', '#ff9e80'];

export function AuthLayout({ children, variant = 'welcome', next }: AuthLayoutProps) {
  const isJoin = variant === 'join';

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      {/* Brand panel (hidden below lg) */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-brand px-12 py-11 text-white lg:flex">
        {/* Decorative translucent circles */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-[50px] -top-[70px] h-60 w-60 rounded-full bg-white/[0.08]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-[60px] -left-10 h-[200px] w-[200px] rounded-full bg-white/[0.06]"
        />

        <Link href="/" className="relative z-10 w-fit">
          <BrandMark onDark />
        </Link>

        {isJoin ? <JoinPanel /> : <WelcomePanel />}

        <p className="relative z-10 font-mono text-[12px] text-[#bbd6fb]">
          © 2026 Local Creator Crew · Made for your block
        </p>
      </aside>

      {/* Form panel */}
      <main className="relative flex items-center justify-center bg-page px-6 py-16 sm:px-10 sm:py-11">
        <AuthToggle next={next} className="absolute right-6 top-6 sm:right-10" />

        <div className="w-full max-w-[420px]">
          {/* Mobile brand (brand panel is hidden < lg) */}
          <Link href="/" className="mb-8 inline-flex lg:hidden">
            <BrandMark />
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}

/** Login / forgot / reset story: "Your block has been busy." */
function WelcomePanel() {
  return (
    <div className="relative z-10 max-w-[400px]">
      <span className="inline-block rounded-full border-[1.5px] border-white/35 bg-white/[0.16] px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-white">
        Welcome back
      </span>
      <h2 className="mt-4 max-w-[400px] font-display text-[44px] font-bold leading-[1.02] tracking-[-0.03em]">
        Your block has been busy.
      </h2>
      <p className="mt-4 max-w-[380px] text-[17px] leading-[1.55] text-[#d8e7fe]">
        Fresh campaigns and rewards are waiting. Log back in and pick up where you left off.
      </p>

      {/* Floating sticker cards */}
      <div className="relative mt-[26px] h-[190px] max-w-[400px]">
        <StickerCard className="absolute left-0 top-[14px] flex animate-ls-float items-center gap-3 px-4 py-[14px] text-ink">
          <span className="flex h-[42px] w-[42px] items-center justify-center rounded-[11px] bg-[#fdecec] text-[#c0392b]">
            <Coffee className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-[14px] font-bold text-ink">Bloom Coffee · Reel</span>
            <span className="block font-mono text-[11px] text-muted">Café · 0.4 mi</span>
          </span>
          <span className="ml-2 rounded-[8px] bg-money-soft px-2 py-1 font-mono text-[13px] font-semibold text-money-ink">
            $120
          </span>
        </StickerCard>

        <StickerCard className="absolute right-0 top-[96px] flex animate-ls-float-r items-center gap-3 bg-yellow px-4 py-[14px] text-ink [animation-delay:-2s]">
          <span className="flex h-[42px] w-[42px] items-center justify-center rounded-[11px] bg-white text-ink">
            <Dumbbell className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-[14px] font-bold text-ink">RiverFit · Story</span>
            <span className="block font-mono text-[11px] text-[#7a5a16]">3-month pass</span>
          </span>
        </StickerCard>
      </div>

      {/* Avatar / stat row */}
      <div className="mt-6 flex items-center gap-4">
        <div className="flex">
          {AVATARS.map((c, i) => (
            <span
              key={c}
              aria-hidden
              className={cn('h-9 w-9 rounded-full border-2 border-ink', i > 0 && '-ml-[11px]')}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <p className="text-[14px] text-[#d8e7fe]">
          <b className="text-white">8,400+ creators</b> · <b className="text-white">$1.2M</b>{' '}
          claimed
        </p>
      </div>
    </div>
  );
}

/** Signup story: "Start shouting locally." */
function JoinPanel() {
  return (
    <div className="relative z-10 max-w-[400px]">
      <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-yellow px-[13px] py-[7px] font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-ink shadow-[3px_3px_0_#14181f]">
        Free to join · 2 min
      </span>
      <h2 className="mt-[18px] max-w-[400px] font-display text-[44px] font-bold leading-[1.02] tracking-[-0.03em]">
        Start shouting locally.
      </h2>
      <p className="mt-4 max-w-[380px] text-[17px] leading-[1.55] text-[#d8e7fe]">
        Create a free account and join thousands turning their neighborhood into their audience.
      </p>

      {/* Value checklist */}
      <ul className="mt-[26px] flex max-w-[380px] flex-col gap-[14px]">
        {[
          'Free forever — no platform fees',
          'Real rewards, not points or “exposure”',
          'Only your neighborhood — distance-first',
        ].map((item) => (
          <li key={item} className="flex items-center gap-3 text-[16px] font-semibold text-white">
            <span className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[9px] border-2 border-ink bg-white text-money shadow-[2px_2px_0_#14181f]">
              <Check className="h-[15px] w-[15px]" strokeWidth={3} />
            </span>
            {item}
          </li>
        ))}
      </ul>

      {/* Creator + business "match" illustration */}
      <div className="relative mt-7 h-[158px] max-w-[380px]">
        <StickerCard className="absolute left-0 top-[6px] flex animate-ls-float items-center gap-3 px-[15px] py-[13px] text-ink">
          <span className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-brand-soft text-brand">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-[14px] font-bold text-ink">Creator</span>
            <span className="block font-mono text-[11px] text-muted">Earns rewards</span>
          </span>
        </StickerCard>

        <StickerCard className="absolute right-0 bottom-[6px] flex animate-ls-float-r items-center gap-3 bg-yellow px-[15px] py-[13px] text-ink [animation-delay:-2s]">
          <span className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-white text-ink">
            <Store className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-[14px] font-bold text-ink">Business</span>
            <span className="block font-mono text-[11px] text-[#7a5a16]">Gets content</span>
          </span>
        </StickerCard>

        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 z-[2] flex h-[52px] w-[52px] -translate-x-1/2 -translate-y-1/2 rotate-[-6deg] items-center justify-center rounded-full bg-ink text-white shadow-[4px_5px_0_#0f5fd6]"
        >
          <Handshake className="h-6 w-6" />
        </span>
      </div>
    </div>
  );
}

/** Small "or with email" divider between the Google button and the email form. */
export function OrDivider({ label = 'or' }: { label?: string }) {
  return (
    <div className="my-6 flex items-center gap-3.5">
      <span className="h-0.5 flex-1 bg-hair-strong" />
      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">
        {label}
      </span>
      <span className="h-0.5 flex-1 bg-hair-strong" />
    </div>
  );
}

/** Inline error banner shown above the form on submit failure. */
export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className={cn(
        'mb-4 rounded-md border-2 border-danger bg-danger-soft px-3.5 py-2.5 text-[13px] font-semibold text-danger-ink',
      )}
    >
      {message}
    </div>
  );
}
