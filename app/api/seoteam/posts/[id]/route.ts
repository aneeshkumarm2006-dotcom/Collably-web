/**
 * /api/seoteam/posts/[id]
 *   GET    — full post document for the editor.
 *   PATCH  — update fields; also handles publish/unpublish (status → sets/clears
 *            publishedAt). Re-slugs when the title/slug changes, re-sanitizes body.
 *   DELETE — remove the post.
 *
 * Any change that affects the published set revalidates `/blog` so it appears
 * instantly. All require a valid SEO session.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isValidObjectId } from 'mongoose';
import { requireSeoApi } from '@/lib/seoteam/guard';
import { connectMongo } from '@/lib/db/mongoose';
import { Post } from '@/lib/db/models/post';
import { ensureUniqueSlug } from '@/lib/seoteam/slug';
import { sanitizePostHtml } from '@/lib/seoteam/sanitize';
import { postUpdateSchema } from '@/lib/seoteam/post-schema';
import { revalidateBlog } from '@/lib/blog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

async function resolveId(ctx: Ctx): Promise<string | null> {
  const { id } = await ctx.params;
  return isValidObjectId(id) ? id : null;
}

export async function GET(_req: Request, ctx: Ctx) {
  const unauth = await requireSeoApi();
  if (unauth) return unauth;

  const id = await resolveId(ctx);
  if (!id) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  await connectMongo();
  const post = await Post.findById(id).lean();
  if (!post) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json({ post });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const unauth = await requireSeoApi();
  if (unauth) return unauth;

  const id = await resolveId(ctx);
  if (!id) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  let input: z.infer<typeof postUpdateSchema>;
  try {
    input = postUpdateSchema.parse(await req.json());
  } catch (err) {
    const message = err instanceof z.ZodError ? err.issues[0]?.message : 'Invalid request';
    return NextResponse.json({ message }, { status: 400 });
  }

  await connectMongo();
  const post = await Post.findById(id);
  if (!post) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  const wasPublished = post.status === 'published';

  // Assign the provided fields.
  const { slug, body, status, ...rest } = input;
  Object.assign(post, rest);

  if (typeof body === 'string') post.body = sanitizePostHtml(body);
  if (rest.metaTitle === '' ) post.metaTitle = post.title;

  // Re-slug when the slug or title changed.
  if (slug !== undefined || rest.title !== undefined) {
    const base = slug || rest.title || post.slug;
    post.slug = await ensureUniqueSlug(base, id);
  }

  // Publish transitions.
  if (status !== undefined && status !== post.status) {
    post.status = status;
    if (status === 'published' && !post.publishedAt) post.publishedAt = new Date();
  }

  await post.save();

  if (wasPublished || post.status === 'published') revalidateBlog();

  return NextResponse.json({ id: String(post._id), slug: post.slug, status: post.status });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const unauth = await requireSeoApi();
  if (unauth) return unauth;

  const id = await resolveId(ctx);
  if (!id) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  await connectMongo();
  const post = await Post.findByIdAndDelete(id);
  if (post?.status === 'published') revalidateBlog();

  return NextResponse.json({ ok: true });
}
