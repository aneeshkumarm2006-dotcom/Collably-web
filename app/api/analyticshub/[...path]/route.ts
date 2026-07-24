/**
 * Analytics Hub — the ONE catch-all serverless function for the whole hub API.
 *
 * Sub-path is parsed from `req.url` (NOT the [...path] query param) so it works
 * identically on Vercel. Everything third-party is called via raw fetch inside
 * the provider modules; this file is dispatch + the security gate + normalized
 * aggregation + caching. Every operator-facing error names the fix.
 */
import { NextResponse, type NextRequest } from 'next/server';

import { secretStatus } from '@/lib/analyticshub/crypto';
import {
  checkPassword,
  freshSessionToken,
  hasPassword,
  isAuthed,
  sessionCookie,
  setPassword,
} from '@/lib/analyticshub/auth';
import {
  getJSON,
  setJSON,
  getCache,
  setCache,
  bustCache,
  isLockedOut,
  recordLoginFail,
  clearLoginFails,
} from '@/lib/analyticshub/store';
import { emptyResult, type HubStatus, type SourceId, type SourceResult } from '@/lib/analyticshub/types';
import * as google from '@/lib/analyticshub/providers/google';
import * as meta from '@/lib/analyticshub/providers/meta';
import * as gads from '@/lib/analyticshub/providers/gads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_PROJECT = { name: 'Local Creator Crew', primary: '#0064E0', accent: '#FF6A3D' };
const googleOAuthAvailable = Boolean(
  process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET,
);

/** Parse the sub-path segments after /api/analyticshub/ from the real URL. */
function subPath(req: NextRequest): string[] {
  const p = new URL(req.url).pathname;
  return p.replace(/^\/api\/analyticshub\/?/, '').replace(/\/+$/, '').split('/').filter(Boolean);
}

function json(data: unknown, init?: number | ResponseInit) {
  return NextResponse.json(data, typeof init === 'number' ? { status: init } : init);
}

async function storeStatus(): Promise<{ ok: boolean; reason?: string }> {
  try {
    // A cheap round-trip proves the DB key works, the collection is reachable,
    // and (on Mongo) that we can read/write — no grants to worry about.
    await getJSON('__health');
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/MONGODB_URI/.test(msg)) return { ok: false, reason: msg };
    return { ok: false, reason: `Storage unreachable: ${msg}` };
  }
}

async function buildStatus(): Promise<HubStatus> {
  const secret = secretStatus();
  const store = secret.ok ? await storeStatus() : { ok: false, reason: 'blocked by secret error' };
  const configured = secret.ok && store.ok;

  const project = (configured && (await getJSON<typeof DEFAULT_PROJECT>('project'))) || DEFAULT_PROJECT;
  const authed = configured ? await isAuthed() : false;
  const needsSetup = configured ? !(await hasPassword()) : false;

  const connections = configured
    ? [
        await google.connectionState('ga4'),
        await google.connectionState('gsc'),
        await meta.connectionState(),
        await gads.connectionState(),
        { source: 'users' as SourceId, connected: false, reconnectNeeded: false, note: 'Not available in this app — signups live in the Local Creator Crew backend, not this dashboard.' },
      ]
    : [];

  return {
    needsSetup,
    authed,
    config: { secret, store },
    project,
    googleOAuthAvailable,
    connections,
  };
}

// Routes reachable without a session. Everything else requires isAuthed().
const PUBLIC_ROUTES = new Set(['status', 'setup', 'login', 'oauth']);

export async function GET(req: NextRequest) {
  const seg = subPath(req);
  const route = seg[0] ?? '';

  if (route === 'status') return json(await buildStatus());

  // OAuth callback lands here (GET) — it establishes the session itself.
  if (route === 'oauth' && seg[1] === 'google' && seg[2] === 'callback') {
    return handleOAuthCallback(req);
  }

  if (!(await gate(route))) return json({ error: 'Not authenticated.' }, 401);

  const url = new URL(req.url);
  // Constrain to strict YYYY-MM-DD before these reach provider query strings
  // (GA4 report bodies, GAQL/Graph date literals) — never trust raw params.
  const from = safeDate(url.searchParams.get('from'), isoDaysAgo(7));
  const to = safeDate(url.searchParams.get('to'), isoDaysAgo(0));
  const refresh = url.searchParams.get('refresh') === '1';

  if (route === 'oauth' && seg[1] === 'google' && seg[2] === 'start') {
    return json({ url: google.oauthStartUrl(url.origin) });
  }
  if (route === 'google' && seg[1] === 'options') return json(await safe(() => google.listOptions()));

  // Data routes (cached per source).
  if (['ga4', 'gsc', 'meta', 'gads', 'users', 'all'].includes(route)) {
    return json(await getData(route, from, to, refresh));
  }
  return json({ error: `Unknown route: ${route}` }, 404);
}

export async function POST(req: NextRequest) {
  const seg = subPath(req);
  const route = seg[0] ?? '';

  // First-run setup: allowed only while no password exists.
  if (route === 'setup') return handleSetup(req);
  if (route === 'login') return handleLogin(req);

  if (!(await gate(route))) return json({ error: 'Not authenticated.' }, 401);

  const body = await safeBody(req);

  switch (route) {
    case 'logout': {
      const res = json({ ok: true });
      res.cookies.set(sessionCookie('', 0));
      return res;
    }
    case 'project': {
      const next = {
        name: String(body.name ?? DEFAULT_PROJECT.name).slice(0, 80),
        primary: String(body.primary ?? DEFAULT_PROJECT.primary),
        accent: String(body.accent ?? DEFAULT_PROJECT.accent),
      };
      await setJSON('project', next);
      return json({ ok: true, project: next });
    }
    case 'password': {
      const pw = String(body.password ?? '');
      if (pw.length < 8) return json({ error: 'Password must be at least 8 characters.' }, 400);
      await setPassword(pw);
      return json({ ok: true });
    }
    case 'google':
      return providerPost('google', seg[1], body);
    case 'meta':
      return providerPost('meta', seg[1], body);
    case 'gads':
      return providerPost('gads', seg[1], body);
    default:
      return json({ error: `Unknown route: ${route}` }, 404);
  }
}

