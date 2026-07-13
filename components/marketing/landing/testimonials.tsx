import { Star } from 'lucide-react';

import { Eyebrow } from '@/components/shared/sticker';
import { Reveal } from './reveal';

type Testimonial = {
  quote: string;
  initials: string;
  bg: string;
  ink: string;
  name: string;
  role: string;
};

// The design's testimonials (its copy differs from lib/TESTIMONIALS), each with
// a specific pastel avatar tint.
const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'I filled a whole month of campaigns and got a wave of new regulars — all from creators who actually live here.',
    initials: 'SM',
    bg: '#FFB74D',
    ink: '#7A4A00',
    name: 'Sofia M.',
    role: 'Owner, Bloom Coffee',
  },
  {
    quote:
      "Free membership for a few Reels I'd post anyway? LocalShout basically pays my gym bill now.",
    initials: 'DK',
    bg: '#4FC3F7',
    ink: '#04425F',
    name: 'Deion K.',
    role: 'Creator · 12k followers',
  },
  {
    quote:
      'Setup took ten minutes. By the weekend we had six creators lined up and reposts rolling in.',
    initials: 'PR',
    bg: '#A5D6A7',
    ink: '#1B5E20',
    name: 'Priya R.',
    role: 'Owner, RiverFit',
  },
];

/** Testimonials on a solid brand-soft band, from creators and businesses. */
export function Testimonials() {
  return (
    <section id="biz" className="border-y-outline border-ink bg-brand-soft py-20">
      <div className="mx-auto max-w-shell px-6 lg:px-10">
        <Reveal className="mx-auto max-w-xl text-center">
          <div className="r">
            <Eyebrow className="justify-center">Loved locally</Eyebrow>
            <h2 className="mt-3 text-balance font-display text-4xl font-bold leading-[1.02] tracking-[-0.03em] text-ink sm:text-[46px]">
              The neighborhood&apos;s talking
            </h2>
          </div>
        </Reveal>

        <Reveal className="mt-10 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="pop sticker flex flex-col rounded-[22px] bg-card p-7">
              <div className="flex gap-0.5 text-yellow" aria-label="Rated 5 out of 5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={17} strokeWidth={0} fill="currentColor" aria-hidden />
                ))}
              </div>
              <blockquote className="my-4 flex-1 text-[17px] leading-relaxed text-[#2A303A]">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-full border-outline border-ink font-display text-[15px] font-bold shadow-[2px_2px_0_#14181F]"
                  style={{ background: t.bg, color: t.ink }}
                  aria-hidden
                >
                  {t.initials}
                </span>
                <div>
                  <div className="font-display text-[15px] font-bold text-ink">{t.name}</div>
                  <div className="font-mono text-xs text-muted">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
