'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';
import type { BlogPostMeta } from '@/lib/blog/types';
import { PostCard } from '@/components/blog/post-card';

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
                'rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
                selected
                  ? 'border-brand bg-brand text-white'
                  : 'border-hair-strong bg-card text-muted hover:border-brand hover:text-brand',
              )}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {visible.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-hair bg-card p-10 text-center text-muted">
          No posts in this category yet.
        </p>
      )}
    </div>
  );
}
