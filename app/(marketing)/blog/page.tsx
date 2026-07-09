import Link from 'next/link';
import type { Metadata } from 'next';
import { Rss } from 'lucide-react';

import { buildMetadata } from '@/lib/seo';
import { getAllPostsMeta, getFeaturedPost } from '@/lib/blog';
import { Section, SectionLabel } from '@/components/marketing/section';
import { PostCard } from '@/components/blog/post-card';
import { BlogFilter } from './blog-filter';

export const metadata: Metadata = buildMetadata({
  title: 'Blog',
  description:
    'Guides, playbooks, and ideas on creator collabs, gifting campaigns, and building a brand with local creators, from the LocalShout team.',
  path: '/blog',
  ogEyebrow: 'Blog',
});

// Published posts come from the DB and must appear instantly (no redeploy), so
// render on demand; the DB read itself is cached + tag-invalidated on publish.
export const dynamic = 'force-dynamic';

export default async function BlogIndexPage() {
  const featured = await getFeaturedPost();
  const posts = await getAllPostsMeta();
  const rest = posts.filter((p) => p.slug !== featured.meta.slug);

  return (
    <Section tone="page">
      {/* Header */}
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <SectionLabel>The LocalShout Blog</SectionLabel>
          <h1 className="mt-5 text-balance font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-[48px]">
            Playbooks for local collabs.
          </h1>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted">
            Guides, stories and data on creator marketing, local business growth and the creator
            economy in Canada.
          </p>
        </div>
        <Link
          href="/feed.xml"
          className="inline-flex items-center gap-2 rounded-full border border-hair-strong bg-card px-4 py-2 text-sm font-semibold text-muted transition-colors hover:border-brand hover:text-brand"
        >
          <Rss className="h-4 w-4" /> RSS
        </Link>
      </div>

      {/* Featured */}
      <PostCard post={featured.meta} variant="feature" className="mb-12" />

      {/* Filter + grid */}
      {rest.length > 0 && <BlogFilter posts={rest} />}
    </Section>
  );
}
