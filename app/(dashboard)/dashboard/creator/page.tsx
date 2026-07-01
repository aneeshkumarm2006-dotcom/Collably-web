import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, BadgeCheck, DollarSign, Handshake, Pencil } from 'lucide-react';

import { serverApi } from '@/lib/api/server';
import { getSession } from '@/lib/auth/session';
import type { CreatorProfile } from '@/lib/shared';
import { formatCurrency, formatRelativeTime } from '@/lib/format';
import { categoryGradient } from '@/lib/domain-meta';
import { NOTIF_CHIP_CLASS, notificationHref, notificationVisual } from '@/lib/notifications';
import { DashboardContainer } from '@/components/dashboard/page-shell';
import { compareCollabPriority } from '@/components/creator/creator-collab-card';
import { StatusBadge } from '@/components/shared/status-badge';

export const metadata: Metadata = { title: 'Creator Dashboard' };

/** A small square gradient tile showing a business/campaign initial. */
function InitialTile({ label, category }: { label?: string; category?: string }) {
  return (
    <span
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-display text-lg font-bold text-white"
      style={{ background: categoryGradient(category) }}
      aria-hidden
    >
      {(label ?? '?').charAt(0).toUpperCase()}
    </span>
  );
}

export default async function CreatorHomePage() {
  const session = await getSession();
  const firstName = session?.user.name?.split(/\s+/)[0] ?? 'there';

  const [profileRes, appsRes, notifsRes] = await Promise.all([
    serverApi.profiles.getCreator().catch(() => null),
    serverApi.applications.list({ limit: 50 }).catch(() => null),
    serverApi.notifications.list({ limit: 5 }).catch(() => null),
  ]);

  const profile: CreatorProfile | null = profileRes?.profile ?? null;
  const apps = appsRes?.data ?? [];
  const notifications = notifsRes?.data ?? [];

  const pending = apps.filter((a) => a.status === 'Pending');
  const activeCollabs = apps
    .filter((a) => a.status === 'Accepted' || a.status === 'Overdue')
    .sort(compareCollabPriority);

  const completedCount =
    profile?.totalCollabsCompleted ?? apps.filter((a) => a.status === 'Completed').length;
  const rewards =
    profile?.totalRewardsEarned ??
    apps
      .filter((a) => a.status === 'Completed')
      .reduce((sum, a) => sum + (a.campaign?.reward.estimatedValue ?? 0), 0);

  const heroSub = `You have ${activeCollabs.length} active ${
    activeCollabs.length === 1 ? 'collab' : 'collabs'
  } and ${pending.length} ${pending.length === 1 ? 'application' : 'applications'} pending review.`;

  const stats: {
    label: string;
    value: string | number;
    glyph: React.ReactNode;
    tile: string;
    delta: string;
    deltaClass: string;
  }[] = [
    {
      label: 'Rewards earned',
      value: formatCurrency(rewards),
      glyph: <DollarSign />,
      tile: 'bg-brand-soft text-brand',
      delta: 'Lifetime value',
      deltaClass: 'text-brand',
    },
    {
      label: 'Applications',
      value: pending.length,
      glyph: <Pencil />,
      tile: 'bg-grape-soft text-grape',
      delta: 'Pending review',
      deltaClass: 'text-grape',
    },
    {
      label: 'Active collabs',
      value: activeCollabs.length,
      glyph: <Handshake />,
      tile: 'bg-mint-soft text-mint',
      delta: 'In progress',
      deltaClass: 'text-mint',
    },
    {
      label: 'Completed',
      value: completedCount,
      glyph: <BadgeCheck />,
      tile: 'bg-[#FFF3DA] text-[#B57F00]',
      delta: 'Verified collabs',
      deltaClass: 'text-[#B57F00]',
    },
  ];

  return (
    <DashboardContainer>
      {/* Hero welcome banner */}
      <section className="relative overflow-hidden rounded-[22px] bg-[linear-gradient(130deg,#0064E0,#7B61FF)] p-7 text-white">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl"
        />
        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div className="min-w-0">
            <h1 className="font-display text-[28px] font-extrabold leading-tight">
              Welcome back, {firstName} 👋
            </h1>
            <p className="mt-1.5 max-w-lg text-[15px] text-white/85">{heroSub}</p>
          </div>
          <Link
            href="/dashboard/creator/explore"
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-white px-6 text-[15px] font-bold text-brand shadow-sm transition-transform hover:-translate-y-0.5"
          >
            Find new collabs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Stat card row */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="relative overflow-hidden rounded-2xl border border-hair bg-card p-[18px] shadow-card"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-soft/50 blur-2xl"
            />
            <div className="relative">
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${s.tile} [&_svg]:h-5 [&_svg]:w-5`}
              >
                {s.glyph}
              </span>
              <p className="mt-4 text-[13px] font-medium text-faint">{s.label}</p>
              <p className="mt-1 font-display text-[30px] font-extrabold leading-none text-ink">
                {s.value}
              </p>
              <p className={`mt-2 text-[12.5px] font-semibold ${s.deltaClass}`}>{s.delta}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Two column: active collabs + recommended/notifications */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Active collabs list card */}
        <section className="rounded-2xl border border-hair bg-card p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink">Active collabs</h2>
            <Link
              href="/dashboard/creator/collabs"
              className="text-[13px] font-semibold text-brand hover:underline"
            >
              View all
            </Link>
          </div>
          {activeCollabs.length === 0 ? (
            <div className="rounded-xl bg-secondary p-6 text-center">
              <p className="text-sm font-semibold text-ink">No active collabs yet</p>
              <p className="mt-1 text-[13px] text-muted">
                Apply to campaigns that match your niche — accepted collabs show up here.
              </p>
              <Link
                href="/dashboard/creator/explore"
                className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-bold text-brand hover:underline"
              >
                Browse campaigns <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {activeCollabs.slice(0, 4).map((a) => {
                const biz = a.campaign?.business ?? a.business;
                const status = a.submittedAt ? 'Submitted' : a.status;
                return (
                  <li key={a._id}>
                    <Link
                      href={`/dashboard/creator/collabs/${a._id}/submit`}
                      className="flex items-center gap-3.5 rounded-xl border border-hair bg-card p-3 transition-colors hover:bg-secondary"
                    >
                      <InitialTile label={biz?.businessName} category={a.campaign?.category} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-ink">
                          {a.campaign?.title ?? 'Campaign'}
                        </p>
                        <p className="mt-0.5 truncate text-[13px] text-muted">{biz?.businessName}</p>
                      </div>
                      {a.campaign?.reward && (
                        <span className="hidden shrink-0 font-mono text-[13px] font-semibold text-money sm:block">
                          {a.campaign.reward.estimatedValue
                            ? formatCurrency(a.campaign.reward.estimatedValue)
                            : a.campaign.reward.type}
                        </span>
                      )}
                      <StatusBadge status={status} className="shrink-0" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Recommended / recent notifications */}
        <section className="rounded-2xl border border-hair bg-card p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink">Recommended</h2>
            <Link
              href="/dashboard/creator/explore"
              className="text-[13px] font-semibold text-brand hover:underline"
            >
              Explore
            </Link>
          </div>

          {pending.length > 0 && (
            <ul className="mb-4 space-y-2.5">
              {pending.slice(0, 3).map((a) => {
                const biz = a.campaign?.business ?? a.business;
                return (
                  <li key={a._id}>
                    <Link
                      href={`/campaign/${a.campaignId}`}
                      className="flex items-center gap-3 rounded-xl bg-secondary p-3 transition-colors hover:bg-brand-soft/60"
                    >
                      <InitialTile label={biz?.businessName} category={a.campaign?.category} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">
                          {a.campaign?.title ?? 'Campaign'}
                        </p>
                        <p className="truncate text-xs text-muted">{biz?.businessName}</p>
                      </div>
                      <StatusBadge status={a.status} className="shrink-0" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-faint">
            Recent activity
          </p>
          {notifications.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted">You&apos;re all caught up.</p>
          ) : (
            <ul className="space-y-1">
              {notifications.map((n) => {
                const { icon: Icon, dot } = notificationVisual(n.type);
                return (
                  <li key={n._id}>
                    <Link
                      href={notificationHref(n.deepLinkPath, 'creator')}
                      className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-secondary"
                    >
                      <span
                        className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${NOTIF_CHIP_CLASS[dot]} [&_svg]:h-4 [&_svg]:w-4`}
                      >
                        <Icon />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] leading-snug text-ink">{n.message}</p>
                        <p className="mt-0.5 text-[11px] text-faint">
                          {formatRelativeTime(n.createdAt)}
                        </p>
                      </div>
                      {!n.isRead && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-info" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </DashboardContainer>
  );
}
