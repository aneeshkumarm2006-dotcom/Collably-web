'use client';

import { useEffect } from 'react';

import './globals.css';

/**
 * Global error boundary: the last line of defence. Catches errors thrown in the
 * root layout itself (where `app/error.tsx` cannot reach), so it must render its
 * own `<html>`/`<body>`. Intentionally dependency-free (no providers/theme) so it
 * works even when the app shell is the thing that failed.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-page font-sans text-ink antialiased">
        <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <div className="sticker w-full max-w-md rounded-xl bg-card px-8 py-10">
            <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.14em] text-coral">
              Something broke
            </p>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-ink">
              Something went wrong
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
              The page failed to load. Please try again.
            </p>
            <button
              type="button"
              onClick={reset}
              className="sticker press mt-7 inline-flex h-11 select-none items-center justify-center rounded-md bg-brand px-6 text-[15px] font-semibold text-white"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
