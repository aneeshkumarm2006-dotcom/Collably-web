'use client';
/**
 * Presentational shell for a connection. Shows the source icon, a connected /
 * not-connected / reconnect badge, an optional label (property/account name) or
 * note, an inline error region (verbatim API message), and arbitrary children
 * (the source-specific connect form). Used by both Settings and the Wizard.
 */
import type { ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ConnectionState } from '@/lib/analyticshub/types';

export function ConnectionCard({
  title,
  description,
  icon,
  state,
  error,
  children,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  state?: ConnectionState;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-hair bg-card p-5 shadow-card">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {icon && (
            <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-ink">
              {icon}
            </span>
          )}
          <div>
            <h3 className="font-display text-base font-bold text-ink">{title}</h3>
            {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
            {state?.connected && state.label && (
              <p className="mt-1 text-sm font-medium text-ink">{state.label}</p>
            )}
            {state?.note && <p className="mt-1 text-xs text-faint">{state.note}</p>}
          </div>
        </div>
        <StatusBadge state={state} />
      </header>

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-md border border-danger/30 bg-danger-soft/50 px-3 py-2 text-sm text-danger"
        >
          {error}
        </p>
      )}

      <div className="mt-4">{children}</div>
    </section>
  );
}

function StatusBadge({ state }: { state?: ConnectionState }) {
  if (!state) return null;
  if (state.reconnectNeeded) {
    return (
      <Badge tone="warn" icon={<AlertTriangle className="h-3.5 w-3.5" />}>
        Reconnect needed
      </Badge>
    );
  }
  if (state.connected) {
    return (
      <Badge tone="success" icon={<CheckCircle2 className="h-3.5 w-3.5" />}>
        Connected
      </Badge>
    );
  }
  return (
    <Badge tone="muted" icon={<Circle className="h-3 w-3" />}>
      Not connected
    </Badge>
  );
}

function Badge({
  tone,
  icon,
  children,
}: {
  tone: 'success' | 'warn' | 'muted';
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold',
        tone === 'success' && 'bg-success-soft text-success',
        tone === 'warn' && 'bg-warn-soft text-warn',
        tone === 'muted' && 'bg-secondary text-faint',
      )}
    >
      {icon}
      {children}
    </span>
  );
}
