/**
 * Analytics Hub layout. Top-level segment (not under the marketing/app groups)
 * so it inherits no public chrome and no user-JWT guards — it's gated by its own
 * httpOnly password cookie via the client <HubApp> shell. The whole subtree is
 * noindex,nofollow and carries its own brand-colored inline-SVG favicon.
 */
import type { Metadata } from 'next';
import { HubApp } from '@/components/analyticshub/hub-app';

// Brand-colored bar-chart favicon (primary #0064E0 tile, accent #FF6A3D bar).
const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%230064E0'/%3E%3Crect x='8' y='16' width='4' height='9' rx='1.5' fill='%23ffffff'/%3E%3Crect x='14' y='11' width='4' height='14' rx='1.5' fill='%23ffffff'/%3E%3Crect x='20' y='7' width='4' height='18' rx='1.5' fill='%23FF6A3D'/%3E%3C/svg%3E";

export const metadata: Metadata = {
  title: 'Analytics Hub',
  robots: { index: false, follow: false },
  icons: { icon: [{ url: FAVICON, type: 'image/svg+xml' }] },
};

export const dynamic = 'force-dynamic';

export default function AnalyticsHubLayout({ children }: { children: React.ReactNode }) {
  return <HubApp>{children}</HubApp>;
}
