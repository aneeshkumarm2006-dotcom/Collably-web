'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

import { StickerButton, Eyebrow } from '@/components/shared/sticker';

/**
 * Route-segment error boundary. Catches render/data errors thrown anywhere below
 * the root layout that don't have a closer `error.tsx` (e.g. marketing, auth,
 * onboarding, public-app). Renders inside `app/layout.tsx`, so the page chrome
 * (html/body/providers) stays intact and `reset()` can recover in place.
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaced to the browser console (and any future error monitoring in P13).
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-page px-4">
      <div className="sticker w-full max-w-md rounded-xl bg-card px-8 py-10 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-outline border-ink bg-danger-soft text-danger shadow-sticker [&_svg]:h-6 [&_svg]:w-6">
          <AlertTriangle aria-hidden />
        </span>
        <Eyebrow className="mt-5">Something broke</Eyebrow>
        <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-ink">
          Something went wrong
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          An unexpected error occurred. You can try again. If it keeps happening, please come back
          in a bit.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <StickerButton type="button" tone="brand" onClick={reset}>
            Try again
          </StickerButton>
          <StickerButton asChild tone="white">
            <Link href="/">Go home</Link>
          </StickerButton>
        </div>
      </div>
    </main>
  );
}
