/**
 * Server-side SEO-session guards, used by the `/seoteam` layout (UI gate) and
 * every `/api/seoteam/*` mutation (API gate). This is the authoritative check —
 * middleware only does a cheap edge presence-check; the real HMAC verify lives
 * here in the Node runtime.
 */
import 'server-only';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SEO_SESSION_COOKIE } from '@/lib/config';
import { verifySession } from './session';

/** True when the current request carries a valid, unexpired SEO session cookie. */
export async function hasSeoSession(): Promise<boolean> {
  const store = await cookies();
  return verifySession(store.get(SEO_SESSION_COOKIE)?.value);
}

/**
 * API guard: returns a 401 `NextResponse` when unauthenticated, else `null`.
 *
 *   const unauth = await requireSeoApi();
 *   if (unauth) return unauth;
 */
export async function requireSeoApi(): Promise<NextResponse | null> {
  if (await hasSeoSession()) return null;
  return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
}
