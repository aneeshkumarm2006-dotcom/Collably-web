'use client';

import { useRef, useState } from 'react';
import { SendHorizonal } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * Message input row: an auto-growing textarea + a circular send button. Owns its
 * draft text; reports typing changes (for the indicator) and hands the trimmed
 * body to `onSend`. Enter sends; Shift+Enter inserts a newline.
 */
export function ChatComposer({
  onSend,
  onTyping,
  disabled = false,
  quickReplies,
}: {
  onSend: (body: string) => void;
  onTyping?: (typing: boolean) => void;
  disabled?: boolean;
  /** Optional one-tap phrases that prefill (not send) the input. */
  quickReplies?: readonly string[];
}) {
  const [text, setText] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);
  const trimmed = text.trim();

  function grow() {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }

  /** Prefill the draft (does not send) and hand focus to the textarea. */
  function prefill(value: string) {
    if (disabled) return;
    setText(value);
    onTyping?.(value.trim().length > 0);
    requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
      grow();
    });
  }

  function send() {
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
    onTyping?.(false);
    requestAnimationFrame(() => {
      if (ref.current) ref.current.style.height = 'auto';
    });
  }

  return (
    <div className="border-t-2 border-ink bg-card px-3 py-2.5">
      {quickReplies && quickReplies.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-2">
          {quickReplies.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => prefill(q)}
              disabled={disabled}
              className="rounded-full border-2 border-ink bg-brand-soft px-3 py-1.5 text-[12.5px] font-semibold text-brand transition-all hover:-translate-y-px hover:shadow-[2px_2px_0_var(--ink)] disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2">
        <textarea
          ref={ref}
          value={text}
          rows={1}
          onChange={(e) => {
            setText(e.target.value);
            onTyping?.(e.target.value.trim().length > 0);
            grow();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Message…"
          aria-label="Message"
          className="max-h-[140px] flex-1 resize-none rounded-[18px] border-2 border-ink bg-page px-4 py-2.5 text-sm text-ink outline-none transition-shadow placeholder:text-faint focus-visible:shadow-focus focus:bg-card"
        />
        <button
          type="button"
          onClick={send}
          disabled={!trimmed || disabled}
          aria-label="Send message"
          className={cn(
            'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-brand text-white shadow-[2px_2px_0_var(--ink)] transition-all hover:-translate-y-px hover:shadow-[3px_3px_0_var(--ink)] active:translate-y-0 active:shadow-[1px_1px_0_var(--ink)]',
            (!trimmed || disabled) && 'opacity-50',
          )}
        >
          <SendHorizonal className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
