import type { Metadata } from 'next';

import { AuthLayout } from '@/components/auth/auth-layout';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Log in',
  description: 'Log in to your Local Creator Crew account to manage campaigns, applications, and collabs.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <AuthLayout next={next}>
      <LoginForm next={next} />
    </AuthLayout>
  );
}
