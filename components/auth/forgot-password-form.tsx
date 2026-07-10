'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound, Loader2, Mail } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { StickerButton } from '@/components/shared/sticker';
import { Field, authInputClass } from '@/components/auth/field';
import { ErrorBanner } from '@/components/auth/auth-layout';
import { forgotPasswordSchema, fieldErrors } from '@/lib/auth/schemas';
import { toApiError, errorMessage } from '@/lib/api/errors';

/** Shape of the backend `/auth/forgot-password` body (passed through verbatim). */
interface ForgotResponse {
  message?: string;
  /** Present only in non-production; lets dev jump straight to the reset page. */
  devResetToken?: string;
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState<{ email: string; devResetToken?: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBanner(null);

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const data: ForgotResponse = await res.json().catch(() => ({}));
      if (!res.ok) throw toApiError(res.status, data);
      setSent({ email: parsed.data.email, devResetToken: data.devResetToken });
    } catch (err) {
      setBanner(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div>
        <span className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-ink bg-money-soft text-money-ink shadow-sticker">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h1 className="font-display text-[36px] font-extrabold leading-[1.05] tracking-[-0.03em] text-ink">
          Check your inbox
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          We&apos;ve sent a reset link to <b className="text-ink">{sent.email}</b>. It expires in 30
          minutes. Check your spam folder if you don&apos;t see it.
        </p>

        {sent.devResetToken && (
          <Link
            href={`/reset-password/${sent.devResetToken}`}
            className="mt-4 inline-block rounded-md border-2 border-warn bg-warn-soft px-3.5 py-2.5 text-[13px] font-semibold text-warn hover:underline"
          >
            Dev shortcut → reset with this token
          </Link>
        )}

        <StickerButton
          type="button"
          tone="white"
          size="lg"
          className="mt-6 w-full"
          onClick={() => setSent(null)}
        >
          Use a different email
        </StickerButton>

        <Link
          href="/login"
          className="mx-auto mt-6 flex w-fit items-center gap-1.5 text-sm text-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> Back to log in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <span className="inline-flex h-14 w-14 rotate-[-5deg] items-center justify-center rounded-card border-2 border-ink bg-yellow text-ink shadow-sticker">
        <KeyRound className="h-7 w-7" />
      </span>
      <p className="mt-[22px] font-mono text-[12px] font-semibold uppercase tracking-[0.1em] text-brand">
        Reset access
      </p>
      <h1 className="mt-2.5 font-display text-[34px] font-extrabold leading-[1.05] tracking-[-0.03em] text-ink">
        Forgot your password?
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">
        No worries. Enter your email and we&apos;ll send a link to reset it.
      </p>

      <ErrorBanner message={banner} />

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <Field label="Email" htmlFor="email" error={errors.email}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(errors.email)}
            className={authInputClass}
          />
        </Field>

        <StickerButton
          type="submit"
          tone="brand"
          size="lg"
          className="w-full"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="h-[18px] w-[18px] animate-spin" /> Sending…
            </>
          ) : (
            <>
              Send reset link <ArrowRight className="h-[18px] w-[18px]" />
            </>
          )}
        </StickerButton>

        <div className="flex items-center gap-2.5 rounded-md border-2 border-money bg-money-soft px-3.5 py-3 text-[13px] leading-snug text-money-ink shadow-[3px_3px_0_#31a24c]">
          <Mail className="h-[18px] w-[18px] shrink-0" />
          <span>We&apos;ll email a secure link that expires in 30 minutes.</span>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Remembered it?{' '}
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
