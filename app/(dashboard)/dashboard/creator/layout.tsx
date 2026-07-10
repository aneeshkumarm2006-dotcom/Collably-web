/**
 * Creator dashboard area (Phase 7). Layered on the `(dashboard)` group guard:
 * `requireRoleSession('creator')` resolves the session and bounces a business
 * user to their own home, then the resolved user feeds the persistent shell
 * (sidebar + top bar). Every `/dashboard/creator/*` page renders inside this.
 *
 * The design pins a "Rewards earned" summary above the sidebar profile chip; we
 * compute it from the creator profile and hand it to the shell as `highlight`.
 */
import { requireRoleSession } from '@/lib/auth/guards';
import { serverApi } from '@/lib/api/server';
import { formatCurrency } from '@/lib/format';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default async function CreatorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ user }, profileRes] = await Promise.all([
    requireRoleSession('creator'),
    serverApi.profiles.getCreator().catch(() => null),
  ]);
  const profile = profileRes?.profile ?? null;
  const rewards = profile?.totalRewardsEarned ?? 0;
  const collabs = profile?.totalCollabsCompleted ?? 0;

  const highlight = (
    <div className="rounded-[12px] bg-page p-3.5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.03em] text-muted">
        Rewards earned
      </div>
      <div className="num mt-0.5 text-[24px] font-bold text-money-ink">
        {formatCurrency(rewards)}
      </div>
      <div className="text-[12px] text-muted">
        across {collabs} {collabs === 1 ? 'collab' : 'collabs'}
      </div>
    </div>
  );

  return (
    <DashboardShell role="creator" user={user} highlight={highlight}>
      {children}
    </DashboardShell>
  );
}
