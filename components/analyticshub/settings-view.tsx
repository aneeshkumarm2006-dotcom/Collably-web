'use client';
/**
 * Settings: live connection cards for every source, a project identity card,
 * and change-password. Reads the ?google=connected|error&msg= param set after
 * the OAuth redirect and surfaces it (toast + inline), then cleans the URL.
 * All mutations go through the shared connectors/forms which POST live and show
 * verbatim API errors.
 */
import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from '@/lib/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHub } from './context';
import { ConnectorStack } from './connectors';
import { ProjectForm, PasswordForm } from './project-cards';

export function SettingsView() {
  const { status, reloadStatus } = useHub();
  const params = useSearchParams();
  const router = useRouter();
  const handled = useRef(false);

  // Surface the OAuth redirect result once, then strip the query params.
  useEffect(() => {
    const google = params.get('google');
    if (!google || handled.current) return;
    handled.current = true;
    const msg = params.get('msg');
    if (google === 'connected') {
      toast.success('Google connected');
      void reloadStatus();
    } else if (google === 'error') {
      toast.error(msg || 'Google connection failed');
    }
    router.replace('/analyticshub/settings');
  }, [params, router, reloadStatus]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink">Settings</h1>
        <p className="mt-1 text-sm text-muted">Connect data sources and manage this dashboard.</p>
      </header>

      <section className="space-y-4">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-faint">
          Data sources
        </h2>
        <ConnectorStack status={status} onChanged={reloadStatus} />
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-faint">
          Dashboard
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>Project</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectForm project={status.project} onSaved={reloadStatus} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Change password</CardTitle>
          </CardHeader>
          <CardContent>
            <PasswordForm />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
