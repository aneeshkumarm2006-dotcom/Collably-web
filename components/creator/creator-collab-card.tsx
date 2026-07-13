import Link from 'next/link';
import { ExternalLink, MessageSquare } from 'lucide-react';

import type { PublicApplication } from '@/lib/api/types';
import type { CampaignDeliverable } from '@/lib/shared';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDateShort, isOverdue } from '@/lib/format';
import { CategoryTile } from '@/components/creator/category-tile';
import { StatusChip } from '@/components/creator/status-chip';

/** "1× Instagram Reel: tag @brand, 20s+" for the "what to create" checklist. */
export function deliverableLabel(d: CampaignDeliverable): string {
  const base = `${d.quantity}× ${d.platform} ${d.contentType}`;
  return d.requirements ? `${base}: ${d.requirements}` : base;
}

/** Order active collabs: action-needed (un-submitted) first, then soonest deadline. */
export function compareCollabPriority(a: PublicApplication, b: PublicApplication): number {
  const aDone = a.submittedAt ? 1 : 0;
  const bDone = b.submittedAt ? 1 : 0;
  if (aDone !== bDone) return aDone - bDone;
  const ad = a.campaign?.deadline ? +new Date(a.campaign.deadline) : Infinity;
  const bd = b.campaign?.deadline ? +new Date(b.campaign.deadline) : Infinity;
  return ad - bd;
}

/** The submission-progress the creator cares about (label + bar), not the raw status. */
function progress(app: PublicApplication): { status: string; pct: number; bar: string; task: string } {
  if (app.status === 'Completed')
    return {
      status: 'Approved',
      pct: 100,
      bar: 'bg-money',
      task: 'Approved — your reward is ready to claim.',
    };
  if (app.submittedAt)
    return {
      status: 'In review',
      pct: 80,
      bar: 'bg-brand',
      task: 'Submitted — waiting on the business to approve.',
    };
  if (app.status === 'Overdue' || (app.campaign?.deadline && isOverdue(app.campaign.deadline)))
    return {
      status: 'Overdue',
      pct: 40,
      bar: 'bg-danger',
      task: 'This collab is overdue — submit your content as soon as you can.',
    };
  return {
    status: 'Content due',
    pct: 40,
    bar: 'bg-yellow',
    task: 'Create and post your content, then submit it for approval.',
  };
}

function Meta({ label, value, money }: { label: string; value: string; money?: boolean }) {
  return (
    <div>
      <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.08em] text-faint">{label}</div>
      <div
        className={cn(
          'mt-0.5 font-display text-[15px] font-bold',
          money ? 'num text-money-ink' : 'text-ink',
        )}
      >
        {value}
      </div>
    </div>
  );
}

/**
 * A creator's accepted collaboration in flight (the Active Collabs page), per the
 * design: a tinted tile, title + status, the task line, a reward/due/deliverable
 * meta row, and a right rail with a progress bar, the primary action and a
 * Message button. `compact` is the condensed dashboard tile.
 */
