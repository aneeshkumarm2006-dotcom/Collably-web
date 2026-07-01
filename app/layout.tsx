import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from 'next/font/google';
import { Providers } from './providers';
import { AnalyticsScripts } from '@/components/analytics/analytics-scripts';
import { CookieConsent } from '@/components/analytics/cookie-consent';
import './globals.css';

// Display face for headings/wordmark; body face for everything else. Exposed as
// CSS variables (`--font-display`, `--font-sans`) that Tailwind's fontFamily maps.
const fontDisplay = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});
const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Collably: Influencer ↔ Brand Collabs & Gifting',
    template: '%s · Collably',
  },
  description:
    'Collably connects local businesses with creators for gifting campaigns and collabs. Post a campaign, get matched with creators, and grow.',
  metadataBase: new URL('https://collably.app'),
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FBFBFE' },
    { media: '(prefers-color-scheme: dark)', color: '#0A1526' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // The root layout reads NO cookies, so the marketing/blog/profile routes stay
  // statically renderable (SSG/ISR). The client `AuthProvider` hydrates the
  // session once on mount via `/api/auth/me`, so the navbar/avatar/bell still
  // resolve to the signed-in user (guests resolve to null). Authed dashboard
  // routes keep their own server-side guards (`requireRoleSession`), which is
  // where the durable, per-request session check lives.
  return (
    <html lang="en" suppressHydrationWarning className={`${fontSans.variable} ${fontDisplay.variable}`}>
      <body className="min-h-screen bg-page font-sans text-ink antialiased">
        <Providers>{children}</Providers>
        <AnalyticsScripts />
        <CookieConsent />
      </body>
    </html>
  );
}
