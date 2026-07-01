import type { Metadata } from 'next';

import { buildMetadata } from '@/lib/seo';
import { LegalPage } from '@/components/marketing/legal-page';

export const metadata: Metadata = buildMetadata({
  title: 'Cookie Policy',
  description: 'How and why Collably uses cookies and similar technologies.',
  path: '/cookies',
  ogEyebrow: 'Legal',
});

const COOKIE_CATEGORIES = [
  {
    name: 'Essential',
    description:
      'Keep you signed in (our session cookies) and operate core features. The site won’t work properly without these.',
    tag: 'Always on',
    tagClass: 'bg-[#E4F8F2] text-[#0FA57E]',
  },
  {
    name: 'Analytics',
    description:
      'Help us understand how the site is used so we can improve it. Aggregated and non-identifying where possible.',
    tag: 'Optional',
    tagClass: 'bg-[#E7F0FF] text-[#0052BD]',
  },
  {
    name: 'Marketing',
    description:
      'Measure the effectiveness of our campaigns and, where you opt in, show relevant content off-platform.',
    tag: 'Optional',
    tagClass: 'bg-[#FFF3DA] text-[#B57F00]',
  },
];

function CookieTable() {
  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-hair bg-card">
      {COOKIE_CATEGORIES.map((cat, i) => (
        <div
          key={cat.name}
          className={`flex items-start justify-between gap-4 p-5 ${
            i > 0 ? 'border-t border-hair' : ''
          }`}
        >
          <div className="min-w-0">
            <div className="font-display text-[15px] font-bold text-ink">{cat.name}</div>
            <p className="mt-1 text-sm leading-relaxed text-muted">{cat.description}</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${cat.tagClass}`}
          >
            {cat.tag}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      lastUpdated="28 June 2026"
      intro="This Cookie Policy explains how Collably uses cookies and similar technologies to recognise you and improve your experience."
    >
      <h2>1. What are cookies?</h2>
      <p>
        Cookies are small text files stored on your device when you visit a website. They help the
        site remember your actions and preferences over time.
      </p>

      <h2>2. Cookie categories</h2>
      <p>We group the cookies and similar technologies we use into the following categories:</p>
      <CookieTable />

      <h2>3. Managing cookies</h2>
      <p>
        Most browsers let you block or delete cookies in their settings. Blocking essential cookies
        will sign you out and may break parts of the site. Where required, we&apos;ll ask for your
        consent to non-essential cookies before setting them.
      </p>

      <h2>4. Third parties</h2>
      <p>
        Some features rely on third-party services (for example, sign-in providers, image hosting, or
        maps) that may set their own cookies subject to their privacy policies.
      </p>

      <h2>5. Changes &amp; contact</h2>
      <p>
        We may update this policy as our use of cookies evolves. Questions? Email{' '}
        <a href="mailto:privacy@collably.app">privacy@collably.app</a> or see our{' '}
        <a href="/privacy">Privacy Policy</a>.
      </p>
    </LegalPage>
  );
}
