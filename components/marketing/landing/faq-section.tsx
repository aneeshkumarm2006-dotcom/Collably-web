import { GENERAL_FAQS } from '@/lib/marketing-content';
import { Eyebrow } from '@/components/shared/sticker';
import { Faq } from '@/components/marketing/faq';

/**
 * FAQ band. Renders the five general FAQs; pairs with faqPageJsonLd on the page,
 * so the visible copy and the structured data stay in lockstep.
 */
export function FaqSection() {
  return (
    <section className="bg-page pb-20 pt-10">
      <div className="mx-auto max-w-[820px] px-6">
        <div className="mb-9 text-center">
          <Eyebrow className="justify-center text-brand">Good to know</Eyebrow>
          <h2 className="mt-3 text-balance font-display text-4xl font-bold leading-[1.02] tracking-[-0.03em] text-ink sm:text-[46px]">
            Questions, answered
          </h2>
        </div>
        <Faq items={GENERAL_FAQS} />
      </div>
    </section>
  );
}
