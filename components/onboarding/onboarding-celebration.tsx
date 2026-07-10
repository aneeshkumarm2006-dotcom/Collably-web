'use client';

import { useMemo } from 'react';
import { ArrowRight, Check } from 'lucide-react';

import { StickerButton } from '@/components/shared/sticker';
import { OnboardingFrame } from '@/components/onboarding/onboarding-ui';

/** Sticker-palette confetti (brand blue / money green / yellow / coral / grape). */
const CONFETTI_COLORS = ['#1877F2', '#31A24C', '#FFC24B', '#FF6B4A', '#7A3FA0'];

type Piece = { left: number; bg: string; duration: number; delay: number; rotate: number };

/**
 * Celebratory finish state (Phase 5). A popped check badge over a falling-
 * confetti field, a personalized headline, and the CTA into the dashboard.
 *
 * Rendered only after a successful profile save (client-side), so the
 * `Math.random()` confetti never runs during SSR. Animations are globally
 * neutralized for `prefers-reduced-motion` users (see `globals.css`).
 */
export interface OnboardingCelebrationProps {
  title: string;
  message: string;
  ctaLabel: string;
  onContinue: () => void;
  loading?: boolean;
}

export function OnboardingCelebration({
  title,
  message,
  ctaLabel,
  onContinue,
  loading,
}: OnboardingCelebrationProps) {
  // Generate once on mount (client-only; component isn't SSR'd).
  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        left: Math.random() * 100,
        bg: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        duration: 1.8 + Math.random() * 1.6,
        delay: Math.random() * 0.6,
        rotate: Math.random() * 360,
      })),
    [],
  );

  return (
    <OnboardingFrame>
      {/* Confetti layer: fixed, non-interactive, behind the card content. */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        {pieces.map((p, i) => (
          <span
            key={i}
            className="absolute top-[-24px] h-3.5 w-2.5 rounded-[2px]"
            style={{
              left: `${p.left}vw`,
              background: p.bg,
              transform: `rotate(${p.rotate}deg)`,
              animation: `confetti-fall ${p.duration}s linear ${p.delay}s forwards`,
            }}
          />
        ))}
      </div>

      <div className="sticker relative z-10 rounded-xl bg-card p-8 text-center">
        <span className="mx-auto mb-6 flex h-[92px] w-[92px] animate-in zoom-in-50 items-center justify-center rounded-full border-outline border-ink bg-money text-white shadow-sticker duration-500">
          <Check className="h-12 w-12" strokeWidth={3} />
        </span>
        <h1 className="font-display text-[44px] font-extrabold leading-[1.05] tracking-[-0.03em] text-ink">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-muted">{message}</p>
        <StickerButton
          type="button"
          tone="brand"
          size="lg"
          onClick={onContinue}
          disabled={loading}
          className="mt-7 w-full"
        >
          {loading ? (
            'Taking you in…'
          ) : (
            <>
              {ctaLabel} <ArrowRight />
            </>
          )}
        </StickerButton>
      </div>
    </OnboardingFrame>
  );
}
