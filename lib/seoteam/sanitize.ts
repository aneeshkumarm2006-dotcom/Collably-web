/**
 * HTML sanitization for post bodies. Tiptap output (and anything pasted from
 * Google Docs/Word) is untrusted, so we sanitize on SAVE and again on RENDER
 * (defense in depth) before it ever reaches `dangerouslySetInnerHTML`.
 *
 * Uses `sanitize-html` (htmlparser2-based, no jsdom) so it bundles cleanly in
 * Next server / serverless. The allow-list is scoped to what the WYSIWYG
 * produces and what `components/marketing/prose.tsx` styles; scripts, event
 * handlers, and non-http(s) schemes are dropped.
 */
import 'server-only';
import sanitizeHtml from 'sanitize-html';

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'h2',
    'h3',
    'h4',
    'p',
    'strong',
    'em',
    'u',
    's',
    'ul',
    'ol',
    'li',
    'blockquote',
    'code',
    'pre',
    'a',
    'img',
    'hr',
    'br',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  // Enforce safe defaults on links (belt-and-braces alongside keyword-links).
  transformTags: {
    a: (tagName, attribs) => {
      const rel = attribs.rel || 'noopener';
      return { tagName, attribs: { ...attribs, rel } };
    },
  },
};

/** Sanitize a post body's HTML to a safe subset. */
export function sanitizePostHtml(html: string): string {
  return sanitizeHtml(html ?? '', OPTIONS);
}
