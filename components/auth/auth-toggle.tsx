'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { sanitizeNext } from '@/lib/auth/redirect';

/**
 * The top-right segmented toggle on the form panel. Two `next/link`s (NOT local
 * state) so login and signup stay separate routes. The `next` redirect param is
 * carried across so a deep-link target survives the switch. Forgot / reset are
 * part of the login flow, so "Log in" reads active there.
 *
 * `next` is threaded down from the server page rather than read here with
 * `useSearchParams()`: that hook opts the whole route out of static prerender,
 * and /forgot-password + /reset-password are otherwise fully static.
 */
const TABS = [
  { key: 'login', label: 'Log in', href: '/login' },
  { key: 'signup', label: 'Sign up', href: '/signup' },
] as const;

export function AuthToggle({ next: nextParam, className }: { next?: string; className?: string }) {
  const pathname = usePathname();
  const next = sanitizeNext(nextParam);
  const active = pathname.startsWith('/signup') ? 'signup' : 'login';

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full border-2 border-ink bg-card p-1 shadow-sticker',
        className,
      )}
      role="tablist"
      aria-label="Log in or sign up"
    >
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        const href = next ? `${tab.href}?next=${encodeURIComponent(next)}` : tab.href;
        return (
          <Link
            key={tab.key}
            href={href}
            role="tab"
            aria-selected={isActive}
            className={cn(
              'rounded-full px-4 py-1.5 font-display text-[13px] font-semibold transition-colors',
              isActive ? 'bg-ink text-white' : 'text-ink hover:text-brand',
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
