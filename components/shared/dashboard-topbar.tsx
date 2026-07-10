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
 * DashboardTopBar. Translucent over the grey page with a blur, per the designs.
 *
 * Supports either a breadcrumb trail (deep routes) or the design's eyebrow +
 * page-title pair. Breadcrumbs stay rendered for assistive tech even when a
 * title is shown, so the route's position in the hierarchy is never lost.
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
        'flex min-w-0 items-center gap-2 text-sm text-muted',
        title && 'sr-only',
      )}
    >
      {breadcrumbs.map((c, i) => {
        const last = i === breadcrumbs.length - 1;
        return (
          <span key={`${c.label}-${i}`} className="flex min-w-0 items-center gap-2">
            {c.href && !last ? (
              <Link href={c.href} className="truncate transition-colors hover:text-ink">
                {c.label}
              </Link>
            ) : (
              <span className={cn('truncate', last && 'font-semibold text-ink')}>{c.label}</span>
            )}
            {!last && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-faint" />}
          </span>
        );
      })}
    </nav>
  );

  return (
    <header
      className={cn(
        'sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-hair bg-page/85 px-5 py-3.5 backdrop-blur-[10px] sm:px-7',
        className,
      )}
    >
      <div className="min-w-0">
        {crumbs}
        {title && (
          <>
            {eyebrow && (
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-faint">
                {eyebrow}
              </p>
            )}
            <h1 className="truncate text-[20px] font-bold text-ink">{title}</h1>
          </>
        )}
      </div>

      <div className="flex items-center gap-1.5">
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
