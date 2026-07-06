'use client';
/**
 * The client shell rendered by the hub layout. It fetches `/status` once, then
 * gates the whole subtree:
 *   config not OK      → full-page Diagnostic (names the fix)
 *   needsSetup         → first-run Wizard
 *   !authed            → Login
 *   otherwise          → sidebar + top bar around the routed {children}
 *
 * A HubProvider exposes status + date range + refresh to every page. The
 * project's primary/accent (validated) drive KPI accents via CSS variables.
 */
import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { HubStatus } from '@/lib/analyticshub/types';
import { Button } from '@/components/ui/button';
import { HubError, getStatus } from './api';
import { HubProvider } from './context';
import { Diagnostic } from './diagnostic';
import { Login } from './login';
import { Wizard } from './wizard';
import { Sidebar } from './sidebar';
import { TopBar } from './topbar';
import { safeHexColor, BRAND_ACCENT, BRAND_PRIMARY } from './colors';

type LoadState =
  | { phase: 'loading' }
  | { phase: 'error'; message: string }
  | { phase: 'ready'; status: HubStatus };

export function HubApp({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LoadState>({ phase: 'loading' });

  const load = useCallback(async () => {
    try {
      const status = await getStatus();
      setState({ phase: 'ready', status });
    } catch (err) {
      setState({
        phase: 'error',
        message: err instanceof HubError ? err.message : 'Could not reach the Analytics Hub API.',
      });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (state.phase === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page text-muted">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="sr-only">Loading Analytics Hub</span>
      </div>
    );
  }

  if (state.phase === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page px-6">
        <div className="w-full max-w-sm rounded-2xl border border-hair bg-card p-8 text-center shadow-card">
          <h1 className="font-display text-lg font-bold text-ink">Can&apos;t load the hub</h1>
          <p className="mt-2 break-words text-sm text-muted">{state.message}</p>
          <Button
            className="mt-5"
            onClick={() => {
              setState({ phase: 'loading' });
              void load();
            }}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const { status } = state;

  if (!status.config.secret.ok || !status.config.store.ok) {
    return <Diagnostic config={status.config} />;
  }
  if (status.needsSetup) {
    return <Wizard initialStatus={status} onDone={load} />;
  }
  if (!status.authed) {
    return <Login onAuthed={load} />;
  }

  const primary = safeHexColor(status.project.primary, BRAND_PRIMARY);
  const accent = safeHexColor(status.project.accent, BRAND_ACCENT);

  return (
    <HubProvider status={status} reloadStatus={load}>
      <div
        className="flex min-h-screen bg-page"
        style={
          {
            '--hub-primary': primary,
            '--hub-accent': accent,
          } as React.CSSProperties
        }
      >
        <Sidebar projectName={status.project.name} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="flex-1 px-4 py-6 md:px-6">{children}</main>
        </div>
      </div>
    </HubProvider>
  );
}
