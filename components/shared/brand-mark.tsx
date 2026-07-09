import { cn } from '@/lib/utils';

/**
 * Brand wordmark + mark. The mark is the LocalShout "drop" glyph filled with
 * currentColor. Use `withWordmark={false}` for the icon only.
 */
export function BrandGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn('h-[18px] w-[18px]', className)}
      aria-hidden
    >
      <path d="M12 2C7.5 6 5.5 9.8 5.5 13.6a6.5 6.5 0 0013 0C18.5 9.8 16.5 6 12 2z" />
    </svg>
  );
}

export interface BrandMarkProps {
  withWordmark?: boolean;
  /** Tint the wordmark for dark surfaces (footer/sidebar/hero). */
  onDark?: boolean;
  className?: string;
}

export function BrandMark({ withWordmark = true, onDark, className }: BrandMarkProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'inline-flex h-[34px] w-[34px] items-center justify-center rounded-md',
          onDark ? 'bg-white/[0.18] text-white' : 'bg-brand text-white shadow-[0_6px_16px_-4px_rgba(0,100,224,0.5)]',
        )}
      >
        <BrandGlyph />
      </span>
      {withWordmark && (
        <span
          className={cn(
            'font-display text-[22px] font-extrabold tracking-[-0.03em]',
            onDark ? 'text-white' : 'text-ink',
          )}
        >
          LocalShout
        </span>
      )}
    </span>
  );
}
