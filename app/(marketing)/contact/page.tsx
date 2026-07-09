import type { Metadata } from 'next';
import { Mail, MapPin, MessageSquare } from 'lucide-react';

import { buildMetadata } from '@/lib/seo';
import { CONTACT_TOPICS, type ContactTopic } from '@/lib/contact';
import { Section, SectionLabel } from '@/components/marketing/section';
import { ContactForm } from '@/components/marketing/contact-form';

export const metadata: Metadata = buildMetadata({
  title: 'Contact',
  description:
    'Get in touch with the LocalShout team about creator collabs, running campaigns, press, or support. We usually reply within one business day.',
  path: '/contact',
  ogEyebrow: 'Contact',
});

const CHANNELS = [
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@localshout.ca',
    href: 'mailto:hello@localshout.ca',
    tone: 'bg-brand-soft text-brand',
  },
  {
    icon: MessageSquare,
    label: 'Support',
    value: 'support@localshout.ca',
    href: 'mailto:support@localshout.ca',
    tone: 'bg-warm-soft text-warm',
  },
  { icon: MapPin, label: 'HQ', value: 'Toronto · Vancouver', tone: 'bg-grape-soft text-grape' },
];

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const { topic } = await searchParams;
  const defaultTopic = CONTACT_TOPICS.includes(topic as ContactTopic)
    ? (topic as ContactTopic)
    : undefined;

  return (
    <Section tone="page">
      <div className="mb-12 text-center">
        <SectionLabel className="justify-center">Contact</SectionLabel>
        <h1 className="mt-5 text-balance font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-5xl">
          Let&apos;s talk.
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-pretty text-lg text-muted">
          Questions, press, or partnerships — we usually reply within a day.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
        <ul className="flex flex-col gap-4">
          {CHANNELS.map((c) => (
            <li
              key={c.label}
              className="flex items-start gap-4 rounded-2xl border border-hair bg-card p-5 shadow-card"
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${c.tone}`}
              >
                <c.icon className="h-5 w-5" />
              </span>
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.08em] text-faint">
                  {c.label}
                </div>
                {c.href ? (
                  <a
                    href={c.href}
                    className="text-[15px] font-bold text-ink transition-colors hover:text-brand"
                  >
                    {c.value}
                  </a>
                ) : (
                  <div className="text-[15px] font-bold text-ink">{c.value}</div>
                )}
              </div>
            </li>
          ))}
        </ul>

        <ContactForm defaultTopic={defaultTopic} />
      </div>
    </Section>
  );
}
