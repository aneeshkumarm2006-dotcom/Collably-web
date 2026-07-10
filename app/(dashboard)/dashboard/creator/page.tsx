import Link from 'next/link';
import type { Metadata } from 'next';
import { BadgeCheck, DollarSign, FileText, Handshake } from 'lucide-react';

import { serverApi } from '@/lib/api/server';
import type { CreatorProfile } from '@/lib/shared';
import type { PublicApplication } from '@/lib/api/types';
import { formatDateShort, formatRelativeTime, isOverdue } from '@/lib/format';
import { NOTIF_CHIP_CLASS, notificationHref, notificationVisual } from '@/lib/notifications';
import { DashboardContainer } from '@/components/dashboard/page-shell';
import { Reveal } from '@/components/shared/reveal';
import { compareCollabPriority } from '@/components/creator/creator-collab-card';
import { CreatorCampaignCard } from '@/components/creator/creator-campaign-card';
import { CategoryTile } from '@/components/creator/category-tile';
import { StatusChip } from '@/components/creator/status-chip';
import { StatValue } from '@/components/creator/stat-value';

export const metadata: Metadata = { title: 'Creator Dashboard' };

/** The submission-progress label + bar for an active collab. */
function collabProgress(a: PublicApplication): { status: string; pct: number; bar: string } {
  if (a.status === 'Completed') return { status: 'Approved', pct: 100, bar: 'bg-money' };
  if (a.submittedAt) return { status: 'In review', pct: 80, bar: 'bg-brand' };
  if (a.status === 'Overdue' || (a.campaign?.deadline && isOverdue(a.campaign.deadline)))
    return { status: 'Overdue', pct: 40, bar: 'bg-danger' };
  return { status: 'Content due', pct: 40, bar: 'bg-[#FFC24B]' };
}

