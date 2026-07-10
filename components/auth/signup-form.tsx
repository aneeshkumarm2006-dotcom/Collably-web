'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, Loader2, Sparkles, Store } from 'lucide-react';

import { useAuth, type SessionUser } from '@/components/providers/auth-provider';
import { Input } from '@/components/ui/input';
import { StickerButton } from '@/components/shared/sticker';
import { Field, authInputClass } from '@/components/auth/field';
import { PasswordInput } from '@/components/auth/password-input';
import { GoogleButton } from '@/components/auth/google-button';
import { ErrorBanner, OrDivider } from '@/components/auth/auth-layout';
import { signupSchema, fieldErrors } from '@/lib/auth/schemas';
import { onboardingPath, postAuthPath } from '@/lib/auth/user';
import { errorMessage } from '@/lib/api/errors';
import { sanitizeNext } from '@/lib/auth/redirect';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';

type Role = 'business' | 'creator';

const ROLES: {
  role: Role;
  icon: typeof Store;
  title: string;
  sub: string;
  dot: string;
  tile: string;
}[] = [
  {
    role: 'creator',
    icon: Sparkles,
    title: "I'm a creator",
    sub: 'Earn rewards for content',
    dot: 'bg-brand',
    tile: 'bg-brand-soft text-brand',
  },
  {
    role: 'business',
    icon: Store,
    title: "I'm a business",
    sub: 'Launch local campaigns',
    dot: 'bg-money',
    tile: 'bg-money-soft text-money-ink',
  },
];

export function SignupForm({ next }: { next?: string }) {
  const router = useRouter();
  const { register, loginWithGoogle } = useAuth();

  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const target = sanitizeNext(next);

  function chooseRole(r: Role) {
    if (r === role) return;
    setRole(r);
    setErrors((prev) => ({ ...prev, role: '' }));
    track('signup_started', { role: r });
  }

  /** After auth, new accounts go to onboarding; honor `next` only if onboarded. */
  function routeAfter(user: SessionUser) {
    router.push(user.isOnboarded ? (target ?? postAuthPath(user)) : onboardingPath(user.role));
  }

  function requireRole(): boolean {
    if (!role) {
      setErrors((prev) => ({ ...prev, role: 'Choose creator or business to continue' }));
      return false;
    }
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBanner(null);
    if (!requireRole() || !role) return;

    const parsed = signupSchema.safeParse({ name, email, password });
    const nextErrors = parsed.success ? {} : fieldErrors(parsed.error);
    if (!agreed) nextErrors.terms = 'Please accept the Terms and Privacy Policy';
    if (!parsed.success || !agreed) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const user = await register({ ...parsed.data, role });
      track('signup_completed', { role, method: 'password' });
      routeAfter(user);
    } catch (err) {
      setBanner(errorMessage(err));
      setSubmitting(false);
    }
  }

  async function handleGoogle(idToken: string) {
    setBanner(null);
    if (!requireRole() || !role) return;
    setSubmitting(true);
    try {
      const { user } = await loginWithGoogle(idToken, role);
      track('signup_completed', { role, method: 'google' });
      routeAfter(user);
    } catch (err) {
      setBanner(errorMessage(err));
      setSubmitting(false);
    }
  }

  const isBusiness = role === 'business';

  return (
    <div>
      <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.1em] text-money-ink">
        Join free
      </p>
      <h1 className="mt-2.5 font-display text-[34px] font-extrabold leading-[1.05] tracking-[-0.03em] text-ink">
        Create your account
      </h1>
      <p className="mt-2 text-[15px] text-muted">First, tell us who you are.</p>

      {/* Role picker */}
      <fieldset className="mt-5">
        <legend className="sr-only">I&apos;m joining as</legend>
        <div className="mt-2.5 grid grid-cols-2 gap-3">
          {ROLES.map(({ role: r, icon: Icon, title, sub, dot, tile }) => {
            const selected = role === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => chooseRole(r)}
                aria-pressed={selected}
                className={cn(
                  'group relative rounded-card border-2 border-ink px-3.5 py-4 text-left transition-all',
                  selected
                    ? 'bg-card shadow-sticker'
                    : 'bg-elev shadow-sticker-muted hover:-translate-y-0.5 hover:shadow-sticker',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full transition-colors',
                    selected ? dot : 'border-2 border-hair-strong',
                  )}
                >
                  {selected && <Check className="h-3 w-3 text-white" strokeWidth={3.5} />}
                </span>
                <span
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-[12px]',
                    tile,
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="mt-3 block font-display text-[16px] font-bold text-ink">
                  {title}
                </span>
                <span className="mt-0.5 block text-[12px] leading-snug text-muted">{sub}</span>
              </button>
            );
          })}
        </div>
        {errors.role && (
          <p className="mt-2 text-[13px] font-medium text-danger-ink">{errors.role}</p>
        )}
      </fieldset>

      <ErrorBanner message={banner} />

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <Field label={isBusiness ? 'Business name' : 'Full name'} htmlFor="name" error={errors.name}>
          <Input
            id="name"
            autoComplete={isBusiness ? 'organization' : 'name'}
            placeholder={isBusiness ? 'Bloom Coffee Co.' : 'Maya Johnson'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={Boolean(errors.name)}
            className={authInputClass}
          />
        </Field>

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
          hint="At least 8 characters"
        >
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(errors.password)}
          />
        </Field>

        <div>
          <label className="flex cursor-pointer items-start gap-2.5 text-[13px] leading-snug text-body">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => {
                setAgreed(e.target.checked);
                if (e.target.checked) setErrors((prev) => ({ ...prev, terms: '' }));
              }}
              aria-invalid={Boolean(errors.terms)}
              className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer rounded-[5px] border-2 border-ink accent-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25"
            />
            <span>
              I agree to the{' '}
              <Link href="/terms" className="font-semibold text-brand hover:underline">
                Terms
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="font-semibold text-brand hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          {errors.terms && (
            <p className="mt-1.5 text-[13px] font-medium text-danger-ink">{errors.terms}</p>
          )}
        </div>

        <StickerButton
          type="submit"
          tone="money"
          size="lg"
          className="w-full"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="h-[18px] w-[18px] animate-spin" /> Creating account…
            </>
          ) : (
            <>
              Create account <ArrowRight className="h-[18px] w-[18px]" />
            </>
          )}
        </StickerButton>
      </form>

      <OrDivider label="or" />

      <GoogleButton onCredential={handleGoogle} text="signup_with" disabled={submitting} />

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link
          href={target ? `/login?next=${encodeURIComponent(target)}` : '/login'}
          className="font-semibold text-brand hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
