/**
 * Edge middleware: the first, cheap auth gate for the authed route groups.
 *
 * It only checks for the *presence* of a session cookie (access or refresh): no
 * backend call, so it stays fast, Edge-safe, and works identically against the
 * MSW mocks (which the Edge runtime can't intercept). The richer rules
 * (role/area matching, onboarding completeness, approval state) run in the
 * route-group layouts (`(dashboard)`, `(onboarding)`) via the request-cached
 * `getSession()`, which CAN reach the backend and refresh tokens.
 *
 * Guests hitting a protected route are sent to `/login?next=<original>` so they
 * land back where they intended after signing in. Public app views
 * (`(public-app)`) and marketing are intentionally NOT matched: guest browse is
 * allowed there.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ACCESS_COOKIE, REFRESH_COOKIE, SEO_SESSION_COOKIE } from '@/lib/config';

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // The private SEO dashboard has its OWN password gate, separate from the app's
  // user auth. Cheap edge presence-check only; the HMAC signature is verified
  // server-side in the `/seoteam` layout (Node runtime). When the session cookie
  // is present we pass through; when absent we still let `/seoteam` render so its
  // layout can show the login screen — but deep links get normalized to `/seoteam`.
  if (pathname.startsWith('/seoteam')) {
    const hasSeoSession = Boolean(req.cookies.get(SEO_SESSION_COOKIE)?.value);
    if (hasSeoSession || pathname === '/seoteam') return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = '/seoteam';
    url.search = '';
    return NextResponse.redirect(url);
  }

  const hasSession = Boolean(
    req.cookies.get(ACCESS_COOKIE)?.value || req.cookies.get(REFRESH_COOKIE)?.value,
  );
  if (hasSession) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.search = '';
  url.searchParams.set('next', `${pathname}${search}`);
  return NextResponse.redirect(url);
}

export const config = {
  // Protect the authed areas + the private SEO dashboard; everything else
  // (marketing, public app, auth pages, API routes, Next internals) passes
  // through untouched. `/api/seoteam/*` is intentionally NOT matched here —
  // those routes enforce auth in-handler and return 401 (not a redirect).
  matcher: ['/dashboard/:path*', '/onboarding/:path*', '/seoteam/:path*'],
};
