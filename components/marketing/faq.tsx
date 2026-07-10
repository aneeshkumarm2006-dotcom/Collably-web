'use client';

import { useId, useState } from 'react';

import { cn } from '@/lib/utils';
import type { FaqItem } from '@/lib/faq';

export type { FaqItem } from '@/lib/faq';

/**
 * A FAQ accordion of rounded white cards with +/− circle toggles. Keeps single-open
 * (collapsible) accordion behavior. `defaultOpenFirst` opens the first item on mount.
 * Render alongside `faqPageJsonLd(items)` for rich results.
 */
export function Faq({
  items,
  defaultOpenFirst = true,
  className,
}: {
  items: FaqItem[];
  defaultOpenFirst?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(defaultOpenFirst ? 0 : null);
  const baseId = useId();

  return (
    <div className={cn('flex w-full flex-col gap-3', className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        const btnId = `${baseId}-btn-${i}`;
        const panelId = `${baseId}-panel-${i}`;
        return (
          <div
            key={i}
            className="sticker rounded-card bg-card transition"
          >
            <h3 className="m-0">
              <button
                type="button"
                id={btnId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-[17px] font-bold text-ink transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                <span className="font-display">{item.q}</span>
                <span
                  aria-hidden
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-outline border-ink text-xl font-medium leading-none transition-colors',
                    isOpen ? 'bg-brand text-white' : 'bg-yellow text-ink',
                  )}
                >
                  {isOpen ? '−' : '+'}
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              hidden={!isOpen}
              className="px-6 pb-5 text-[15px] leading-relaxed text-muted"
            >
              {item.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
