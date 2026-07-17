/**
 * Server-side route guards for the authed route groups. Middleware does the cheap
 * cookie-presence gate (and attaches `?next=`); these run inside the route-group
 * layouts where the resolved session is available, enforcing the richer
 * role/onboarding rules with `redirect()`.
 *
 * Approval is intentionally NOT a hard gate here: an unapproved creator/business
 * can still browse their dashboard and see "pending review" states; the
 * apply/publish actions are gated in the UI via `canTakeGatedAction`.
 */
import 'server-only';
import { redirect } from 'next/navigation';
import { getSession, type Session } from './session';
import { needsVerification, onboardingPath, roleHome, VERIFY_PATH } from './user';
import type { UserRole } from '@/lib/constants';

/**
 * Require an authenticated, verified, onboarded session inside the `(dashboard)`
 * group. Redirects guests → `/login`, admins → the marketing site (they use the
 * admin app), unverified users → the verification gate, and not-yet-onboarded
 * users → their onboarding flow. The gate order matches the mobile app:
 * verify → onboard → app.
 */
export async function requireDashboardSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.user.role === 'admin') redirect('/');
  if (needsVerification(session.user)) redirect(VERIFY_PATH);
  if (!session.user.isOnboarded) redirect(onboardingPath(session.user.role));
  return session;
}

/**
 * Require a session for a role-specific dashboard area (e.g. `/dashboard/creator/*`).
 * Use in the Phase 7/8 nested layouts on top of the group guard: a business
 * landing on a creator route is bounced to their own home.
 */
export async function requireRoleSession(area: Exclude<UserRole, 'admin'>): Promise<Session> {
  const session = await requireDashboardSession();
  if (session.user.role !== area) redirect(roleHome(session.user.role));
  return session;
}

/**
 * Require an authenticated session inside the `(onboarding)` group. Redirects
 * guests → `/login`, admins → the marketing site, unverified users → the
 * verification gate (which runs first), and already-onboarded users → their
 * dashboard home (no reason to re-onboard).
 */
export async function requireOnboardingSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.user.role === 'admin') redirect('/');
  if (needsVerification(session.user)) redirect(VERIFY_PATH);
  if (session.user.isOnboarded) redirect(roleHome(session.user.role));
  return session;
}

/**
 * Require an authenticated session on the `/verify` gate itself. Guests → `/login`,
 * admins → the marketing site, and users who are ALREADY fully verified are sent
 * onward (onboarding or their home) so the gate never traps a finished account.
 */
export async function requireVerificationSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.user.role === 'admin') redirect('/');
  if (!needsVerification(session.user)) {
    redirect(session.user.isOnboarded ? roleHome(session.user.role) : onboardingPath(session.user.role));
  }
  return session;
}
