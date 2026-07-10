import type { PublicCampaign } from '@/lib/api/types';
import type { CardAppStatus } from '@/lib/creator/application-status';
import { Reveal } from '@/components/shared/reveal';
import { CreatorCampaignCard } from '@/components/creator/creator-campaign-card';

/**
 * "Matching your niche" rail on the authed creator Explore: an eyebrow + heading
 * over a horizontally-scrolling set of relevance-ranked campaigns for the
 * creator's niches, styled in the Facebook-clean dashboard language. Hidden when
 * there's nothing to recommend.
 */
export function CreatorNicheRail({
  campaigns,
  niches,
  applicationStatusByCampaign,
}: {
  campaigns: PublicCampaign[];
  niches: string[];
  applicationStatusByCampaign?: Record<string, CardAppStatus>;
}) {
  if (campaigns.length === 0) return null;

  const nicheText = niches.length > 0 ? niches.slice(0, 3).join(' & ') : 'your niche';

  return (
    <section className="mb-6">
      <div className="mb-3.5 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-brand">
            <span className="h-[7px] w-[7px] animate-ls-pulse rounded-full bg-money" />
            Matching your niche
          </div>
          <h2 className="mt-1 text-[19px] font-bold tracking-[-0.02em] text-ink">
            Hand-picked for {nicheText}
          </h2>
        </div>
      </div>
      <Reveal className="-mx-1 flex gap-3.5 overflow-x-auto px-1 pb-2">
        {campaigns.map((c) => (
          <CreatorCampaignCard
            key={c._id}
            className="r w-[min(280px,82vw)] shrink-0 sm:w-[280px]"
            campaign={c}
            applicationStatus={applicationStatusByCampaign?.[c._id]}
          />
        ))}
      </Reveal>
    </section>
  );
}
