'use client';
/**
 * Live on-page SEO checks. Runs the pure `runSeoChecks` against the current draft
 * and shows pass/warn indicators so a non-technical author knows whether the post
 * is "SEO-ready" before publishing.
 */
import { useMemo } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { runSeoChecks, type SeoCheckInput } from '@/lib/seoteam/seo-checks';

export function SeoCheckPanel(input: SeoCheckInput) {
  const checks = useMemo(() => runSeoChecks(input), [input]);
  const passing = checks.filter((c) => c.status === 'pass').length;

  return (
    <div className="rounded-xl border border-hair bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-base font-bold text-ink">SEO checks</h3>
        <span className="text-[13px] font-semibold text-muted">
          {passing}/{checks.length} passing
        </span>
      </div>
      <ul className="space-y-2.5">
        {checks.map((c) => (
          <li key={c.id} className="flex items-start gap-2.5">
            {c.status === 'pass' ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-money" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warn" />
            )}
            <div className="min-w-0">
              <div className="text-sm font-medium text-ink">{c.label}</div>
              <div className="text-[12px] text-muted">{c.hint}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
