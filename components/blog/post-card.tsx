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
          'group grid overflow-hidden rounded-[22px] border border-hair bg-card shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover lg:grid-cols-[1.1fr_.9fr]',
          className,
        )}
      >
        {/* Gradient panel */}
        <div
          className="relative flex min-h-[240px] items-end p-7 lg:min-h-full"
          style={{ background: gradient }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl"
          />
          <span className="relative inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur">
            Featured · {post.category}
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center p-8">
          <span className="text-[13px] font-extrabold uppercase tracking-[0.1em] text-brand">
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
        'group flex flex-col overflow-hidden rounded-2xl border border-hair bg-card shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover',
        className,
      )}
    >
      {/* Gradient header */}
      <div className="relative h-[150px] shrink-0 p-4" style={{ background: gradient }}>
        <span
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/15 blur-2xl"
        />
        <span className="relative inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur">
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
        className="flex shrink-0 items-center justify-center rounded-full font-display text-xs font-bold text-white"
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
