import type { Metadata } from 'next';

import { AuthLayout } from '@/components/auth/auth-layout';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export const metadata: Metadata = {
  title: 'Reset password',
  description: 'Set a new password for your LocalShout account.',
};

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <AuthLayout>
      <ResetPasswordForm token={token} />
    </AuthLayout>
  );
}
