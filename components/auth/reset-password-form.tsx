'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, Lock } from 'lucide-react';

import { useAuth } from '@/components/providers/auth-provider';
import { StickerButton } from '@/components/shared/sticker';
import { Field } from '@/components/auth/field';
import { PasswordInput } from '@/components/auth/password-input';
import { ErrorBanner } from '@/components/auth/auth-layout';
import { resetPasswordSchema, fieldErrors, MIN_PASSWORD_LENGTH } from '@/lib/auth/schemas';
import { postAuthPath } from '@/lib/auth/user';
import { errorMessage } from '@/lib/api/errors';
import { cn } from '@/lib/utils';

/**
 * Local password-strength heuristic — UX guidance only. The backend enforces the
 * real rule (min length); this never blocks submit and is not a security control.
 */
function strengthOf(password: string): { score: 0 | 1 | 2 | 3 | 4; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= MIN_PASSWORD_LENGTH) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  const clamped = Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;
  const meta = [
    { label: 'Add a few more characters', color: 'bg-danger' },
    { label: 'Weak — keep going', color: 'bg-danger' },
    { label: 'Fair — getting there', color: 'bg-warn' },
    { label: 'Good — almost there', color: 'bg-brand' },
    { label: 'Strong — nice work.', color: 'bg-money' },
  ][clamped];
  return { score: clamped, label: meta.label, color: meta.color };
}

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const strength = useMemo(() => strengthOf(password), [password]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBanner(null);

    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const user = await resetPassword(token, parsed.data.password);
      // Auto-logged-in by the backend; send them where they belong.
      router.push(postAuthPath(user));
    } catch (err) {
      setBanner(errorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <div>
      <span className="inline-flex h-14 w-14 rotate-[-5deg] items-center justify-center rounded-card border-2 border-ink bg-money text-white shadow-sticker">
        <Lock className="h-7 w-7" />
      </span>
      <p className="mt-[22px] font-mono text-[12px] font-semibold uppercase tracking-[0.1em] text-money-ink">
        New password
      </p>
      <h1 className="mt-2.5 font-display text-[34px] font-extrabold leading-[1.05] tracking-[-0.03em] text-ink">
        Set a new password
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">
        Choose a strong password you&apos;ll remember.
      </p>

      <ErrorBanner message={banner} />

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <Field label="New password" htmlFor="password" error={errors.password}>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(errors.password)}
          />
        </Field>

        {password && (
          <div aria-live="polite">
            <div className="flex gap-1.5" aria-hidden>
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={cn(
                    'h-1.5 flex-1 rounded-full transition-colors',
                    i < strength.score ? strength.color : 'bg-hair-strong',
                  )}
                />
              ))}
            </div>
            <p className="mt-1.5 text-[12px] text-muted">{strength.label}</p>
          </div>
        )}

        <Field label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword}>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            aria-invalid={Boolean(errors.confirmPassword)}
          />
        </Field>

        <StickerButton
          type="submit"
          tone="money"
          size="lg"
          className="w-full"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="h-[18px] w-[18px] animate-spin" /> Saving…
            </>
          ) : (
            <>
              Update password <ArrowRight className="h-[18px] w-[18px]" />
            </>
          )}
        </StickerButton>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
