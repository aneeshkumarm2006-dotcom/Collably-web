/**
 * Guard layout for the authed dashboard area. Middleware has already ensured a
 * session cookie is present; this server layout resolves the actual session and
 * enforces the richer rules: guests → `/login`, admins → the marketing site
 * (they use the separate admin app), and not-yet-onboarded users → their
 * onboarding flow. Role/area matching (creator vs business) is layered on by the
 * nested layouts via `requireRoleSession`.
 *
 * The Facebook-clean token set is applied by `.surface-app` on `DashboardShell`,
 * not here — that shell also wraps the public-app views for signed-in users, and
 * those render outside this route group. See components/dashboard/dashboard-shell.tsx.
 */
import { requireDashboardSession } from '@/lib/auth/guards';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardSession();
  return <>{children}</>;
}
