'use client';
/**
 * Full-page config diagnostic shown when the server can't run the hub yet:
 * a missing/invalid secret or an unavailable store. Names the exact fix using
 * the API's `reason` string so the operator knows what to set.
 */
import { ServerCog } from 'lucide-react';
import type { HubStatus } from '@/lib/analyticshub/types';

export function Diagnostic({ config }: { config: HubStatus['config'] }) {
  const items = [
    { key: 'Encryption secret', ok: config.secret.ok, reason: config.secret.reason },
    { key: 'Config store', ok: config.store.ok, reason: config.store.reason },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-6 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-hair bg-card p-8 shadow-card">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warn-soft text-warn">
            <ServerCog className="h-6 w-6" />
          </span>
          <h1 className="font-display text-xl font-bold text-ink">Analytics Hub isn&apos;t ready</h1>
          <p className="mt-1 text-sm text-muted">
            The server needs some configuration before the dashboard can run.
          </p>
        </div>
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.key}
              className={`rounded-xl border p-4 ${
                item.ok ? 'border-hair bg-card' : 'border-danger/30 bg-danger-soft/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-bold text-ink">{item.key}</span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    item.ok ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'
                  }`}
                >
                  {item.ok ? 'OK' : 'Needs fixing'}
                </span>
              </div>
              {!item.ok && item.reason && (
                <p className="mt-2 break-words text-sm text-muted">{item.reason}</p>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-center text-xs text-faint">
          Fix the items above on the server, then reload this page.
        </p>
      </div>
    </div>
  );
}
