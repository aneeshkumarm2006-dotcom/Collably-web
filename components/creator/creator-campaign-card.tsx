import Link from 'next/link';

import type { PublicCampaign } from '@/lib/api/types';
import type { CardAppStatus } from '@/lib/creator/application-status';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';
import { categoryIcon } from '@/lib/domain-meta';
import { categoryVisual } from '@/lib/creator/category-visual';

/** Two initials for the small business avatar chip. */
function initials(name?: string): string {
  return (name ?? '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

const APPLIED_LABEL: Record<CardAppStatus, string> = {
  applied: 'Applied',
  accepted: 'Accepted',
  rejected: 'Not selected',
};

/**
 * Creator dashboard campaign card, per the "Campaigns you'd be great for" and
 * Explore designs: a soft tinted cover band with a floating white icon tile, a
 * "● Live" badge and optional match-%, then a business chip, the ask, a green
 * reward figure and an Apply button. The whole card is a non-link container so
 * the Apply link is the single, unambiguous action.
 */
export function CreatorCampaignCard({
  campaign,
  applicationStatus,
  className,
}: {
  campaign: PublicCampaign;
  applicationStatus?: CardAppStatus;
  className?: string;
}) {
  const business = campaign.business;
  const { tint, ink } = categoryVisual(campaign.category);
  const Icon = categoryIcon(campaign.category ?? 'Other');
  const reward = campaign.reward;
  const rewardValue = reward
    ? reward.estimatedValue
      ? formatCurrency(reward.estimatedValue)
      : reward.description || reward.type
    : null;
  const cityText = campaign.isRemote
    ? `${campaign.category} · Remote`
    : [campaign.category, campaign.location?.city].filter(Boolean).join(' · ');
  const appliedCount = campaign.applicationsCount;

  return (
    <div
      className={cn(
        'sticker lift flex flex-col overflow-hidden rounded-card bg-card',
        className,
      )}
    >
      {/* Tinted cover band */}
      <div
        className="relative flex h-[96px] items-center justify-center border-b-2 border-ink"
        style={{ background: tint }}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-[13px] border-2 border-ink bg-card shadow-[2px_2px_0_var(--ink)]">
          <Icon style={{ width: 26, height: 26, color: ink }} strokeWidth={2} aria-hidden />
        </span>
        {applicationStatus ? (
          <span className="absolute left-2.5 top-2.5 rounded-[7px] border-2 border-ink bg-card px-2 py-[3px] font-mono text-[10px] font-bold uppercase tracking-wide text-brand">
            {APPLIED_LABEL[applicationStatus]}
          </span>
        ) : (
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-[7px] border-2 border-ink bg-card px-2 py-[3px] font-mono text-[10px] font-bold uppercase tracking-wide text-money-ink">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-money align-middle animate-ls-pulse" />
            Live
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] border-2 border-ink text-[11px] font-bold"
            style={{ background: tint, color: ink }}
          >
            {initials(business?.businessName)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13.5px] font-semibold text-ink">
              {business?.businessName ?? 'Local business'}
            </p>
            <p className="truncate text-[11px] text-faint">{cityText}</p>
          </div>
        </div>

        <p className="mt-2.5 line-clamp-2 min-h-[36px] text-[13px] leading-snug text-muted">
          {campaign.title}
        </p>

        <div className="mt-3 flex items-center justify-between border-t border-divider pt-3">
          <div className="min-w-0">
            {rewardValue && (
              <p className="num truncate text-[15px] font-bold text-money-ink">{rewardValue}</p>
            )}
            {typeof appliedCount === 'number' && (
              <p className="text-[11px] text-faint">{appliedCount} applied</p>
            )}
          </div>
          <Link
            href={`/campaign/${campaign._id}`}
            className="shrink-0 rounded-md border-2 border-ink bg-brand px-3.5 py-1.5 font-display text-[13px] font-semibold text-white shadow-[2px_2px_0_var(--ink)] transition-all hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_var(--ink)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0_var(--ink)]"
          >
            {applicationStatus ? 'View' : 'Apply'}
          </Link>
        </div>
      </div>
    </div>
  );
}
