/**
 * Visual metadata for the domain enums: lucide icon glyphs (reward / category /
 * niche) and category to cover-gradient fallbacks. Keyed by the SHARED enum
 * values (`@/lib/shared`) so they stay in lockstep with the backend.
 *
 * The "blend": covers fall back to neutral-ink gradients (no colored glow),
 * matching the reference card anatomy re-skinned to the app palette.
 */
import {
  Baby,
  BookOpen,
  Coffee,
  ConciergeBell,
  CupSoda,
  Dumbbell,
  Flower2,
  Gamepad2,
  Gift,
  Laugh,
  Leaf,
  Music,
  Palette,
  Plane,
  Scissors,
  Shirt,
  Smartphone,
  Sofa,
  Sparkles,
  Tag,
  Ticket,
  TrendingUp,
  Utensils,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

import type { Category, Niche, RewardType } from '@/lib/shared';

/** Reward type to icon (shown small in `RewardPill`). */
export const REWARD_ICON: Record<RewardType, LucideIcon> = {
  Product: Gift,
  Experience: Sparkles,
  Voucher: Ticket,
  Service: ConciergeBell,
  'Cash+Product': Wallet,
};

export const rewardIcon = (type: string): LucideIcon => REWARD_ICON[type as RewardType] ?? Gift;

/** Campaign/business category to icon (filter chips, `CategoryPill`). */
export const CATEGORY_ICON: Record<Category, LucideIcon> = {
  Restaurant: UtensilsCrossed,
  Cafe: Coffee,
  'Food & Beverage': CupSoda,
  Fashion: Shirt,
  Beauty: Sparkles,
  'Salon & Spa': Scissors,
  'Health & Wellness': Leaf,
  Fitness: Dumbbell,
  Tech: Smartphone,
  Gaming: Gamepad2,
  Travel: Plane,
  'Home & Lifestyle': Sofa,
  Education: BookOpen,
  Other: Tag,
};

export const categoryIcon = (category: string): LucideIcon =>
  CATEGORY_ICON[category as Category] ?? Tag;

/** Creator niche to icon (onboarding pills, creator profiles). */
export const NICHE_ICON: Record<Niche, LucideIcon> = {
  Food: Utensils,
  Lifestyle: Flower2,
  Fashion: Shirt,
  Beauty: Sparkles,
  Fitness: Dumbbell,
  'Health & Wellness': Leaf,
  Tech: Smartphone,
  Gaming: Gamepad2,
  Travel: Plane,
  Parenting: Baby,
  Education: BookOpen,
  Comedy: Laugh,
  Music: Music,
  'Art & Design': Palette,
  'Business & Finance': TrendingUp,
};

export const nicheIcon = (niche: string): LucideIcon => NICHE_ICON[niche as Niche] ?? Sparkles;

/**
 * Category to 2-stop cover gradient fallback (used when a campaign has no cover
 * image, or it fails to load). Neutral-ink tones tuned per category family.
 */
const CATEGORY_GRADIENT: Record<Category, [string, string]> = {
  Restaurant: ['#FF6A3D', '#FFB020'],
  Cafe: ['#0064E0', '#3E8BFF'],
  'Food & Beverage': ['#FF6A3D', '#FF9E6B'],
  Fashion: ['#7B61FF', '#A48CFF'],
  Beauty: ['#FF6A3D', '#FF9E6B'],
  'Salon & Spa': ['#7B61FF', '#A48CFF'],
  'Health & Wellness': ['#16C79A', '#4FE0BC'],
  Fitness: ['#16C79A', '#4FE0BC'],
  Tech: ['#0064E0', '#3E8BFF'],
  Gaming: ['#7B61FF', '#A48CFF'],
  Travel: ['#0064E0', '#3E8BFF'],
  'Home & Lifestyle': ['#FF6A3D', '#FFB020'],
  Education: ['#0064E0', '#7B61FF'],
  Other: ['#0064E0', '#7B61FF'],
};

const DEFAULT_GRADIENT: [string, string] = ['#0064E0', '#7B61FF'];

/** Returns a CSS `linear-gradient(...)` string for a category cover fallback. */
export function categoryGradient(category?: string): string {
  const stops = (category && CATEGORY_GRADIENT[category as Category]) || DEFAULT_GRADIENT;
  return `linear-gradient(135deg, ${stops[0]}, ${stops[1]})`;
}
