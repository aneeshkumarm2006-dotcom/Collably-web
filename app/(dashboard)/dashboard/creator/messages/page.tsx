import type { Metadata } from 'next';
import { MessagesSquare } from 'lucide-react';

export const metadata: Metadata = { title: 'Messages' };

/**
 * Right-pane placeholder when no thread is open. The conversation list lives in
 * the route `layout.tsx` (the split-pane), so on desktop this sits beside it;
 * on mobile the layout shows the list here instead and hides this pane.
 */
export default function CreatorMessagesPage() {
  return (
    <div className="flex h-full items-center justify-center p-8 text-center">
      <div className="max-w-sm">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-brand-soft text-brand">
          <MessagesSquare className="h-7 w-7" />
        </span>
        <h2 className="mt-4 text-xl font-bold text-ink">Your messages</h2>
        <p className="mt-1.5 text-sm text-muted">
          Select a conversation to start chatting with the brands you’re collaborating with.
        </p>
      </div>
    </div>
  );
}
