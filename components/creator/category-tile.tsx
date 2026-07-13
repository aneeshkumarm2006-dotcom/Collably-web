import { cn } from '@/lib/utils';
import { categoryIcon } from '@/lib/domain-meta';
import { categoryVisual } from '@/lib/creator/category-visual';

/**
 * A soft-tinted, rounded square holding the category glyph — the recurring
 * "icon tile" across the creator dashboard (cards, table rows, chat, activity).
 * The tint + icon colour are data-driven per category, so they're applied as
 * inline styles (dynamic values); everything else is Tailwind.
 */
export function CategoryTile({
  category,
  size = 38,
  radius = 10,
  iconSize,
  className,
}: {
  category?: string | null;
  /** Tile edge in px. */
  size?: number;
  /** Corner radius in px. */
  radius?: number;
  /** Glyph edge in px (defaults to ~0.55× the tile). */
  iconSize?: number;
  className?: string;
}) {
  const Icon = categoryIcon(category ?? 'Other');
  const { tint, ink } = categoryVisual(category);
  const glyph = iconSize ?? Math.round(size * 0.55);
  return (
    <span
      aria-hidden
      className={cn('inline-flex shrink-0 items-center justify-center border-2 border-ink', className)}
      style={{ width: size, height: size, borderRadius: radius, background: tint }}
    >
      <Icon style={{ width: glyph, height: glyph, color: ink }} strokeWidth={2} />
    </span>
  );
}
