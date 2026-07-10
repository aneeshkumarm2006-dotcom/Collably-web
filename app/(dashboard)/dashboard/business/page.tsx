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
import { Reveal } from '@/components/shared/reveal';
import { StatValue } from '@/components/business/stat-value';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Business Dashboard' };

/** Time-of-day greeting (server runtime). */
function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

/**
 * A restyled overview stat tile matching the design: a 38px tinted icon tile
 * top-left, a mono delta pill top-right, a 28px tabular value, then the label.
 */
function StatTile({
  label,
  value,
  icon,
  glyph,
  delta,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  /** Tailwind classes for the glyph tile bg + text + the corner blob color. */
  glyph: { tile: string; blob: string };
  /** `className` carries the pill's soft bg + text tone. */
  delta?: { text: string; className: string };
}) {
  return (
    <div className="r rounded-lg border border-hair bg-card p-[18px] shadow-card lift">
      <div className="flex items-start justify-between gap-2">
        <div
          className={`inline-flex h-[38px] w-[38px] items-center justify-center rounded-md ${glyph.tile} [&_svg]:h-5 [&_svg]:w-5`}
        >
          {icon}
        </div>
        {delta && (
          <span
            className={`num inline-flex items-center rounded-[6px] px-2 py-1 font-mono text-[12px] font-semibold ${delta.className}`}
          >
            {delta.text}
          </span>
        )}
      </div>
      <div className="num mt-3.5 font-mono text-[28px] font-bold leading-none tracking-tight text-ink">
        {value}
      </div>
      <div className="mt-1 text-[13px] text-muted">{label}</div>
    </div>
  );
}

/**
 * "Reward budget" progress card from the design. The domain has no monthly
 * budget cap field, so figures are wired to typed props: `given` is derived from
 * real campaign reward values, and `budget` is optional — when it's absent (as
 * today) we render the honest "given" figure without a fabricated cap or bar
 * rather than hardcode fake money. See the data-gap note in the PR summary.
 */
function RewardBudgetCard({
  given,
  rewardsCount,
  budget,
}: {
  given: number;
  rewardsCount: number;
  budget?: number | null;
}) {
  const pct = budget && budget > 0 ? Math.min(100, Math.round((given / budget) * 100)) : null;
  return (
    <div className="r lift rounded-lg border border-brand/15 bg-brand-soft p-[18px]">
      <div className="font-mono text-[11px] font-semibold uppercase tracking-wide text-brand">
        Reward value given
      </div>
      <div className="num mt-1.5 font-mono text-[24px] font-bold leading-none text-ink">
        {formatCompactCurrency(given)}
        {budget && budget > 0 && (
          <span className="ml-1 text-[14px] font-semibold text-muted">
            of {formatCompactCurrency(budget)}
          </span>
        )}
      </div>
      {pct !== null && (
        <div
          className="mt-3 h-2.5 overflow-hidden rounded-full bg-card"
          role="progressbar"
          aria-valuenow={given}
          aria-valuemin={0}
          aria-valuemax={budget ?? undefined}
          aria-label="Reward budget used"
        >
          <div
            className="h-full rounded-full bg-brand transition-[width] duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      <div className="mt-2 text-[12px] font-semibold text-muted">
        {rewardsCount} reward{rewardsCount === 1 ? '' : 's'} given across active &amp; completed
        campaigns
      </div>
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
          <Button asChild size="pill-sm" className="active:scale-[0.98]">
            <Link href="/dashboard/business/campaigns/new">
              <Plus className="h-4 w-4" /> New campaign
            </Link>
          </Button>
        }
      />

      {/* Stat grid */}
      <Reveal className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Active campaigns"
          value={<StatValue value={activeCampaigns.length} />}
          icon={<Flag />}
          glyph={{ tile: 'bg-brand-soft text-brand', blob: 'bg-brand-soft' }}
          delta={
            activeCampaigns.length > 0
              ? { text: `${activeCampaigns.length} filling fast`, className: 'bg-brand-soft text-brand' }
              : undefined
          }
        />
        <StatTile
          label="Total applicants"
          value={<StatValue value={totalApplications} format="compactNumber" />}
          icon={<Star />}
          glyph={{ tile: 'bg-grape-soft text-grape', blob: 'bg-grape-soft' }}
          delta={
            pending.length > 0
              ? { text: `+${pending.length} this week`, className: 'bg-success-soft text-success' }
              : undefined
          }
        />
        <StatTile
          label="Content approved"
          value={<StatValue value={approvedContent} />}
          icon={<CheckCircle2 />}
          glyph={{ tile: 'bg-money-soft text-money', blob: 'bg-money-soft' }}
        />
        <StatTile
          label="Reward value given"
          value={<StatValue value={rewardValueGiven} format="compactCurrency" />}
          icon={<DollarSign />}
          glyph={{ tile: 'bg-warn-soft text-warn', blob: 'bg-warn-soft' }}
        />
      </Reveal>

      <Reveal className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
        {/* Active campaigns */}
        <section className="r rounded-lg border border-hair bg-card p-[18px] shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">Active campaigns</h2>
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
                <Button asChild size="pill-sm" className="active:scale-[0.98]">
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
                    className="flex items-center gap-3.5 rounded-md border border-hair p-3 transition-colors hover:bg-secondary"
                  >
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-[15px] font-extrabold text-white"
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
                      <span className="num font-mono text-lg font-bold text-ink">
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

        {/* Right rail: recent applicants + reward budget */}
        <div className="flex flex-col gap-6">
        <section className="r rounded-lg border border-hair bg-card p-[18px] shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">New applications</h2>
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
                    className="flex items-center gap-3.5 rounded-md border border-hair p-3"
                  >
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full text-[14px] font-extrabold text-white"
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
              className="mt-4 flex items-center justify-between rounded-md bg-brand-soft px-3.5 py-2.5 text-[13px] font-bold text-brand transition-opacity hover:opacity-80"
            >
              <span className="inline-flex items-center gap-2">
                <BadgeCheck className="h-4 w-4" />
                {pending.length} application{pending.length === 1 ? '' : 's'} awaiting review
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </section>

          <RewardBudgetCard
            given={rewardValueGiven}
            rewardsCount={approvedContent}
            // No monthly-budget field exists in the domain yet; passing null keeps
            // the card honest (given amount only, no fabricated cap). Wire a real
            // budget here once the API exposes one.
            budget={null}
          />
        </div>
      </Reveal>
    </DashboardContainer>
  );
}
