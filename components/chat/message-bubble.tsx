import { Check, CheckCheck, Clock } from 'lucide-react';

import type { Message } from '@/lib/shared';
import { cn } from '@/lib/utils';
import { shortTime } from '@/lib/chat/time';

/**
 * One chat message bubble. Outgoing sits right on the brand fill; incoming sits
 * left on a card surface. Consecutive messages from the same sender are tightened
 * (the tail is dropped). Outgoing bubbles carry delivery state inline: a clock
 * while the optimistic send is pending, a single check once sent, double checks
 * once the recipient has read it.
 */
export function MessageBubble({
  message,
  mine,
  tight = false,
  animateIn = false,
}: {
  message: Message;
  mine: boolean;
  /** Same sender as the message just above: tighten spacing, drop the tail. */
  tight?: boolean;
  /** Newest bubble: play a one-shot rise/fade as it mounts. Pure CSS, so it
   *  degrades to a plain visible bubble with JS off or reduced motion. */
  animateIn?: boolean;
}) {
  const pending = message._id.startsWith('temp-');

  return (
    <div
      className={cn('flex px-3', mine ? 'justify-end' : 'justify-start', tight ? 'mt-0.5' : 'mt-2.5')}
    >
      <div
        className={cn(
          'max-w-[74%] px-3.5 py-2.5 shadow-[0_1px_1px_rgba(0,0,0,0.04)]',
          mine
            ? 'rounded-[14px_4px_14px_14px] bg-brand text-white'
            : 'rounded-[4px_14px_14px_14px] bg-card text-ink',
          animateIn && 'animate-ls-rise',
        )}
      >
        <p className="whitespace-pre-wrap break-words text-[14px] leading-[1.45]">{message.body}</p>
        <div
          className={cn(
            'mt-0.5 flex items-center justify-end gap-1',
            mine ? 'text-white/70' : 'text-faint',
          )}
        >
          <span className="font-mono text-[10px] leading-none">{shortTime(message.createdAt)}</span>
          {mine &&
            (pending ? (
              <Clock className="h-3 w-3" aria-label="Sending" />
            ) : message.readAt ? (
              <CheckCheck className="h-3.5 w-3.5" aria-label="Read" />
            ) : (
              <Check className="h-3.5 w-3.5" aria-label="Sent" />
            ))}
        </div>
      </div>
    </div>
  );
}

/** Centered date pill between days (WhatsApp-style). */
export function DateSeparator({ label }: { label: string }) {
  return (
    <div className="my-3 flex justify-center">
      <span className="rounded-full bg-secondary px-3 py-1 text-[11.5px] font-semibold tracking-wide text-muted">
        {label}
      </span>
    </div>
  );
}

/** Animated "•••" typing bubble shown on the incoming side. */
export function TypingBubble() {
  return (
    <div className="flex justify-start px-3 pt-2.5">
      <div className="flex items-center gap-1 rounded-[4px_14px_14px_14px] border border-hair bg-card px-3.5 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-faint"
            style={{ animationDelay: `${i * 150}ms`, animationDuration: '1s' }}
          />
        ))}
      </div>
    </div>
  );
}
