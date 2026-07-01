import { cn } from '@/lib/utils';

/**
 * Long-form content wrapper (about, legal, blog posts). Styles standard HTML via
 * child selectors so authored content needs no per-element classes, themed to
 * the app palette and dark-mode-aware. (No @tailwindcss/typography dependency.)
 */
export const proseClass = cn(
  'max-w-none text-[17px] leading-[1.7] text-[#22334A] dark:text-muted',
  // Headings
  '[&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:scroll-mt-24 [&_h2]:font-display [&_h2]:text-[26px] [&_h2]:font-bold [&_h2]:tracking-[-0.02em] [&_h2]:text-ink',
  '[&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:scroll-mt-24 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-ink',
  '[&_h2:first-child]:mt-0 [&_h3:first-child]:mt-0',
  // Body
  '[&_p]:my-5 [&_p:first-child]:mt-0',
  '[&_strong]:font-semibold [&_strong]:text-ink',
  '[&_em]:italic',
  // Links
  '[&_a]:font-medium [&_a]:text-brand [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-brand-secondary',
  // Lists
  '[&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-5',
  '[&_li]:my-1.5 [&_li]:pl-1 [&_li]:marker:text-faint',
  // Blockquote
  '[&_blockquote]:my-6 [&_blockquote]:rounded-r-xl [&_blockquote]:border-l-4 [&_blockquote]:border-brand [&_blockquote]:bg-[#F5F8FF] [&_blockquote]:px-[22px] [&_blockquote]:py-4 [&_blockquote]:font-semibold [&_blockquote]:text-ink [&_blockquote]:not-italic dark:[&_blockquote]:bg-secondary',
  '[&_blockquote_p]:my-0',
  // Code
  '[&_code]:rounded [&_code]:bg-secondary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:text-ink',
  // Rules + images
  '[&_hr]:my-10 [&_hr]:border-hair',
  '[&_img]:my-6 [&_img]:rounded-xl',
);

export function Prose({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn(proseClass, className)}>{children}</div>;
}
