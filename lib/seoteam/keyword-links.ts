/**
 * Keyword backlinking: turn occurrences of each keyword in a post body into an
 * anchor pointing at its target URL — the core SEO-team feature.
 *
 * Rules (from the spec):
 *  - Case-insensitive, word-boundary aware matching.
 *  - By default only the FIRST occurrence of each keyword is linked (avoids
 *    over-optimization); `linkAll` links every occurrence.
 *  - Never touch text already inside an <a>, a heading (h1–h6), or <code>/<pre>,
 *    so existing links and code stay intact.
 *  - External links open in a new tab with rel="noopener" plus the keyword's
 *    rel intent (nofollow/sponsored; dofollow adds nothing extra).
 *
 * Implemented over a real HTML parse (node-html-parser) walking text nodes only,
 * so tag boundaries are respected — far safer than regex over raw HTML.
 */
import { parse, type HTMLElement, type Node, NodeType } from 'node-html-parser';
import type { KeywordRel } from '@/lib/db/post-constants';

export interface KeywordEntry {
  keyword: string;
  url: string;
  rel?: KeywordRel;
}

const SKIP_TAGS = new Set(['A', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'CODE', 'PRE']);

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Build the rel attribute: always noopener, plus nofollow/sponsored per intent. */
function relFor(rel: KeywordRel | undefined): string {
  const parts = ['noopener'];
  if (rel === 'nofollow') parts.push('nofollow');
  else if (rel === 'sponsored') parts.push('sponsored', 'nofollow');
  return parts.join(' ');
}

function isInsideSkipped(node: Node): boolean {
  let el = node.parentNode as HTMLElement | null;
  while (el) {
    if (el.tagName && SKIP_TAGS.has(el.tagName.toUpperCase())) return true;
    el = el.parentNode as HTMLElement | null;
  }
  return false;
}

/**
 * Apply keyword backlinks to `html`. Returns the transformed HTML. Keywords are
 * processed longest-first so a longer phrase wins over a contained shorter one.
 */
export function applyKeywordLinks(
  html: string,
  keywords: KeywordEntry[],
  opts: { linkAll?: boolean } = {},
): string {
  const valid = keywords.filter(
    (k) =>
      k.keyword.trim() &&
      k.url.trim() &&
      // Defense in depth: only ever emit http(s)/mailto links, even if a bad
      // URL slipped past input validation.
      (/^https?:\/\//i.test(k.url.trim()) || /^mailto:/i.test(k.url.trim())),
  );
  if (!valid.length) return html;

  const ordered = [...valid].sort((a, b) => b.keyword.length - a.keyword.length);
  const linked = new Set<string>(); // keywords that already consumed their first hit

  const root = parse(html, { comment: false });

  // Collect text nodes up front (mutating the tree while walking is unsafe).
  const textNodes: Node[] = [];
  const collect = (node: Node) => {
    for (const child of node.childNodes) {
      if (child.nodeType === NodeType.TEXT_NODE) {
        if (child.rawText.trim() && !isInsideSkipped(child)) textNodes.push(child);
      } else {
        collect(child);
      }
    }
  };
  collect(root);

  for (const node of textNodes) {
    let text = node.rawText;
    let changed = false;

    for (const entry of ordered) {
      const key = entry.keyword.toLowerCase();
      if (!opts.linkAll && linked.has(key)) continue;

      const flags = opts.linkAll ? 'gi' : 'i';
      const re = new RegExp(`\\b(${escapeRegExp(entry.keyword)})\\b`, flags);
      if (!re.test(text)) continue;

      const anchorOpen = `<a href="${escapeHtml(entry.url)}" target="_blank" rel="${relFor(
        entry.rel,
      )}">`;
      let replacedOnce = false;
      text = text.replace(re, (match) => {
        if (!opts.linkAll) {
          if (replacedOnce) return match;
          replacedOnce = true;
        }
        // `match` is a slice of the source-encoded rawText, so it's already
        // HTML-safe — inserting it verbatim avoids double-encoding entities.
        return `${anchorOpen}${match}</a>`;
      });
      changed = true;
      if (!opts.linkAll) linked.add(key);
    }

    if (changed) {
      // Splice the parsed replacement nodes (anchors + text) in place of the
      // original text node. node-html-parser has no multi-node `replaceWith`, so
      // we edit the parent's childNodes array directly and re-point parents.
      const parent = node.parentNode as HTMLElement | null;
      if (parent) {
        const idx = parent.childNodes.indexOf(node);
        if (idx !== -1) {
          const replacement = parse(text, { comment: false });
          for (const child of replacement.childNodes) child.parentNode = parent;
          parent.childNodes.splice(idx, 1, ...replacement.childNodes);
        }
      }
    }
  }

  return root.toString();
}
