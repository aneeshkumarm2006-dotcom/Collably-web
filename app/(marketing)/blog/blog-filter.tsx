'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';
import type { BlogPostMeta } from '@/lib/blog/types';
import { PostCard } from '@/components/blog/post-card';
import { Reveal } from '@/components/shared/reveal';

const ALL = 'All';

/**
 * Category filter pills + the filtered post grid. Client-side so selecting a
 * pill narrows the grid without a navigation. Data is passed in from the
 * server-rendered index page (no fetching here).
 */
export function BlogFilter({ posts }: { posts: BlogPostMeta[] }) {
  const categories = [ALL, ...Array.from(new Set(posts.map((p) => p.category)))];
  const [active, setActive] = useState<string>(ALL);

  const visible = active === ALL ? posts : posts.filter((p) => p.category === active);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Filter posts by category"
        className="mb-8 flex flex-wrap gap-2"
      >
        {categories.map((cat) => {
          const selected = cat === active;
          return (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(cat)}
              className={cn(
                'rounded-full border-outline border-ink px-4 py-1.5 font-mono text-[13px] font-semibold uppercase tracking-[0.06em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
                selected
                  ? 'bg-brand text-white'
                  : 'bg-card text-muted hover:bg-yellow hover:text-ink',
              )}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {visible.length > 0 ? (
        // Remount on filter change (`key`) so the reveal observer re-scans the new
        // cards — each wrapper is a fresh `.r` target, and PostCard keeps its own
        // hover-lift untouched inside.
        <Reveal key={active} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((post) => (
            <div key={post.slug} className="r">
              <PostCard post={post} className="h-full" />
            </div>
          ))}
        </Reveal>
      ) : (
        <p className="sticker rounded-card bg-card p-10 text-center text-muted">
          No posts in this category yet.
        </p>
      )}
    </div>
  );
}
