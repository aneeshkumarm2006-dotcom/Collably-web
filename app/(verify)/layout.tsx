/**
 * Guard layout for the mandatory verification gate. Resolves the session and
 * enforces: guests → `/login`, admins → the marketing site, and users who are
 * ALREADY fully verified → onward (onboarding or their home). New creator/business
 * accounts land here until both email and phone are confirmed.
 */
import { requireVerificationSession } from '@/lib/auth/guards';

export default async function VerifyLayout({ children }: { children: React.ReactNode }) {
  await requireVerificationSession();
  return <>{children}</>;
}
