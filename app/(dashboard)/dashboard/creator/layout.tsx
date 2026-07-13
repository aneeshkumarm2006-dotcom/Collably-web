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
    <div className="relative overflow-hidden rounded-[12px] border-2 border-ink bg-band p-3.5 shadow-[3px_3px_0_var(--ink)]">
      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-band-money">
        Rewards earned
      </div>
      <div className="num mt-1 font-display text-[24px] font-bold leading-none text-white">
        {formatCurrency(rewards)}
      </div>
      <div className="mt-1 text-[12px] font-medium text-white/60">
        across {collabs} {collabs === 1 ? 'collab' : 'collabs'}
      </div>
      <span
        aria-hidden
        className="pointer-events-none absolute -right-5 -top-6 h-16 w-16 rounded-full bg-band-money/20"
      />
    </div>
  );

  return (
    <DashboardShell role="creator" user={user} highlight={highlight}>
      {children}
    </DashboardShell>
  );
}
