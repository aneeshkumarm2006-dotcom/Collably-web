import {
  Coffee,
  Dog,
  Dumbbell,
  Palette,
  Sandwich,
  ShoppingBag,
  Sparkle,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * Black band with a seamless, pausing marquee of reward offers. The eight unique
 * offers are rendered twice so the `ls-marquee` -50% translate loops without a
 * seam (16 items total, 26s); `.mq:hover` pauses it. Decorative → `aria-hidden`.
 */
const OFFERS: { icon: LucideIcon; text: string }[] = [
  { icon: Coffee, text: 'Free coffee for a Reel' },
  { icon: Dumbbell, text: '3-month gym membership' },
  { icon: UtensilsCrossed, text: 'Dinner on the house' },
  { icon: Sparkles, text: 'Full spa day' },
  { icon: Sandwich, text: 'A month of tacos' },
  { icon: ShoppingBag, text: 'Store credit + swag' },
  { icon: Palette, text: 'Free studio session' },
  { icon: Dog, text: 'Grooming, on us' },
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
            <offer.icon size={18} strokeWidth={2} className="text-yellow" />
            {offer.text}
            <Sparkle size={13} strokeWidth={2} className="text-band-money" fill="currentColor" />
          </span>
        ))}
      </div>
    </section>
  );
}
