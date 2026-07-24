/**
 * Blog content registry. Unions two sources into one newest-first list:
 *
 *  1. The two code-based static posts (`content/blog/*.tsx` — `meta` + a React
 *     `Body` component). A lightweight, type-safe content collection.
 *  2. DB-backed posts authored in the private `/seoteam` dashboard and stored in
 *     MongoDB. These publish INSTANTLY (no redeploy) and render as sanitized
 *     HTML with keyword backlinks applied.
 *
 * The registry functions are async because the DB set is fetched per request
 * (wrapped in `unstable_cache`, invalidated on publish via `revalidateBlog()`),
 * and degrade gracefully to just the static posts if MongoDB is unreachable —
 * so the public blog never 500s on a DB blip.
 */
import { unstable_cache, revalidateTag } from 'next/cache';
import { revalidatePath } from 'next/cache';
import type { BlogPost, BlogPostMeta, NormalizedPost } from './types';

import Article1, { meta as meta1 } from '@/content/blog/why-follower-minimums-are-broken';
import Article2, { meta as meta2 } from '@/content/blog/run-your-first-gifting-campaign';

const STATIC_POSTS: NormalizedPost[] = [
  { meta: meta1, source: 'static', Body: Article1 },
  { meta: meta2, source: 'static', Body: Article2 },
];

const BLOG_CACHE_TAG = 'blog-posts';

/**
 * Fetch published DB posts as `NormalizedPost`s. Imports the DB layer lazily so
 * this module (and its static-post consumers like the client-safe types) never
 * pull `mongoose`/`server-only` into a bundle that doesn't need it. Returns []
 * on any failure so the blog falls back to the static posts.
 */
const getDbPosts = unstable_cache(
  async (): Promise<NormalizedPost[]> => {
    try {
      const { connectMongo } = await import('@/lib/db/mongoose');
      const { Post } = await import('@/lib/db/models/post');
      const { readingMinutes } = await import('@/lib/seoteam/reading-time');

      await connectMongo();
      const docs = await Post.find({ status: 'published' })
        .sort({ publishedAt: -1 })
        .lean()
        .exec();

      return docs.map((doc): NormalizedPost => {
        const published = (doc.publishedAt ?? doc.createdAt ?? new Date()) as Date;
        const updated = (doc.updatedAt ?? published) as Date;
        const meta: BlogPostMeta = {
          slug: doc.slug,
          title: doc.title,
          description: doc.excerpt || doc.metaTitle || doc.title,
          category: doc.category || 'Guides',
          tags: doc.tags ?? [],
          author: { name: doc.author?.name || 'Local Creator Crew Team', role: doc.author?.role || undefined },
          date: new Date(published).toISOString(),
          updated: new Date(updated).toISOString(),
          readingMinutes: readingMinutes(doc.body || ''),
          coverImage: doc.coverImage || undefined,
          featured: false,
        };
        return {
          meta,
          source: 'db',
          html: doc.body || '',
          keywords: (doc.keywords ?? []).map((k) => ({
            keyword: k.keyword,
            url: k.url,
            rel: k.rel,
          })),
          linkAllOccurrences: Boolean(doc.linkAllOccurrences),
        };
      });
    } catch {
      return [];
    }
  },
  ['blog-db-posts'],
  { tags: [BLOG_CACHE_TAG], revalidate: 60 },
);

/** All posts (static + published DB), newest first, de-duped by slug (static wins). */
async function getNormalizedPosts(): Promise<NormalizedPost[]> {
  const db = await getDbPosts();
  const bySlug = new Map<string, NormalizedPost>();
  for (const p of db) bySlug.set(p.meta.slug, p);
  for (const p of STATIC_POSTS) bySlug.set(p.meta.slug, p); // static overrides on collision
  return [...bySlug.values()].sort((a, b) => +new Date(b.meta.date) - +new Date(a.meta.date));
}

/** All posts, newest first. */
export async function getAllPosts(): Promise<NormalizedPost[]> {
  return getNormalizedPosts();
}

/** Just the metadata (index list / sitemap / RSS), newest first. */
export async function getAllPostsMeta(): Promise<BlogPostMeta[]> {
  return (await getNormalizedPosts()).map((p) => p.meta);
}

/** A single post (either source) by slug. */
export async function getPost(slug: string): Promise<NormalizedPost | undefined> {
  return (await getNormalizedPosts()).find((p) => p.meta.slug === slug);
}

/** The featured post (or the most recent) for the index hero. */
export async function getFeaturedPost(): Promise<NormalizedPost> {
  const posts = await getNormalizedPosts();
  return posts.find((p) => p.meta.featured) ?? posts[0]!;
}

/** Distinct categories present across all posts. */
export async function getAllCategories(): Promise<string[]> {
  return Array.from(new Set((await getNormalizedPosts()).map((p) => p.meta.category)));
}

/** Up to `limit` other posts (excludes `slug`), preferring the same category. */
export async function getRelatedPosts(slug: string, limit = 2): Promise<NormalizedPost[]> {
  const posts = await getNormalizedPosts();
  const current = posts.find((p) => p.meta.slug === slug);
  const others = posts.filter((p) => p.meta.slug !== slug);
  if (!current) return others.slice(0, limit);
  const sameCat = others.filter((p) => p.meta.category === current.meta.category);
  const rest = others.filter((p) => p.meta.category !== current.meta.category);
  return [...sameCat, ...rest].slice(0, limit);
}

/**
 * Invalidate the cached DB post list + the blog routes so a publish/unpublish/
 * edit/delete appears on `/blog` instantly (no redeploy). Called by the
 * `/api/seoteam` mutation routes.
 */
export function revalidateBlog(): void {
  revalidateTag(BLOG_CACHE_TAG);
  revalidatePath('/blog');
  revalidatePath('/sitemap.xml');
  revalidatePath('/feed.xml');
}

/** Legacy re-export kept for any importer expecting the old `BlogPost` shape. */
export type { BlogPost };
