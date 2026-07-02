/**
 * Layout for the private SEO dashboard. Lives at its own top-level segment (not
 * under the marketing/dashboard groups) so it inherits neither the public site
 * chrome nor the app's user-JWT guards. The whole subtree is noindex,nofollow.
 *
 * The session is verified server-side here (the authoritative gate): no valid
 * SEO session → render the login screen; otherwise render the dashboard shell.
 */
import type { Metadata } from 'next';
import { hasSeoSession } from '@/lib/seoteam/guard';
import { SeoLogin } from '@/components/seoteam/seo-login';
import { SeoShell } from '@/components/seoteam/seo-shell';

export const metadata: Metadata = {
  title: 'SEO Dashboard',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function SeoTeamLayout({ children }: { children: React.ReactNode }) {
  const authed = await hasSeoSession();
  if (!authed) return <SeoLogin />;
  return <SeoShell>{children}</SeoShell>;
}
