/**
 * POST /api/seoteam/login: exchange the shared SEO password for a signed session
 * cookie. Constant-time password compare + in-memory rate-limiting guard against
 * brute force. Independent of the app's user-JWT auth.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { config } from '@/lib/config';
import { checkPassword, setSeoSessionCookie } from '@/lib/seoteam/session';
import { clientIp, isLocked, registerFailure, clearAttempts } from '@/lib/seoteam/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({ password: z.string().min(1, 'Password is required') });

export async function POST(req: Request) {
  // Fail loudly (not a silent login-loop) if the signing secret is unconfigured:
  // without it, we'd set a cookie that verifySession can never accept.
  if (!config.seo.sessionSecret) {
    return NextResponse.json(
      { message: 'Dashboard is not configured (missing session secret).' },
      { status: 500 },
    );
  }

  const ip = clientIp(req);
  if (isLocked(ip)) {
    return NextResponse.json(
      { message: 'Too many attempts. Try again in a few minutes.' },
      { status: 429 },
    );
  }

  let input: z.infer<typeof schema>;
  try {
    input = schema.parse(await req.json());
  } catch (err) {
    const message = err instanceof z.ZodError ? err.issues[0]?.message : 'Invalid request';
    return NextResponse.json({ message }, { status: 400 });
  }

  if (!checkPassword(input.password)) {
    registerFailure(ip);
    return NextResponse.json({ message: 'Incorrect password' }, { status: 401 });
  }

  clearAttempts(ip);
  const res = NextResponse.json({ ok: true });
  setSeoSessionCookie(res);
  return res;
}
