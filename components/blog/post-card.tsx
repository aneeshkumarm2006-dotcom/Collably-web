import Link from 'next/link';

import { cn } from '@/lib/utils';
import { formatDate, initials } from '@/lib/format';
import { categoryGradient } from '@/lib/domain-meta';
import type { BlogPostMeta } from '@/lib/blog/types';

/** A blog post card for the index grid (`default`) or the featured hero (`feature`). */
export function PostCard({
  post,
  variant = 'default',
  className,
}: {
  post: BlogPostMeta;
  variant?: 'default' | 'feature';
  className?: string;
}) {
  const feature = variant === 'feature';
  const gradient = categoryGradient(post.category);

  if (feature) {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className={cn(
          'sticker group grid overflow-hidden rounded-xl bg-card transition-transform duration-200 hover:-translate-y-1 hover:shadow-sticker-lg lg:grid-cols-[1.1fr_.9fr]',
          className,
        )}
      >
        {/* Gradient panel */}
        <div
          className="relative flex min-h-[240px] items-end border-b-outline border-ink p-7 lg:min-h-full lg:border-b-0 lg:border-r-outline"
          style={{ background: gradient }}
        >
          <span className="relative inline-flex items-center gap-1.5 rounded-full border-outline border-ink bg-yellow px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-ink">
            Featured · {post.category}
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center p-8">
          <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.14em] text-coral">
            {post.category}
          </span>
          <h2 className="mt-3 font-display text-[28px] font-extrabold leading-[1.1] tracking-[-0.02em] text-ink">
            {post.title}
          </h2>
          <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-muted">
            {post.description}
          </p>
          <AuthorRow post={post} className="mt-6" />
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        'sticker group flex flex-col overflow-hidden rounded-card bg-card transition-transform duration-200 hover:-translate-y-1 hover:shadow-sticker-lg',
        className,
      )}
    >
      {/* Gradient header */}
      <div
        className="relative h-[150px] shrink-0 border-b-outline border-ink p-4"
        style={{ background: gradient }}
      >
        <span className="relative inline-flex items-center rounded-full border-outline border-ink bg-yellow px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-ink">
          {post.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-[18px] font-bold leading-snug tracking-[-0.01em] text-ink">
          <span className="line-clamp-2">{post.title}</span>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{post.description}</p>
        <AuthorRow post={post} compact className="mt-5" />
      </div>
    </Link>
  );
}

/** Author avatar + name · date row. `compact` uses a small gradient avatar for grid cards. */
function AuthorRow({
  post,
  compact,
  className,
}: {
  post: BlogPostMeta;
  compact?: boolean;
  className?: string;
}) {
  const size = compact ? 28 : 40;
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span
        aria-hidden
        className="flex shrink-0 items-center justify-center rounded-full border-2 border-ink font-display text-xs font-bold text-white"
        style={{
          width: size,
          height: size,
          background: categoryGradient(post.category),
          fontSize: Math.max(10, Math.round(size * 0.36)),
        }}
      >
        {initials(post.author.name)}
      </span>
      <div className="min-w-0 text-[13px]">
        {compact ? (
          <span className="text-muted">
            <span className="font-semibold text-ink">{post.author.name}</span> ·{' '}
            {formatDate(post.date)}
          </span>
        ) : (
          <>
            <div className="font-semibold text-ink">{post.author.name}</div>
            <div className="text-[12px] text-muted">
              {formatDate(post.date)} · {post.readingMinutes} min read
            </div>
          </>
        )}
      </div>
    </div>
  );
}
