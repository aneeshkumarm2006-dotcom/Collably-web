/**
 * Tiny in-memory login rate-limiter for the SEO dashboard: locks an IP after too
 * many failed password attempts for a short window.
 *
 * Caveat: memory is per-process, so on a serverless platform (Vercel) the counts
 * are per-lambda and reset on cold start. For a single shared-password internal
 * gate this is an acceptable speed-bump against brute force; a durable limiter
 * (Redis/Mongo) would be needed for hard guarantees.
 */
import 'server-only';

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

interface Entry {
  count: number;
  /** When the current lockout/window expires (ms epoch). */
  resetAt: number;
}

const attempts = new Map<string, Entry>();

/** True if this IP is currently locked out. */
export function isLocked(ip: string): boolean {
  const entry = attempts.get(ip);
  if (!entry) return false;
  if (Date.now() > entry.resetAt) {
    attempts.delete(ip);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

/** Record a failed attempt; starts/extends the window. */
export function registerFailure(ip: string): void {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  entry.count += 1;
}

/** Clear an IP's attempts (after a successful login). */
export function clearAttempts(ip: string): void {
  attempts.delete(ip);
}

/**
 * Client IP for keying the limiter. Prefer platform-set headers that the edge
 * controls (Vercel's `x-vercel-forwarded-for`, then `x-real-ip`) over the raw
 * client-supplied `x-forwarded-for`, which an attacker can rotate per request to
 * dodge the lockout.
 */
export function clientIp(req: Request): string {
  const vercel = req.headers.get('x-vercel-forwarded-for');
  if (vercel) return vercel.split(',')[0]!.trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  return 'unknown';
}
