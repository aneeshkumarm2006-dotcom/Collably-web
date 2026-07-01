import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/marketing/section';

export interface CtaBandProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
  className?: string;
}

/**
 * The full-width brand CTA band used to close marketing pages: a rounded
 * blue→purple gradient panel with decorative blobs, centered heading + subtext,
 * and up to two pill CTAs.
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
        <div
          className="relative overflow-hidden rounded-[30px] px-6 py-16 text-center text-white sm:px-12 sm:py-20"
          style={{ background: 'linear-gradient(130deg,#0064E0,#7B61FF)' }}
        >
          {/* Decorative blobs */}
          <span
            aria-hidden
            className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -right-12 h-64 w-64 rounded-[40px] bg-white/10 blur-2xl"
          />

          <div className="relative mx-auto max-w-2xl">
            {eyebrow && (
              <span className="text-[13px] font-extrabold uppercase tracking-[0.1em] text-white/80">
                {eyebrow}
              </span>
            )}
            <h2 className="mt-3 text-balance font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-[46px]">
              {title}
            </h2>
            {subtitle && (
              <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-white/85">{subtitle}</p>
            )}
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              {primary && (
                <Button asChild size="pill" className="bg-white text-brand shadow-sm hover:bg-white/90">
                  <Link href={primary.href}>
                    {primary.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              {secondary && (
                <Button
                  asChild
                  size="pill"
                  variant="outline"
                  className="border-white/40 bg-white/10 text-white hover:border-white/60 hover:bg-white/20 hover:text-white"
                >
                  <Link href={secondary.href}>{secondary.label}</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
