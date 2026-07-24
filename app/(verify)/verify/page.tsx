import type { Metadata } from 'next';

import { BrandMark } from '@/components/shared/brand-mark';
import { VerifyFlow } from '@/components/verify/verify-flow';

export const metadata: Metadata = {
  title: 'Verify your account',
  description: 'Confirm your email and phone number to secure your Local Creator Crew account.',
  robots: { index: false, follow: false },
};

/**
 * The verification gate (`/verify`). The `(verify)` layout guard has already
 * ensured an authed, not-yet-verified, non-admin session; the two-step flow
 * (email → phone) is a client island that reads the live session from context.
 */
export default function VerifyPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-page px-6 py-12">
      <header className="mb-10">
        <BrandMark />
      </header>
      <div className="w-full">
        <VerifyFlow />
      </div>
      <p className="mx-auto mt-10 max-w-[420px] text-center text-[12.5px] leading-relaxed text-faint">
        We verify email and phone so businesses and creators on Local Creator Crew are real
        people. Standard message rates may apply.
      </p>
    </main>
  );
}
