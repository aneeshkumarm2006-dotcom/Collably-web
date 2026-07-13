import type { Metadata } from 'next';
import { MessagesSquare } from 'lucide-react';

export const metadata: Metadata = { title: 'Messages' };

/**
 * Right-pane placeholder when no thread is open. The conversation list lives in
 * the route `layout.tsx` (the split-pane), so on desktop this sits beside it;
 * on mobile the layout shows the list here instead and hides this pane.
 */
export default function BusinessMessagesPage() {
  return (
    <div className="flex h-full items-center justify-center p-8 text-center">
      <div className="max-w-sm">
        <span className="mx-auto flex h-16 w-16 -rotate-3 items-center justify-center rounded-[18px] border-2 border-ink bg-yellow text-ink shadow-[3px_3px_0_var(--ink)]">
          <MessagesSquare className="h-7 w-7" />
        </span>
        <h2 className="mt-4 font-display text-xl font-bold text-ink">Your messages</h2>
        <p className="mt-1.5 text-sm text-muted">
          Select a conversation to start chatting with the creators working on your campaigns.
        </p>
      </div>
    </div>
  );
}
