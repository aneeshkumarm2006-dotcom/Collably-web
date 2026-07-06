'use client';
/**
 * Project identity + password change cards for Settings (and the identity form
 * is reused by the Wizard). Both POST live and surface verbatim API errors.
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/lib/toast';
import type { HubStatus } from '@/lib/analyticshub/types';
import { HubError, postPassword, postProject, type ProjectInput } from './api';

function errMsg(err: unknown): string {
  return err instanceof HubError ? err.message : 'Something went wrong. Try again.';
}

/** Editable project name + brand colors. `onSaved` refreshes status. */
export function ProjectForm({
  project,
  onSaved,
  submitLabel = 'Save project',
}: {
  project: HubStatus['project'];
  onSaved?: (next: ProjectInput) => void | Promise<void>;
  submitLabel?: string;
}) {
  const [name, setName] = useState(project.name || '');
  const [primary, setPrimary] = useState(project.primary || '#0064E0');
  const [accent, setAccent] = useState(project.accent || '#FF6A3D');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const payload: ProjectInput = { name: name.trim(), primary, accent };
    try {
      await postProject(payload);
      toast.success('Project saved');
      await onSaved?.(payload);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="proj-name">Project name</Label>
        <Input id="proj-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ColorField id="proj-primary" label="Primary color" value={primary} onChange={setPrimary} />
        <ColorField id="proj-accent" label="Accent color" value={accent} onChange={setAccent} />
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <Button type="submit" disabled={busy || !name.trim()}>
        {submitLabel}
      </Button>
    </form>
  );
}

function ColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const valid = /^#[0-9a-fA-F]{6}$/.test(value);
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} picker`}
          value={valid ? value : '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 shrink-0 cursor-pointer rounded-md border border-input bg-card p-1"
        />
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono"
          maxLength={7}
          aria-invalid={!valid}
        />
      </div>
    </div>
  );
}

/** Change the hub password. Min 8, confirmation, warns there is no reset flow. */
export function PasswordForm() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const tooShort = password.length > 0 && password.length < 8;
  const mismatch = confirm.length > 0 && confirm !== password;
  const canSubmit = password.length >= 8 && confirm === password && !busy;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setBusy(true);
    try {
      await postPassword(password);
      toast.success('Password updated');
      setPassword('');
      setConfirm('');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="pw-new">New password</Label>
        <Input
          id="pw-new"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {tooShort && <p className="text-xs text-danger">Use at least 8 characters.</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pw-confirm">Confirm password</Label>
        <Input
          id="pw-confirm"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        {mismatch && <p className="text-xs text-danger">Passwords don&apos;t match.</p>}
      </div>
      <p className="text-xs text-warn">
        There is no password reset flow — store this somewhere safe.
      </p>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <Button type="submit" disabled={!canSubmit}>
        Update password
      </Button>
    </form>
  );
}
