'use client';
/**
 * The posts management table: search + status filter + per-row actions
 * (edit / publish / unpublish / delete). Composed from existing primitives
 * (no shadcn table primitive exists in this repo).
 */
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2, Send, EyeOff, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/format';
import { toast } from '@/lib/toast';

export interface PostRow {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  views: number;
  category: string;
  publishedAt: string | null;
  updatedAt: string | null;
}

type StatusFilter = 'all' | 'draft' | 'published';

export function PostsTable({ initialPosts }: { initialPosts: PostRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<PostRow | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialPosts.filter(
      (p) =>
        (filter === 'all' || p.status === filter) &&
        (!q || p.title.toLowerCase().includes(q)),
    );
  }, [initialPosts, query, filter]);

  async function togglePublish(post: PostRow) {
    setBusyId(post.id);
    try {
      const next = post.status === 'published' ? 'draft' : 'published';
      const res = await fetch(`/api/seoteam/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error();
      toast.success(next === 'published' ? 'Post published' : 'Post unpublished');
      router.refresh();
    } catch {
      toast.error('Could not update the post');
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setBusyId(toDelete.id);
    try {
      const res = await fetch(`/api/seoteam/posts/${toDelete.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Post deleted');
      setToDelete(null);
      router.refresh();
    } catch {
      toast.error('Could not delete the post');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Posts</h1>
          <p className="mt-1 text-sm text-muted">
            {initialPosts.length} post{initialPosts.length === 1 ? '' : 's'} · publish to make them
            live on /blog instantly.
          </p>
        </div>
        <Button asChild>
          <Link href="/seoteam/new">New post</Link>
        </Button>
      </div>

      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <Input
            placeholder="Search by title…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-hair bg-card p-1">
          {(['all', 'published', 'draft'] as StatusFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                filter === f ? 'bg-brand text-white' : 'text-muted hover:text-ink'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-hair bg-card">
        <div className="hidden grid-cols-[1fr_120px_100px_140px_180px] gap-4 border-b border-hair px-5 py-3 text-[12px] font-semibold uppercase tracking-wide text-faint md:grid">
          <span>Title</span>
          <span>Status</span>
          <span>Views</span>
          <span>Published</span>
          <span className="text-right">Actions</span>
        </div>

        {rows.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-muted">
            No posts yet. <Link href="/seoteam/new" className="text-brand underline">Create one</Link>.
          </div>
        ) : (
          rows.map((post) => (
            <div
              key={post.id}
              className="grid grid-cols-1 gap-3 border-b border-hair px-5 py-4 last:border-0 md:grid-cols-[1fr_120px_100px_140px_180px] md:items-center md:gap-4"
            >
              <div className="min-w-0">
                <div className="truncate font-semibold text-ink">{post.title || 'Untitled'}</div>
                <div className="truncate text-[12px] text-muted">/{post.slug}</div>
              </div>
              <div>
                <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                  {post.status}
                </Badge>
              </div>
              <div className="inline-flex items-center gap-1 text-sm text-muted">
                <Eye className="h-3.5 w-3.5" /> {post.views}
              </div>
              <div className="text-sm text-muted">
                {post.publishedAt ? formatDate(post.publishedAt) : '—'}
              </div>
              <div className="flex items-center justify-start gap-1 md:justify-end">
                <Button asChild variant="ghost" size="sm" title="Edit">
                  <Link href={`/seoteam/${post.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={busyId === post.id}
                  onClick={() => togglePublish(post)}
                  title={post.status === 'published' ? 'Unpublish' : 'Publish'}
                >
                  {post.status === 'published' ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={busyId === post.id}
                  onClick={() => setToDelete(post)}
                  title="Delete"
                  className="text-danger hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete confirm */}
      <Dialog open={Boolean(toDelete)} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this post?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted">
            &ldquo;{toDelete?.title}&rdquo; will be permanently removed. This can&rsquo;t be undone.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={busyId === toDelete?.id}
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
