/**
 * On-page SEO checks (no external APIs). Pure functions so the same logic runs
 * in the client editor panel and, if ever needed, in a server route. Each check
 * returns a pass/warn indicator plus a short hint so a non-technical author can
 * tell whether a post is "SEO-ready" before publishing.
 */
import { config } from '@/lib/config';
import { htmlToText, wordCount } from './reading-time';
import type { KeywordEntry } from './keyword-links';

export type CheckStatus = 'pass' | 'warn';

export interface SeoCheck {
  id: string;
  label: string;
  status: CheckStatus;
  hint: string;
}

export interface SeoCheckInput {
  metaTitle: string;
  metaDescription: string;
  body: string;
  keywords: KeywordEntry[];
  coverImage: string;
}

// Recommended lengths (Google truncation guidance).
export const META_TITLE_RANGE = { min: 30, ideal: 50, max: 60 } as const;
export const META_DESC_RANGE = { min: 70, ideal: 150, max: 160 } as const;
export const MIN_WORDS = 300;

function siteHost(): string {
  try {
    return new URL(config.siteUrl).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/** Count <a href> links, split into internal (same host / relative) vs external. */
export function linkCounts(html: string): { internal: number; external: number } {
  const host = siteHost();
  let internal = 0;
  let external = 0;
  const re = /<a\b[^>]*href=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const href = m[1]!;
    if (/^https?:\/\//i.test(href)) {
      const isInternal = host && href.toLowerCase().includes(host);
      if (isInternal) internal += 1;
      else external += 1;
    } else if (href.startsWith('/') || href.startsWith('#')) {
      internal += 1;
    }
  }
  return { internal, external };
}

/** Count <img> tags missing (or with empty) alt text. */
export function imagesMissingAlt(html: string): number {
  const imgs = html.match(/<img\b[^>]*>/gi) ?? [];
  return imgs.filter((tag) => !/\balt=["'][^"']+["']/i.test(tag)).length;
}

function lengthCheck(
  id: string,
  label: string,
  value: string,
  range: { min: number; max: number },
): SeoCheck {
  const len = value.trim().length;
  const ok = len >= range.min && len <= range.max;
  return {
    id,
    label,
    status: ok ? 'pass' : 'warn',
    hint: ok
      ? `${len} characters — good`
      : len === 0
        ? `Empty — aim for ${range.min}–${range.max} characters`
        : len < range.min
          ? `${len} characters — a bit short (aim ${range.min}–${range.max})`
          : `${len} characters — a bit long (aim ${range.min}–${range.max})`,
  };
}

/** Run every on-page check against the current draft. */
export function runSeoChecks(input: SeoCheckInput): SeoCheck[] {
  const checks: SeoCheck[] = [];

  checks.push(
    lengthCheck('meta-title', 'Meta title length', input.metaTitle, {
      min: META_TITLE_RANGE.min,
      max: META_TITLE_RANGE.max,
    }),
  );
  checks.push(
    lengthCheck('meta-desc', 'Meta description length', input.metaDescription, {
      min: META_DESC_RANGE.min,
      max: META_DESC_RANGE.max,
    }),
  );

  const words = wordCount(input.body);
  checks.push({
    id: 'word-count',
    label: 'Content length',
    status: words >= MIN_WORDS ? 'pass' : 'warn',
    hint:
      words >= MIN_WORDS
        ? `${words} words`
        : `${words} words — thin content, aim for ${MIN_WORDS}+`,
  });

  // Each target keyword should actually appear in the body.
  const text = htmlToText(input.body).toLowerCase();
  const kws = input.keywords.filter((k) => k.keyword.trim());
  if (kws.length) {
    const missing = kws.filter((k) => !text.includes(k.keyword.trim().toLowerCase()));
    checks.push({
      id: 'keywords-in-body',
      label: 'Keywords appear in body',
      status: missing.length === 0 ? 'pass' : 'warn',
      hint:
        missing.length === 0
          ? `All ${kws.length} keyword(s) found`
          : `Not found: ${missing.map((k) => k.keyword).join(', ')}`,
    });
  }

  const { internal, external } = linkCounts(input.body);
  checks.push({
    id: 'links',
    label: 'Links',
    status: internal + external > 0 ? 'pass' : 'warn',
    hint: `${internal} internal · ${external} external`,
  });

  const noAlt = imagesMissingAlt(input.body);
  checks.push({
    id: 'img-alt',
    label: 'Image alt text',
    status: noAlt === 0 ? 'pass' : 'warn',
    hint: noAlt === 0 ? 'All images have alt text' : `${noAlt} image(s) missing alt text`,
  });

  checks.push({
    id: 'cover',
    label: 'Cover image',
    status: input.coverImage.trim() ? 'pass' : 'warn',
    hint: input.coverImage.trim() ? 'Set' : 'No cover image set',
  });

  return checks;
}
