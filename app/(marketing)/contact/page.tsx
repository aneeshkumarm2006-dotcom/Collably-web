import type { Metadata } from 'next';
import { Mail, MapPin, MessageSquare } from 'lucide-react';

import { buildMetadata } from '@/lib/seo';
import { CONTACT_TOPICS, type ContactTopic } from '@/lib/contact';
import { Section, SectionLabel } from '@/components/marketing/section';
import { ContactForm } from '@/components/marketing/contact-form';
import { Reveal } from '@/components/shared/reveal';
import { StickerCard } from '@/components/shared/sticker';

export const metadata: Metadata = buildMetadata({
  title: 'Contact',
  description:
    'Get in touch with the Local Creator Crew team about creator collabs, running campaigns, press, or support. We usually reply within one business day.',
  path: '/contact',
  ogEyebrow: 'Contact',
});

const CHANNELS = [
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@localcreatorcrew.com',
    href: 'mailto:hello@localcreatorcrew.com',
    tone: 'bg-brand-soft text-brand',
  },
  {
    icon: MessageSquare,
    label: 'Support',
    value: 'support@localcreatorcrew.com',
    href: 'mailto:support@localcreatorcrew.com',
    tone: 'bg-coral text-white',
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
        <Reveal as="ul" className="flex flex-col gap-4">
          {CHANNELS.map((c) => (
            <StickerCard
              as="li"
              key={c.label}
              lift
              className="group r flex items-start gap-4 p-5 hover:!-translate-y-1"
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-card border-outline border-ink transition-transform duration-150 group-hover:-rotate-6 ${c.tone}`}
              >
                <c.icon className="h-5 w-5" />
              </span>
              <div>
                <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-coral">
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
            </StickerCard>
          ))}
        </Reveal>

        <ContactForm defaultTopic={defaultTopic} />
      </div>
    </Section>
  );
}
