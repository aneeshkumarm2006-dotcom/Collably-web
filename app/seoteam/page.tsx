/**
 * SEO dashboard home: the posts table. Reads directly from Mongo in the server
 * component (already behind the layout's session gate) and hands plain rows to
 * the client table for search/filter/actions.
 */
import { redirect } from 'next/navigation';
import { connectMongo } from '@/lib/db/mongoose';
import { Post } from '@/lib/db/models/post';
import { hasSeoSession } from '@/lib/seoteam/guard';
import { PostsTable, type PostRow } from '@/components/seoteam/posts-table';

export const dynamic = 'force-dynamic';

async function loadPosts(): Promise<PostRow[]> {
  try {
    await connectMongo();
    const docs = await Post.find({})
      .select('title slug status views category publishedAt updatedAt')
      .sort({ updatedAt: -1 })
      .lean();
    return docs.map((d) => ({
      id: String(d._id),
      title: d.title,
      slug: d.slug,
      status: d.status as PostRow['status'],
      views: d.views ?? 0,
      category: d.category ?? '',
      publishedAt: d.publishedAt ? new Date(d.publishedAt).toISOString() : null,
      updatedAt: d.updatedAt ? new Date(d.updatedAt as Date).toISOString() : null,
    }));
  } catch {
    return [];
  }
}

export default async function SeoPostsPage() {
  // Authoritative gate: never rely on the layout alone (a layout can be skipped
  // on partial RSC renders), so re-verify the session before touching the DB.
  if (!(await hasSeoSession())) redirect('/seoteam');
  const posts = await loadPosts();
  return <PostsTable initialPosts={posts} />;
}
