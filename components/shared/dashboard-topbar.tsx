'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import type { SessionUser } from '@/components/providers/auth-provider';
import { cn } from '@/lib/utils';
import { NotificationBell, type NotificationItem } from '@/components/shared/notification-bell';
import { UserMenu } from '@/components/shared/user-menu';

export interface Crumb {
  label: string;
  href?: string;
}

export interface DashboardTopBarProps {
  breadcrumbs: Crumb[];
  user: Pick<SessionUser, 'name' | 'email' | 'role' | 'avatar'>;
  notifications?: NotificationItem[];
  /** Server-authoritative unread count for the bell badge (may exceed the items shown). */
  unreadNotifications?: number;
  onMarkAllRead?: () => void;
  /** "View all notifications" target for the bell dropdown. */
  notificationsHref?: string;
  onLogout?: () => void;
  /** Uppercase mono label above the title — e.g. "Wednesday, Jul 10". */
  eyebrow?: string;
  /** Large page title. When set it replaces the breadcrumb row visually. */
  title?: string;
  /** Search field slot, rendered before the bell. */
  search?: React.ReactNode;
  /** Primary action slot, rendered after the avatar menu. */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * DashboardTopBar — sticker language: a solid cream bar with a hard ink
 * underline (never a translucent blur), a Space Grotesk page title, and a coral
 * mono eyebrow. Supports either a breadcrumb trail (deep routes) or the
 * eyebrow + title pair; breadcrumbs stay in the DOM for assistive tech even when
 * a title is shown.
 */
export function DashboardTopBar({
  breadcrumbs,
  user,
  notifications = [],
  unreadNotifications,
  onMarkAllRead,
  notificationsHref,
  onLogout,
  eyebrow,
  title,
  search,
  actions,
  className,
}: DashboardTopBarProps) {
  const crumbs = (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        'flex min-w-0 items-center gap-2 font-mono text-[12px] font-medium text-muted',
        title && 'sr-only',
      )}
    >
      {breadcrumbs.map((c, i) => {
        const last = i === breadcrumbs.length - 1;
        return (
          <span key={`${c.label}-${i}`} className="flex min-w-0 items-center gap-2">
            {c.href && !last ? (
              <Link href={c.href} className="truncate transition-colors hover:text-brand">
                {c.label}
              </Link>
            ) : (
              <span className={cn('truncate', last && 'font-bold text-ink')}>{c.label}</span>
            )}
            {!last && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink/30" />}
          </span>
        );
      })}
    </nav>
  );

  return (
    <header
      className={cn(
        'sticky top-0 z-20 flex items-center justify-between gap-4 border-b-[2.5px] border-ink bg-page px-5 py-3 sm:px-7',
        className,
      )}
    >
      <div className="min-w-0">
        {crumbs}
        {title && (
          <>
            {eyebrow && (
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-coral">
                {eyebrow}
              </p>
            )}
            <h1 className="truncate font-display text-[22px] font-bold tracking-[-0.02em] text-ink">
              {title}
            </h1>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {search}
        <NotificationBell
          notifications={notifications}
          unreadCount={unreadNotifications}
          onMarkAllRead={onMarkAllRead}
          viewAllHref={notificationsHref}
        />
        <UserMenu user={user} onLogout={onLogout} />
        {actions}
      </div>
    </header>
  );
}
