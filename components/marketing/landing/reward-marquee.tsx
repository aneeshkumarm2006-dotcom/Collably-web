/**
 * Black band with a seamless, pausing marquee of reward offers. The eight unique
 * offers are rendered twice so the `ls-marquee` -50% translate loops without a
 * seam (16 items total, 26s); `.mq:hover` pauses it. Decorative → `aria-hidden`.
 */
const OFFERS: { emoji: string; text: string }[] = [
  { emoji: '☕', text: 'Free coffee for a Reel' },
  { emoji: '💪', text: '3-month gym membership' },
  { emoji: '🍜', text: 'Dinner on the house' },
  { emoji: '💅', text: 'Full spa day' },
  { emoji: '🌮', text: 'A month of tacos' },
  { emoji: '🛍️', text: 'Store credit + swag' },
  { emoji: '🎨', text: 'Free studio session' },
  { emoji: '🐶', text: 'Grooming, on us' },
];

export function RewardMarquee() {
  const track = [...OFFERS, ...OFFERS];

  return (
    <section aria-hidden className="mq overflow-hidden border-y-outline border-ink bg-ink py-3.5 text-white">
      <div className="mq-track flex w-max">
        {track.map((offer, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2.5 whitespace-nowrap px-[26px] font-mono text-[15px] font-medium text-white"
          >
            <span className="text-[18px] text-yellow">{offer.emoji}</span>
            {offer.text}
            <span className="text-band-money">✦</span>
          </span>
        ))}
      </div>
    </section>
  );
}
