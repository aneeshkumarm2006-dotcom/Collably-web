/**
 * Edit an existing post. Loads the full document server-side (behind the layout's
 * session gate) and hands it to the shared editor in edit mode.
 */
import { notFound, redirect } from 'next/navigation';
import { isValidObjectId } from 'mongoose';
import { connectMongo } from '@/lib/db/mongoose';
import { Post } from '@/lib/db/models/post';
import { hasSeoSession } from '@/lib/seoteam/guard';
import { PostEditor, type EditorInitial } from '@/components/seoteam/post-editor';
import type { PostTemplateId } from '@/lib/db/models/post';

export const dynamic = 'force-dynamic';

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  // Authoritative gate (don't rely on the layout alone).
  if (!(await hasSeoSession())) redirect('/seoteam');

  const { id } = await params;
  if (!isValidObjectId(id)) notFound();

  // Degrade gracefully if the DB is briefly unreachable instead of 500-ing.
  const post = await (async () => {
    try {
      await connectMongo();
      return await Post.findById(id).lean();
    } catch {
      redirect('/seoteam'); // throws NEXT_REDIRECT
    }
  })();
  if (!post) notFound();

  const initial: EditorInitial = {
    id: String(post._id),
    title: post.title,
    slug: post.slug,
    template: (post.template ?? 'generic') as PostTemplateId,
    body: post.body ?? '',
    excerpt: post.excerpt ?? '',
    metaTitle: post.metaTitle ?? '',
    category: post.category ?? 'Guides',
    tags: post.tags ?? [],
    coverImage: post.coverImage ?? '',
    keywords: (post.keywords ?? []).map((k) => ({ keyword: k.keyword, url: k.url, rel: k.rel })),
    linkAllOccurrences: Boolean(post.linkAllOccurrences),
    authorName: post.author?.name ?? 'Local Creator Crew Team',
    authorRole: post.author?.role ?? '',
    status: post.status as 'draft' | 'published',
  };

  return <PostEditor initial={initial} />;
}
