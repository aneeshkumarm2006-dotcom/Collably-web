'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle2,
  Megaphone,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Plus,
  SearchX,
  Send,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react';

import { useCampaigns, useSetCampaignStatus, useDeleteCampaign } from '@/lib/api/queries';
import { toast } from '@/lib/toast';
import { errorMessage } from '@/lib/api/errors';
import { CAMPAIGN_STATUS_TABS } from '@/lib/constants';
import type { CampaignStatus } from '@/lib/shared';
import { canTransitionCampaign } from '@/lib/shared';
import type { PublicCampaign } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { categoryIcon, categoryGradient } from '@/lib/domain-meta';
import { formatCompactCurrency } from '@/lib/format';
import { EmptyState } from '@/components/shared/empty-state';
import { ConfirmModal } from '@/components/shared/confirm-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Tab = (typeof CAMPAIGN_STATUS_TABS)[number];

const SORTS = {
  newest: 'Newest first',
  most_applied: 'Most applications',
  deadline: 'Closing soon',
} as const;
type Sort = keyof typeof SORTS;

type PendingAction = { type: 'close' | 'complete' | 'delete'; campaign: PublicCampaign };

export function BusinessCampaignsClient() {
  const query = useCampaigns({ mine: true, limit: 100 });
  const setStatus = useSetCampaignStatus();
  const remove = useDeleteCampaign();

  const [tab, setTab] = useState<Tab>('All');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<Sort>('newest');
  const [view, setView] = useState<'list' | 'map'>('list');
  const [pending, setPending] = useState<PendingAction | null>(null);

  const campaigns = useMemo(() => query.data?.data ?? [], [query.data]);

  const counts = useMemo(() => {
    const c = Object.fromEntries(CAMPAIGN_STATUS_TABS.map((t) => [t, 0])) as Record<Tab, number>;
    c.All = campaigns.length;
    for (const cam of campaigns) {
      if (cam.status in c) c[cam.status as Tab] += 1;
    }
    return c;
  }, [campaigns]);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    const filtered = campaigns.filter((c) => {
      if (tab !== 'All' && c.status !== tab) return false;
      if (term && !c.title.toLowerCase().includes(term)) return false;
      return true;
    });
    return filtered.slice().sort((a, b) => {
      if (sort === 'most_applied') return (b.applicationsCount ?? 0) - (a.applicationsCount ?? 0);
      if (sort === 'deadline') {
        const ad = a.deadline ? +new Date(a.deadline) : Infinity;
        const bd = b.deadline ? +new Date(b.deadline) : Infinity;
        return ad - bd;
      }
      return +new Date(b.createdAt) - +new Date(a.createdAt);
    });
  }, [campaigns, tab, q, sort]);

  async function changeStatus(c: PublicCampaign, status: CampaignStatus, message: string) {
    try {
      await setStatus.mutateAsync({ id: c._id, status });
      toast.success(message);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update the campaign'));
    }
  }

  async function confirmAction() {
    if (!pending) return;
    const { type, campaign } = pending;
    try {
      if (type === 'delete') {
        await remove.mutateAsync(campaign._id);
        toast.success('Campaign deleted');
      } else if (type === 'close') {
        await setStatus.mutateAsync({ id: campaign._id, status: 'Closed' });
        toast.success('Campaign closed');
      } else {
        await setStatus.mutateAsync({ id: campaign._id, status: 'Completed' });
        toast.success('Campaign marked completed');
      }
      setPending(null);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not complete that action'));
      setPending(null);
    }
  }

  const busy = setStatus.isPending || remove.isPending;

  return (
    <>
      {/* View toggle + status pills */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-[11px] bg-[#EEF1F8] p-[3px]">
          {(['list', 'map'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={cn(
                'rounded-lg px-4 py-1.5 text-[13px] font-bold capitalize transition-colors',
                view === v ? 'bg-card text-ink shadow-xs' : 'text-muted hover:text-ink',
              )}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {CAMPAIGN_STATUS_TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              aria-pressed={tab === t}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-bold transition-colors',
                tab === t
                  ? 'bg-brand text-white'
                  : 'bg-[#EEF1F8] text-muted hover:text-ink',
              )}
            >
              {t}
              <span className={cn('text-[11px]', tab === t ? 'text-white/80' : 'text-faint')}>
                {counts[t]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search campaigns…"
          className="max-w-xs"
        />
        <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
          <SelectTrigger className="w-auto min-w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(SORTS) as Sort[]).map((s) => (
              <SelectItem key={s} value={s}>
                {SORTS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {query.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[260px] w-full rounded-2xl" />
          ))}
        </div>
      ) : query.isError ? (
        <EmptyState
          icon={<SearchX />}
          title="Couldn’t load your campaigns"
          description="Something went wrong. Please try again."
          action={
            <Button variant="outline" onClick={() => query.refetch()}>
              Retry
            </Button>
          }
        />
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={<Megaphone />}
          title="No campaigns yet"
          description="Create your first campaign to start receiving applications from creators."
          action={
            <Button asChild>
              <Link href="/dashboard/business/campaigns/new">
                <Plus className="h-4 w-4" /> New campaign
              </Link>
            </Button>
          }
        />
      ) : rows.length === 0 ? (
        <EmptyState icon={<SearchX />} title="No campaigns match" description="Try a different tab or search." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((c) => (
            <CampaignRow
              key={c._id}
              campaign={c}
              busy={busy}
              onPublish={() => changeStatus(c, 'Active', 'Campaign published')}
              onPause={() => changeStatus(c, 'Paused', 'Campaign paused')}
              onResume={() => changeStatus(c, 'Active', 'Campaign resumed')}
              onClose={() => setPending({ type: 'close', campaign: c })}
              onComplete={() => setPending({ type: 'complete', campaign: c })}
              onDelete={() => setPending({ type: 'delete', campaign: c })}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        open={pending !== null}
        onOpenChange={(open) => !open && setPending(null)}
        title={
          pending?.type === 'delete'
            ? 'Delete this campaign?'
            : pending?.type === 'close'
              ? 'Close this campaign?'
              : 'Mark this campaign completed?'
        }
        description={
          pending?.type === 'delete'
            ? 'This permanently removes the campaign and all of its applications. This can’t be undone.'
            : pending?.type === 'close'
              ? 'Creators won’t be able to apply anymore. Accepted collabs in progress will continue.'
              : 'This wraps up the campaign. Every accepted collab must be verified first.'
        }
        confirmLabel={
          pending?.type === 'delete' ? 'Delete' : pending?.type === 'close' ? 'Close campaign' : 'Mark completed'
        }
        destructive={pending?.type === 'delete'}
        loading={busy}
        onConfirm={confirmAction}
      />
    </>
  );
}

/** Domain status → design pill (label + soft tint colors). */
const STATUS_PILL: Record<CampaignStatus, { label: string; className: string }> = {
  Active: { label: 'Live', className: 'bg-mint-soft text-[#0FA57E]' },
  Paused: { label: 'Paused', className: 'bg-[#FFF3DA] text-[#B57F00]' },
  Draft: { label: 'Draft', className: 'bg-[#EEF1F8] text-muted' },
  Closed: { label: 'Closed', className: 'bg-[#EEF1F8] text-muted' },
  Completed: { label: 'Completed', className: 'bg-[#E7F0FF] text-[#0052BD]' },
};

function CampaignRow({
  campaign: c,
  busy,
  onPublish,
  onPause,
  onResume,
  onClose,
  onComplete,
  onDelete,
}: {
  campaign: PublicCampaign;
  busy: boolean;
  onPublish: () => void;
  onPause: () => void;
  onResume: () => void;
  onClose: () => void;
  onComplete: () => void;
  onDelete: () => void;
}) {
  const canEdit = c.status !== 'Completed';
  const canClose = c.status === 'Active' || c.status === 'Paused';
  const canComplete = canTransitionCampaign(c.status, 'Completed');
  const appsHref = `/dashboard/business/campaigns/${c._id}/applications`;
  const CategoryIcon = categoryIcon(c.category);
  const pill = STATUS_PILL[c.status];
  const rewardValue =
    typeof c.reward?.estimatedValue === 'number' && c.reward.estimatedValue > 0
      ? formatCompactCurrency(c.reward.estimatedValue)
      : null;
  // The domain has no "spots" model, so we surface deliverable quantity as the
  // spots target when available, and the real applicant count.
  const spots = c.deliverables?.reduce((sum, d) => sum + (d.quantity ?? 0), 0) || null;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-hair bg-card shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      {/* Gradient header */}
      <Link href={appsHref} className="relative block h-24" style={{ background: categoryGradient(c.category) }}>
        {c.coverImage ? (
          <Image src={c.coverImage} alt="" fill sizes="360px" className="object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center opacity-80">
            <CategoryIcon className="h-8 w-8 text-white/85" />
          </span>
        )}
        <span
          className={cn(
            'absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold',
            pill.className,
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {pill.label}
        </span>
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col p-[18px]">
        <Link href={appsHref} className="line-clamp-2 font-display text-[17px] font-bold leading-snug text-ink hover:text-brand">
          {c.title}
        </Link>
        <p className="mt-1.5 text-[13px] font-bold text-brand">
          {rewardValue ? `${c.reward.description || c.reward.type} · ${rewardValue}` : c.reward?.description || c.reward?.type}
        </p>

        <div className="mt-3 flex items-center justify-between border-t border-hair pt-3 text-[12.5px] text-muted">
          <span>
            <b className="text-ink">{c.applicationsCount}</b> applicant{c.applicationsCount === 1 ? '' : 's'}
          </span>
          {spots != null && (
            <span>
              <b className="text-ink">{spots}</b> spot{spots === 1 ? '' : 's'}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2">
          {canEdit ? (
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href={`/dashboard/business/campaigns/${c._id}/edit`}>
                <Pencil className="h-4 w-4" /> Edit
              </Link>
            </Button>
          ) : (
            <span className="flex-1" />
          )}
          <Button asChild size="sm" className="flex-1">
            <Link href={appsHref}>
              <Users className="h-4 w-4" /> Applicants
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="More actions" disabled={busy}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
            {c.status === 'Draft' && (
              <DropdownMenuItem onClick={onPublish}>
                <Send className="h-4 w-4" /> Publish
              </DropdownMenuItem>
            )}
            {c.status === 'Active' && (
              <DropdownMenuItem onClick={onPause}>
                <Pause className="h-4 w-4" /> Pause
              </DropdownMenuItem>
            )}
            {c.status === 'Paused' && (
              <DropdownMenuItem onClick={onResume}>
                <Play className="h-4 w-4" /> Resume
              </DropdownMenuItem>
            )}
            {canClose && (
              <DropdownMenuItem onClick={onClose}>
                <XCircle className="h-4 w-4" /> Close
              </DropdownMenuItem>
            )}
            {canComplete && (
              <DropdownMenuItem onClick={onComplete}>
                <CheckCircle2 className="h-4 w-4" /> Mark completed
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-danger focus:text-danger">
              <Trash2 className="h-4 w-4" /> Delete
            </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
