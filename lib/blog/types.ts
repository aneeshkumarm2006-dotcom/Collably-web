import type { ComponentType } from 'react';

/**
 * Blog post metadata. Each post is a `.tsx` module under `content/blog/` that
 * exports `meta` (this shape) + a default React component for the body. The
 * registry in `lib/blog/index.ts` collects them: a lightweight, type-safe
 * content collection with no MDX toolchain.
 */
export interface BlogPostMeta {
  slug: string;
  title: string;
  /** Excerpt + meta description + RSS summary (one sentence or two). */
  description: string;
  /** Editorial category (one per post): used for the index filter + breadcrumbs. */
  category: string;
  tags: string[];
  author: { name: string; role?: string };
  /** ISO date published. */
  date: string;
  /** ISO date last updated (defaults to `date`). */
  updated?: string;
  readingMinutes: number;
  /** Remote cover image (Unsplash/Pixabay/Cloudinary): hero + social preview. */
  coverImage?: string;
  /** Surface on the index hero. */
  featured?: boolean;
}

export interface BlogPost {
  meta: BlogPostMeta;
  Body: ComponentType;
}

/** rel intent for a keyword backlink, carried through to the public renderer. */
export interface BlogKeyword {
  keyword: string;
  url: string;
  rel?: 'dofollow' | 'nofollow' | 'sponsored';
}

/**
 * A post normalized across both sources so `/blog` can render either through one
 * path: the two code-based static posts (a React `Body` component) and the
 * DB-backed posts authored in `/seoteam` (sanitized HTML + keyword backlinks).
 */
export type NormalizedPost =
  | { meta: BlogPostMeta; source: 'static'; Body: ComponentType }
  | {
      meta: BlogPostMeta;
      source: 'db';
      html: string;
      keywords: BlogKeyword[];
      linkAllOccurrences: boolean;
    };
