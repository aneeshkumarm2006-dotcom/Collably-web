'use client';
/**
 * Manage a post's keyword backlinks in one place: each row is a keyword + target
 * URL + rel intent. A global switch controls whether every occurrence links or
 * just the first (the default, to avoid over-optimization).
 */
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { KEYWORD_REL_VALUES } from '@/lib/db/post-constants';
import type { KeywordEntry } from '@/lib/seoteam/keyword-links';

export function KeywordManager({
  keywords,
  onChange,
  linkAll,
  onLinkAllChange,
}: {
  keywords: KeywordEntry[];
  onChange: (next: KeywordEntry[]) => void;
  linkAll: boolean;
  onLinkAllChange: (next: boolean) => void;
}) {
  function update(i: number, patch: Partial<KeywordEntry>) {
    onChange(keywords.map((k, idx) => (idx === i ? { ...k, ...patch } : k)));
  }
  function remove(i: number) {
    onChange(keywords.filter((_, idx) => idx !== i));
  }
  function add() {
    onChange([...keywords, { keyword: '', url: '', rel: 'dofollow' }]);
  }

  return (
    <div className="rounded-xl border border-hair bg-card p-5">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="font-display text-base font-bold text-ink">Keyword backlinks</h3>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>
      <p className="mb-4 text-[13px] text-muted">
        Occurrences of each keyword in the body become links to its URL.
      </p>

      {keywords.length === 0 ? (
        <p className="rounded-lg border border-dashed border-hair px-4 py-6 text-center text-sm text-muted">
          No keywords yet. Add one to create a backlink.
        </p>
      ) : (
        <div className="space-y-3">
          {keywords.map((k, i) => (
            <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1.4fr_auto_auto] sm:items-center">
              <Input
                placeholder="keyword"
                value={k.keyword}
                onChange={(e) => update(i, { keyword: e.target.value })}
              />
              <Input
                placeholder="https://target-url.com"
                value={k.url}
                onChange={(e) => update(i, { url: e.target.value })}
              />
              <select
                value={k.rel ?? 'dofollow'}
                onChange={(e) => update(i, { rel: e.target.value as KeywordEntry['rel'] })}
                className="h-10 rounded-md border border-hair-strong bg-card px-2 text-sm text-ink"
              >
                {KEYWORD_REL_VALUES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-danger hover:text-danger"
                onClick={() => remove(i)}
                title="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between rounded-lg bg-secondary px-4 py-3">
        <div>
          <Label htmlFor="link-all" className="font-semibold text-ink">
            Link all occurrences
          </Label>
          <p className="text-[12px] text-muted">Off = link only the first occurrence (recommended).</p>
        </div>
        <Switch id="link-all" checked={linkAll} onCheckedChange={onLinkAllChange} />
      </div>
    </div>
  );
}
