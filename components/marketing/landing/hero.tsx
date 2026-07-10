'use client';

import { useCallback, useEffect, useState } from 'react';

import { HeroCta } from '@/components/marketing/hero-cta';
import { cn } from '@/lib/utils';

type SceneKey = 'creator' | 'business';

const SCENES: { key: SceneKey; label: string; emoji: string }[] = [
  { key: 'creator', label: 'For creators', emoji: '✨' },
  { key: 'business', label: 'For businesses', emoji: '🏪' },
];

const ADVANCE_MS = 4200;

// Overlapping avatar stack under the hero copy (the design's social proof row).
const AVATARS: { initials: string; bg: string; ink: string }[] = [
  { initials: 'MJ', bg: '#FFB74D', ink: '#7A4A00' },
  { initials: 'AK', bg: '#4FC3F7', ink: '#04425F' },
  { initials: 'RS', bg: '#A5D6A7', ink: '#1B5E20' },
  { initials: 'DL', bg: '#FF9E80', ink: '#7A2E12' },
];

/**
 * Landing hero. Left column is the copy (with a highlighter-marker underline on
 * one word); the right column is an auto-advancing slideshow that toggles the
 * hand-authored Creator and Business SVG scenes. Pills switch scenes and reset
 * the timer.
 */
export function Hero() {
  const [scene, setScene] = useState<SceneKey>('creator');
  // Bumped on manual selection so the auto-advance effect restarts its timer.
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setScene((prev) => (prev === 'creator' ? 'business' : 'creator'));
    }, ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [resetKey, scene]);

  const select = useCallback((key: SceneKey) => {
    setScene(key);
    setResetKey((n) => n + 1);
  }, []);

  return (
    <header className="relative overflow-hidden bg-page">
      {/* Ambient background shapes (design's morphing blobs, approximated). */}
      <span
        aria-hidden
        className="pointer-events-none absolute -left-16 -top-16 h-72 w-72 rounded-full bg-brand-soft animate-ls-float"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-warn-soft animate-ls-float-r"
      />

      <div className="relative mx-auto grid max-w-shell items-center gap-9 px-6 py-14 sm:py-16 lg:grid-cols-[1.02fr_0.98fr] lg:px-10 lg:py-16">
        {/* ---- Copy ---- */}
        <div className="max-w-xl">
          <span className="sticker inline-flex animate-ls-rise items-center gap-2 rounded-full bg-card px-3.5 py-2 font-mono text-[12px] font-semibold uppercase tracking-[0.04em] text-money">
            <span className="h-2 w-2 rounded-full bg-money" aria-hidden />
            142 campaigns live near you
          </span>
          <h1 className="mt-5 font-display text-[44px] font-bold leading-[0.98] tracking-[-0.04em] text-ink sm:text-[56px] lg:text-[66px]">
            <span className="block animate-ls-word-up" style={{ animationDelay: '80ms' }}>
              Give your block
            </span>
            <span className="block animate-ls-word-up" style={{ animationDelay: '170ms' }}>
              something to
            </span>
            <span className="block animate-ls-word-up" style={{ animationDelay: '260ms' }}>
              <Marker>talk</Marker> <span className="text-brand">about.</span>
            </span>
          </h1>
          <p
            className="mt-5 max-w-lg text-pretty text-[20px] leading-relaxed text-muted animate-ls-rise"
            style={{ animationDelay: '360ms' }}
          >
            Local businesses post campaigns. Local creators earn{' '}
            <b className="text-ink">real rewards</b> for real content. No agencies — all
            neighborhood.
          </p>
          <div className="animate-ls-rise" style={{ animationDelay: '460ms' }}>
            <HeroCta />
          </div>

          {/* Social proof: overlapping avatar stack. */}
          <div
            className="mt-8 flex items-center gap-3.5 animate-ls-rise"
            style={{ animationDelay: '560ms' }}
          >
            <div className="flex">
              {AVATARS.map((a, i) => (
                <span
                  key={a.initials}
                  className={cn(
                    'flex h-[38px] w-[38px] items-center justify-center rounded-full border-outline border-ink font-display text-sm font-bold',
                    i > 0 && '-ml-3',
                  )}
                  style={{ background: a.bg, color: a.ink }}
                  aria-hidden
                >
                  {a.initials}
                </span>
              ))}
            </div>
            <p className="text-sm leading-tight text-muted">
              <b className="text-ink">8,400+ creators</b>
              <br />
              already shouting locally
            </p>
          </div>
        </div>

        {/* ---- Slideshow ---- */}
        <div className="relative">
          <div
            className="relative aspect-[52/47] w-full"
            role="group"
            aria-roledescription="carousel"
            aria-label="What LocalShout looks like"
          >
            <SceneLayer active={scene === 'creator'}>
              <CreatorScene />
            </SceneLayer>
            <SceneLayer active={scene === 'business'}>
              <BusinessScene />
            </SceneLayer>
          </div>

          {/* Toggle pills (below the stage, centered). */}
          <div className="relative z-10 mt-1 flex items-center justify-center gap-3">
            {SCENES.map((s) => {
              const isActive = scene === s.key;
              return (
                <button
                  key={s.key}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => select(s.key)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border-outline border-ink px-3.5 py-2 font-display text-[13px] font-semibold shadow-[2px_2px_0_#14181F] transition hover:-translate-x-px hover:-translate-y-px',
                    isActive ? 'bg-ink text-white' : 'bg-card text-ink',
                  )}
                >
                  <span aria-hidden>{s.emoji}</span>
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* Floating "rewards claimed" card. */}
          <div className="absolute right-0 top-[1%] z-20 rounded-[14px] border-outline border-ink bg-ink px-4 py-3 font-mono text-white shadow-[5px_6px_0_#1877F2] animate-ls-float">
            <div className="text-[10px] tracking-[0.08em] text-white/70">REWARDS CLAIMED</div>
            <div className="text-[22px] font-semibold text-yellow">$1.2M+</div>
          </div>
        </div>
      </div>
    </header>
  );
}

/** A word with a hand-drawn highlighter stroke swept underneath it. */
function Marker({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-block">
      <span className="relative z-10">{children}</span>
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-1.5 z-0 h-3.5 rounded-[3px] bg-yellow"
      />
    </span>
  );
}

function SceneLayer({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <div
      aria-hidden={!active}
      className={cn(
        'absolute inset-0 grid place-items-center transition-[opacity,transform] duration-700',
        active
          ? 'opacity-100 translate-x-0'
          : 'pointer-events-none translate-x-7 scale-[0.985] opacity-0',
      )}
    >
      {children}
    </div>
  );
}

/**
 * Creator scene: hands holding a phone (a creator mid-selfie, "LIVE" badge),
 * floating reaction shapes, and an "Earned $120" reward pill. Ported from the
 * design's hand-authored SVG.
 */
function CreatorScene() {
  return (
    <svg
      viewBox="0 0 520 470"
      className="h-auto w-full"
      fill="none"
      role="img"
      aria-label="A creator filming content on their phone and earning a reward"
    >
      <rect x="66" y="66" width="388" height="360" rx="60" fill="#EAF3FF" />
      {/* floating reaction shapes */}
      <path
        d="M150 150c-8-11-25-6-25 6 0 12 25 25 25 25s25-13 25-25c0-12-17-17-25-6Z"
        fill="#FF6B4A"
        stroke="#14181F"
        strokeWidth="3"
        className="animate-ls-float"
        style={{ transformOrigin: '150px 170px' }}
      />
      <path
        d="M404 116 l6 13 14 2 -10 10 3 14 -13-7 -13 7 3-14 -10-10 14-2Z"
        fill="#FFC24B"
        stroke="#14181F"
        strokeWidth="2.5"
        className="animate-ls-bob"
      />
      <circle
        cx="398"
        cy="210"
        r="11"
        fill="#5FD37F"
        stroke="#14181F"
        strokeWidth="2.5"
        className="animate-ls-float"
      />
      <path d="M120 258 l3 9 9 3 -9 3 -3 9 -3-9 -9-3 9-3Z" fill="#FFC24B" />
      <path d="M416 300 l3 8 8 3 -8 3 -3 8 -3-8 -8-3 8-3Z" fill="#1877F2" />
      {/* phone + hands (float together) */}
      <g className="animate-ls-float" style={{ transformOrigin: '260px 260px' }}>
        <rect x="176" y="108" width="168" height="300" rx="30" fill="#fff" stroke="#14181F" strokeWidth="3.5" />
        <rect x="238" y="118" width="44" height="10" rx="5" fill="#14181F" />
        <rect x="190" y="140" width="140" height="242" rx="16" fill="#EAF2FF" />
        <clipPath id="cscr">
          <rect x="190" y="140" width="140" height="242" rx="16" />
        </clipPath>
        <g clipPath="url(#cscr)">
          <ellipse cx="260" cy="252" rx="52" ry="50" fill="#3B2A22" />
          <circle cx="260" cy="262" r="44" fill="#F3C293" />
          <path d="M216 262 q44 -48 88 0 q-8 -30 -44 -30 q-36 0 -44 30Z" fill="#3B2A22" />
          <circle cx="245" cy="262" r="4.5" fill="#14181F" />
          <circle cx="275" cy="262" r="4.5" fill="#14181F" />
          <circle cx="234" cy="273" r="6" fill="#FF9E80" opacity="0.55" />
          <circle cx="286" cy="273" r="6" fill="#FF9E80" opacity="0.55" />
          <path d="M247 280 q13 12 26 0" stroke="#14181F" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M206 382 C206 342 230 322 260 322 C290 322 314 342 314 382Z" fill="#1877F2" />
          <rect x="252" y="322" width="16" height="18" fill="#F3C293" />
        </g>
        <rect x="200" y="150" width="54" height="20" rx="10" fill="#FF6B4A" />
        <circle cx="212" cy="160" r="4" fill="#fff" />
        <text x="222" y="165" fontSize="11" fill="#fff" className="font-mono" fontWeight="600">
          LIVE
        </text>
        <rect x="270" y="150" width="52" height="20" rx="10" fill="#14181F" opacity="0.5" />
        <text x="296" y="165" fontSize="11" fill="#fff" textAnchor="middle" className="font-mono">
          1.2k
        </text>
      </g>
      {/* hands gripping the phone */}
      <g className="animate-ls-float" style={{ transformOrigin: '260px 300px' }}>
        <rect x="118" y="300" width="42" height="46" rx="14" fill="#1877F2" stroke="#14181F" strokeWidth="3" />
        <path d="M152 286 q-28 0 -28 26 q0 24 28 26 l22 0 0 -52Z" fill="#F3C293" stroke="#14181F" strokeWidth="3" />
        <rect x="168" y="300" width="16" height="11" rx="5.5" fill="#F3C293" stroke="#14181F" strokeWidth="2.5" />
        <rect x="168" y="316" width="16" height="11" rx="5.5" fill="#F3C293" stroke="#14181F" strokeWidth="2.5" />
        <rect x="360" y="300" width="42" height="46" rx="14" fill="#1877F2" stroke="#14181F" strokeWidth="3" />
        <path d="M368 286 q28 0 28 26 q0 24 -28 26 l-22 0 0 -52Z" fill="#F3C293" stroke="#14181F" strokeWidth="3" />
        <rect x="336" y="300" width="16" height="11" rx="5.5" fill="#F3C293" stroke="#14181F" strokeWidth="2.5" />
        <rect x="336" y="316" width="16" height="11" rx="5.5" fill="#F3C293" stroke="#14181F" strokeWidth="2.5" />
      </g>
      {/* reward pill */}
      <g className="animate-ls-float">
        <rect x="92" y="354" width="162" height="46" rx="23" fill="#fff" stroke="#14181F" strokeWidth="3" />
        <circle cx="118" cy="377" r="15" fill="#FDE7E7" stroke="#14181F" strokeWidth="2" />
        <text x="118" y="383" fontSize="15" textAnchor="middle">
          ☕
        </text>
        <text x="144" y="383" fontSize="15" fill="#1E7E34" fontWeight="700" className="font-display">
          Earned $120
        </text>
      </g>
    </svg>
  );
}

/**
 * Business scene: a storefront with a shop owner waving, an "OPEN" sign, a
 * megaphone, a floating LIVE campaign card and a coin. Ported from the design's
 * hand-authored SVG.
 */
function BusinessScene() {
  return (
    <svg
      viewBox="0 0 520 470"
      className="h-auto w-full"
      fill="none"
      role="img"
      aria-label="A shop owner in front of their storefront launching a campaign"
    >
      <rect x="66" y="66" width="388" height="360" rx="60" fill="#E6F4EA" />
      {/* storefront */}
      <g className="animate-ls-float" style={{ transformOrigin: '260px 240px' }}>
        <rect x="126" y="150" width="268" height="200" rx="14" fill="#fff" stroke="#14181F" strokeWidth="3.5" />
        <rect x="196" y="112" width="128" height="40" rx="10" fill="#1877F2" stroke="#14181F" strokeWidth="3" />
        <text x="260" y="139" fontSize="17" textAnchor="middle" fill="#fff" fontWeight="700" className="font-display">
          SHOP
        </text>
        <path
          d="M126 168 h268 v-4 a12 12 0 0 0 -12 -12 h-244 a12 12 0 0 0 -12 12 Z"
          fill="#31A24C"
          stroke="#14181F"
          strokeWidth="3"
        />
        <path
          d="M126 168 l0 18 26 -18Z M182 168 l0 18 26 -18Z M238 168 l0 18 26 -18Z M294 168 l0 18 26 -18Z M350 168 l0 18 26 -18Z"
          fill="#fff"
          opacity="0.85"
        />
        <rect x="146" y="206" width="58" height="54" rx="6" fill="#EAF3FF" stroke="#14181F" strokeWidth="2.5" />
        <rect x="316" y="206" width="58" height="54" rx="6" fill="#EAF3FF" stroke="#14181F" strokeWidth="2.5" />
        <rect x="178" y="222" width="34" height="15" rx="3" fill="#FF6B4A" stroke="#14181F" strokeWidth="2" />
        <text x="195" y="233" fontSize="8" textAnchor="middle" fill="#fff" className="font-mono" fontWeight="600">
          OPEN
        </text>
      </g>
      {/* shop owner */}
      <g className="animate-ls-float" style={{ transformOrigin: '262px 320px' }}>
        <path d="M212 362 C212 314 232 294 262 294 C292 294 312 314 312 362Z" fill="#1877F2" stroke="#14181F" strokeWidth="3.5" />
        <path d="M238 302 h48 v40 a24 24 0 0 1 -48 0Z" fill="#fff" stroke="#14181F" strokeWidth="2.5" />
        <rect x="250" y="320" width="24" height="16" rx="3" fill="none" stroke="#14181F" strokeWidth="2" />
        <rect x="250" y="270" width="24" height="28" fill="#F3C293" stroke="#14181F" strokeWidth="2.5" />
        <ellipse cx="262" cy="236" rx="44" ry="42" fill="#2E241C" />
        <circle cx="262" cy="244" r="38" fill="#F3C293" stroke="#14181F" strokeWidth="3" />
        <path d="M225 244 q37 -42 74 0 q-6 -26 -37 -26 q-31 0 -37 26Z" fill="#2E241C" />
        <circle cx="249" cy="244" r="4.5" fill="#14181F" />
        <circle cx="275" cy="244" r="4.5" fill="#14181F" />
        <circle cx="240" cy="255" r="6" fill="#FF9E80" opacity="0.55" />
        <circle cx="284" cy="255" r="6" fill="#FF9E80" opacity="0.55" />
        <path d="M250 262 q12 12 24 0" stroke="#14181F" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M300 314 Q344 300 352 250 L380 258 Q372 320 322 340Z" fill="#1877F2" stroke="#14181F" strokeWidth="3.5" strokeLinejoin="round" />
        <circle cx="360" cy="240" r="17" fill="#F3C293" stroke="#14181F" strokeWidth="3" />
        <path d="M386 222 q7 8 3 18 M397 230 q4 7 0 15" stroke="#FFC24B" strokeWidth="4" strokeLinecap="round" />
      </g>
      {/* counter */}
      <rect x="150" y="356" width="220" height="58" rx="10" fill="#E7D3AE" stroke="#14181F" strokeWidth="3.5" />
      <rect x="150" y="356" width="220" height="15" rx="7.5" fill="#D9BF8F" stroke="#14181F" strokeWidth="3" />
      {/* megaphone */}
      <g className="animate-ls-float">
        <rect x="70" y="120" width="38" height="32" rx="9" fill="#FF6B4A" stroke="#14181F" strokeWidth="3" />
        <path d="M108 116 l38 -15 v70 l-38 -15Z" fill="#FF8360" stroke="#14181F" strokeWidth="3" strokeLinejoin="round" />
        <path d="M152 122 q15 14 0 44" stroke="#FFC24B" strokeWidth="5" strokeLinecap="round" />
      </g>
      {/* live campaign card */}
      <g className="animate-ls-float">
        <rect x="352" y="112" width="120" height="66" rx="16" fill="#fff" stroke="#14181F" strokeWidth="3" />
        <circle cx="372" cy="132" r="6" fill="#31A24C" />
        <text x="385" y="137" fontSize="11" fill="#14181F" className="font-mono" fontWeight="600">
          LIVE
        </text>
        <rect x="372" y="148" width="82" height="8" rx="4" fill="#14181F" />
        <rect x="372" y="162" width="46" height="8" rx="4" fill="#31A24C" />
      </g>
      {/* coin */}
      <g className="animate-ls-bob">
        <circle cx="104" cy="300" r="21" fill="#FFC24B" stroke="#14181F" strokeWidth="3" />
        <text x="104" y="308" fontSize="19" textAnchor="middle" fontWeight="700" fill="#7A4A00">
          $
        </text>
      </g>
    </svg>
  );
}
