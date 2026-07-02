/**
 * /api/seoteam/posts
 *   GET  — list posts for the dashboard table (title/status/date/views), with
 *          optional `?status=` filter and `?q=` title search. Body excluded.
 *   POST — create a post (draft by default). Slug is auto-generated + de-duped,
 *          body is sanitized on save.
 *
 * Both require a valid SEO session (401 otherwise).
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSeoApi } from '@/lib/seoteam/guard';
import { connectMongo } from '@/lib/db/mongoose';
import { Post } from '@/lib/db/models/post';
import { ensureUniqueSlug } from '@/lib/seoteam/slug';
import { sanitizePostHtml } from '@/lib/seoteam/sanitize';
import { postInputSchema } from '@/lib/seoteam/post-schema';
import { revalidateBlog } from '@/lib/blog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const unauth = await requireSeoApi();
  if (unauth) return unauth;

  await connectMongo();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const q = searchParams.get('q')?.trim();

  const filter: Record<string, unknown> = {};
  if (status === 'draft' || status === 'published') filter.status = status;
  if (q) filter.title = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };

  const posts = await Post.find(filter)
    .select('title slug status views category publishedAt updatedAt createdAt')
    .sort({ updatedAt: -1 })
    .lean();

  return NextResponse.json({ posts });
}

export async function POST(req: Request) {
  const unauth = await requireSeoApi();
  if (unauth) return unauth;

  let input: z.infer<typeof postInputSchema>;
  try {
    input = postInputSchema.parse(await req.json());
  } catch (err) {
    const message = err instanceof z.ZodError ? err.issues[0]?.message : 'Invalid request';
    return NextResponse.json({ message }, { status: 400 });
  }

  await connectMongo();
  const slug = await ensureUniqueSlug(input.slug || input.title);

  const doc = await Post.create({
    ...input,
    slug,
    body: sanitizePostHtml(input.body),
    metaTitle: input.metaTitle || input.title,
    publishedAt: input.status === 'published' ? new Date() : null,
  });

  if (doc.status === 'published') revalidateBlog();

  return NextResponse.json({ id: String(doc._id), slug: doc.slug }, { status: 201 });
}
