'use client';
/**
 * Live connection forms for each source. Every save POSTs immediately and shows
 * the API's verbatim error in the card. These are shared by Settings and the
 * Wizard's connect step. No secrets are stored client-side — tokens/keys are
 * typed by the operator and sent straight to the API, never persisted here.
 */
import { useEffect, useState } from 'react';
import { ChevronDown, ExternalLink, LineChart, Megaphone, BadgeDollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/lib/toast';
import type { ConnectionState, HubStatus, SourceId } from '@/lib/analyticshub/types';
import { ConnectionCard } from './connection-card';
import {
  HubError,
  getGoogleOptions,
  getGoogleStart,
  postGadsDisconnect,
  postGadsSave,
  postGoogleDisconnect,
  postGoogleSelect,
  postGoogleServiceAccount,
  postMetaAccounts,
  postMetaDisconnect,
  postMetaSelect,
} from './api';

function connFor(status: HubStatus, source: SourceId): ConnectionState | undefined {
  return status.connections?.find((c) => c.source === source);
}

function errMsg(err: unknown): string {
  return err instanceof HubError ? err.message : 'Something went wrong. Try again.';
}

// --- Google (GA4 + Search Console) -----------------------------------------

export function GoogleConnector({
  status,
  onChanged,
}: {
  status: HubStatus;
  onChanged: () => void | Promise<void>;
}) {
  const ga4 = connFor(status, 'ga4');
  const gsc = connFor(status, 'gsc');
  const connected = Boolean(ga4?.connected || gsc?.connected);
  const reconnectNeeded = Boolean(ga4?.reconnectNeeded || gsc?.reconnectNeeded);
  // Composite state for the badge/labels.
  const state: ConnectionState = {
    source: 'ga4',
    connected,
    reconnectNeeded,
    label: [ga4?.label && `GA4: ${ga4.label}`, gsc?.label && `GSC: ${gsc.label}`]
      .filter(Boolean)
      .join(' · ') || undefined,
  };

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showSa, setShowSa] = useState(false);
  const [keyJson, setKeyJson] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [options, setOptions] = useState<{
    properties: { id: string; name: string }[];
    sites: { url: string }[];
  } | null>(null);

  // After OAuth, load selectable properties/sites.
  useEffect(() => {
    let cancelled = false;
    if (!connected) {
      setOptions(null);
      return;
    }
    getGoogleOptions()
      .then((o) => {
        if (!cancelled) setOptions(o);
      })
      .catch(() => {
        /* options are optional; the operator can still use the SA form */
      });
    return () => {
      cancelled = true;
    };
  }, [connected]);

  async function startOAuth() {
    setError(null);
    setBusy(true);
    try {
      const { url } = await getGoogleStart();
      window.location.href = url;
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  }

  async function saveServiceAccount(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await postGoogleServiceAccount({ keyJson, propertyId, siteUrl });
      toast.success('Google connected via service account');
      setKeyJson('');
      await onChanged();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  async function saveSelection(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await postGoogleSelect({ propertyId, siteUrl });
      toast.success('Property & site saved');
      await onChanged();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    setError(null);
    setBusy(true);
    try {
      await postGoogleDisconnect();
      toast.success('Google disconnected');
      await onChanged();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <ConnectionCard
      title="Google — Analytics & Search Console"
      description="One sign-in covers GA4 and Search Console."
      icon={<LineChart className="h-5 w-5 text-brand" />}
      state={state}
      error={error}
    >
      {status.googleOAuthAvailable ? (
        <Button onClick={startOAuth} disabled={busy}>
          <ExternalLink className="h-4 w-4" />
          {connected ? 'Re-authorize with Google' : 'Sign in with Google'}
        </Button>
      ) : (
        <p className="text-sm text-muted">
          Google OAuth isn&apos;t configured on the server. Use a service account below.
        </p>
      )}

      {/* Property/site selection after OAuth */}
      {connected && options && (options.properties.length > 0 || options.sites.length > 0) && (
        <form onSubmit={saveSelection} className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>GA4 property</Label>
            <Select value={propertyId} onValueChange={setPropertyId}>
              <SelectTrigger>
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                {options.properties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Search Console site</Label>
            <Select value={siteUrl} onValueChange={setSiteUrl}>
              <SelectTrigger>
                <SelectValue placeholder="Select site" />
              </SelectTrigger>
              <SelectContent>
                {options.sites.map((s) => (
                  <SelectItem key={s.url} value={s.url}>
                    {s.url}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={busy || (!propertyId && !siteUrl)}>
              Save selection
            </Button>
          </div>
        </form>
      )}

      {/* Service-account fallback */}
      <div className="mt-4 border-t border-hair pt-3">
        <button
          type="button"
          onClick={() => setShowSa((v) => !v)}
          className="flex items-center gap-1 text-sm font-medium text-muted hover:text-ink"
          aria-expanded={showSa}
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${showSa ? 'rotate-180' : ''}`} />
          Advanced: service account
        </button>
        {showSa && (
          <form onSubmit={saveServiceAccount} className="mt-3 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="g-sa-json">Service account key (JSON)</Label>
              <Textarea
                id="g-sa-json"
                value={keyJson}
                onChange={(e) => setKeyJson(e.target.value)}
                rows={4}
                spellCheck={false}
                placeholder='{ "type": "service_account", ... }'
                className="font-mono text-xs"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="g-sa-prop">GA4 property ID</Label>
                <Input
                  id="g-sa-prop"
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  placeholder="123456789"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="g-sa-site">Search Console site URL</Label>
                <Input
                  id="g-sa-site"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  placeholder="https://example.com/"
                />
              </div>
            </div>
            <Button type="submit" variant="outline" disabled={busy || !keyJson}>
              Save service account
            </Button>
          </form>
        )}
      </div>

      {connected && (
        <div className="mt-4 border-t border-hair pt-3">
          <Button variant="ghost" size="sm" onClick={disconnect} disabled={busy}>
            Disconnect Google
          </Button>
        </div>
      )}
    </ConnectionCard>
  );
}

// --- Meta ------------------------------------------------------------------

export function MetaConnector({
  status,
  onChanged,
}: {
  status: HubStatus;
  onChanged: () => void | Promise<void>;
}) {
  const state = connFor(status, 'meta');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [token, setToken] = useState('');
  const [accounts, setAccounts] = useState<{ id: string; name: string }[] | null>(null);
  const [accountId, setAccountId] = useState('');

  async function loadAccounts(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { accounts: list } = await postMetaAccounts(token);
      setAccounts(list);
      if (list.length === 0) setError('No ad accounts found for this token.');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  async function select(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await postMetaSelect({ token, accountId });
      toast.success('Meta ad account connected');
      setToken('');
      setAccounts(null);
      setAccountId('');
      await onChanged();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    setError(null);
    setBusy(true);
    try {
      await postMetaDisconnect();
      toast.success('Meta disconnected');
      await onChanged();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <ConnectionCard
      title="Meta Ads"
      description="Paste a long-lived access token, then choose an ad account."
      icon={<Megaphone className="h-5 w-5 text-grape" />}
      state={state}
      error={error}
    >
      <form onSubmit={loadAccounts} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="meta-token">Access token</Label>
          <Input
            id="meta-token"
            type="password"
            autoComplete="off"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="EAAB..."
          />
        </div>
        <Button type="submit" variant="outline" disabled={busy || !token}>
          Load ad accounts
        </Button>
      </form>

      {accounts && accounts.length > 0 && (
        <form onSubmit={select} className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <Label>Ad account</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name} ({a.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={busy || !accountId}>
            Connect account
          </Button>
        </form>
      )}

      {state?.connected && (
        <div className="mt-4 border-t border-hair pt-3">
          <Button variant="ghost" size="sm" onClick={disconnect} disabled={busy}>
            Disconnect Meta
          </Button>
        </div>
      )}
    </ConnectionCard>
  );
}

// --- Google Ads ------------------------------------------------------------

export function GoogleAdsConnector({
  status,
  onChanged,
}: {
  status: HubStatus;
  onChanged: () => void | Promise<void>;
}) {
  const state = connFor(status, 'gads');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    developerToken: '',
    clientId: '',
    clientSecret: '',
    refreshToken: '',
    customerId: '',
    loginCustomerId: '',
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const required = ['developerToken', 'clientId', 'clientSecret', 'refreshToken', 'customerId'] as const;
  const canSave = required.every((k) => form[k].trim().length > 0);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await postGadsSave({
        developerToken: form.developerToken,
        clientId: form.clientId,
        clientSecret: form.clientSecret,
        refreshToken: form.refreshToken,
        customerId: form.customerId,
        loginCustomerId: form.loginCustomerId || undefined,
      });
      toast.success('Google Ads connected');
      setForm((f) => ({ ...f, clientSecret: '', refreshToken: '' }));
      await onChanged();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    setError(null);
    setBusy(true);
    try {
      await postGadsDisconnect();
      toast.success('Google Ads disconnected');
      await onChanged();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  const fields: { key: keyof typeof form; label: string; secret?: boolean; optional?: boolean }[] = [
    { key: 'developerToken', label: 'Developer token', secret: true },
    { key: 'clientId', label: 'OAuth client ID' },
    { key: 'clientSecret', label: 'OAuth client secret', secret: true },
    { key: 'refreshToken', label: 'Refresh token', secret: true },
    { key: 'customerId', label: 'Customer ID' },
    { key: 'loginCustomerId', label: 'Login customer ID (optional)', optional: true },
  ];

  return (
    <ConnectionCard
      title="Google Ads"
      description="Enter OAuth + API credentials for your Ads account."
      icon={<BadgeDollarSign className="h-5 w-5 text-warm" />}
      state={state}
      error={error}
    >
      <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label htmlFor={`gads-${f.key}`}>{f.label}</Label>
            <Input
              id={`gads-${f.key}`}
              type={f.secret ? 'password' : 'text'}
              autoComplete="off"
              value={form[f.key]}
              onChange={set(f.key)}
            />
          </div>
        ))}
        <div className="sm:col-span-2">
          <Button type="submit" disabled={busy || !canSave}>
            Save Google Ads
          </Button>
        </div>
      </form>

      {state?.connected && (
        <div className="mt-4 border-t border-hair pt-3">
          <Button variant="ghost" size="sm" onClick={disconnect} disabled={busy}>
            Disconnect Google Ads
          </Button>
        </div>
      )}
    </ConnectionCard>
  );
}

/** All three connectors stacked — reused by Settings and the Wizard. */
export function ConnectorStack({
  status,
  onChanged,
}: {
  status: HubStatus;
  onChanged: () => void | Promise<void>;
}) {
  return (
    <div className="space-y-4">
      <GoogleConnector status={status} onChanged={onChanged} />
      <MetaConnector status={status} onChanged={onChanged} />
      <GoogleAdsConnector status={status} onChanged={onChanged} />
    </div>
  );
}
