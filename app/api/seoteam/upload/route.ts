/**
 * POST /api/seoteam/upload: hand the browser a signed Cloudinary upload payload,
 * gated by the SEO session. The app's normal upload flow signs via the user's
 * backend JWT, which a password-only SEO user doesn't have — so this route signs
 * server-side with the Cloudinary API secret instead. The browser then POSTs the
 * file straight to Cloudinary with the returned params.
 */
import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { config } from '@/lib/config';
import { requireSeoApi } from '@/lib/seoteam/guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({ folder: z.string().trim().default('blog') });

export async function POST(req: Request) {
  const unauth = await requireSeoApi();
  if (unauth) return unauth;

  if (!config.seo.cloudinaryApiKey || !config.seo.cloudinaryApiSecret || !config.cloudinaryCloudName) {
    return NextResponse.json(
      { message: 'Cloudinary is not configured (set CLOUDINARY_API_KEY/SECRET and cloud name).' },
      { status: 500 },
    );
  }

  let input: z.infer<typeof schema>;
  try {
    input = schema.parse(await req.json().catch(() => ({})));
  } catch (err) {
    const message = err instanceof z.ZodError ? err.issues[0]?.message : 'Invalid request';
    return NextResponse.json({ message }, { status: 400 });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = input.folder;

  // Cloudinary signature: SHA-1 of the sorted params to sign + the API secret.
  const toSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash('sha1')
    .update(`${toSign}${config.seo.cloudinaryApiSecret}`)
    .digest('hex');

  return NextResponse.json({
    cloudName: config.cloudinaryCloudName,
    apiKey: config.seo.cloudinaryApiKey,
    timestamp,
    folder,
    signature,
    uploadUrl: `https://api.cloudinary.com/v1_1/${config.cloudinaryCloudName}/image/upload`,
  });
}
