/**
 * Analytics Hub chart palette.
 *
 * One hue per source, chosen from a colorblind-separable qualitative set
 * (Okabe–Ito derived) that all contrast well on the white/dark card surface.
 * When several metrics from the SAME source are overlaid, we step lightness so
 * each line stays distinguishable while keeping the source's hue identity.
 */
import type { SourceId } from '@/lib/analyticshub/types';

/** Brand fallback for project accents. */
export const BRAND_PRIMARY = '#0064E0';
export const BRAND_ACCENT = '#FF6A3D';

/**
 * Validate a color from the (untrusted) API before it reaches a style value.
 * Accepts #rgb / #rrggbb only; anything else falls back to a safe default.
 */
export function safeHexColor(value: unknown, fallback = BRAND_PRIMARY): string {
  return typeof value === 'string' && /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(value.trim())
    ? value.trim()
    : fallback;
}

/** Base hue per source. Distinct + colorblind-separable on the card surface. */
export const SOURCE_HUE: Record<SourceId, string> = {
  ga4: '#0064E0', // brand blue
  gsc: '#009E73', // bluish green
  meta: '#7B61FF', // reddish purple
  gads: '#E69F00', // orange
  users: '#56B4E9', // sky blue
};

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.replace(/(.)/g, '$1$1') : h;
  const int = parseInt(full, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const to = (v: number) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

/** Mix a hex toward white (amount 0..1). Used for lightness steps within a hue. */
function lighten(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount);
}

/**
 * Color for one line of a source. `index` is the metric's position among the
 * selected metrics of that source, `count` how many that source contributes.
 */
export function seriesColor(source: SourceId, index = 0, count = 1): string {
  const base = SOURCE_HUE[source] ?? SOURCE_HUE.ga4;
  if (count <= 1 || index <= 0) return base;
  // Step lightness up to ~55% lighter across the group's members.
  const step = (index / Math.max(1, count - 1)) * 0.55;
  return lighten(base, step);
}
