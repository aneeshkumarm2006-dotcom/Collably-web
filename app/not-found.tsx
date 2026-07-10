import Link from 'next/link';

import { BrandMark } from '@/components/shared/brand-mark';
import { StickerButton, Eyebrow } from '@/components/shared/sticker';

export const metadata = {
  title: 'Page not found',
};

/**
 * Root 404. Rendered inside `app/layout.tsx` for any unmatched route (and any
 * `notFound()` call without a closer `not-found.tsx`). Kept self-contained (no
 * navbar) with a clear path back into the product.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center bg-page px-6 text-center">
      <Link href="/" className="mb-8" aria-label="LocalShout home">
        <BrandMark />
      </Link>
      <div className="sticker w-full max-w-md rounded-xl bg-card px-8 py-10">
        <Eyebrow>Error 404</Eyebrow>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink">
          Page not found
        </h1>
        <p className="mt-2 text-muted">
          The page you’re looking for doesn’t exist or may have moved.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <StickerButton asChild tone="brand">
            <Link href="/">Back to home</Link>
          </StickerButton>
          <StickerButton asChild tone="white">
            <Link href="/explore">Explore campaigns</Link>
          </StickerButton>
        </div>
      </div>
    </main>
  );
}
