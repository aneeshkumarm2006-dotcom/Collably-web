'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, type LucideIcon } from 'lucide-react';

import { useAuth } from '@/components/providers/auth-provider';
import { BrandMark } from '@/components/shared/brand-mark';
import { StickerButton } from '@/components/shared/sticker';
import { ErrorBanner } from '@/components/auth/auth-layout';
import { cn } from '@/lib/utils';

/**
 * Shared onboarding chrome (Phase 5). `OnboardingFrame` is the page scaffold:
 * page-grey background, a slim top bar (brand + sign-out), and a centered column.
 * Used by both the stepper shell and the celebratory finish. `OnboardingShell`
 * adds the card, the `StepProgress` stepper, and the Back / Continue nav.
 *
 * There is intentionally no "Skip" link: onboarding is required (the
 * `(onboarding)` + `(dashboard)` guards bounce an un-onboarded user straight
 * back here), so a skip would only loop. Sign-out is offered instead.
 */
export function OnboardingFrame({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-page">
      <header className="flex items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" aria-label="Local Creator Crew home">
          <BrandMark />
        </Link>
        <button
          type="button"
          onClick={() => void logout()}
          className="font-display text-sm font-semibold text-muted transition-colors hover:text-ink"
        >
          Log out
        </button>
      </header>
      <main className="mx-auto w-full max-w-[560px] px-4 pb-20 sm:px-6">{children}</main>
    </div>
  );
}

export interface OnboardingShellProps {
  /** Step labels for the progress stepper (input steps only, not the finish). */
  steps: string[];
  /** 0-based index of the active step. */
  current: number;
  onBack?: () => void;
  onNext: () => void;
  /** Whether the current step's required fields are satisfied. */
  canAdvance: boolean;
  /** Last input step → the primary button submits ("Finish setup"). */
  isLast: boolean;
  submitting?: boolean;
  error?: string | null;
  children: React.ReactNode;
}

export function OnboardingShell({
  steps,
  current,
  onBack,
  onNext,
  canAdvance,
  isLast,
  submitting,
  error,
  children,
}: OnboardingShellProps) {
  const pct = steps.length > 0 ? ((current + 1) / steps.length) * 100 : 0;

  return (
    <OnboardingFrame>
      {/* Step indicator + sticker progress bar */}
      <div className="mb-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.1em] text-muted">
            Step {current + 1} of {steps.length}
          </span>
          <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.1em] text-brand">
            {steps[current]}
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full border-outline border-ink bg-elev">
          <div
            className="h-full rounded-full bg-brand transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="sticker rounded-xl bg-card p-6 sm:p-8">
        {/* Each step animates in; reduced-motion users get the global no-op. */}
        <div key={current} className="animate-in fade-in slide-in-from-right-3 duration-300">
          {children}
        </div>

        {error && <ErrorBanner message={error} />}

        <div className="mt-8 flex items-center justify-between gap-3">
          <StickerButton
            type="button"
            tone="white"
            onClick={onBack}
            disabled={!onBack || submitting}
            className={cn(!onBack && 'opacity-40')}
          >
            <ArrowLeft /> Back
          </StickerButton>
          <StickerButton
            type="button"
            tone="brand"
            onClick={onNext}
            disabled={!canAdvance || submitting}
          >
            {submitting ? (
              'Saving…'
            ) : isLast ? (
              <>
                Finish <Check />
              </>
            ) : (
              <>
                Continue <ArrowRight />
              </>
            )}
          </StickerButton>
        </div>
      </div>
    </OnboardingFrame>
  );
}

/** Per-step heading + supporting line, shown above the step's inputs. */
export function StepIntro({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-[28px] font-extrabold tracking-[-0.03em] text-ink">{title}</h1>
      {description && <p className="mt-1.5 text-[15px] text-muted">{description}</p>}
    </div>
  );
}

/** Rounded toggle pill for multi-select sets (niche / content types). */
export function TogglePill({
  label,
  selected,
  onClick,
  icon: Icon,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  icon?: LucideIcon;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-4 py-2.5 font-display text-sm font-semibold transition-all',
        selected
          ? 'bg-brand text-white shadow-sticker-active'
          : 'bg-elev text-ink shadow-sticker-muted hover:-translate-y-0.5 hover:bg-brand-soft',
      )}
    >
      {Icon && <Icon aria-hidden className="h-4 w-4 shrink-0" />}
      {label}
    </button>
  );
}

/**
 * Single-select toggle pill (business category). Selected pills fill with the
 * given tone (warm for business categories per the mockups); unselected are white.
 */
export function SelectCard({
  label,
  icon: Icon,
  selected,
  onClick,
  tone = 'brand',
}: {
  label: string;
  icon?: LucideIcon;
  selected: boolean;
  onClick: () => void;
  tone?: 'brand' | 'warm';
}) {
  const selectedClass =
    tone === 'warm' ? 'bg-coral text-white' : 'bg-brand text-white';
  const hoverClass = tone === 'warm' ? 'hover:bg-warn-soft' : 'hover:bg-brand-soft';
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-4 py-2.5 font-display text-sm font-semibold transition-all',
        selected
          ? cn(selectedClass, 'shadow-sticker-active')
          : cn('bg-elev text-ink shadow-sticker-muted hover:-translate-y-0.5', hoverClass),
      )}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden />}
      <span className="truncate">{label}</span>
    </button>
  );
}
