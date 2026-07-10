import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Container } from '@/components/marketing/section';
import { StickerButton } from '@/components/shared/sticker';

export interface CtaBandProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
  className?: string;
}

/**
 * The full-width brand CTA band used to close marketing pages: a solid brand
 * "sticker" panel with a hard ink outline + offset shadow, centered heading +
 * subtext, and up to two press-physics CTAs.
 */
export function CtaBand({
  eyebrow,
  title,
  subtitle,
  primary = { label: 'Join as a creator', href: '/signup' },
  secondary = { label: "I'm a business", href: '/for-businesses' },
  className,
}: CtaBandProps) {
  return (
    <section className={cn('bg-page py-16 sm:py-20', className)}>
      <Container>
        <div className="sticker relative overflow-hidden rounded-3xl bg-brand px-6 py-16 text-center text-white shadow-sticker-lg sm:px-12 sm:py-20">
          {/* Decorative sticker shapes */}
          <span
            aria-hidden
            className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-3xl border-outline border-ink bg-yellow animate-ls-float"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-12 -right-8 h-40 w-40 rounded-full border-outline border-ink bg-coral animate-ls-float-r"
          />

          <div className="relative mx-auto max-w-2xl">
            {eyebrow && (
              <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.14em] text-yellow">
                {eyebrow}
              </span>
            )}
            <h2 className="mt-3 text-balance font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-[46px]">
              {title}
            </h2>
            {subtitle && (
              <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-white/90">{subtitle}</p>
            )}
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              {primary && (
                <StickerButton asChild tone="yellow" size="lg">
                  <Link href={primary.href}>
                    {primary.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </StickerButton>
              )}
              {secondary && (
                <StickerButton asChild tone="white" size="lg">
                  <Link href={secondary.href}>{secondary.label}</Link>
                </StickerButton>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
