import type { PublicCampaign } from '@/lib/api/types';
import { toCampaignCardData } from '@/lib/campaign-card';
import { CampaignCard } from '@/components/shared/campaign-card';
import { Eyebrow, LiveDot } from '@/components/shared/sticker';
import { BrowseAllButton, GuestApplyButton } from '@/components/marketing/hero-cta';
import { Reveal } from './reveal';

/**
 * Live campaign rail — three real, active campaigns pulled from the API by the
 * page. Renders nothing when the fetch came back empty so the section never
 * shows a broken/placeholder state.
 */
export function LiveCampaigns({ campaigns }: { campaigns: PublicCampaign[] }) {
  const cards = campaigns.slice(0, 3);
  if (cards.length === 0) return null;

  return (
    <section id="live" className="bg-page py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-shell px-6 lg:px-10">
        <div className="mb-9 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <Eyebrow className="flex items-center gap-2 text-brand">
              <LiveDot /> Live right now
            </Eyebrow>
            <h2 className="mt-3 text-balance font-display text-4xl font-bold leading-[1.02] tracking-[-0.03em] text-ink sm:text-[46px]">
              Campaigns looking for creators
            </h2>
          </div>
          <BrowseAllButton label="Browse all 142" />
        </div>

        <Reveal className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <div key={c._id} className="r flex flex-col gap-4">
              <CampaignCard campaign={toCampaignCardData(c)} className="h-full" />
              <GuestApplyButton />
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
