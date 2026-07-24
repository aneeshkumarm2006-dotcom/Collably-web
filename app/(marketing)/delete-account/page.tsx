import type { Metadata } from 'next';

import { buildMetadata } from '@/lib/seo';
import { Container } from '@/components/marketing/section';
import { Prose } from '@/components/marketing/prose';

/**
 * Public, login-free account-deletion instructions.
 *
 * Google Play's Data Safety form requires a URL where a user can request
 * deletion of their account and data WITHOUT installing/opening the app, so this
 * page must stay outside the auth-gated `(dashboard)` group and off `middleware`'s
 * matcher. It documents the in-app path and a no-app fallback (email), and lists
 * what the deletion cascade removes vs. retains (kept in step with
 * `backend/src/routes/auth.ts` `DELETE /auth/me`).
 */
export const metadata: Metadata = buildMetadata({
  title: 'Delete your account',
  description:
    'How to permanently delete your Local Creator Crew account and associated data, from inside the app or by request.',
  path: '/delete-account',
  ogEyebrow: 'Account',
});

const SUPPORT_EMAIL = 'privacy@localcreatorcrew.com';

export default function DeleteAccountPage() {
  return (
    <article className="bg-page py-16 sm:py-20">
      <Container size="narrow">
        <p className="mb-3 font-mono text-[12px] font-semibold uppercase tracking-[0.14em] text-coral">
          Account
        </p>
        <h1 className="font-display text-[34px] font-bold leading-tight text-ink sm:text-[40px]">
          Delete your account
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-muted">
          You can permanently delete your Local Creator Crew account and its data at any time. This
          cannot be undone.
        </p>

        <Prose className="mt-10">
          <h2>Option 1 — Delete from the app (fastest)</h2>
          <ol>
            <li>Open the Local Creator Crew app.</li>
            <li>
              Go to <strong>Settings</strong> → <strong>Account actions</strong>.
            </li>
            <li>
              Tap <strong>Delete account</strong> and confirm.
            </li>
          </ol>
          <p>
            Your account and data are removed immediately. Businesses and creators keep no copy of
            your profile.
          </p>

          <h2>Option 2 — Request deletion without the app</h2>
          <p>
            If you can&apos;t access the app, email{' '}
            <a href={`mailto:${SUPPORT_EMAIL}?subject=Delete%20my%20account`}>{SUPPORT_EMAIL}</a>{' '}
            <strong>from the email address on your account</strong> with the subject
            &ldquo;Delete my account&rdquo;. We verify ownership and delete your account and data
            within <strong>30 days</strong>, usually much sooner.
          </p>

          <h2>What gets deleted</h2>
          <ul>
            <li>Your profile (creator or business) and account login;</li>
            <li>Campaigns you created and applications you submitted;</li>
            <li>Your messages and conversations;</li>
            <li>Saved / favourited collabs;</li>
            <li>Verification records and notifications tied to your account.</li>
          </ul>

          <h2>What we may retain</h2>
          <p>
            We keep the minimum required for legal, security, and fraud-prevention purposes — for
            example, a moderation report another user filed <em>about</em> an account is retained as
            part of our safety record. Retained data is not used to re-create your profile.
          </p>

          <h2>Questions</h2>
          <p>
            Contact <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> or see our{' '}
            <a href="/privacy">Privacy Policy</a>.
          </p>
        </Prose>
      </Container>
    </article>
  );
}
