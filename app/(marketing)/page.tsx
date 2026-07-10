import type { Metadata } from 'next';

import { publicApi } from '@/lib/api/public';
import type { PublicCampaign } from '@/lib/api/types';
import {
  buildMetadata,
  organizationJsonLd,
  websiteJsonLd,
  SITE_DESCRIPTION,
} from '@/lib/seo';
import { GENERAL_FAQS } from '@/lib/marketing-content';
import { faqPageJsonLd } from '@/lib/faq';
import { JsonLd } from '@/components/shared/json-ld';

import { Hero } from '@/components/marketing/landing/hero';
import { RewardMarquee } from '@/components/marketing/landing/reward-marquee';
import { StatsBand } from '@/components/marketing/landing/stats-band';
import { HowItWorks } from '@/components/marketing/landing/how-it-works';
import { FeatureGrid } from '@/components/marketing/landing/feature-grid';
import { RewardsBand } from '@/components/marketing/landing/rewards-band';
import { LiveCampaigns } from '@/components/marketing/landing/live-campaigns';
import { CreatorSpotlight } from '@/components/marketing/landing/creator-spotlight';
import { LocalMap } from '@/components/marketing/landing/local-map';
import { Testimonials } from '@/components/marketing/landing/testimonials';
import { Pricing } from '@/components/marketing/landing/pricing';
import { FaqSection } from '@/components/marketing/landing/faq-section';
import { FinalCta } from '@/components/marketing/landing/final-cta';

export const metadata: Metadata = buildMetadata({
  description: SITE_DESCRIPTION,
  path: '/',
});

// Statically rendered + revalidated; the live rail refreshes in the background.
export const revalidate = 300;

/** Pull a handful of active campaigns for the live rail (graceful on error). */
async function getLiveCampaigns(): Promise<PublicCampaign[]> {
  try {
    const res = await publicApi.campaigns.list({ status: 'Active', sort: 'newest', limit: 8 });
    return res.data;
  } catch {
    return [];
  }
}

export default async function LandingPage() {
  const campaigns = await getLiveCampaigns();

  return (
    <>
      <JsonLd data={[organizationJsonLd(), websiteJsonLd(), faqPageJsonLd(GENERAL_FAQS)]} />

      <Hero />
      <RewardMarquee />
      <StatsBand />
      <HowItWorks />
      <FeatureGrid />
      <RewardsBand />
      <LiveCampaigns campaigns={campaigns} />
      <CreatorSpotlight />
      <LocalMap />
      <Testimonials />
      <Pricing />
      <FaqSection />
      <FinalCta />
    </>
  );
}
