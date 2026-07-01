'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ClipboardList, Handshake, MessageSquare, SearchX, Send } from 'lucide-react';

import { useApplications, useRemindCreator } from '@/lib/api/queries';
import { toast } from '@/lib/toast';
import { errorMessage } from '@/lib/api/errors';
import type { PublicApplication } from '@/lib/api/types';
import type { CampaignDeliverable } from '@/lib/shared';
import { applicantView } from '@/lib/business/applicant';
import { isOverdue, initials } from '@/lib/format';
import { categoryGradient } from '@/lib/domain-meta';
import { cn } from '@/lib/utils';
import { CountdownChip } from '@/components/shared/collab-card';
import { StatusBadge, type StatusTone } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

type Bucket = 'Awaiting' | 'Submitted' | 'Overdue';
const FILTERS = ['All', 'Awaiting', 'Submitted', 'Overdue'] as const;
type Filter = (typeof FILTERS)[number];

const FILTER_LABEL: Record<Filter, string> = {
  All: 'All',
  Awaiting: 'Awaiting submission',
  Submitted: 'Submitted',
  Overdue: 'Overdue',
};

const BUCKET_TONE: Record<Bucket, StatusTone> = {
  Awaiting: 'warn',
  Submitted: 'info',
  Overdue: 'danger',
};

/** The collab's working state from the business's point of view. */
function collabBucket(app: PublicApplication): Bucket {
  if (app.submittedAt && app.status === 'Accepted') return 'Submitted';
  if (app.status === 'Overdue') return 'Overdue';
  if (app.status === 'Accepted' && app.campaign?.deadline && isOverdue(app.campaign.deadline)) {
    return 'Overdue';
  }
  return 'Awaiting';
}

/** "1× Instagram Reel · 1× Story": compact deliverables summary. */
function deliverableSummary(deliverables?: CampaignDeliverable[]): string {
  if (!deliverables || deliverables.length === 0) return 'Content deliverables';
  return deliverables.map((d) => `${d.quantity}× ${d.platform} ${d.contentType}`).join(' · ');
}

export function BusinessCollabsClient() {
  const query = useApplications({ status: 'Accepted,Overdue', limit: 100 });
  const remind = useRemindCreator();
  const [filter, setFilter] = useState<Filter>('All');
  const [remindingId, setRemindingId] = useState<string | null>(null);

  const collabs = useMemo(() => query.data?.data ?? [], [query.data]);
  const buckets = useMemo(() => collabs.map((a) => [a, collabBucket(a)] as const), [collabs]);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { All: collabs.length, Awaiting: 0, Submitted: 0, Overdue: 0 };
    for (const [, b] of buckets) c[b] += 1;
    return c;
  }, [collabs.length, buckets]);

  const rows = buckets.filter(([, b]) => filter === 'All' || b === filter);

  async function onRemind(app: PublicApplication) {
    setRemindingId(app._id);
    try {
      await remind.mutateAsync(app._id);
      toast.success(`Reminder sent to ${app.creatorUser?.name ?? 'the creator'}`);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not send the reminder'));
    } finally {
      setRemindingId(null);
    }
  }

  return (
    <>
      {/* Filter pills */}
      <div className="mb-6 flex flex-wrap items-center gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-bold transition-colors',
              filter === f ? 'bg-brand text-white' : 'bg-[#EEF1F8] text-muted hover:text-ink',
            )}
          >
            {FILTER_LABEL[f]}
            <span className={cn('text-[11px]', filter === f ? 'text-white/80' : 'text-faint')}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {query.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[188px] w-full rounded-2xl" />
          ))}
        </div>
      ) : query.isError ? (
        <EmptyState
          icon={<SearchX />}
          title="Couldn’t load your collabs"
          description="Something went wrong. Please try again."
          action={
            <Button variant="outline" onClick={() => query.refetch()}>
              Retry
            </Button>
          }
        />
      ) : collabs.length === 0 ? (
        <EmptyState
          icon={<Handshake />}
          title="No active collabs"
          description="When you accept an applicant, the collab shows up here while they work on the deliverables."
        />
      ) : rows.length === 0 ? (
        <EmptyState icon={<Handshake />} title={`No ${FILTER_LABEL[filter].toLowerCase()} collabs`} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {rows.map(([app, bucket]) => (
            <CollabRow
              key={app._id}
              app={app}
              bucket={bucket}
              reminding={remindingId === app._id}
              onRemind={() => onRemind(app)}
            />
          ))}
        </div>
      )}
    </>
  );
}

function CollabRow({
  app,
  bucket,
  reminding,
  onRemind,
}: {
  app: PublicApplication;
  bucket: Bucket;
  reminding: boolean;
  onRemind: () => void;
}) {
  const view = applicantView(app);
  const campaign = app.campaign;
  const overdue = bucket === 'Overdue';
  const canRemind = app.status === 'Accepted' && !app.submittedAt;

  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl border border-hair bg-card p-[18px] shadow-card',
        overdue && 'border-l-4 border-l-danger',
      )}
    >
      <div className="flex items-start gap-3.5">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl font-display text-[15px] font-extrabold text-white"
          style={view.avatar ? undefined : { background: categoryGradient(view.niche[0]) }}
        >
          {view.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element -- creator avatar
            <img src={view.avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            initials(view.name)
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate font-display text-[16px] font-bold text-ink">{view.name}</h3>
              <p className="mt-0.5 truncate text-[13px] text-muted">
                {campaign?.title ? `“${campaign.title}”` : 'Campaign'}
              </p>
            </div>
            <StatusBadge status={bucket} tone={BUCKET_TONE[bucket]} className="shrink-0" />
          </div>
        </div>
      </div>

      <p className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-muted">
        <ClipboardList className="h-3.5 w-3.5" /> {deliverableSummary(campaign?.deliverables)}
      </p>
      {campaign?.deadline && <CountdownChip deadline={campaign.deadline} className="mt-2 self-start" />}

      <div className="mt-4 flex items-center gap-2">
        {app.submittedAt ? (
          <Button asChild size="sm" className="flex-1">
            <Link href="/dashboard/business/submissions">Review content</Link>
          </Button>
        ) : canRemind ? (
          <Button variant="outline" size="sm" className="flex-1" disabled={reminding} onClick={onRemind}>
            <Send className="h-4 w-4" /> {reminding ? 'Sending…' : 'Send reminder'}
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="flex-1" disabled>
            Awaiting content
          </Button>
        )}
        {app.conversationId && (
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`/dashboard/business/messages/${app.conversationId}`}>
              <MessageSquare className="h-4 w-4" /> Message
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
