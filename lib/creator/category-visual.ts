/**
 * Flat tint + icon-ink pairs for the Facebook-clean creator dashboard, per the
 * "Creator Dashboard" design. Each business/campaign category maps to a soft
 * tinted tile background and a saturated icon colour (used by the tinted icon
 * tiles on cards, rows, chat and notifications). Kept separate from the public
 * `categoryGradient` (which paints 2-stop cover gradients on the sticker
 * surface) so the two surfaces stay independent.
 */
export interface CategoryVisual {
  /** Tile / cover-band background. */
  tint: string;
  /** Icon + accent colour drawn on the tint. */
  ink: string;
}

const CATEGORY_VISUAL: Record<string, CategoryVisual> = {
  Restaurant: { tint: '#E7F0FF', ink: '#1877F2' },
  Cafe: { tint: '#FDECEC', ink: '#B23B3B' },
  'Food & Beverage': { tint: '#FFF3E0', ink: '#C77700' },
  Fashion: { tint: '#F3E8FF', ink: '#7A3FA0' },
  Beauty: { tint: '#F3E8FF', ink: '#7A3FA0' },
  'Salon & Spa': { tint: '#F3E8FF', ink: '#7A3FA0' },
  'Health & Wellness': { tint: '#E6F4EA', ink: '#1E7E34' },
  Fitness: { tint: '#EAF3FF', ink: '#1877F2' },
  Tech: { tint: '#EAF3FF', ink: '#1877F2' },
  Gaming: { tint: '#F3E8FF', ink: '#7A3FA0' },
  Travel: { tint: '#E7F0FF', ink: '#1877F2' },
  'Home & Lifestyle': { tint: '#FFF3E0', ink: '#C77700' },
  Education: { tint: '#EAF3FF', ink: '#1877F2' },
  Other: { tint: '#EAF3FF', ink: '#1877F2' },
};

const DEFAULT_VISUAL: CategoryVisual = { tint: '#EAF3FF', ink: '#1877F2' };

/** Returns the tint/ink pair for a category, falling back to the brand blue. */
export function categoryVisual(category?: string | null): CategoryVisual {
  return (category && CATEGORY_VISUAL[category]) || DEFAULT_VISUAL;
}