export default async function CreatorHomePage() {
  const [profileRes, appsRes, notifsRes, recRes] = await Promise.all([
    serverApi.profiles.getCreator().catch(() => null),
    serverApi.applications.list({ limit: 50 }).catch(() => null),
    serverApi.notifications.list({ limit: 5 }).catch(() => null),
    serverApi.campaigns.list({ sort: 'relevance', limit: 4 }).catch(() => null),
  ]);

  const profile: CreatorProfile | null = profileRes?.profile ?? null;
  const apps = appsRes?.data ?? [];
  const notifications = notifsRes?.data ?? [];
  const recommended = recRes?.data ?? [];

  const pending = apps.filter((a) => a.status === 'Pending');
  const activeCollabs = apps
    .filter((a) => a.status === 'Accepted' || a.status === 'Overdue')
    .sort(compareCollabPriority);
  const recentApps = apps
    .slice()
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 4);

  const completedCount =
    profile?.totalCollabsCompleted ?? apps.filter((a) => a.status === 'Completed').length;
  const rewards =
    profile?.totalRewardsEarned ??
    apps
      .filter((a) => a.status === 'Completed')
      .reduce((sum, a) => sum + (a.campaign?.reward.estimatedValue ?? 0), 0);

  const stats: {
    label: string;
    value: number;
    currency?: boolean;
    icon: React.ReactNode;
    tile: string;
    ink: string;
    delta: string;
    deltaClass: string;
  }[] = [
    {
      label: 'Rewards earned',
      value: rewards,
      currency: true,
      icon: <DollarSign />,
      tile: 'bg-money-soft',
      ink: 'text-money-ink',
      delta: 'Lifetime',
      deltaClass: 'bg-money-soft text-money-ink',
    },
    {
      label: 'Active collabs',
      value: activeCollabs.length,
      icon: <Handshake />,
      tile: 'bg-brand-soft',
      ink: 'text-brand',
      delta: 'In progress',
      deltaClass: 'bg-brand-soft-2 text-brand',
    },
    {
      label: 'Applications',
      value: apps.length,
      icon: <FileText />,
      tile: 'bg-secondary',
      ink: 'text-muted',
      delta: `${pending.length} pending`,
      deltaClass: 'bg-secondary text-muted',
    },
    {
      label: 'Completed',
      value: completedCount,
      icon: <BadgeCheck />,
      tile: 'bg-warn-soft',
      ink: 'text-warn',
      delta: 'Verified',
      deltaClass: 'bg-warn-soft text-warn',
    },
  ];

  return (
    <DashboardContainer>
      {/* Stat row */}
      <Reveal className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="lift r rounded-lg border border-hair bg-card p-[18px]">
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex h-[38px] w-[38px] items-center justify-center rounded-[10px] ${s.tile} ${s.ink} [&_svg]:h-[20px] [&_svg]:w-[20px]`}
              >
                {s.icon}
              </span>
              <span
                className={`num rounded-[6px] px-2 py-[3px] text-[12px] font-semibold ${s.deltaClass}`}
              >
                {s.delta}
              </span>
            </div>
            <div className="num mt-3.5 text-[28px] font-bold leading-none text-ink">
              <StatValue value={s.value} currency={s.currency} />
            </div>
            <div className="mt-1 text-[13px] text-muted">{s.label}</div>
          </div>
        ))}
      </Reveal>

      <div className="mt-[22px] grid items-start gap-[18px] lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
        {/* Left column */}
        <div className="flex flex-col gap-[22px]">
          {recommended.length > 0 && (
            <section>
              <div className="mb-3.5 flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold text-brand">
                    <span className="h-[7px] w-[7px] animate-ls-pulse rounded-full bg-money" />
                    Near you
                  </div>
                  <h2 className="mt-1 text-[19px] font-bold tracking-[-0.02em] text-ink">
                    Campaigns you&apos;d be great for
                  </h2>
                </div>
                <Link
                  href="/dashboard/creator/explore"
                  className="text-[14px] font-semibold text-brand hover:underline"
                >
                  See all
                </Link>
              </div>
              <Reveal className="grid gap-3.5 sm:grid-cols-2">
                {recommended.map((c) => (
                  <CreatorCampaignCard key={c._id} campaign={c} className="r" />
                ))}
              </Reveal>
            </section>
          )}

          <section>
            <div className="mb-3.5 flex items-center justify-between">
              <h2 className="text-[19px] font-bold tracking-[-0.02em] text-ink">Active collabs</h2>
              <Link
                href="/dashboard/creator/collabs"
                className="text-[14px] font-semibold text-brand hover:underline"
              >
                View all
              </Link>
            </div>
            {activeCollabs.length === 0 ? (
              <div className="rounded-lg border border-hair bg-card p-6 text-center">
                <p className="text-sm font-semibold text-ink">No active collabs yet</p>
                <p className="mx-auto mt-1 max-w-sm text-[13px] text-muted">
                  Apply to campaigns that match your niche — accepted collabs show up here.
                </p>
                <Link
                  href="/dashboard/creator/explore"
                  className="mt-3 inline-block text-[13px] font-semibold text-brand hover:underline"
                >
                  Browse campaigns
                </Link>
              </div>
            ) : (
              <Reveal className="overflow-hidden rounded-lg border border-hair bg-card">
                {activeCollabs.slice(0, 4).map((a) => {
                  const biz = a.campaign?.business ?? a.business;
                  const { status, pct, bar } = collabProgress(a);
                  const due = a.campaign?.deadline ? formatDateShort(a.campaign.deadline) : 'Soon';
                  return (
                    <Link
                      key={a._id}
                      href={`/dashboard/creator/collabs/${a._id}/submit`}
                      className="row r flex items-center gap-3.5 border-t border-divider px-4 py-3.5 first:border-t-0 hover:bg-elev"
                    >
                      <CategoryTile category={a.campaign?.category} size={44} radius={11} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-[15px] font-semibold text-ink">
                            {a.campaign?.title ?? 'Campaign'}
                          </span>
                          <StatusChip status={status} />
                        </div>
                        <p className="mt-0.5 truncate text-[13px] text-muted">
                          {biz?.businessName}
                        </p>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#EBEDF0]">
                          <div
                            className={`h-full rounded-full ${bar}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-[11px] text-faint">Due</div>
                        <div className="text-[14px] font-semibold text-ink">{due}</div>
                      </div>
                    </Link>
                  );
                })}
              </Reveal>
            )}
          </section>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-[18px]">
          <div className="rounded-lg border border-hair bg-card p-[18px]">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-ink">Your applications</h3>
              <Link
                href="/dashboard/creator/applications"
                className="text-[13px] font-semibold text-brand hover:underline"
              >
                All {apps.length}
              </Link>
            </div>
            {recentApps.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">No applications yet.</p>
            ) : (
              <Reveal className="mt-3 flex flex-col gap-0.5">
                {recentApps.map((a) => (
                  <Link
                    key={a._id}
                    href="/dashboard/creator/applications"
                    className="row r -mx-2 flex items-center gap-3 rounded-sm p-2 hover:bg-elev"
                  >
                    <CategoryTile category={a.campaign?.category} size={34} radius={8} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-semibold text-ink">
                        {a.campaign?.title ?? 'Campaign'}
                      </p>
                      <p className="text-[11px] text-faint">{formatRelativeTime(a.createdAt)}</p>
                    </div>
                    <StatusChip status={a.status} />
                  </Link>
                ))}
              </Reveal>
            )}
          </div>

          <div className="rounded-lg border border-hair bg-card p-[18px]">
            <h3 className="mb-2 text-[16px] font-bold text-ink">Recent activity</h3>
            {notifications.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted">You&apos;re all caught up.</p>
            ) : (
              <Reveal as="ul">
                {notifications.map((n) => {
                  const { icon: Icon, dot } = notificationVisual(n.type);
                  return (
                    <li key={n._id} className="r">
                      <Link
                        href={notificationHref(n.deepLinkPath, 'creator')}
                        className="flex items-start gap-3 border-t border-divider py-2.5 first:border-t-0"
                      >
                        <span
                          className={`inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg ${NOTIF_CHIP_CLASS[dot]} [&_svg]:h-4 [&_svg]:w-4`}
                        >
                          <Icon />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13.5px] leading-snug text-ink">{n.message}</p>
                          <p className="mt-0.5 text-[11px] text-faint">
                            {formatRelativeTime(n.createdAt)}
                          </p>
                        </div>
                        {!n.isRead && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </DashboardContainer>
  );
}
