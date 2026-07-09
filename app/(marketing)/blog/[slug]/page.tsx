import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';

import { buildMetadata, blogPostingJsonLd, breadcrumbJsonLd } from '@/lib/seo';
import { formatDate, initials } from '@/lib/format';
import { getPost, getRelatedPosts } from '@/lib/blog';
import { sanitizePostHtml } from '@/lib/seoteam/sanitize';
import { applyKeywordLinks } from '@/lib/seoteam/keyword-links';
import { categoryGradient } from '@/lib/domain-meta';
import { Container } from '@/components/marketing/section';
import { Prose } from '@/components/marketing/prose';
import { CtaBand } from '@/components/marketing/cta-band';
import { PostCard } from '@/components/blog/post-card';
import { JsonLd } from '@/components/shared/json-ld';

// Slugs are open-ended (new DB posts appear without a rebuild), so resolve at
// request time. The DB read is cached and tag-invalidated on publish.
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return buildMetadata({ title: 'Post not found', description: '', path: `/blog/${slug}`, noIndex: true });
  return buildMetadata({
    title: post.meta.title,
    description: post.meta.description,
    path: `/blog/${post.meta.slug}`,
    image: post.meta.coverImage,
    type: 'article',
    ogEyebrow: `Blog · ${post.meta.category}`,
    keywords: post.meta.tags,
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const { meta } = post;
  const related = await getRelatedPosts(slug);
  const gradient = categoryGradient(meta.category);

  // Static posts render their React `Body`; DB posts render sanitized HTML with
  // keyword backlinks applied (sanitized again here as defense in depth).
  const dbHtml =
    post.source === 'db'
      ? sanitizePostHtml(
          applyKeywordLinks(post.html, post.keywords, { linkAll: post.linkAllOccurrences }),
        )
      : null;

  // Best-effort view count for DB posts (fire-and-forget; never blocks render).
  if (post.source === 'db') {
    void (async () => {
      try {
        const { connectMongo } = await import('@/lib/db/mongoose');
        const { Post } = await import('@/lib/db/models/post');
        await connectMongo();
        await Post.updateOne({ slug: meta.slug }, { $inc: { views: 1 } });
      } catch {
        /* monitoring only — ignore failures */
      }
    })();
  }

  return (
    <article className="bg-page pb-4">
      <JsonLd
        data={[
          blogPostingJsonLd({
            slug: meta.slug,
            title: meta.title,
            description: meta.description,
            image: meta.coverImage,
            datePublished: meta.date,
            dateModified: meta.updated,
            authorName: meta.author.name,
          }),
          breadcrumbJsonLd([
            { name: 'Blog', path: '/blog' },
            { name: meta.title, path: `/blog/${meta.slug}` },
          ]),
        ]}
      />

      <div className="mx-auto w-full max-w-[720px] px-6 pt-12">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" /> All posts
        </Link>

        {/* Header */}
        <header className="mt-6">
          <span className="text-[13px] font-extrabold uppercase tracking-[0.1em] text-brand">
            {meta.category}
          </span>
          <h1 className="mt-3 text-balance font-display text-3xl font-extrabold leading-[1.1] tracking-[-0.03em] sm:text-[42px]">
            {meta.title}
          </h1>

          {/* Author row */}
          <div className="mt-6 flex items-center gap-3 border-b border-hair pb-6">
            <span
              aria-hidden
              className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full font-display text-sm font-bold text-white"
              style={{ background: gradient }}
            >
              {initials(meta.author.name)}
            </span>
            <div className="text-sm">
              <div className="font-semibold text-ink">
                {meta.author.name}
                {meta.author.role && (
                  <span className="font-normal text-muted"> · {meta.author.role}</span>
                )}
              </div>
              <div className="text-[12px] text-muted">
                {formatDate(meta.date)} · {meta.readingMinutes} min read
              </div>
            </div>
          </div>
        </header>

        {/* Hero */}
        <div
          className="relative mt-8 h-[280px] overflow-hidden rounded-2xl"
          style={{ background: gradient }}
        >
          {meta.coverImage && (
            <Image
              src={meta.coverImage}
              alt={meta.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 720px"
              className="object-cover"
            />
          )}
        </div>

        {/* Body */}
        <Prose className="mt-10">
          {post.source === 'db' ? (
            <div dangerouslySetInnerHTML={{ __html: dbHtml ?? '' }} />
          ) : (
            <post.Body />
          )}
        </Prose>

        {/* Tags */}
        {meta.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {meta.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-hair bg-card px-3 py-1 text-[12px] font-medium text-muted"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Share */}
        <div className="mt-8 flex items-center gap-3 border-t border-hair pt-6">
          <span className="text-sm font-semibold text-ink">Share:</span>
          <ShareTiles title={meta.title} slug={meta.slug} />
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <Container size="default" className="mt-16">
          <h2 className="mb-6 font-display text-2xl font-bold tracking-[-0.02em] text-ink">
            Keep reading
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {related.map((r) => (
              <PostCard key={r.meta.slug} post={r.meta} />
            ))}
          </div>
        </Container>
      )}

      <div className="mt-16">
        <CtaBand
          title="Start your first collab free"
          subtitle="Join LocalShout free, as a creator or a business, and put these ideas to work."
          primary={{ label: 'Get started', href: '/signup' }}
          secondary={{ label: 'Browse campaigns', href: '/explore' }}
        />
      </div>
    </article>
  );
}

/** Square social share tiles (LinkedIn / X / Facebook). Links open a share intent. */
function ShareTiles({ title, slug }: { title: string; slug: string }) {
  const url = `https://localshout.app/blog/${slug}`;
  const enc = encodeURIComponent(url);
  const encTitle = encodeURIComponent(title);
  const tiles = [
    {
      label: 'Share on LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc}`,
      glyph: 'in',
    },
    {
      label: 'Share on X',
      href: `https://twitter.com/intent/tweet?url=${enc}&text=${encTitle}`,
      glyph: 'X',
    },
    {
      label: 'Share on Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc}`,
      glyph: 'f',
    },
  ];
  return (
    <div className="flex items-center gap-2">
      {tiles.map((t) => (
        <a
          key={t.label}
          href={t.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t.label}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-hair-strong bg-card text-sm font-bold text-muted transition-colors hover:border-brand hover:text-brand"
        >
          {t.glyph}
        </a>
      ))}
    </div>
  );
}
