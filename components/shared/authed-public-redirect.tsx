'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { useAuth } from '@/components/providers/auth-provider';
import { postAuthPath } from '@/lib/auth/user';

/**
 * Bounces a signed-in user off the prospect-facing pages (marketing home + the
 * public Explore) to their dashboard. Content pages that are legitimately
 * shareable — a campaign, a creator/business profile, the blog, legal — are NOT
 * redirected, so a signed-in user can still open a shared link. Guests (user ===
 * null) are never redirected. Runs client-side so the marketing pages stay
 * statically rendered for logged-out visitors and crawlers.
 */
const REDIRECT_PATHS = new Set([
  '/',
  '/for-creators',
  '/for-businesses',
  '/pricing',
  '/about',
  '/contact',
]);

export function AuthedPublicRedirect() {
  const { user, isLoading } = useAuth();
  const pathname = usePathname() ?? '';
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !user) return;
    if (REDIRECT_PATHS.has(pathname)) {
      router.replace(postAuthPath(user));
    }
  }, [user, isLoading, pathname, router]);

  return null;
}