export function CreatorCollabCard({
  application,
  variant = 'full',
  className,
}: {
  application: PublicApplication;
  variant?: 'full' | 'compact';
  className?: string;
}) {
  const campaign = application.campaign;
  const business = campaign?.business ?? application.business;
  const { status, pct, bar, task } = progress(application);
  const submitted = Boolean(application.submittedAt);
  const submitHref = `/dashboard/creator/collabs/${application._id}/submit`;

  const reward = campaign?.reward;
  const rewardText = reward
    ? reward.estimatedValue
      ? formatCurrency(reward.estimatedValue)
      : reward.description || reward.type
    : '—';
  const dueText = campaign?.deadline ? formatDateShort(campaign.deadline) : status === 'Approved' ? 'Done' : 'Soon';
  const firstDeliverable = campaign?.deliverables?.[0];
  const deliverableText = firstDeliverable
    ? `${firstDeliverable.quantity} ${firstDeliverable.contentType}`
    : `${campaign?.deliverables?.length ?? 1} item`;

  const primary =
    submitted && application.submissionLink ? (
      <a
        href={application.submissionLink}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'inline-flex w-full items-center justify-center gap-1.5 rounded-md border-2 border-ink px-3 py-2.5 font-display text-[14px] font-semibold text-white shadow-[2px_2px_0_var(--ink)] transition-all hover:-translate-y-px hover:shadow-[3px_3px_0_var(--ink)] active:translate-y-0 active:shadow-[1px_1px_0_var(--ink)]',
          status === 'Approved' ? 'bg-money' : 'bg-brand',
        )}
      >
        <ExternalLink className="h-4 w-4" /> View submission
      </a>
    ) : submitted ? (
      <Link
        href={submitHref}
        className="inline-flex w-full items-center justify-center rounded-md border-2 border-ink bg-brand px-3 py-2.5 font-display text-[14px] font-semibold text-white shadow-[2px_2px_0_var(--ink)] transition-all hover:-translate-y-px hover:shadow-[3px_3px_0_var(--ink)] active:translate-y-0 active:shadow-[1px_1px_0_var(--ink)]"
      >
        View submission
      </Link>
    ) : (
      <Link
        href={submitHref}
        className="inline-flex w-full items-center justify-center rounded-md border-2 border-ink bg-brand px-3 py-2.5 font-display text-[14px] font-semibold text-white shadow-[2px_2px_0_var(--ink)] transition-all hover:-translate-y-px hover:shadow-[3px_3px_0_var(--ink)] active:translate-y-0 active:shadow-[1px_1px_0_var(--ink)]"
      >
        Submit content
      </Link>
    );

  const messageBtn = application.conversationId ? (
    <Link
      href={`/dashboard/creator/messages/${application.conversationId}`}
      className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border-2 border-ink bg-secondary px-3 py-2.5 font-display text-[14px] font-semibold text-ink shadow-[2px_2px_0_var(--ink)] transition-all hover:-translate-y-px hover:shadow-[3px_3px_0_var(--ink)] active:translate-y-0 active:shadow-[1px_1px_0_var(--ink)]"
    >
      <MessageSquare className="h-4 w-4" /> Message
    </Link>
  ) : null;

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'sticker lift flex items-center gap-3.5 rounded-card bg-card p-3.5',
          className,
        )}
      >
        <CategoryTile category={campaign?.category} size={44} radius={11} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[15px] font-semibold text-ink">
              {campaign?.title ?? 'Campaign'}
            </h3>
            <StatusChip status={status} />
          </div>
          <p className="mt-0.5 truncate text-[13px] text-muted">{business?.businessName}</p>
        </div>
        <div className="num shrink-0 text-[14px] font-bold text-money-ink">{rewardText}</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'sticker lift grid gap-6 rounded-card bg-card p-5 md:grid-cols-[minmax(0,1fr)_220px]',
        className,
      )}
    >
      <div className="flex gap-4">
        <CategoryTile category={campaign?.category} size={52} radius={13} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-[17px] font-bold text-ink">{campaign?.title ?? 'Campaign'}</h3>
            <StatusChip status={status} />
          </div>
          <p className="mt-1 text-[13.5px] text-muted">
            <span className="font-medium text-ink">{business?.businessName}</span>
            {' — '}
            {task}
          </p>
          <div className="mt-3.5 flex flex-wrap gap-x-8 gap-y-3">
            <Meta label="Reward" value={rewardText} money />
            <Meta label="Due" value={dueText} />
            <Meta label="Deliverable" value={deliverableText} />
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center gap-2.5 border-t border-divider pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
        <div>
          <div className="mb-1.5 flex items-center justify-between text-[12px] text-muted">
            <span>Progress</span>
            <span className="num font-display font-bold text-ink">{pct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-ink/10">
            <div className={cn('h-full rounded-full', bar)} style={{ width: `${pct}%` }} />
          </div>
        </div>
        {primary}
        {messageBtn}
      </div>
    </div>
  );
}
