/**
 * Client-safe post enums + types. Kept out of `models/post.ts` (which is
 * `server-only` and pulls in mongoose) so client components — the editor,
 * keyword manager, template picker — can import these values without dragging
 * the server DB layer into the browser bundle.
 */

/** rel options for a keyword backlink (per the SEO team's link intent). */
export const KEYWORD_REL_VALUES = ['dofollow', 'nofollow', 'sponsored'] as const;
export type KeywordRel = (typeof KEYWORD_REL_VALUES)[number];

/** Ids of the ready-made SEO post templates the author can start from. */
export const POST_TEMPLATE_IDS = [
  'how-to',
  'listicle',
  'comparison',
  'review',
  'news',
  'generic',
] as const;
export type PostTemplateId = (typeof POST_TEMPLATE_IDS)[number];

export const POST_STATUSES = ['draft', 'published'] as const;
export type PostStatus = (typeof POST_STATUSES)[number];
