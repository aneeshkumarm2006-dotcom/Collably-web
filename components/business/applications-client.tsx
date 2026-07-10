'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, ExternalLink, FileText, SearchX, X } from 'lucide-react';

import { useApplications, useDecideApplication } from '@/lib/api/queries';
import { toast } from '@/lib/toast';
import { errorMessage } from '@/lib/api/errors';
import type { ApplicationStatus } from '@/lib/shared';
import type { PublicApplication } from '@/lib/api/types';
import { applicantView } from '@/lib/business/applicant';
import { formatCompactNumber, initials } from '@/lib/format';
import { categoryGradient } from '@/lib/domain-meta';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { Reveal } from '@/components/shared/reveal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const TABS = ['All', 'Pending', 'Accepted', 'Rejected', 'Completed'] as const;
type Tab = (typeof TABS)[number];

export function BusinessApplicationsClient({ campaignId }: { campaignId?: string }) {
  const query = useApplications({ campaignId, limit: 100 });
  const decide = useDecideApplication();
  const [tab, setTab] = useState<Tab>(campaignId ? 'Pending' : 'All');
  const [actingId, setActingId] = useState<string | null>(null);

  const apps = useMemo(() => query.data?.data ?? [], [query.data]);

  const counts = useMemo(() => {
    const c: Record<Tab, number> = { All: apps.length, Pending: 0, Accepted: 0, Rejected: 0, Completed: 0 };
    for (const a of apps) if (a.status in c) c[a.status as Tab] += 1;
    return c;
  }, [apps]);

  const rows = tab === 'All' ? apps : apps.filter((a) => a.status === (tab as ApplicationStatus));

  async function onDecide(app: PublicApplication, status: 'Accepted' | 'Rejected') {
    setActingId(app._id);
    try {
      await decide.mutateAsync({ id: app._id, status });
      toast.success(
        status === 'Accepted'
          ? `Accepted ${app.creatorUser?.name ?? 'the creator'}. They can start the collab.`
          : 'Application rejected',
      );
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update the application'));
    } finally {
      setActingId(null);
    }
  }

  return (
    <>
      {/* Campaign / status filter pills */}
      <div className="mb-6 flex flex-wrap items-center gap-1.5">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md border px-3.5 py-1.5 text-[13px] font-bold transition-colors',
              tab === t
                ? 'border-ink bg-ink text-white'
                : 'border-hair bg-card text-muted hover:text-ink',
            )}
          >
            {t}
            <span className={cn('text-[11px]', tab === t ? 'text-white/80' : 'text-faint')}>
              {counts[t]}
            </span>
          </button>
        ))}
      </div>

      {query.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[92px] w-full rounded-lg" />
          ))}
        </div>
      ) : query.isError ? (
        <EmptyState
          icon={<SearchX />}
          title="Couldn’t load applications"
          description="Something went wrong. Please try again."
          action={
            <Button variant="outline" onClick={() => query.refetch()}>
              Retry
            </Button>
          }
        />
      ) : apps.length === 0 ? (
        <EmptyState
          icon={<FileText />}
          title="No applications yet"
          description={
            campaignId
              ? 'When creators apply to this campaign, they’ll show up here.'
              : 'Applications across all your campaigns will show up here.'
          }
        />
      ) : rows.length === 0 ? (
        <EmptyState icon={<FileText />} title={`No ${tab.toLowerCase()} applications`} />
      ) : (
        <Reveal key={tab} className="space-y-3">
          {rows.map((app) => (
            <ApplicantRow
              key={app._id}
              app={app}
              showCampaign={!campaignId}
              acting={actingId === app._id}
              onAccept={() => onDecide(app, 'Accepted')}
              onReject={() => onDecide(app, 'Rejected')}
            />
          ))}
        </Reveal>
      )}
    </>
  );
}

function ApplicantRow({
  app,
  showCampaign,
  acting,
  onAccept,
  onReject,
}: {
  app: PublicApplication;
  showCampaign: boolean;
  acting: boolean;
  onAccept: () => void;
  onReject: () => void;
}) {
  const view = applicantView(app);
  const subline = [
    view.niche[0],
    typeof view.followers === 'number' ? `${formatCompactNumber(view.followers)} followers` : null,
    view.city,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="r lift flex flex-col gap-4 rounded-lg border border-hair bg-card p-[18px] shadow-card sm:flex-row sm:items-start">
      <span
        className="flex h-[52px] w-[52px] shrink-0 items-center justify-center overflow-hidden rounded-full text-[16px] font-extrabold text-white"
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
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[16px] font-bold text-ink">{view.name}</h3>
          {view.handle && (
            <span className="font-mono text-[12px] text-muted">{view.handle}</span>
          )}
          {app.status !== 'Pending' && <StatusBadge status={app.status} />}
        </div>
        {subline && <p className="mt-0.5 truncate text-[13px] text-muted">{subline}</p>}
        {showCampaign && app.campaign?.title && (
          <p className="mt-0.5 truncate text-[13px] text-muted">
            Applied to <b className="text-ink">{app.campaign.title}</b>
          </p>
        )}
        {app.pitch && (
          <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-body">“{app.pitch}”</p>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {view.profileHref && (
          <Button asChild variant="ghost" size="sm">
            <Link href={view.profileHref} target="_blank">
              <ExternalLink className="h-4 w-4" /> View profile
            </Link>
          </Button>
        )}
        {app.status === 'Pending' && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="text-danger hover:text-danger"
              disabled={acting}
              onClick={onReject}
            >
              <X className="h-4 w-4" /> Decline
            </Button>
            <Button
              variant="money"
              size="sm"
              className="active:scale-[0.98]"
              disabled={acting}
              onClick={onAccept}
            >
              <Check className="h-4 w-4" /> Approve
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
