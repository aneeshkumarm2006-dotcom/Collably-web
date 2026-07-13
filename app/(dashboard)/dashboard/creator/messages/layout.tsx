'use client';

import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/auth-provider';
import { ConversationList } from '@/components/chat/conversation-list';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Messages split-pane: the conversation list (left) sits beside the active
 * thread / placeholder (right), filling the dashboard content area. On mobile it
 * collapses to a single pane — the list on the index route, the thread once a
 * conversation is open (the thread's own back button returns to the list).
 */
export default function CreatorMessagesLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname() ?? '';
  const hasActive = /\/messages\/[^/]+/.test(pathname);

  return (
    <div className="flex h-[calc(100dvh-4rem)] overflow-hidden md:h-[calc(100vh-4rem)]">
      <aside
        className={cn(
          'flex w-full shrink-0 flex-col overflow-y-auto border-r-2 border-ink bg-card md:w-[286px]',
          hasActive && 'hidden md:flex',
        )}
      >
        <div className="border-b-2 border-ink px-5 py-4">
          <h1 className="font-display text-[16px] font-bold text-ink">Messages</h1>
          <p className="mt-0.5 text-[12px] text-faint">
            Chat with the brands you’re collaborating with.
          </p>
        </div>
        <div className="p-4">
          {user ? (
            <ConversationList role="creator" meId={user.id} />
          ) : (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-[68px] w-full rounded-card" />
              ))}
            </div>
          )}
        </div>
      </aside>
      <section className={cn('min-w-0 flex-1 bg-page', !hasActive && 'hidden md:block')}>
        {children}
      </section>
    </div>
  );
}
