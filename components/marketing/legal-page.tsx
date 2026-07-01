'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { Container } from '@/components/marketing/section';
import { Prose } from '@/components/marketing/prose';

const NAV = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Cookie Policy', href: '/cookies' },
];

/**
 * Shared chrome for legal pages (privacy / terms / cookies): a sticky left
 * side-nav that tabs between the three policies, and a right column with a
 * "last updated" stamp, title, intro, and the long-form body in `Prose`.
 */
export function LegalPage({
  title,
  lastUpdated,
  intro,
  children,
}: {
  title: string;
  lastUpdated: string;
  intro?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <article className="bg-page py-16 sm:py-20">
      <Container size="default">
        <div className="grid gap-11 lg:grid-cols-[220px_1fr]">
          {/* Side-nav */}
          <nav aria-label="Legal" className="lg:sticky lg:top-[90px] lg:self-start">
            <p className="mb-3 text-[13px] font-extrabold uppercase tracking-[0.1em] text-faint">
              Legal
            </p>
            <ul className="flex flex-col gap-1">
              {NAV.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'block rounded-[11px] px-3.5 py-2.5 text-sm font-semibold transition-colors',
                        active
                          ? 'bg-brand-soft text-brand dark:bg-brand/15'
                          : 'text-muted hover:bg-secondary hover:text-ink',
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Content */}
          <div className="min-w-0 max-w-[720px]">
            <p className="text-sm text-faint">Last updated {lastUpdated}</p>
            <h1 className="mt-2 text-balance font-display text-3xl font-extrabold leading-[1.1] tracking-[-0.03em] sm:text-[42px]">
              {title}
            </h1>
            {intro && (
              <p className="mt-4 text-pretty text-lg leading-relaxed text-muted">{intro}</p>
            )}
            <Prose className="mt-8 text-[15.5px] text-muted dark:text-muted [&_h2]:text-[22px]">
              {children}
            </Prose>
          </div>
        </div>
      </Container>
    </article>
  );
}
