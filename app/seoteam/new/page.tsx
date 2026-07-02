/**
 * Create a new post. The editor starts blank (defaults to the Generic template).
 */
import { redirect } from 'next/navigation';
import { hasSeoSession } from '@/lib/seoteam/guard';
import { PostEditor } from '@/components/seoteam/post-editor';

export const dynamic = 'force-dynamic';

export default async function NewPostPage() {
  // Authoritative gate (don't rely on the layout alone).
  if (!(await hasSeoSession())) redirect('/seoteam');
  return <PostEditor />;
}
