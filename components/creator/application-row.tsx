import Link from 'next/link';

import type { PublicApplication } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { categoryGradient } from '@/lib/domain-meta';
import { formatCurrency, formatDate } from '@/lib/format';
import { StatusBadge } from '@/components/shared/status-badge';

/**
 * A creator's application as a table-style row (the "My Applications" +
 * "History" screens): a gradient initial tile + title + business/category, the
 * reward in brand blue, an applied/completed date, the status pill, and a
 * caller-supplied action slot. Dimmed for dead-end states (rejected / withdrawn
 * / cancelled). Designed to stack inside a bordered table card.
 */
export function CreatorApplicationRow({
  application,
  dateLabel,
  actions,
}: {
  application: PublicApplication;
  /** Overrides the default "Applied {date}" line. */
  dateLabel?: string;
  actions?: React.ReactNode;
}) {
  const campaign = application.campaign;
  const business = campaign?.business ?? application.business;
  const dimmed = ['Rejected', 'Withdrawn', 'Cancelled'].includes(application.status);
  const date = dateLabel ?? `Applied ${formatDate(application.createdAt)}`;
  const reward = campaign?.reward;
  const rewardText = reward
    ? reward.estimatedValue
      ? formatCurrency(reward.estimatedValue)
      : reward.description || reward.type
    : '—';
  const initial = (business?.businessName ?? campaign?.title ?? '?').charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-4 px-4 py-3.5 transition-colors hover:bg-secondary',
        dimmed && 'opacity-65',
      )}
    >
      {/* Campaign */}
      <div className="flex min-w-0 flex-[2] items-center gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-display text-lg font-bold text-white"
          style={{ background: categoryGradient(campaign?.category) }}
          aria-hidden
        >
          {initial}
        </span>
        <div className="min-w-0">
          <Link
            href={campaign ? `/campaign/${campaign._id}` : '#'}
            className="block truncate font-semibold leading-tight text-ink hover:text-brand"
          >
            {campaign?.title ?? 'Campaign'}
          </Link>
          <p className="mt-0.5 truncate text-[13px] text-muted">
            {business?.businessName}
            {campaign?.category ? ` · ${campaign.category}` : ''}
          </p>
        </div>
      </div>

      {/* Reward */}
      <div className="hidden flex-1 font-mono text-[13px] font-semibold text-brand sm:block">
        {rewardText}
      </div>

      {/* Applied */}
      <div className="hidden flex-1 text-[13px] text-faint md:block">{date}</div>

      {/* Status + actions */}
      <div className="flex shrink-0 items-center gap-3">
        <StatusBadge status={application.status} />
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
