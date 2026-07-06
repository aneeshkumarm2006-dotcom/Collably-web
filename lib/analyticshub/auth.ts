/**
 * Analytics Hub auth — a self-contained password + HMAC-cookie session, fully
 * independent of the main app's session and the /seoteam session (distinct
 * cookie name + secret). Single user (the owner). Server-only.
 */
import 'server-only';
import { cookies } from 'next/headers';
import { hashPassword, verifyPassword, mintSession, verifySession } from '@/lib/analyticshub/crypto';
import { getValue, setValue } from '@/lib/analyticshub/store';

export const COOKIE_NAME = 'analyticshub_session';
const PASSWORD_KEY = 'auth:password_hash';
const SESSION_TTL = 60 * 60 * 24 * 30; // 30 days

/** Has the owner completed first-run setup (password created)? */
export async function hasPassword(): Promise<boolean> {
  return (await getValue(PASSWORD_KEY)) !== null;
}

/** Store the scrypt hash (itself encrypted at rest by the store). */
export async function setPassword(password: string): Promise<void> {
  await setValue(PASSWORD_KEY, hashPassword(password));
}

/** Verify a login attempt against the stored hash. */
export async function checkPassword(password: string): Promise<boolean> {
  const stored = await getValue(PASSWORD_KEY);
  if (!stored) return false;
  return verifyPassword(password, stored);
}

/** Read the request's session cookie and verify signature + expiry. */
export async function isAuthed(): Promise<boolean> {
  const jar = await cookies();
  return verifySession(jar.get(COOKIE_NAME)?.value);
}

/** Cookie options — httpOnly, Secure in prod, SameSite=Lax, 30-day. */
export function sessionCookie(value: string, maxAge = SESSION_TTL) {
  return {
    name: COOKIE_NAME,
    value,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    // Must be '/' so the cookie is sent to BOTH the UI (/analyticshub/*) AND the
    // API (/api/analyticshub/*) — a narrower path never reaches the API routes.
    path: '/',
    maxAge,
  };
}

export const freshSessionToken = () => mintSession(SESSION_TTL);
