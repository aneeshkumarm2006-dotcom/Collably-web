'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, Send } from 'lucide-react';

import { contactSchema, type ContactValues } from '@/lib/contact';
import { fieldErrors } from '@/lib/auth/schemas';
import { track } from '@/lib/analytics';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { Field } from '@/components/auth/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StickerButton } from '@/components/shared/sticker';

const EMPTY: ContactValues = { name: '', email: '', topic: 'General', message: '' };

/** "I'm a…" role pills → mapped onto the schema's `topic` enum values. */
const ROLE_OPTIONS: { label: string; topic: ContactValues['topic'] }[] = [
  { label: 'Creator', topic: 'For creators' },
  { label: 'Business', topic: 'For businesses' },
  { label: 'Press', topic: 'Press' },
];

/** Public contact form → POST /api/contact, with inline validation + a sent state. */
export function ContactForm({ defaultTopic }: { defaultTopic?: ContactValues['topic'] }) {
  const [values, setValues] = useState<ContactValues>({
    ...EMPTY,
    topic: defaultTopic ?? 'General',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (patch: Partial<ContactValues>) => setValues((v) => ({ ...v, ...patch }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(data.message ?? 'Could not send your message');
      }
      track('contact_submitted', { topic: parsed.data.topic });
      setSent(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="sticker flex flex-col items-center rounded-card bg-card p-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border-outline border-ink bg-money text-white">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h3 className="mt-5 font-display text-xl font-bold text-ink">Message sent</h3>
        <p className="mt-2 max-w-sm text-sm text-muted">
          Thanks for reaching out, {values.name.split(' ')[0] || 'there'}. We&apos;ll get back to you
          at {values.email} as soon as we can.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="sticker rounded-card bg-card p-6 sm:p-8"
    >
      <div className="grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Name" htmlFor="contact-name" error={errors.name}>
            <Input
              id="contact-name"
              value={values.name}
              onChange={(e) => set({ name: e.target.value })}
              autoComplete="name"
              aria-invalid={!!errors.name}
            />
          </Field>

          <Field label="Email" htmlFor="contact-email" error={errors.email}>
            <Input
              id="contact-email"
              type="email"
              value={values.email}
              onChange={(e) => set({ email: e.target.value })}
              autoComplete="email"
              aria-invalid={!!errors.email}
            />
          </Field>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-ink">I&apos;m a…</legend>
          <div className="flex flex-wrap gap-2">
            {ROLE_OPTIONS.map((opt) => {
              const selected = values.topic === opt.topic;
              return (
                <button
                  key={opt.label}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => set({ topic: opt.topic })}
                  className={cn(
                    'rounded-full border-outline px-4 py-2 font-mono text-[13px] font-semibold uppercase tracking-[0.06em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
                    selected
                      ? 'border-ink bg-brand text-white'
                      : 'border-ink bg-card text-muted hover:bg-yellow hover:text-ink',
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <Field label="Message" htmlFor="contact-message" error={errors.message}>
          <Textarea
            id="contact-message"
            rows={5}
            value={values.message}
            onChange={(e) => set({ message: e.target.value })}
            placeholder="How can we help?"
            aria-invalid={!!errors.message}
          />
        </Field>

        <StickerButton type="submit" size="lg" disabled={submitting} className="w-full">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Sending…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" /> Send message
            </>
          )}
        </StickerButton>
      </div>
    </form>
  );
}