// ── helpers ──────────────────────────────────────────────────────────────────

async function gate(route: string): Promise<boolean> {
  if (PUBLIC_ROUTES.has(route)) return true;
  const secret = secretStatus();
  if (!secret.ok) return false;
  return isAuthed();
}

async function handleSetup(req: NextRequest) {
  const secret = secretStatus();
  if (!secret.ok) return json({ error: secret.reason }, 400);
  const store = await storeStatus();
  if (!store.ok) return json({ error: store.reason }, 400);
  if (await hasPassword()) return json({ error: 'Setup already completed. Use login.' }, 409);

  const body = await safeBody(req);
  const pw = String(body.password ?? '');
  if (pw.length < 8) return json({ error: 'Password must be at least 8 characters.' }, 400);
  await setPassword(pw);
  if (body.project) await setJSON('project', body.project);

  const res = json({ ok: true });
  res.cookies.set(sessionCookie(freshSessionToken()));
  return res;
}

async function handleLogin(req: NextRequest) {
  const secret = secretStatus();
  if (!secret.ok) return json({ error: secret.reason }, 400);
  if (await isLockedOut())
    return json({ error: 'Too many attempts. Try again in 15 minutes.' }, 429);

  const body = await safeBody(req);
  if (!(await checkPassword(String(body.password ?? '')))) {
    await recordLoginFail();
    return json({ error: 'Incorrect password.' }, 401);
  }
  await clearLoginFails();
  const res = json({ ok: true });
  res.cookies.set(sessionCookie(freshSessionToken()));
  return res;
}

async function handleOAuthCallback(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const err = url.searchParams.get('error');
  const dest = new URL('/analyticshub/settings', url.origin);
  if (err || !code) {
    dest.searchParams.set('google', 'error');
    return NextResponse.redirect(dest);
  }
  try {
    await google.handleCallback(code, url.origin);
    dest.searchParams.set('google', 'connected');
  } catch (e) {
    dest.searchParams.set('google', 'error');
    dest.searchParams.set('msg', e instanceof Error ? e.message : 'oauth failed');
  }
  return NextResponse.redirect(dest);
}

/** Dispatch provider POST subroutes; each validates live and busts its cache. */
async function providerPost(
  provider: 'google' | 'meta' | 'gads',
  action: string | undefined,
  body: Record<string, unknown>,
) {
  try {
    if (provider === 'google') {
      if (action === 'select') await google.select(body);
      else if (action === 'service-account') await google.saveServiceAccount(body);
      else if (action === 'disconnect') await google.disconnect();
      else return json({ error: `Unknown google action: ${action}` }, 404);
      await bustCache('ga4');
      await bustCache('gsc');
    } else if (provider === 'meta') {
      if (action === 'accounts') return json(await meta.listAccounts(String(body.token ?? '')));
      if (action === 'select') await meta.select(body);
      else if (action === 'disconnect') await meta.disconnect();
      else return json({ error: `Unknown meta action: ${action}` }, 404);
      await bustCache('meta');
    } else {
      if (action === 'save') await gads.save(body);
      else if (action === 'disconnect') await gads.disconnect();
      else return json({ error: `Unknown gads action: ${action}` }, 404);
      await bustCache('gads');
    }
    return json({ ok: true });
  } catch (e) {
    // Provider validation failures surface the provider's message verbatim.
    return json({ error: e instanceof Error ? e.message : 'Request failed.' }, 400);
  }
}

/** Fetch one source (or all) with 6h caching + per-source failure isolation. */
async function getData(route: string, from: string, to: string, refresh: boolean): Promise<unknown> {
  const fetchers: Record<string, () => Promise<SourceResult>> = {
    ga4: () => google.fetchGA4(from, to),
    gsc: () => google.fetchGSC(from, to),
    meta: () => meta.fetchMeta(from, to),
    gads: () => gads.fetchGads(from, to),
    users: async () => emptyResult('not_connected'),
  };

  if (route !== 'all') {
    return cached(route, from, to, refresh, fetchers[route] ?? (async () => emptyResult('error')));
  }

  const ids: SourceId[] = ['ga4', 'gsc', 'meta', 'gads'];
  const entries = await Promise.all(
    ids.map(async (id) => [id, await cached(id, from, to, refresh, fetchers[id])] as const),
  );
  return Object.fromEntries(entries);
}

async function cached(
  source: string,
  from: string,
  to: string,
  refresh: boolean,
  fetcher: () => Promise<SourceResult>,
): Promise<SourceResult> {
  const key = `${source}:${from}:${to}`;
  if (!refresh) {
    const hit = await getCache<SourceResult>(key);
    if (hit) return hit;
  }
  let result: SourceResult;
  try {
    result = await fetcher();
  } catch (e) {
    return { ...emptyResult('error'), error: e instanceof Error ? e.message : 'Fetch failed.' };
  }
  if (result.status === 'ok') await setCache(key, result); // cache successes only
  return result;
}

async function safe<T>(fn: () => Promise<T>) {
  try {
    return await fn();
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Request failed.' };
  }
}

async function safeBody(req: NextRequest): Promise<Record<string, unknown>> {
  try {
    return (await req.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

/** Accept only a real YYYY-MM-DD date; otherwise fall back (injection-safe). */
function safeDate(v: string | null, fallback: string): string {
  if (v && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v))) return v;
  return fallback;
}
