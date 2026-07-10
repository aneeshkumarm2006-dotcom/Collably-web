import Link from 'next/link';

import { StickerButton } from '@/components/shared/sticker';

/** Closing CTA: a solid blue sticker block with the hard offset shadow. */
export function FinalCta() {
  return (
    <section className="bg-page pb-24">
      <div className="mx-auto max-w-shell px-6 lg:px-10">
        <div className="sticker relative overflow-hidden rounded-[32px] bg-brand px-6 py-16 text-center text-white shadow-sticker-lg sm:px-10">
          <svg
            aria-hidden
            viewBox="0 0 100 100"
            className="pointer-events-none absolute -top-5 right-6 w-[110px] animate-ls-float"
          >
            <path
              d="M50 8l10 24 26 3-19 18 5 26-22-12-22 12 5-26L14 35l26-3z"
              fill="#FFC24B"
              stroke="#14181F"
              strokeWidth="3"
            />
          </svg>
          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-[40px] font-bold leading-[1.02] tracking-[-0.03em] sm:text-[50px]">
              Your neighborhood
              <br />
              is waiting.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[19px] text-[#D8E7FE]">
              Join free today. Businesses launch in minutes. Creators start earning this week.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
              <StickerButton asChild tone="yellow" size="lg">
                <Link href="/signup">Get started free</Link>
              </StickerButton>
              <StickerButton asChild tone="white" size="lg" className="text-brand">
                <Link href="#how">See how it works</Link>
              </StickerButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
