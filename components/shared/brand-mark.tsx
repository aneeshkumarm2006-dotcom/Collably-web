import { cn } from '@/lib/utils';

/**
 * Local Creator Crew brand — concept 2c, "Talking O's".
 *
 * Typographic wordmark: the letters are one ink colour (white on dark surfaces)
 * and only the two o-glyphs carry colour. The `o` in "Local" is a map pin (the
 * place); the `o` in "Creator" is a broadcasting speaker (the voice). SVG paths
 * are ported verbatim from the design's 2c lockup (`.oglyph`, .78em,
 * vertical-align -0.12em).
 *
 * 2c ships no standalone icon, so `BrandGlyph` derives one from the pin — a
 * monochrome teardrop that works on any tile (favicon, collapsed sidebar).
 */

/** The pin-o, two-tone, exactly as drawn in the design. */
function PinO({ onDark, className }: { onDark?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      // Intrinsic em size (valid SVG units) so the glyph stays inline-sized even
      // if a utility class fails to load — never balloons to fill the viewport.
      width="0.78em"
      height="0.78em"
      className={cn('inline-block', className)}
      style={{ verticalAlign: '-0.12em', margin: '0 .01em' }}
      aria-hidden
    >
      <path
        d="M12 2.5c-4 0-7.2 3-7.2 6.9 0 5 7.2 12.1 7.2 12.1s7.2-7.1 7.2-12.1C19.2 5.5 16 2.5 12 2.5Z"
        fill={onDark ? '#4A96F7' : '#1877F2'}
      />
      <circle cx="12" cy="9.2" r="2.6" fill={onDark ? '#14181F' : '#fff'} />
    </svg>
  );
}

/** The speaker-o: solid disc + two broadcasting arcs. */
function SpeakerO({ onDark, className }: { onDark?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      width="0.78em"
      height="0.78em"
      className={cn('inline-block', className)}
      style={{ verticalAlign: '-0.12em', margin: '0 .01em' }}
      aria-hidden
    >
      <circle cx="12" cy="12" r="3.4" fill={onDark ? '#FFC24B' : '#1877F2'} />
      <path d="M17 8a6 6 0 0 1 0 8" stroke="#FFC24B" strokeWidth="2.1" strokeLinecap="round" />
      {/* The faint outer wave is dropped on dark, matching the design's dark lockup. */}
      {!onDark && (
        <path
          d="M20 5.5a10 10 0 0 1 0 13"
          stroke="#FFC24B"
          strokeWidth="2.1"
          strokeLinecap="round"
          opacity=".5"
        />
      )}
    </svg>
  );
}

/**
 * Standalone mark, derived from the pin. Monochrome `currentColor` teardrop with
 * a knocked-out circular counter so it reads as an `o`/pin on any background —
 * used for the favicon tile and the collapsed sidebar.
 */
export function BrandGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="18"
      height="18"
      className={cn('h-[18px] w-[18px]', className)}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2.5c-4 0-7.2 3-7.2 6.9 0 5 7.2 12.1 7.2 12.1s7.2-7.1 7.2-12.1C19.2 5.5 16 2.5 12 2.5Zm0 4.1a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2Z"
      />
    </svg>
  );
}

export interface BrandMarkProps {
  /** Render the full wordmark. `false` gives the pin mark alone. */
  withWordmark?: boolean;
  /** Tint for dark surfaces (footer, sidebar, auth brand panel). */
  onDark?: boolean;
  className?: string;
}

export function BrandMark({ withWordmark = true, onDark, className }: BrandMarkProps) {
  if (!withWordmark) {
    return (
      <span
        className={cn(
          'inline-flex h-[34px] w-[34px] items-center justify-center rounded-sm',
          onDark ? 'bg-white/[0.18] text-white' : 'bg-brand text-white',
          className,
        )}
      >
        <BrandGlyph />
      </span>
    );
  }

  return (
    <span
      className={cn(
        // `whitespace-nowrap` keeps the three words on one line — the old
        // single-word lockup could never wrap, this one can.
        'inline-flex items-center whitespace-nowrap font-display text-[22px] font-bold tracking-[-0.03em]',
        onDark ? 'text-white' : 'text-ink',
        className,
      )}
      role="img"
      aria-label="Local Creator Crew"
    >
      L
      <PinO onDark={onDark} className="h-[0.78em] w-[0.78em]" />
      cal&nbsp;Creat
      <SpeakerO onDark={onDark} className="h-[0.78em] w-[0.78em]" />
      r&nbsp;Crew
    </span>
  );
}
