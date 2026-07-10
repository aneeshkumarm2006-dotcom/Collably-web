import { Eyebrow } from '@/components/shared/sticker';
import { TiltCard } from './tilt-card';
import { Reveal } from './reveal';

type Creator = {
  initials: string;
  bg: string;
  ink: string;
  name: string;
  niche: string;
  followers: string;
  earned: string;
};

// The design's four spotlight creators (illustrative "design data", not live
// API records) — each with a specific pastel avatar tint.
const CREATORS: Creator[] = [
  { initials: 'MJ', bg: '#FFB74D', ink: '#7A4A00', name: 'Maya J.', niche: 'Food & café', followers: '18k followers', earned: '$640' },
  { initials: 'AK', bg: '#4FC3F7', ink: '#04425F', name: 'Andre K.', niche: 'Fitness', followers: '9k followers', earned: '$820' },
  { initials: 'RS', bg: '#A5D6A7', ink: '#1B5E20', name: 'Ria S.', niche: 'Beauty', followers: '24k followers', earned: '$1,100' },
  { initials: 'DL', bg: '#FF9E80', ink: '#7A2E12', name: 'Deon L.', niche: 'Local eats', followers: '6k followers', earned: '$430' },
];

/** Creator spotlight on a solid yellow band with a wiggling star accent. */
export function CreatorSpotlight() {
  return (
    <section className="relative overflow-hidden border-y-outline border-ink bg-yellow py-20">
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        className="pointer-events-none absolute left-8 top-6 w-[70px] animate-ls-wiggle"
      >
        <path
          d="M50 8l10 24 26 3-19 18 5 26-22-12-22 12 5-26L14 35l26-3z"
          fill="#fff"
          stroke="#14181F"
          strokeWidth="3"
        />
      </svg>

      <div className="relative mx-auto max-w-shell px-6 lg:px-10">
        <Reveal className="mx-auto max-w-xl text-center">
          <div className="r">
            <Eyebrow className="justify-center text-ink">Meet the shouters</Eyebrow>
            <h2 className="mt-3 text-balance font-display text-4xl font-bold leading-[1.02] tracking-[-0.03em] text-ink sm:text-[46px]">
              Creators earning around the corner
            </h2>
          </div>
        </Reveal>

        <Reveal className="mt-10 grid gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
          {CREATORS.map((c) => (
            <TiltCard key={c.name} className="pop sticker rounded-[22px] bg-card p-[22px] text-center">
              <span
                className="mx-auto flex h-[70px] w-[70px] items-center justify-center rounded-full border-outline border-ink font-display text-[22px] font-bold shadow-[3px_3px_0_#14181F]"
                style={{ background: c.bg, color: c.ink }}
                aria-hidden
              >
                {c.initials}
              </span>
              <h3 className="mt-3.5 font-display text-[17px] font-bold text-ink">{c.name}</h3>
              <p className="mt-0.5 font-mono text-xs text-muted">{c.niche}</p>
              <span className="mt-3 inline-block rounded-full bg-brand-soft px-2.5 py-1 font-mono text-xs font-semibold text-brand">
                {c.followers}
              </span>
              <p className="mt-3 text-[13px] text-muted">
                Earned <b className="text-money-ink">{c.earned}</b> in perks
              </p>
            </TiltCard>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
