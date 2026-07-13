'use client';

import Link from 'next/link';
import { Bell, CheckCheck } from 'lucide-react';

import { useInfiniteNotifications, useMarkAllNotificationsRead } from '@/lib/api/queries';
import { NOTIF_CHIP_CLASS, notificationHref, notificationVisual } from '@/lib/notifications';
import { formatRelativeTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Reveal } from '@/components/shared/reveal';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function NotificationsClient({ role }: { role: 'creator' | 'business' }) {
  const query = useInfiniteNotifications({ limit: 20 });
  const markAll = useMarkAllNotificationsRead();

  const notifications = query.data?.pages.flatMap((p) => p.data) ?? [];
  const unreadCount = query.data?.pages[0]?.unreadCount ?? 0;
  // Reveal only the initial page: `useReveal` scans once on mount, so rows
  // appended by "Load more" would never receive `.in` and stay hidden. Those
  // later rows simply render visible (no `.r`), which is the safe degrade.
  const firstPageIds = new Set(query.data?.pages[0]?.data.map((n) => n._id));

  return (
    <>
      <div className="mb-4 flex items-center justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => markAll.mutate()}
          disabled={unreadCount === 0 || markAll.isPending}
        >
          <CheckCheck className="h-4 w-4" /> Mark all read
        </Button>
      </div>

      {query.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-card" />
          ))}
        </div>
      ) : query.isError ? (
        <EmptyState
          icon={<Bell />}
          title="Couldn’t load notifications"
          description="Something went wrong. Please try again."
          action={
            <Button variant="outline" onClick={() => query.refetch()}>
              Retry
            </Button>
          }
        />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell />}
          title="No notifications yet"
          description="Updates about your applications, collabs, and submissions will show up here."
        />
      ) : (
        <>
          <Reveal as="ul" className="sticker overflow-hidden rounded-card bg-card">
            {notifications.map((n) => {
              const { icon: Icon, dot } = notificationVisual(n.type);
              return (
                <li
                  key={n._id}
                  className={cn(
                    'border-b border-divider last:border-b-0',
                    firstPageIds.has(n._id) && 'r',
                  )}
                >
                  <Link
                    href={notificationHref(n.deepLinkPath, role)}
                    className={cn(
                      'flex items-center gap-3.5 px-5 py-4 transition-colors hover:bg-elev',
                      !n.isRead && 'bg-brand-soft',
                    )}
                  >
                    <span
                      className={cn(
                        'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[11px] border-2 border-ink [&_svg]:h-[18px] [&_svg]:w-[18px]',
                        NOTIF_CHIP_CLASS[dot],
                      )}
                    >
                      <Icon />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14.5px] font-semibold leading-snug text-ink">{n.message}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3.5">
                      <span className="text-[12px] text-faint">{formatRelativeTime(n.createdAt)}</span>
                      <span
                        className={cn(
                          'h-[9px] w-[9px] rounded-full',
                          n.isRead ? 'bg-transparent' : 'bg-brand',
                        )}
                        aria-label={n.isRead ? undefined : 'Unread'}
                      />
                    </div>
                  </Link>
                </li>
              );
            })}
          </Reveal>

          {query.hasNextPage && (
            <div className="mt-5 text-center">
              <Button
                variant="outline"
                onClick={() => query.fetchNextPage()}
                disabled={query.isFetchingNextPage}
              >
                {query.isFetchingNextPage ? 'Loading…' : 'Load more'}
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}
