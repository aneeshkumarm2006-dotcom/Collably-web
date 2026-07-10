import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

/**
 * The public surface's "sticker" vocabulary: hard ink outlines, solid offset
 * shadows, press physics. See app/globals.css for the `.sticker` / `.press`
 * classes, which collapse to hairlines and soft elevation inside `.surface-app`.
 */

/** A card with the ink outline + offset shadow. `lift` adds hover elevation. */
export function StickerCard({
  as: Tag = 'div',
  lift = false,
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLElement> & { as?: 'div' | 'article' | 'li' | 'section'; lift?: boolean }) {
  return (
    <Tag
      className={cn(
        'sticker rounded-card bg-card',
        lift && 'transition-[transform,box-shadow] duration-150 hover:-translate-y-1 hover:shadow-sticker-lg',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

const BUTTON_TONES = {
  brand: 'bg-brand text-white',
  ink: 'bg-ink text-white',
  yellow: 'bg-yellow text-ink',
  money: 'bg-money text-white',
  white: 'bg-card text-ink',
} as const;

const BUTTON_SIZES = {
  sm: 'h-9 px-3.5 text-[13px]',
  md: 'h-11 px-5 text-[15px]',
  lg: 'h-[52px] px-7 text-[16px]',
} as const;

export interface StickerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: keyof typeof BUTTON_TONES;
  size?: keyof typeof BUTTON_SIZES;
  /** Render as the single child element (e.g. a `next/link`) instead of a `<button>`. */
  asChild?: boolean;
}

/**
 * The press button. Hover pushes the shadow out and lifts; `:active` collapses
 * both so it reads as physically pressed into the page.
 */
export function StickerButton({
  tone = 'brand',
  size = 'md',
  asChild = false,
  className,
  ...rest
}: StickerButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={cn(
        'sticker press inline-flex select-none items-center justify-center gap-2 rounded-md font-display font-semibold',
        'disabled:pointer-events-none disabled:opacity-60',
        BUTTON_TONES[tone],
        BUTTON_SIZES[size],
        className,
      )}
      {...rest}
    />
  );
}

/** Uppercase mono eyebrow that labels each section. */
export function Eyebrow({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p
      className={cn(
        'font-mono text-[12px] font-semibold uppercase tracking-[0.12em] text-coral',
        className,
      )}
    >
      {children}
    </p>
  );
}

const PILL_TONES = {
  brand: 'bg-brand-soft text-brand',
  money: 'bg-money-soft text-money-ink',
  warn: 'bg-warn-soft text-warn',
  danger: 'bg-danger-soft text-danger-ink',
  grape: 'bg-grape-soft text-grape',
  ink: 'bg-ink text-white',
  yellow: 'bg-yellow text-ink',
} as const;

/** Small rounded label: statuses, counts, category chips. */
export function Pill({
  tone = 'brand',
  className,
  children,
}: {
  tone?: keyof typeof PILL_TONES;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.08em]',
        PILL_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Pulsing green dot used by "Live" badges. */
export function LiveDot({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('inline-block h-1.5 w-1.5 rounded-full bg-money animate-ls-pulse', className)}
    />
  );
}
