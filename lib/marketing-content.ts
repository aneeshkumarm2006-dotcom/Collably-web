/**
 * Marketing copy in one place so the landing + audience pages stay in sync.
 * These are editorial/marketing figures (illustrative), not live API data. The
 * "live campaigns" rail and Explore pull the real backend.
 */
import type { FaqItem } from '@/lib/faq';

/** Headline platform stats shown in the stats band + OG copy. */
export const PLATFORM_STATS = [
  { value: '3,200+', label: 'Creators' },
  { value: '640+', label: 'Local businesses' },
  { value: '$1.2M+', label: 'Rewards unlocked' },
  { value: '18', label: 'Canadian cities' },
] as const;

/** Category strip: label + a display count (links into Explore filtered). */
export const CATEGORY_STRIP: { label: string; count: number }[] = [
  { label: 'Restaurant', count: 342 },
  { label: 'Fashion', count: 218 },
  { label: 'Beauty', count: 195 },
  { label: 'Fitness', count: 134 },
  { label: 'Cafe', count: 121 },
  { label: 'Tech', count: 87 },
  { label: 'Travel', count: 76 },
];

/** Businesses shown in the "trusted by" marquee on the landing page. */
export const MARQUEE_BUSINESSES = [
  'Maple & Oat',
  'Glow Bar',
  'North Goods',
  'Peak Pilates',
  'Harbour Tacos',
  'Lush Locks',
  'Bloom & Bistro',
  'Aurora Spa',
] as const;

export const HOW_IT_WORKS = {
  business: [
    { title: 'Post a collab', body: "Tell creators what you're offering and what you need, in minutes." },
    { title: 'Review pitches', body: 'Browse profiles and pitches from creators who actually want to work with you.' },
    { title: 'Accept & verify', body: 'Pick the ones you love, verify the content, done. UGC without agency costs.' },
  ],
  creator: [
    { title: 'Browse your niche', body: 'Find collabs from local spots matching your niche and your city.' },
    { title: 'Apply with a pitch', body: 'No agency gatekeeping, just you, your work, and a quick pitch.' },
    { title: 'Show up & earn', body: 'Complete the collab, unlock the reward, and build your portfolio.' },
  ],
} as const;

/** "Why Local Creator Crew" feature grid (lucide icon name + accent tone resolved in the page). */
export const FEATURES = [
  {
    icon: 'gift',
    tone: 'brand',
    title: 'Real rewards, never "exposure"',
    body: 'Every collab states exactly what you earn — meals, services, products — with the dollar value up front.',
  },
  {
    icon: 'users',
    tone: 'warm',
    title: 'No follower minimums',
    body: 'Nano and UGC creators are first-class here. Local spots match on fit and quality, not vanity metrics.',
  },
  {
    icon: 'map-pin',
    tone: 'grape',
    title: 'Local-first matching',
    body: 'Collabs surface by city and niche, so you work with businesses right around the corner.',
  },
] as const;

/** Sample rewards list (icon + perk → $ value) for the rewards section. */
export const SAMPLE_REWARDS: {
  name: string;
  sub: string;
  value: string;
  icon: string;
  tone: string;
}[] = [
  { name: 'Brunch for two', sub: 'Maple & Oat · Gastown', value: '$65', icon: 'coffee', tone: 'warm' },
  { name: 'Full skincare set', sub: 'Glow Bar · Yorkville', value: '$95', icon: 'sparkles', tone: 'grape' },
  { name: '3-month studio pass', sub: 'Peak Pilates · Kits', value: '$270', icon: 'dumbbell', tone: 'mint' },
  { name: 'Tasting menu for two', sub: 'Bloom & Bistro · Old Port', value: '$140', icon: 'utensils', tone: 'brand' },
  { name: 'Signature cut & colour', sub: 'Lush Locks · Queen West', value: '$180', icon: 'scissors', tone: 'warm' },
];

export const TESTIMONIALS = [
  {
    initials: 'AP',
    name: 'Aanya Patel',
    role: 'Creator · @toronto.eats',
    quote:
      'As a nano creator I kept getting ignored by agencies. On Local Creator Crew I landed three restaurant collabs in my first month — all in Toronto, all genuinely fun.',
  },
  {
    initials: 'DR',
    name: 'Daniel Roy',
    role: 'Owner · Maple & Oat',
    quote:
      'We replaced a $2k/month agency retainer. We post a collab, review real pitches, and the content quality has honestly been better.',
  },
  {
    initials: 'ML',
    name: 'Marcus Lee',
    role: 'Creator · @van.foodie.diaries',
    quote:
      "The reward is always clear before I apply. No chasing, no “we'll pay in exposure” — just real experiences I actually want.",
  },
] as const;

export const GENERAL_FAQS: FaqItem[] = [
  {
    q: 'Is Local Creator Crew free to join?',
    a: 'Yes. Creating an account, building your profile, and browsing collabs is completely free for both creators and businesses. Local spots only pay in the rewards they offer.',
  },
  {
    q: 'Do I need a minimum follower count?',
    a: 'No. We welcome nano and UGC-only creators. Each collab sets its own requirements, and many are open to all. Businesses match on content fit, not follower count.',
  },
  {
    q: 'How do rewards work?',
    a: 'Every collab states the reward and its dollar value up front. Once your submission is reviewed and verified by the business, the collab is marked complete and the reward is yours.',
  },
  {
    q: 'What kinds of rewards can I earn?',
    a: 'Real meals, services and products — dining experiences, vouchers, memberships, skincare sets, and more. It varies by business, and the reward and its value show on every collab.',
  },
  {
    q: 'How do businesses verify content?',
    a: 'Creators submit live post links and proof screenshots. Businesses review each submission and can mark it verified, request a revision, or flag an issue before completing the collab.',
  },
];

/**
 * Canonical business pricing. Rendered by BOTH `/pricing` and the landing
 * page's pricing section, so it lives here rather than in either of them —
 * two copies would silently drift and put a wrong price on a public page.
 *
 * `monthly` and `annual` are CAD per month; `annual` is the discounted
 * per-month rate when billed yearly. A tier at 0 renders as "Free".
 */
export interface BusinessTier {
  name: string;
  monthly: number;
  annual: number;
  note: string;
  cta: { label: string; href: string };
  features: string[];
  featured?: boolean;
}

export const BUSINESS_TIERS: BusinessTier[] = [
  {
    name: 'Starter',
    monthly: 0,
    annual: 0,
    note: 'Pay only in the rewards you offer.',
    cta: { label: 'Get started', href: '/signup' },
    features: [
      'Post collabs & receive pitches',
      'Review applications & accept creators',
      'Verify submissions end-to-end',
      'Direct messaging with creators',
      '1 active collab at a time',
    ],
  },
  {
    name: 'Growth',
    monthly: 49,
    annual: 39,
    note: 'For growing local brands running steady collabs.',
    cta: { label: 'Start Growth', href: '/signup' },
    featured: true,
    features: [
      'Everything in Starter',
      'Up to 10 active collabs',
      'Priority placement in Explore',
      'Campaign analytics dashboard',
      'Faster support',
    ],
  },
  {
    name: 'Pro',
    monthly: 99,
    annual: 79,
    note: 'For multi-location brands and teams at scale.',
    cta: { label: 'Talk to sales', href: '/contact' },
    features: [
      'Everything in Growth',
      'Unlimited active collabs',
      'Team seats & roles',
      'Advanced analytics & exports',
      'Priority support',
    ],
  },
];
