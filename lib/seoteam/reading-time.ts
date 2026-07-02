/**
 * Reading-time + word-count helpers for DB posts (static posts hardcode their
 * own `readingMinutes`). Framework-free so both the editor and server can use it.
 */

/** Strip HTML tags and collapse whitespace to plain text. */
export function htmlToText(html: string): string {
  return (html ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Count words in an HTML body. */
export function wordCount(html: string): number {
  const text = htmlToText(html);
  if (!text) return 0;
  return text.split(/\s+/).length;
}

/** Estimated reading time in minutes (~200 wpm, min 1). */
export function readingMinutes(html: string): number {
  return Math.max(1, Math.round(wordCount(html) / 200));
}
