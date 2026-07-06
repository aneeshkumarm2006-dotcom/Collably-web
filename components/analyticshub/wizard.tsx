'use client';
/**
 * First-run wizard: (1) create password → POST /setup (sets the cookie),
 * (2) confirm project identity → POST /project, (3) connect sources (all
 * skippable) → land on the Overview. Keeps its own step state so setting the
 * password mid-flow doesn't unmount the wizard; only `onDone` (called at the
 * end) reloads status and hands off to the app shell.
 */
import { useState } from 'react';
import { Check, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { HubStatus } from '@/lib/analyticshub/types';
import { cn } from '@/lib/utils';
import { HubError, getStatus, postSetup } from './api';
import { ProjectForm } from './project-cards';
import { ConnectorStack } from './connectors';

type Step = 1 | 2 | 3;

const STEPS: { n: Step; label: string }[] = [
  { n: 1, label: 'Password' },
  { n: 2, label: 'Project' },
  { n: 3, label: 'Connect' },
];

export function Wizard({
  initialStatus,
  onDone,
}: {
  initialStatus: HubStatus;
  onDone: () => void | Promise<void>;
}) {
  const [step, setStep] = useState<Step>(1);
  const [status, setStatus] = useState<HubStatus>(initialStatus);

  const reload = async () => {
    try {
      setStatus(await getStatus());
    } catch {
      /* keep the last-known status */
    }
  };

  return (
    <div className="min-h-screen bg-page px-6 py-12">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-bold text-ink">Set up Analytics Hub</h1>
          <p className="mt-1 text-sm text-muted">Three quick steps and you&apos;re in.</p>
        </div>

        <ol className="mb-8 flex items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <li key={s.n} className="flex items-center gap-2">
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                  step > s.n
                    ? 'bg-success text-white'
                    : step === s.n
                      ? 'bg-brand text-white'
                      : 'bg-secondary text-faint',
                )}
              >
                {step > s.n ? <Check className="h-4 w-4" /> : s.n}
              </span>
              <span
                className={cn(
                  'text-sm font-medium',
                  step >= s.n ? 'text-ink' : 'text-faint',
                )}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-hair-strong" />}
            </li>
          ))}
        </ol>

        <div className="rounded-2xl border border-hair bg-card p-6 shadow-card">
          {step === 1 && (
            <PasswordStep
              onDone={async () => {
                await reload();
                setStep(2);
              }}
            />
          )}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-lg font-bold text-ink">Confirm project identity</h2>
                <p className="mt-1 text-sm text-muted">
                  This names your dashboard and sets KPI accent colors.
                </p>
              </div>
              <ProjectForm
                project={status.project}
                submitLabel="Save & continue"
                onSaved={async () => {
                  await reload();
                  setStep(3);
                }}
              />
              <button
                type="button"
                onClick={() => setStep(3)}
                className="text-sm font-medium text-muted underline-offset-4 hover:text-ink hover:underline"
              >
                Skip for now
              </button>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-lg font-bold text-ink">Connect your sources</h2>
                <p className="mt-1 text-sm text-muted">
                  Connect any of these now, or skip and do it later in Settings. Every source is
                  optional.
                </p>
              </div>
              <ConnectorStack status={status} onChanged={reload} />
              <div className="flex justify-end border-t border-hair pt-4">
                <Button onClick={() => onDone()}>Finish & open dashboard</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PasswordStep({ onDone }: { onDone: () => void | Promise<void> }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const tooShort = password.length > 0 && password.length < 8;
  const mismatch = confirm.length > 0 && confirm !== password;
  const canSubmit = password.length >= 8 && confirm === password && !busy;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setBusy(true);
    try {
      await postSetup({ password });
      await onDone();
    } catch (err) {
      setError(err instanceof HubError ? err.message : 'Setup failed. Try again.');
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-soft text-brand">
          <Lock className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-display text-lg font-bold text-ink">Create a password</h2>
          <p className="mt-1 text-sm text-muted">This gates the whole dashboard.</p>
        </div>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="wiz-pw">Password</Label>
          <Input
            id="wiz-pw"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {tooShort && <p className="text-xs text-danger">Use at least 8 characters.</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="wiz-pw-confirm">Confirm password</Label>
          <Input
            id="wiz-pw-confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {mismatch && <p className="text-xs text-danger">Passwords don&apos;t match.</p>}
        </div>
        <p className="rounded-md border border-warn/30 bg-warn-soft/50 px-3 py-2 text-xs text-warn">
          There is no password reset flow. Store this somewhere safe — losing it means losing access.
        </p>
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={!canSubmit}>
          {busy ? 'Creating…' : 'Create password & continue'}
        </Button>
      </form>
    </div>
  );
}
