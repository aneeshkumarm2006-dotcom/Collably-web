import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

/**
 * LocalShout theme.
 *
 * Light-only — the designs define no dark theme (see app/globals.css).
 *
 * Colors resolve through CSS variables so a single utility renders correctly on
 * BOTH surfaces: the public "sticker" language (`:root`) and the Facebook-clean
 * dashboard (`.surface-app`), which re-points the same variable names.
 *   • shadcn/ui semantic tokens use HSL channels → `hsl(var(--token))`
 *   • surface + brand tokens use hex/rgba       → `var(--token)`
 *
 * Radii carry BOTH scales: the app's tight 7-14px dashboard scale and the
 * public sticker scale (16/22/26/32). Named so intent is legible at the call
 * site rather than sized by a shared t-shirt ladder that fits neither.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // --- shadcn/ui semantic tokens (HSL channels; support opacity modifiers) ---
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        // shadcn `muted` lives under `muted_` so the app's text-muted `muted` wins below.
        muted_: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        // --- Surface aliases (flip between public + .surface-app) ---
        ink: 'var(--ink)',
        muted: 'var(--text-secondary)',
        faint: 'var(--text-muted)',
        body: 'var(--text-body)',
        page: 'var(--page)',
        elev: 'var(--surface-elev)',
        hair: 'var(--hairline)',
        'hair-strong': 'var(--hairline-strong)',
        divider: 'var(--divider)',

        // --- Brand (identical on both surfaces) ---
        brand: {
          DEFAULT: 'var(--brand)',
          hover: 'var(--brand-hover)',
          deep: 'var(--brand-deep)',
          lift: 'var(--brand-lift)',
          soft: 'var(--brand-soft)',
          'soft-2': 'var(--brand-soft-2)',
          // Legacy: the old palette's purple. Re-pointed at the grape accent.
          secondary: 'var(--grape-ink)',
        },
        money: {
          DEFAULT: 'var(--money)',
          ink: 'var(--money-ink)',
          soft: 'var(--money-soft)',
        },
        // Sticker-language accents. `coral` and `yellow` exist only in the public
        // designs, but are harmless on the app surface.
        yellow: { DEFAULT: 'var(--accent-yellow)' },
        coral: { DEFAULT: 'var(--accent-coral)', lift: 'var(--accent-coral-lift)' },
        warn: { DEFAULT: 'var(--warn-ink)', soft: 'var(--warn-soft)' },
        danger: { DEFAULT: 'var(--danger)', ink: 'var(--danger-ink)', soft: 'var(--danger-soft)' },
        grape: { DEFAULT: 'var(--grape-ink)', soft: 'var(--grape-soft)' },

        // Always-dark bands (rewards section, marquee) — same on both surfaces.
        band: {
          DEFAULT: 'var(--band-dark)',
          card: 'var(--band-dark-card)',
          border: 'var(--band-dark-border)',
          pill: 'var(--band-dark-pill)',
          money: 'var(--band-dark-money)',
        },

        // --- Semantic + legacy aliases ---
        // `success`/`info` are the semantic names components already use for
        // state; they resolve to the brand's money-green and blue. `mint`,
        // `warm` and `dark-*` are the pre-redesign palette names, re-pointed at
        // the new tokens so the ~85 existing call sites keep rendering. Prefer
        // `money` / `brand` / `coral` / `band` in new code.
        success: { DEFAULT: 'var(--money)', soft: 'var(--money-soft)' },
        info: { DEFAULT: 'var(--brand)', soft: 'var(--brand-soft)' },
        mint: { DEFAULT: 'var(--money)', soft: 'var(--money-soft)' },
        warm: { DEFAULT: 'var(--accent-coral)', soft: 'var(--warn-soft)' },
        dark: {
          sidebar: 'var(--band-dark)',
          panel: 'var(--band-dark-card)',
          border: 'var(--band-dark-border)',
        },
      },
      borderRadius: {
        // Dashboard scale (Facebook-clean).
        xs: '7px',
        sm: '9px',
        md: '12px', // inputs + buttons, both surfaces
        lg: '14px', // dashboard card
        // Sticker scale (public).
        card: '16px',
        xl: '22px',
        '2xl': '26px',
        '3xl': '32px',
        full: '9999px',
      },
      borderWidth: {
        // The sticker outline. Collapses to 1px inside `.surface-app`.
        outline: 'var(--outline-w)',
      },
      fontFamily: {
        // Body is the system stack on BOTH surfaces — the public designs use
        // Space Grotesk for headings only, never for running text.
        sans: [
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        display: ['var(--font-display)', 'Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'IBM Plex Mono', 'ui-monospace', 'SF Mono', 'monospace'],
      },
      boxShadow: {
        // Sticker shadows: solid, non-blurred, offset. Soft blurs on .surface-app.
        sticker: 'var(--shadow-sticker)',
        'sticker-lg': 'var(--shadow-sticker-lg)',
        'sticker-hover': 'var(--shadow-sticker-hover)',
        'sticker-active': 'var(--shadow-sticker-active)',
        'sticker-muted': 'var(--shadow-sticker-muted)',
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        md: 'var(--shadow-md)',
        dropdown: 'var(--shadow-dropdown)',
        modal: 'var(--shadow-modal)',
        focus: 'var(--focus-ring)',
      },
      maxWidth: {
        shell: 'var(--shell-max)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'ls-word-up': {
          from: { opacity: '0', transform: 'translateY(0.9em)' },
          to: { opacity: '1', transform: 'none' },
        },
        'ls-rise': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'none' },
        },
        'ls-float': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-14px)' } },
        'ls-float-r': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(13px)' } },
        'ls-bob': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        'ls-pulse': { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.35' } },
        'ls-ring': {
          from: { transform: 'scale(0.6)', opacity: '0.7' },
          to: { transform: 'scale(1.6)', opacity: '0' },
        },
        'ls-marquee': { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        'ls-shimmer': { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
        'ls-wiggle': { '0%,100%': { transform: 'rotate(-8deg)' }, '50%': { transform: 'rotate(8deg)' } },
        'ls-spin-slow': { to: { transform: 'rotate(360deg)' } },
        'ls-blob': {
          '0%,100%': { borderRadius: '42% 58% 63% 37% / 41% 44% 56% 59%' },
          '50%': { borderRadius: '63% 37% 41% 59% / 56% 63% 37% 44%' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'ls-word-up': 'ls-word-up 0.7s cubic-bezier(0.16,1,0.3,1) both',
        'ls-rise': 'ls-rise 0.7s cubic-bezier(0.16,1,0.3,1) both',
        'ls-float': 'ls-float 6s ease-in-out infinite',
        'ls-float-r': 'ls-float-r 7s ease-in-out infinite',
        'ls-bob': 'ls-bob 2.6s ease-in-out infinite',
        'ls-pulse': 'ls-pulse 1.8s ease-in-out infinite',
        'ls-ring': 'ls-ring 2.4s ease-out infinite',
        'ls-marquee': 'ls-marquee 26s linear infinite',
        'ls-shimmer': 'ls-shimmer 1.4s linear infinite',
        'ls-wiggle': 'ls-wiggle 3.2s ease-in-out infinite',
        'ls-spin-slow': 'ls-spin-slow 26s linear infinite',
        'ls-blob': 'ls-blob 14s ease-in-out infinite',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
