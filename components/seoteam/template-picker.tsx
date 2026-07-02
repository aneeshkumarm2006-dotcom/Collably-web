'use client';
/**
 * Template picker: choosing a template loads a heading structure + guidance into
 * the editor. Confirms before overwriting a non-empty body.
 */
import { POST_TEMPLATES } from '@/lib/seoteam/templates';
import type { PostTemplateId } from '@/lib/db/models/post';
import { cn } from '@/lib/utils';

export function TemplatePicker({
  selected,
  onSelect,
}: {
  selected: PostTemplateId;
  onSelect: (id: PostTemplateId) => void;
}) {
  return (
    <div className="rounded-xl border border-hair bg-card p-5">
      <h3 className="mb-1 font-display text-base font-bold text-ink">Template</h3>
      <p className="mb-4 text-[13px] text-muted">Start from a proven SEO structure.</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {POST_TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id)}
            className={cn(
              'rounded-lg border p-3 text-left transition-colors',
              selected === t.id
                ? 'border-brand bg-brand-soft'
                : 'border-hair hover:border-hair-strong',
            )}
          >
            <div className="text-sm font-semibold text-ink">{t.label}</div>
            <div className="mt-0.5 line-clamp-2 text-[12px] text-muted">{t.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
