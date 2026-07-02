/**
 * Slug helpers for blog posts: derive a URL-safe slug from a title and ensure
 * it's unique across BOTH the DB posts and the two hardcoded static posts (which
 * live outside the DB), so a published DB post can never shadow a static one.
 */
import 'server-only';
import { connectMongo } from '@/lib/db/mongoose';
import { Post } from '@/lib/db/models/post';

/** Slugs owned by the code-based static posts in `content/blog/*` — reserved. */
export const RESERVED_STATIC_SLUGS = new Set([
  'why-follower-minimums-are-broken',
  'run-your-first-gifting-campaign',
]);

/** "Why Follower Minimums Are Broken!" → "why-follower-minimums-are-broken". */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/**
 * Return a unique slug based on `base`, appending `-2`, `-3`… until free.
 * Excludes the post being edited (`excludeId`) and avoids the reserved static
 * slugs. Falls back to `post` if the input slugifies to empty.
 */
export async function ensureUniqueSlug(base: string, excludeId?: string): Promise<string> {
  await connectMongo();
  const root = slugify(base) || 'post';

  let candidate = root;
  let n = 1;
  // Loop until the candidate collides with neither a reserved static slug nor
  // another DB post.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const clash = RESERVED_STATIC_SLUGS.has(candidate);
    if (!clash) {
      const existing = await Post.findOne({ slug: candidate }).select('_id').lean();
      if (!existing || (excludeId && String(existing._id) === excludeId)) {
        return candidate;
      }
    }
    n += 1;
    candidate = `${root}-${n}`;
  }
}
