'use client';
/**
 * Password gate. Single field → POST /login. Lockout / incorrect-password
 * messages from the API are shown verbatim. On success we reload status so the
 * shell swaps in the dashboard.
 */
import { useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HubError, postLogin } from './api';

export function Login({ onAuthed }: { onAuthed: () => void | Promise<void> }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password || busy) return;
    setError(null);
    setBusy(true);
    try {
      await postLogin(password);
      await onAuthed();
    } catch (err) {
      setError(err instanceof HubError ? err.message : 'Login failed. Try again.');
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-6">
      <div className="w-full max-w-sm rounded-2xl border border-hair bg-card p-8 shadow-card">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand">
            <Lock className="h-5 w-5" />
          </span>
          <h1 className="font-display text-xl font-bold text-ink">Analytics Hub</h1>
          <p className="mt-1 text-sm text-muted">Enter the password to continue.</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="hub-password">Password</Label>
            <Input
              id="hub-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={busy || !password}>
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
}
