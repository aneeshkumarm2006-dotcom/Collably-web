import { cn } from '@/lib/utils';

/** Centered max-width container for the marketing/public-app horizontal rhythm. */
export function Container({
  children,
  className,
  size = 'default',
}: {
  children: React.ReactNode;
  className?: string;
  size?: 'default' | 'wide' | 'narrow';
}) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-6 lg:px-10',
        size === 'wide' && 'max-w-[1760px]',
        size === 'default' && 'max-w-[1600px]',
        size === 'narrow' && 'max-w-[760px] lg:px-6',
        className,
      )}
    >
      {children}
    </div>
  );
}

/** A vertical section band with consistent padding; `tone` swaps the background. */
export function Section({
  children,
  className,
  tone = 'page',
  containerSize = 'default',
  id,
}: {
  children: React.ReactNode;
  className?: string;
  tone?: 'page' | 'card' | 'muted' | 'dark' | 'brand';
  containerSize?: 'default' | 'wide' | 'narrow';
  id?: string;
}) {
  const toneClass = {
    page: 'bg-page text-ink',
    card: 'bg-card text-ink',
    muted: 'bg-elev text-ink',
    dark: 'bg-dark-sidebar text-white',
    brand: 'bg-brand text-white',
  }[tone];

  return (
    <section id={id} className={cn('py-16 sm:py-20 lg:py-24', toneClass, className)}>
      <Container size={containerSize}>{children}</Container>
    </section>
  );
}

/** Mono eyebrow label with an optional ordinal (e.g. "01"). `onDark` for dark bands. */
export function SectionLabel({
  children,
  ordinal,
  onDark,
  className,
}: {
  children: React.ReactNode;
  ordinal?: string;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 text-[13px] font-extrabold uppercase tracking-[0.1em]',
        onDark ? 'text-white/70' : 'text-brand',
        className,
      )}
    >
      {ordinal && <span className="opacity-70">{ordinal}</span>}
      {children}
    </span>
  );
}

/**
 * A section header: eyebrow label + heading (+ optional aside/cta). `split` lays
 * the aside to the right on wide screens (the reference's split heads).
 */
export function SectionHeader({
  label,
  ordinal,
  title,
  aside,
  cta,
  onDark,
  split,
  className,
}: {
  label?: string;
  ordinal?: string;
  title: React.ReactNode;
  aside?: React.ReactNode;
  cta?: React.ReactNode;
  onDark?: boolean;
  split?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mb-12 gap-6',
        split ? 'flex flex-col items-start justify-between sm:flex-row sm:items-end' : 'max-w-2xl',
        className,
      )}
    >
      <div>
        {label && (
          <SectionLabel ordinal={ordinal} onDark={onDark} className="mb-4">
            {label}
          </SectionLabel>
        )}
        <h2
          className={cn(
            'text-balance font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-[46px]',
            onDark ? 'text-white' : 'text-ink',
          )}
        >
          {title}
        </h2>
      </div>
      {(aside || cta) && (
        <div className={cn('shrink-0', split ? 'sm:max-w-xs' : 'mt-4')}>
          {aside && (
            <p className={cn('text-base leading-relaxed', onDark ? 'text-white/70' : 'text-muted')}>
              {aside}
            </p>
          )}
          {cta && <div className={cn(aside && 'mt-4')}>{cta}</div>}
        </div>
      )}
    </div>
  );
}
