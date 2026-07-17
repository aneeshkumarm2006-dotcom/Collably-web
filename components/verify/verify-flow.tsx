'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, ShieldCheck, Smartphone } from 'lucide-react';

import { clientApi } from '@/lib/api/client';
import { errorMessage } from '@/lib/api/errors';
import { useAuth } from '@/components/providers/auth-provider';
import { postAuthPath } from '@/lib/auth/user';
import { DEFAULT_COUNTRY, type Country, toE164, isValidE164 } from '@/lib/phone';
import { StickerButton } from '@/components/shared/sticker';
import { OtpInput } from './otp-input';
import { PhoneField } from './phone-field';

const RESEND_COOLDOWN = 30; // seconds — mirrors backend OTP_RESEND_COOLDOWN_SECONDS

type Step = 'email' | 'phone' | 'done';

/**
 * The mandatory verification gate: confirm email (an emailed code), then phone (an
 * SMS code), then route onward to onboarding / the dashboard. Mirrors the mobile
 * flow. There's no skip — the only way out unfinished is to log out.
 */
export function VerifyFlow() {
  const { user, refresh, logout } = useAuth();
  const router = useRouter();

  // Which step the user is on, derived from what's already verified.
  const initialStep: Step = user && !user.emailVerified ? 'email' : 'phone';
  const [step, setStep] = useState<Step>(initialStep);

  if (!user) return null;

  return (
    <div className="mx-auto w-full max-w-[440px]">
      <StepIndicator step={step} />
      {step === 'email' ? (
        <EmailStep
          email={user.email}
          onVerified={async () => {
            await refresh();
            setStep('phone');
          }}
        />
      ) : (
        <PhoneStep
          onVerified={async () => {
            const next = await refresh();
            setStep('done');
            // Route past the gate once both are confirmed.
            router.replace(next ? postAuthPath(next) : '/');
          }}
        />
      )}

      <button
        type="button"
        onClick={() => void logout()}
        className="mx-auto mt-8 block text-[13px] font-semibold text-muted hover:text-ink"
      >
        Log out
      </button>
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const onPhone = step !== 'email';
  return (
    <div className="mb-7 flex items-center justify-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.12em]">
      <span className={onPhone ? 'text-money' : 'text-brand'}>1 · Email</span>
      <span className="text-faint">→</span>
      <span className={onPhone ? 'text-brand' : 'text-faint'}>2 · Phone</span>
    </div>
  );
}

/** Shared code-entry sub-view: send on mount, enter, confirm, resend. */
function useResend(send: () => Promise<string | undefined>) {
  const [cooldown, setCooldown] = useState(0);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const run = useCallback(async () => {
    setError(null);
    setSending(true);
    try {
      const dev = await send();
      setDevCode(dev ?? null);
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSending(false);
    }
  }, [send]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  return { cooldown, devCode, error, setError, sending, run };
}

function EmailStep({ email, onVerified }: { email: string; onVerified: () => Promise<void> }) {
  const [code, setCode] = useState('');
  const [confirming, setConfirming] = useState(false);
  const sentOnce = useRef(false);

  const send = useCallback(async () => {
    const res = await clientApi.auth.sendEmailCode();
    return res.devCode;
  }, []);
  const { cooldown, devCode, error, setError, sending, run } = useResend(send);

  // Auto-send the first code when the step opens.
  useEffect(() => {
    if (sentOnce.current) return;
    sentOnce.current = true;
    void run();
  }, [run]);

  async function confirm(value: string) {
    setError(null);
    setConfirming(true);
    try {
      await clientApi.auth.confirmEmailCode(value);
      await onVerified();
    } catch (err) {
      setError(errorMessage(err));
      setConfirming(false);
    }
  }

  return (
    <CodeCard
      icon={<Mail className="h-6 w-6" />}
      title="Verify your email"
      subtitle={
        <>
          We sent a 6-digit code to <span className="font-semibold text-ink">{email}</span>.
        </>
      }
      code={code}
      setCode={setCode}
      onComplete={confirm}
      confirming={confirming}
      error={error}
      devCode={devCode}
      cooldown={cooldown}
      resending={sending}
      onResend={run}
      onSubmit={() => confirm(code)}
    />
  );
}

function PhoneStep({ onVerified }: { onVerified: () => Promise<void> }) {
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [national, setNational] = useState('');
  const [phase, setPhase] = useState<'enter' | 'code'>('enter');
  const [code, setCode] = useState('');
  const [confirming, setConfirming] = useState(false);

  const e164 = toE164(country, national);
  const canSend = isValidE164(e164);

  const send = useCallback(async () => {
    const res = await clientApi.auth.sendPhoneCode(e164);
    return res.devCode;
  }, [e164]);
  const { cooldown, devCode, error, setError, sending, run } = useResend(send);

  async function startSend() {
    if (!canSend) {
      setError('Enter a valid phone number with country code.');
      return;
    }
    await run();
    setPhase('code');
  }

  async function confirm(value: string) {
    setError(null);
    setConfirming(true);
    try {
      await clientApi.auth.confirmPhoneCode(e164, value);
      await onVerified();
    } catch (err) {
      setError(errorMessage(err));
      setConfirming(false);
    }
  }

  if (phase === 'enter') {
    return (
      <div className="rounded-card border-outline border-ink bg-card p-7 shadow-sticker">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-md border-2 border-ink bg-brand-soft text-brand">
          <Smartphone className="h-6 w-6" />
        </div>
        <h1 className="font-display text-[24px] font-bold tracking-[-0.02em] text-ink">
          Verify your phone
        </h1>
        <p className="mt-1.5 text-[15px] text-muted">
          Pick your country and enter your mobile number. We&apos;ll text you a code.
        </p>

        <div className="mt-5">
          <PhoneField
            country={country}
            onCountryChange={setCountry}
            national={national}
            onNationalChange={setNational}
            invalid={Boolean(error)}
          />
          {error && <p className="mt-2 text-[13px] font-medium text-danger-ink">{error}</p>}
        </div>

        <StickerButton
          type="button"
          tone="brand"
          size="lg"
          className="mt-6 w-full"
          disabled={sending || !canSend}
          onClick={startSend}
        >
          {sending ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : 'Send code'}
        </StickerButton>
      </div>
    );
  }

  return (
    <CodeCard
      icon={<Smartphone className="h-6 w-6" />}
      title="Enter the SMS code"
      subtitle={
        <>
          Sent to <span className="font-semibold text-ink">{e164}</span>.{' '}
          <button
            type="button"
            className="font-semibold text-brand hover:underline"
            onClick={() => {
              setPhase('enter');
              setCode('');
            }}
          >
            Change number
          </button>
        </>
      }
      code={code}
      setCode={setCode}
      onComplete={confirm}
      confirming={confirming}
      error={error}
      devCode={devCode}
      cooldown={cooldown}
      resending={sending}
      onResend={run}
      onSubmit={() => confirm(code)}
    />
  );
}

/** The reusable code-entry card (icon, copy, OTP boxes, resend, submit). */
function CodeCard({
  icon,
  title,
  subtitle,
  code,
  setCode,
  onComplete,
  confirming,
  error,
  devCode,
  cooldown,
  resending,
  onResend,
  onSubmit,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: React.ReactNode;
  code: string;
  setCode: (v: string) => void;
  onComplete: (code: string) => void;
  confirming: boolean;
  error: string | null;
  devCode: string | null;
  cooldown: number;
  resending: boolean;
  onResend: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="rounded-card border-outline border-ink bg-card p-7 shadow-sticker">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-md border-2 border-ink bg-brand-soft text-brand">
        {icon}
      </div>
      <h1 className="font-display text-[24px] font-bold tracking-[-0.02em] text-ink">{title}</h1>
      <p className="mt-1.5 text-[15px] text-muted">{subtitle}</p>

      <div className="mt-6">
        <OtpInput
          value={code}
          onChange={setCode}
          onComplete={onComplete}
          disabled={confirming}
          invalid={Boolean(error)}
        />
        {error && (
          <p className="mt-3 text-center text-[13px] font-medium text-danger-ink">{error}</p>
        )}
        {devCode && (
          <p className="mt-3 text-center font-mono text-[12px] text-warn">
            Dev code: <span className="font-semibold">{devCode}</span>
          </p>
        )}
      </div>

      <StickerButton
        type="button"
        tone="brand"
        size="lg"
        className="mt-6 w-full"
        disabled={confirming || code.replace(/\D/g, '').length !== 6}
        onClick={onSubmit}
      >
        {confirming ? (
          <>
            <Loader2 className="h-[18px] w-[18px] animate-spin" /> Verifying…
          </>
        ) : (
          <>
            <ShieldCheck className="h-[18px] w-[18px]" /> Verify
          </>
        )}
      </StickerButton>

      <div className="mt-4 text-center text-[13px] text-muted">
        Didn&apos;t get it?{' '}
        {cooldown > 0 ? (
          <span className="text-faint">Resend in {cooldown}s</span>
        ) : (
          <button
            type="button"
            className="font-semibold text-brand hover:underline disabled:opacity-60"
            disabled={resending}
            onClick={onResend}
          >
            Resend code
          </button>
        )}
      </div>
    </div>
  );
}
