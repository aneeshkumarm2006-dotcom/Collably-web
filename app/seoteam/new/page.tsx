/**
 * Create a new post. The editor starts blank (defaults to the Generic template).
 */
import { PostEditor } from '@/components/seoteam/post-editor';

export const dynamic = 'force-dynamic';

export default function NewPostPage() {
  return <PostEditor />;
}
