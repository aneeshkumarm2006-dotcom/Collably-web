'use client';

import { cn } from '@/lib/utils';
import { categoryIcon } from '@/lib/domain-meta';

/**
 * CategoryPill: icon + category name + optional count (green mono). Selectable
 * (used as a filter chip): `active` paints it brand; otherwise hover reveals the
 * brand border. Renders a <button> when `onClick` is provided, else a <span>.
 */
export interface CategoryPillProps {
  category: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function CategoryPill({ category, count, active, onClick, className }: CategoryPillProps) {
  const classes = cn(
    'inline-flex items-center gap-2 rounded-full border-2 border-ink px-[15px] py-[9px] font-display text-[13.5px] font-bold transition-all',
    active
      ? 'bg-brand text-white shadow-[2px_2px_0_var(--ink)]'
      : 'bg-card text-ink hover:-translate-y-px hover:bg-secondary hover:shadow-[2px_2px_0_var(--ink)]',
    className,
  );

  const Icon = categoryIcon(category);
  const content = (
    <>
      <Icon aria-hidden className="h-4 w-4 shrink-0" />
      <span>{category}</span>
      {typeof count === 'number' && (
        <span className={cn('font-mono text-xs', active ? 'text-white/80' : 'text-money')}>
          {count}
        </span>
      )}
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} aria-pressed={active} className={classes}>
        {content}
      </button>
    );
  }
  return <span className={classes}>{content}</span>;
}
