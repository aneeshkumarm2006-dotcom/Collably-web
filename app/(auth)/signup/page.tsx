import type { Metadata } from 'next';

import { AuthLayout } from '@/components/auth/auth-layout';
import { SignupForm } from '@/components/auth/signup-form';

export const metadata: Metadata = {
  title: 'Sign up',
  description:
    'Join LocalShout to connect local businesses with creators for gifting campaigns and collabs.',
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <AuthLayout variant="join" next={next}>
      <SignupForm next={next} />
    </AuthLayout>
  );
}
