'use client';
/**
 * Users page. Signups/user analytics are not part of this dashboard — they live
 * in the LocalShout backend — so this is an intentional, friendly explainer.
 */
import Link from 'next/link';
import { Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UsersPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink">Users</h1>
        <p className="mt-1 text-sm text-muted">Signup and user analytics.</p>
      </header>

      <div className="flex flex-col items-center rounded-2xl border border-dashed border-hair-strong bg-card p-10 text-center shadow-card">
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand">
          <Users className="h-6 w-6" />
        </span>
        <h2 className="font-display text-lg font-bold text-ink">Not available in this dashboard</h2>
        <p className="mt-1.5 max-w-md text-sm text-muted">
          User and signup analytics live in the LocalShout backend, not the Analytics Hub. This hub
          focuses on marketing sources — Analytics, Search Console, and ads.
        </p>
        <Button asChild variant="outline" className="mt-5">
          <Link href="/analyticshub">
            Back to overview <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
