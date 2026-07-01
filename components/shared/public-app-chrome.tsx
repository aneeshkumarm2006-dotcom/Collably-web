'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { SiteChrome } from '@/components/shared/site-chrome';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

/**
 * Chrome for the public-app pages (explore, campaign + profile detail). These
 * are shareable, guest-accessible URLs, so a signed-OUT visitor gets the public
 * navbar + footer (`SiteChrome`). A signed-IN creator/business instead gets the
 * full dashboard shell (sidebar + top bar) wrapped around the same content, so
 * opening a campaign keeps them "in the app" rather than bouncing them onto the
 * marketing header. While the session is still resolving we render the public
 * chrome so guests + crawlers see content immediately.
 */
export function PublicAppChrome({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (user && (user.role === 'creator' || user.role === 'business')) {
    return (
      <DashboardShell role={user.role} user={user}>
        {children}
      </DashboardShell>
    );
  }

  return <SiteChrome>{children}</SiteChrome>;
}
