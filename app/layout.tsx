import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, Space_Grotesk } from 'next/font/google';
import { Providers } from './providers';
import { AnalyticsScripts } from '@/components/analytics/analytics-scripts';
import { CookieConsent } from '@/components/analytics/cookie-consent';
import './globals.css';

// Headings + wordmark. Body text is the system stack on both surfaces, so there
// is no webfont for running text — only for display and mono.
const fontDisplay = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});
// Eyebrows, metric figures, badges and meta labels.
const fontMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Local Creator Crew: Influencer ↔ Brand Collabs & Gifting',
    template: '%s · Local Creator Crew',
  },
  description:
    'Local Creator Crew connects local businesses with creators for gifting campaigns and collabs. Post a campaign, get matched with creators, and grow.',
  metadataBase: new URL('https://www.localcreatorcrew.com'),
};

// Light-only: the designs define no dark theme, so the browser chrome is pinned
// to the public surface's cream page colour regardless of OS preference.
export const viewport: Viewport = {
  themeColor: '#FFFDF8',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // The root layout reads NO cookies, so the marketing/blog/profile routes stay
  // statically renderable (SSG/ISR). The client `AuthProvider` hydrates the
  // session once on mount via `/api/auth/me`, so the navbar/avatar/bell still
  // resolve to the signed-in user (guests resolve to null). Authed dashboard
  // routes keep their own server-side guards (`requireRoleSession`), which is
  // where the durable, per-request session check lives.
  return (
    // suppressHydrationWarning: the client bundle adds a `.js` class to <html>
    // before hydration (see app/providers.tsx), so the root element's className
    // intentionally differs from the server HTML. This scopes the suppression to
    // <html>'s own attributes only — children still hydrate strictly.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontDisplay.variable} ${fontMono.variable}`}
    >
      <body className="min-h-screen bg-page font-sans text-ink antialiased">
        <Providers>{children}</Providers>
        <AnalyticsScripts />
        <CookieConsent />
      </body>
    </html>
  );
}
