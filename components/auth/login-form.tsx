'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';

import { useAuth } from '@/components/providers/auth-provider';
import { Input } from '@/components/ui/input';
import { StickerButton } from '@/components/shared/sticker';
import { Field, authInputClass } from '@/components/auth/field';
import { PasswordInput } from '@/components/auth/password-input';
import { GoogleButton } from '@/components/auth/google-button';
import { ErrorBanner, OrDivider } from '@/components/auth/auth-layout';
import { loginSchema, fieldErrors } from '@/lib/auth/schemas';
import { postAuthPath } from '@/lib/auth/user';
import { errorMessage, isApiError } from '@/lib/api/errors';
import { sanitizeNext } from '@/lib/auth/redirect';
import { track } from '@/lib/analytics';

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const target = sanitizeNext(next);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBanner(null);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const user = await login(parsed.data);
      track('login_completed', { method: 'password' });
      router.push(target ?? postAuthPath(user));
    } catch (err) {
      setBanner(errorMessage(err));
      setSubmitting(false);
    }
  }

  async function handleGoogle(idToken: string) {
    setBanner(null);
    setSubmitting(true);
    try {
      const { user } = await loginWithGoogle(idToken);
      track('login_completed', { method: 'google' });
      router.push(target ?? postAuthPath(user));
    } catch (err) {
      // A Google sign-in failing on /login is almost always a brand-new account
      // that still needs to choose a role (Business vs Creator). The backend
      // requires a role only for new Google accounts, so send them to signup —
      // which has the role picker + Google button — rather than dead-ending here.
      if (isApiError(err) && err.status >= 400 && err.status < 500) {
        router.push(target ? `/signup?next=${encodeURIComponent(target)}` : '/signup');
        return;
      }
      setBanner(errorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <div>
      <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.1em] text-brand">
        Welcome back
      </p>
      <h1 className="mt-2.5 font-display text-[34px] font-extrabold leading-[1.05] tracking-[-0.03em] text-ink">
        Log in to your block
      </h1>
      <p className="mt-2 text-[15px] text-muted">Good to see you again. Let&apos;s get shouting.</p>

      <div className="mt-7">
        <GoogleButton onCredential={handleGoogle} text="signin_with" disabled={submitting} />
      </div>
      <OrDivider label="or with email" />

      <ErrorBanner message={banner} />

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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

        <Field
          label="Password"
          htmlFor="password"
          error={errors.password}
          action={
            <Link
              href="/forgot-password"
              className="font-mono text-[12px] font-semibold uppercase tracking-[0.06em] text-brand hover:underline"
            >
              Forgot?
            </Link>
          }
        >
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(errors.password)}
          />
        </Field>

        {/* The design shows a "Keep me logged in" checkbox, but session lifetime is
            fixed server-side by the httpOnly cookie and `/api/auth/login` accepts
            no `rememberMe` flag. Rather than render a control that silently does
            nothing, it is omitted until the backend supports it. */}

        <StickerButton
          type="submit"
          tone="brand"
          size="lg"
          className="w-full"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="h-[18px] w-[18px] animate-spin" /> Logging in…
            </>
          ) : (
            <>
              Log in <ArrowRight className="h-[18px] w-[18px]" />
            </>
          )}
        </StickerButton>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        New to Local Creator Crew?{' '}
        <Link
          href={target ? `/signup?next=${encodeURIComponent(target)}` : '/signup'}
          className="font-semibold text-brand hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
