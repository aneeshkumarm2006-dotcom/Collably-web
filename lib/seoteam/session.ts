/**
 * Session + credential handling for the private SEO dashboard. This is fully
 * independent of the app's user-JWT auth: a single shared password
 * (`SEO_DASHBOARD_PASSWORD`) unlocks a signed, httpOnly session cookie.
 *
 * Runs only in Node route handlers (`runtime = 'nodejs'`), so it uses Node
 * `crypto` for HMAC signing and constant-time comparison. Cookie options mirror
 * `lib/auth/cookies.ts` (httpOnly, SameSite=Lax, Secure in prod, path `/`).
 */
import 'server-only';
import crypto from 'node:crypto';
import type { NextResponse } from 'next/server';
import { config, SEO_SESSION_COOKIE } from '@/lib/config';

const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days (seconds)

interface SessionPayload {
  /** Issued-at (seconds). */
  iat: number;
  /** Expiry (seconds). */
  exp: number;
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url');
}

function hmac(data: string): string {
  return crypto.createHmac('sha256', config.seo.sessionSecret).update(data).digest('base64url');
}

/** Constant-time string equality that also tolerates length mismatch. */
function safeEqual(a: string, b: string): boolean {
  // Compare fixed-length SHA-256 digests so the compare itself never leaks
  // length and `timingSafeEqual`'s equal-length precondition always holds.
  const da = crypto.createHash('sha256').update(a).digest();
  const db = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(da, db);
}

/**
 * Verify a submitted password against `SEO_DASHBOARD_PASSWORD` in constant time.
 * Always false when the password env is unset (fail closed).
 */
export function checkPassword(input: string): boolean {
  const expected = config.seo.dashboardPassword;
  if (!expected) return false;
  return safeEqual(input, expected);
}

/** Sign a fresh session token (`payload.signature`). */
export function signSession(): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = { iat: now, exp: now + SESSION_MAX_AGE };
  const body = b64url(JSON.stringify(payload));
  return `${body}.${hmac(body)}`;
}

/**
 * Verify a session token: signature must match (constant-time) and it must not
 * be expired. Returns true only for a valid, unexpired session.
 */
export function verifySession(token: string | undefined | null): boolean {
  if (!token || !config.seo.sessionSecret) return false;
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return false;

  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!safeEqual(sig, hmac(body))) return false;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionPayload;
    return typeof payload.exp === 'number' && payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  };
}

/** Set the signed SEO session cookie on a response (after a successful login). */
export function setSeoSessionCookie(res: NextResponse): void {
  res.cookies.set(SEO_SESSION_COOKIE, signSession(), {
    ...cookieOptions(),
    maxAge: SESSION_MAX_AGE,
  });
}

/** Expire the SEO session cookie (logout). */
export function clearSeoSessionCookie(res: NextResponse): void {
  res.cookies.set(SEO_SESSION_COOKIE, '', { ...cookieOptions(), maxAge: 0 });
}
