/**
 * POST /api/seoteam/logout: clear the SEO session cookie.
 */
import { NextResponse } from 'next/server';
import { clearSeoSessionCookie } from '@/lib/seoteam/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  clearSeoSessionCookie(res);
  return res;
}
