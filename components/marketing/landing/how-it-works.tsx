import { Eyebrow } from '@/components/shared/sticker';
import { TiltCard } from './tilt-card';
import { Reveal } from './reveal';

type Step = { title: string; body: string };

// The design's own steps (its written copy differs from lib/HOW_IT_WORKS), so
// they're declared here rather than editing the shared marketing content.
const CREATOR_STEPS: Step[] = [
  {
    title: 'Find campaigns near you',
    body: 'Browse live offers from businesses on your block, filtered by niche and distance.',
  },
  {
    title: 'Apply in one tap',
    body: 'Pitch yourself with your handles and past work. No DMs, no back-and-forth.',
  },
  {
    title: 'Post & get rewarded',
    body: "Create the content, submit it, and claim your reward the moment it's approved.",
  },
];

const BUSINESS_STEPS: Step[] = [
  {
    title: 'Launch a campaign',
    body: 'Set the ask and the reward in minutes — free product, service, or perks.',
  },
  {
    title: 'Pick your creators',
    body: 'Review applicants by following, niche, and fit. Approve the ones you love.',
  },
  {
    title: 'Get real content',
    body: 'Receive posts you can reshare, plus fresh foot traffic from real neighbors.',
  },
];

/** Two-column "how it works": creators on brand-soft, businesses on money-soft. */
export function HowItWorks() {
  return (
    <section id="how" className="bg-page py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-shell px-6 lg:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="r">
            <Eyebrow className="justify-center text-brand">How it works</Eyebrow>
            <h2 className="mt-3 text-balance font-display text-4xl font-bold leading-[1.02] tracking-[-0.03em] text-ink sm:text-[46px]">
              Two sides, one loud loop
            </h2>
            <p className="mt-3 text-[18px] leading-relaxed text-body">
              Businesses launch, creators apply, content flies, rewards land.
            </p>
          </div>
        </Reveal>

        <Reveal className="mt-11 grid gap-6 md:grid-cols-2">
          <FlowCard
            eyebrow="For creators"
            eyebrowClass="text-brand"
            title="Get paid in real perks"
            fill="bg-brand-soft"
            badge="bg-brand"
            icon={<CreatorIcon />}
            steps={CREATOR_STEPS}
          />
          <FlowCard
            eyebrow="For business"
            eyebrowClass="text-money"
            title="Turn regulars into fans"
            fill="bg-money-soft"
            badge="bg-money"
            icon={<BusinessIcon />}
            steps={BUSINESS_STEPS}
          />
        </Reveal>
      </div>
    </section>
  );
}

function FlowCard({
  eyebrow,
  eyebrowClass,
  title,
  fill,
  badge,
  icon,
  steps,
}: {
  eyebrow: string;
  eyebrowClass: string;
  title: string;
  fill: string;
  badge: string;
  icon: React.ReactNode;
  steps: Step[];
}) {
  return (
    <TiltCard className={`r sticker rounded-[26px] p-8 ${fill}`}>
      <div className="flex items-center gap-3.5">
        {icon}
        <div>
          <Eyebrow className={eyebrowClass}>{eyebrow}</Eyebrow>
          <h3 className="mt-0.5 font-display text-2xl font-bold tracking-[-0.02em] text-ink">
            {title}
          </h3>
        </div>
      </div>
      <ol className="mt-6 flex flex-col gap-5">
        {steps.map((step, i) => (
          <li key={step.title} className="flex items-start gap-3.5">
            <span
              className={`sticker flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px] font-mono text-[15px] font-semibold text-white shadow-[2px_2px_0_#14181F] ${badge}`}
            >
              {i + 1}
            </span>
            <div>
              <div className="font-display text-[17px] font-bold text-ink">{step.title}</div>
              <p className="mt-0.5 text-[15px] leading-relaxed text-body">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </TiltCard>
  );
}

/** Creator badge: person avatar on a white sticker tile with a yellow dot. */
function CreatorIcon() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" aria-hidden className="shrink-0">
      <rect x="2" y="2" width="56" height="56" rx="16" fill="#fff" stroke="#14181F" strokeWidth="3" />
      <circle cx="30" cy="24" r="8" fill="#1877F2" />
      <path d="M16 46c0-8 6-13 14-13s14 5 14 13" fill="#4A96F7" />
      <circle cx="43" cy="17" r="6" fill="#FFC24B" stroke="#14181F" strokeWidth="2" />
    </svg>
  );
}

/** Business badge: storefront on a white sticker tile with a yellow dot. */
function BusinessIcon() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" aria-hidden className="shrink-0">
      <rect x="2" y="2" width="56" height="56" rx="16" fill="#fff" stroke="#14181F" strokeWidth="3" />
      <path d="M16 28h28v14a3 3 0 0 1-3 3H19a3 3 0 0 1-3-3V28Z" fill="#31A24C" />
      <path d="M16 28l3-9h22l3 9" fill="#5BC47A" />
      <rect x="26" y="35" width="8" height="10" fill="#fff" />
      <circle cx="44" cy="17" r="6" fill="#FFC24B" stroke="#14181F" strokeWidth="2" />
    </svg>
  );
}
