'use client';
/**
 * Full-page state cards for source pages and diagnostics.
 * - EmptyState: nothing connected yet → point at settings.
 * - ErrorState: a verbatim error (reconnect / provider failure) + settings link.
 */
import Link from 'next/link';
import { AlertTriangle, PlugZap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EmptyState({
  title = 'Not connected',
  message,
}: {
  title?: string;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-hair-strong bg-card p-10 text-center shadow-card">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand">
        <PlugZap className="h-6 w-6" />
      </span>
      <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
      <p className="mt-1.5 max-w-md text-sm text-muted">{message}</p>
      <Button asChild className="mt-5">
        <Link href="/analyticshub/settings">
          Connect in settings <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  error,
  settingsLabel = 'Open settings',
}: {
  title?: string;
  error: string;
  settingsLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-danger/30 bg-danger-soft/40 p-10 text-center shadow-card">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger">
        <AlertTriangle className="h-6 w-6" />
      </span>
      <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
      <p className="mt-1.5 max-w-lg break-words text-sm text-muted">{error}</p>
      <Button asChild variant="outline" className="mt-5">
        <Link href="/analyticshub/settings">
          {settingsLabel} <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
