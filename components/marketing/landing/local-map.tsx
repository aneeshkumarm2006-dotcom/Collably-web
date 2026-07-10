import { Eyebrow } from '@/components/shared/sticker';
import { Reveal } from './reveal';

/**
 * "Hyper-local" section: copy + two stat chips beside a hand-drawn neighbourhood
 * map with bobbing pins and a walking-radius circle. The map is decorative
 * (aria-hidden). Ported from the design's hand-authored SVG.
 */
export function LocalMap() {
  return (
    <section className="bg-page py-20">
      <div className="mx-auto grid max-w-shell items-center gap-12 px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-10">
        <Reveal>
          <div className="r max-w-md">
            <Eyebrow className="text-money">Hyper-local</Eyebrow>
            <h2 className="mt-3 text-balance font-display text-4xl font-bold leading-[1.03] tracking-[-0.03em] text-ink sm:text-[46px]">
              Every campaign is
              <br />
              within walking distance.
            </h2>
            <p className="mt-4 max-w-md text-[18px] leading-relaxed text-body">
              Discovery is distance-first. Set your radius and only see businesses you could actually
              walk to — so every collab is genuinely in your community.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="sticker rounded-[14px] bg-card px-4 py-3">
                <div className="font-mono text-[22px] font-semibold text-brand">0.8 mi</div>
                <div className="text-xs text-muted">avg. distance</div>
              </div>
              <div className="sticker rounded-[14px] bg-card px-4 py-3">
                <div className="font-mono text-[22px] font-semibold text-money">42</div>
                <div className="text-xs text-muted">cities live</div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="pop sticker h-[360px] overflow-hidden rounded-[26px] bg-[#E9F1E9]">
            <svg viewBox="0 0 460 360" className="h-full w-full" fill="none" aria-hidden>
              <rect width="460" height="360" fill="#EAF2EA" />
              {/* roads */}
              <path
                d="M0 120 H460 M0 240 H460 M150 0 V360 M310 0 V360"
                stroke="#D3E0D3"
                strokeWidth="10"
              />
              {/* river */}
              <path d="M60 0 C120 120 40 240 120 360" stroke="#BFE0F0" strokeWidth="18" fill="none" />
              {/* city blocks */}
              <g fill="#CFE3CF">
                <rect x="20" y="20" width="90" height="70" rx="8" />
                <rect x="180" y="30" width="90" height="60" rx="8" />
                <rect x="340" y="18" width="90" height="72" rx="8" />
                <rect x="180" y="150" width="90" height="70" rx="8" />
                <rect x="340" y="150" width="100" height="70" rx="8" />
                <rect x="20" y="260" width="90" height="70" rx="8" />
                <rect x="340" y="260" width="90" height="70" rx="8" />
              </g>
              {/* bobbing pins */}
              <g className="animate-ls-bob">
                <path
                  d="M120 150c0-13 10-23 23-23s23 10 23 23c0 17-23 40-23 40s-23-23-23-40Z"
                  fill="#1877F2"
                  stroke="#14181F"
                  strokeWidth="3"
                />
                <circle cx="143" cy="150" r="8" fill="#fff" />
              </g>
              <g className="animate-ls-bob" style={{ animationDelay: '-1s' }}>
                <path
                  d="M290 110c0-13 10-23 23-23s23 10 23 23c0 17-23 40-23 40s-23-23-23-40Z"
                  fill="#31A24C"
                  stroke="#14181F"
                  strokeWidth="3"
                />
                <circle cx="313" cy="110" r="8" fill="#fff" />
              </g>
              <g className="animate-ls-bob" style={{ animationDelay: '-0.5s' }}>
                <path
                  d="M250 240c0-13 10-23 23-23s23 10 23 23c0 17-23 40-23 40s-23-23-23-40Z"
                  fill="#FF6B4A"
                  stroke="#14181F"
                  strokeWidth="3"
                />
                <circle cx="273" cy="240" r="8" fill="#fff" />
              </g>
              {/* walking radius */}
              <circle
                cx="80"
                cy="300"
                r="26"
                fill="none"
                stroke="#1877F2"
                strokeWidth="3"
                strokeDasharray="6 6"
              />
              <circle cx="80" cy="300" r="7" fill="#1877F2" />
            </svg>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
