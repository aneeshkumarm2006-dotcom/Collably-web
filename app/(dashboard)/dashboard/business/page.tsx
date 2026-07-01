import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  DollarSign,
  Flag,
  Megaphone,
  Plus,
  Star,
} from 'lucide-react';

import { serverApi } from '@/lib/api/server';
import { getSession } from '@/lib/auth/session';
import type { BusinessProfile } from '@/lib/shared';
import { categoryGradient } from '@/lib/domain-meta';
import { formatCompactNumber, formatCompactCurrency, initials } from '@/lib/format';
import { applicantView } from '@/lib/business/applicant';
import { DashboardContainer, PageHeader } from '@/components/dashboard/page-shell';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Business Dashboard' };

/** Time-of-day greeting (server runtime). */
function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

/** A restyled overview stat tile: soft corner blob, colored glyph, Bricolage value. */
function StatTile({
  label,
  value,
  icon,
  glyph,
  delta,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  /** Tailwind classes for the glyph tile bg + text + the corner blob color. */
  glyph: { tile: string; blob: string };
  delta?: { text: string; className: string };
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-hair bg-card p-[18px] shadow-card">
      <div
        aria-hidden
        className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-60 blur-2xl ${glyph.blob}`}
      />
      <div
        className={`relative inline-flex h-11 w-11 items-center justify-center rounded-xl ${glyph.tile} [&_svg]:h-5 [&_svg]:w-5`}
      >
        {icon}
      </div>
      <div className="relative mt-4 text-[13px] font-semibold text-muted">{label}</div>
      <div className="relative mt-1 font-display text-[30px] font-extrabold leading-none tracking-tight text-ink">
        {value}
      </div>
      {delta && (
        <div className={`relative mt-2 text-[12.5px] font-bold ${delta.className}`}>{delta.text}</div>
      )}
    </div>
  );
}

export default async function BusinessHomePage() {
  const session = await getSession();

  const [profileRes, campaignsRes, appsRes] = await Promise.all([
    serverApi.profiles.getBusiness().catch(() => null),
    serverApi.campaigns.list({ mine: true, limit: 100 }).catch(() => null),
    serverApi.applications.list({ limit: 100 }).catch(() => null),
  ]);

  const profile: BusinessProfile | null = profileRes?.profile ?? null;
  const businessName = profile?.businessName ?? session?.user.name ?? 'there';
  const campaigns = campaignsRes?.data ?? [];
  const apps = appsRes?.data ?? [];

  const activeCampaigns = campaigns.filter((c) => c.status === 'Active');
  const totalApplications = appsRes?.total ?? apps.length;
  const pending = apps.filter((a) => a.status === 'Pending');
  const approvedContent = apps.filter(
    (a) => a.status === 'Completed' || (a.status === 'Accepted' && a.submittedAt),
  ).length;
  const rewardValueGiven = campaigns
    .filter((c) => c.status === 'Active' || c.status === 'Completed')
    .reduce((sum, c) => sum + (c.reward?.estimatedValue ?? 0), 0);

  // Campaigns to manage: Active first, then most-applied, capped.
  const manageList = campaigns
    .slice()
    .sort((a, b) => {
      const aActive = a.status === 'Active' ? 1 : 0;
      const bActive = b.status === 'Active' ? 1 : 0;
      if (aActive !== bActive) return bActive - aActive;
      return (b.applicationsCount ?? 0) - (a.applicationsCount ?? 0);
    })
    .slice(0, 5);

  // New applications = the most recent pending ones.
  const newApplications = pending
    .slice()
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 5);

  const subtitle =
    pending.length > 0
      ? `You have ${pending.length} application${pending.length === 1 ? '' : 's'} waiting for a decision.`
      : "Here's what's happening with your campaigns.";

  return (
    <DashboardContainer>
      <PageHeader
        title={`${greeting()}, ${businessName}`}
        subtitle={subtitle}
        action={
          <Button asChild size="pill-sm">
            <Link href="/dashboard/business/campaigns/new">
              <Plus className="h-4 w-4" /> New campaign
            </Link>
          </Button>
        }
      />

      {/* Stat grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Active campaigns"
          value={activeCampaigns.length}
          icon={<Flag />}
          glyph={{ tile: 'bg-[#E7F0FF] text-brand', blob: 'bg-[#E7F0FF]' }}
          delta={
            activeCampaigns.length > 0
              ? { text: `${activeCampaigns.length} filling fast`, className: 'text-brand' }
              : undefined
          }
        />
        <StatTile
          label="Total applicants"
          value={formatCompactNumber(totalApplications)}
          icon={<Star />}
          glyph={{ tile: 'bg-[#EFEBFF] text-grape', blob: 'bg-[#EFEBFF]' }}
          delta={
            pending.length > 0
              ? { text: `▲ ${pending.length} this week`, className: 'text-grape' }
              : undefined
          }
        />
        <StatTile
          label="Content approved"
          value={approvedContent}
          icon={<CheckCircle2 />}
          glyph={{ tile: 'bg-mint-soft text-mint', blob: 'bg-mint-soft' }}
        />
        <StatTile
          label="Reward value given"
          value={formatCompactCurrency(rewardValueGiven)}
          icon={<DollarSign />}
          glyph={{ tile: 'bg-[#FFF3DA] text-[#B57F00]', blob: 'bg-[#FFF3DA]' }}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Active campaigns */}
        <section className="rounded-2xl border border-hair bg-card p-[18px] shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink">Active campaigns</h2>
            <Link
              href="/dashboard/business/campaigns"
              className="text-[13px] font-bold text-brand hover:underline"
            >
              Manage
            </Link>
          </div>
          {manageList.length === 0 ? (
            <EmptyState
              icon={<Megaphone />}
              title="No campaigns yet"
              description="Post your first campaign to start receiving applications from creators."
              action={
                <Button asChild size="pill-sm">
                  <Link href="/dashboard/business/campaigns/new">
                    <Plus className="h-4 w-4" /> Create a campaign
                  </Link>
                </Button>
              }
            />
          ) : (
            <ul className="space-y-2.5">
              {manageList.map((c) => (
                <li key={c._id}>
                  <Link
                    href={`/dashboard/business/campaigns/${c._id}/applications`}
                    className="flex items-center gap-3.5 rounded-xl border border-hair p-3 transition-colors hover:bg-[#F7F9FD]"
                  >
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-display text-[15px] font-extrabold text-white"
                      style={{ background: categoryGradient(c.category) }}
                    >
                      {initials(c.title)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-ink">{c.title}</p>
                      <p className="mt-0.5 truncate text-[13px] text-muted">
                        {c.reward?.description || c.reward?.type}
                        {typeof c.reward?.estimatedValue === 'number' && c.reward.estimatedValue > 0
                          ? ` · ${formatCompactCurrency(c.reward.estimatedValue)}`
                          : ''}
                      </p>
                    </div>
                    <span className="shrink-0 text-right">
                      <span className="font-display text-lg font-extrabold text-ink">
                        {c.applicationsCount}
                      </span>
                      <span className="block text-[11px] font-semibold text-faint">applicants</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* New applications */}
        <section className="rounded-2xl border border-hair bg-card p-[18px] shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink">New applications</h2>
            <Link
              href="/dashboard/business/applications"
              className="text-[13px] font-bold text-brand hover:underline"
            >
              View all
            </Link>
          </div>
          {newApplications.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">No new applications right now.</p>
          ) : (
            <ul className="space-y-2.5">
              {newApplications.map((app) => {
                const view = applicantView(app);
                return (
                  <li
                    key={app._id}
                    className="flex items-center gap-3.5 rounded-xl border border-hair p-3"
                  >
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full font-display text-[14px] font-extrabold text-white"
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
                      <p className="truncate font-bold text-ink">{view.name}</p>
                      <p className="mt-0.5 truncate text-[13px] text-muted">
                        {[
                          view.niche[0],
                          typeof view.followers === 'number'
                            ? `${formatCompactNumber(view.followers)} followers`
                            : null,
                        ]
                          .filter(Boolean)
                          .join(' · ') || 'Creator'}
                      </p>
                    </div>
                    <Link
                      href="/dashboard/business/applications"
                      className="shrink-0 text-[13px] font-bold text-brand hover:underline"
                    >
                      Review
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {pending.length > 0 && (
            <Link
              href="/dashboard/business/applications"
              className="mt-4 flex items-center justify-between rounded-xl bg-[#E7F0FF] px-3.5 py-2.5 text-[13px] font-bold text-brand transition-opacity hover:opacity-80"
            >
              <span className="inline-flex items-center gap-2">
                <BadgeCheck className="h-4 w-4" />
                {pending.length} application{pending.length === 1 ? '' : 's'} awaiting review
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </section>
      </div>
    </DashboardContainer>
  );
}
