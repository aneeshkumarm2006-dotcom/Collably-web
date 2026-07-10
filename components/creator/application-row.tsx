import Link from 'next/link';

import type { PublicApplication } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate } from '@/lib/format';
import { CategoryTile } from '@/components/creator/category-tile';
import { StatusChip } from '@/components/creator/status-chip';

/**
 * A creator's application as a CSS-grid table row (the "My Applications" +
 * "History" screens), per the design: a tinted category tile + title +
 * business/type, the reward in money-green, an applied/completed date, then the
 * status pill and a caller-supplied action slot. Reward + date columns collapse
 * on small screens. Dimmed for dead-end states (rejected / withdrawn /
 * cancelled).
 */
export function CreatorApplicationRow({
  application,
  dateLabel,
  actions,
  className,
}: {
  application: PublicApplication;
  /** Overrides the default applied date. */
  dateLabel?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  const campaign = application.campaign;
  const business = campaign?.business ?? application.business;
  const dimmed = ['Rejected', 'Withdrawn', 'Cancelled'].includes(application.status);
  const date = dateLabel ?? formatDate(application.createdAt);
  const reward = campaign?.reward;
  const rewardText = reward
    ? reward.estimatedValue
      ? formatCurrency(reward.estimatedValue)
      : reward.description || reward.type
    : '—';
  const subtitle = [business?.businessName, campaign?.category].filter(Boolean).join(' · ');

  return (
    <div
      className={cn(
        'row grid grid-cols-[minmax(0,2.4fr)_auto] items-center gap-3 border-t border-divider px-[18px] py-3.5 transition-colors first:border-t-0 hover:bg-elev sm:grid-cols-[minmax(0,2.4fr)_1fr_1fr_auto]',
        dimmed && 'opacity-65',
        className,
      )}
    >
      {/* Campaign */}
      <div className="flex min-w-0 items-center gap-3">
        <CategoryTile category={campaign?.category} size={38} radius={9} />
        <div className="min-w-0">
          <Link
            href={campaign ? `/campaign/${campaign._id}` : '#'}
            className="block truncate text-[14px] font-semibold leading-tight text-ink hover:text-brand"
          >
            {campaign?.title ?? 'Campaign'}
          </Link>
          <p className="mt-0.5 truncate text-[12px] text-faint">{subtitle}</p>
        </div>
      </div>

      {/* Reward */}
      <div className="num hidden text-[14px] font-bold text-money-ink sm:block">{rewardText}</div>

      {/* Date */}
      <div className="hidden text-[13px] text-muted sm:block">{date}</div>

      {/* Status + actions */}
      <div className="flex shrink-0 items-center justify-end gap-3">
        <StatusChip status={application.status} />
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
