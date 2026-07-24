/**
 * Contact form endpoint. Validates the submission server-side and forwards it to
 * the support inbox via Resend.
 *
 * This route is a compliance surface, not just a marketing nicety: the Privacy
 * Policy points GDPR/CCPA rights requests at this form, so a submission that is
 * only logged and dropped is a missed statutory request. It now emails
 * `config.email.contactTo`.
 *
 * Delivery mirrors the backend's `services/resend.ts` contract on purpose (same
 * env vars, same best-effort semantics): a plain `fetch` to the Resend HTTP API
 * rather than the SDK, so the website takes no new dependency. If Resend isn't
 * configured we log a dev-only warning and still return `{ ok: true }` — the
 * visitor gets the same experience they do today instead of a 500.
 *
 * PII discipline: the submitter's name/message never reach the logs, and their
 * email is masked. Both are attacker-controlled strings, so they'd otherwise put
 * CRLF-injectable user input into server logs.
 */
import { NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { contactSchema, type ContactValues } from '@/lib/contact';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

// Abuse guard: this endpoint is unauthenticated and now sends mail, so an
// unbounded caller could use it to flood the support inbox. Per-process memory
// only (counts are per-lambda on Vercel and reset on cold start), which is a
// speed-bump rather than a guarantee — enough for a contact form.
const MAX_SUBMISSIONS = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const submissions = new Map<string, { count: number; resetAt: number }>();

/**
 * Client IP for keying the limiter. Prefer platform-set headers the edge
 * controls over the raw client-supplied `x-forwarded-for`, which an attacker can
 * rotate per request to dodge the limit.
 */
function clientIp(req: Request): string {
  const vercel = req.headers.get('x-vercel-forwarded-for');
  if (vercel) return vercel.split(',')[0]!.trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  return 'unknown';
}

/** Count this submission; `true` when the caller is over the window's budget. */
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = submissions.get(ip);
  if (!entry || now > entry.resetAt) {
    submissions.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_SUBMISSIONS;
}

/** Mask an email for logs — first char + domain only, so recipient/sender PII
 * doesn't accumulate in server logs. */
function maskEmail(email: string): string {
  const at = email.indexOf('@');
  if (at <= 0) return '***';
  return `${email[0]}***${email.slice(at)}`;
}

/** Minimal HTML escape so submitted values can't break (or inject into) the markup. */
function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Send one submission to the support inbox. Never throws — returns `false` when
 * skipped (unconfigured) or on transport/API error, so the caller can treat
 * email as best-effort.
 */
async function forwardToSupport(values: ContactValues): Promise<boolean> {
  const { resendApiKey, resendFrom, contactTo } = config.email;
  if (!resendApiKey || !resendFrom) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[contact] Resend is not configured (RESEND_API_KEY / RESEND_FROM unset) — not sent');
    }
    return false;
  }

  const { name, email, topic, message } = values;
  const subject = `[Contact · ${topic}] ${name}`;
  const html = `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a;">
  <h2 style="margin:0 0 16px;font-size:18px;">New contact form submission</h2>
  <p style="margin:0 0 4px;"><strong>Name:</strong> ${esc(name)}</p>
  <p style="margin:0 0 4px;"><strong>Email:</strong> ${esc(email)}</p>
  <p style="margin:0 0 16px;"><strong>Topic:</strong> ${esc(topic)}</p>
  <p style="margin:0 0 8px;"><strong>Message:</strong></p>
  <p style="white-space:pre-wrap;margin:0;">${esc(message)}</p>
</body></html>`;
  const text = [
    'New contact form submission',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    `Topic: ${topic}`,
    '',
    'Message:',
    message,
  ].join('\n');

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: resendFrom,
        to: contactTo,
        // Replying from the support inbox goes straight back to the submitter.
        reply_to: email,
        subject,
        html,
        text,
      }),
    });

    if (!res.ok) {
      // Body is Resend's own error JSON (no key, no submitted content) — safe to
      // log, truncated.
      const body = await res.text().catch(() => '');
      console.error(`[contact] Resend responded ${res.status}: ${body.slice(0, 200)}`);
      return false;
    }
    return true;
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'unknown transport error';
    console.error(`[contact] send failed for ${maskEmail(email)}: ${reason}`);
    return false;
  }
}

export async function POST(request: Request) {
  if (isRateLimited(clientIp(request))) {
    return NextResponse.json(
      { message: 'Too many messages from this network. Please try again later.' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { message: first?.message ?? 'Please check the form and try again' },
      { status: 422 },
    );
  }

  const { topic } = parsed.data;
  const sent = await forwardToSupport(parsed.data);
  // Do NOT log the submitter's name/email/message — that writes PII (and
  // CRLF-injectable user input) into server logs. Log only the non-identifying
  // topic plus whether delivery succeeded.
  console.info(`[contact] received a "${topic}" submission (delivered=${sent})`);

  // Always acknowledge: a provider outage is ours to fix from the logs, not the
  // visitor's to retry into.
  return NextResponse.json({ ok: true });
}
