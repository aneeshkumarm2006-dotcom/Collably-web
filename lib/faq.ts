/**
 * Server-safe FAQ types + JSON-LD helper. Kept separate from the `Faq` client
 * component so Server Components (e.g. the marketing landing page) can build the
 * FAQPage structured data without importing a `'use client'` module.
 */
export interface FaqItem {
  q: string;
  a: string;
}

/** FAQPage JSON-LD for a set of Q&As (pairs with the `Faq` component). */
export function faqPageJsonLd(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}
