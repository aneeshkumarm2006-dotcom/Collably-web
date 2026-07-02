'use client';
/**
 * Minimal chrome for the SEO dashboard: a topbar with nav + logout. Deliberately
 * NOT the app's `DashboardShell` (which is bound to the user-auth context,
 * notifications, and socket realtime — none of which apply to this
 * password-only, backend-independent area).
 */
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, PlusCircle, LogOut, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SeoShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  async function logout() {
    try {
      await fetch('/api/seoteam/logout', { method: 'POST' });
    } catch {
      /* ignore */
    }
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-page">
      <header className="sticky top-0 z-30 border-b border-hair bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <Link href="/seoteam" className="font-display text-base font-bold text-ink">
              SEO Dashboard
            </Link>
            <nav className="hidden items-center gap-1 sm:flex">
              <Link
                href="/seoteam"
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted hover:bg-secondary hover:text-ink"
              >
                <FileText className="h-4 w-4" /> Posts
              </Link>
              <Link
                href="/seoteam/new"
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted hover:bg-secondary hover:text-ink"
              >
                <PlusCircle className="h-4 w-4" /> New post
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <a href="/blog" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" /> View blog
              </a>
            </Button>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" /> Log out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
