import type { PublicApplication } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/format';

type StepState = 'done' | 'current' | 'pending';

interface Step {
  label: string;
  caption?: string;
  state: StepState;
}

/**
 * The vertical four-step submission timeline shown on the "view submission"
 * screen: Submitted → In review → Approved → Reward released. State is derived
 * strictly from the real application record — there is no fabricated status:
 *
 *   • Submitted        — the creator filed the proof (`submittedAt`).
 *   • In review        — awaiting the business; complete once verified.
 *   • Approved         — the business verified the collab (`verifiedAt`).
 *   • Reward released  — the collab reached its terminal `Completed` state.
 *
 * Approval and reward release share the same server signal (verification flips
 * the status to Completed), so both light up together once the business acts.
 */
export function submissionSteps(
  app: Pick<PublicApplication, 'submittedAt' | 'verifiedAt' | 'status'>,
): Step[] {
  const verified = Boolean(app.verifiedAt);
  const completed = app.status === 'Completed';

  return [
    {
      label: 'Submitted',
      caption: app.submittedAt ? formatDate(app.submittedAt) : undefined,
      state: 'done',
    },
    {
      label: 'In review',
      caption: verified ? undefined : 'Usually within 24h',
      state: verified ? 'done' : 'current',
    },
    {
      label: 'Approved',
      caption: app.verifiedAt ? formatDate(app.verifiedAt) : undefined,
      state: verified ? 'done' : 'pending',
    },
    {
      label: 'Reward released',
      state: completed ? 'done' : 'pending',
    },
  ];
}

export function SubmissionStepper({
  application,
  className,
}: {
  application: Pick<PublicApplication, 'submittedAt' | 'verifiedAt' | 'status'>;
  className?: string;
}) {
  const steps = submissionSteps(application);

  return (
    <ol className={cn('flex flex-col', className)}>
      {steps.map((step, i) => {
        const last = i === steps.length - 1;
        const connectorDone = step.state === 'done';
        return (
          <li key={step.label} className="flex gap-3">
            {/* Dot + connector rail */}
            <div className="flex flex-col items-center" aria-hidden>
              <span
                className={cn(
                  'h-[22px] w-[22px] shrink-0 rounded-full',
                  step.state === 'done' && 'bg-money',
                  step.state === 'current' && 'bg-brand ring-4 ring-brand-soft',
                  step.state === 'pending' && 'border-2 border-hair bg-card',
                )}
              />
              {!last && (
                <span
                  className={cn('w-0.5 flex-1', connectorDone ? 'bg-money' : 'bg-hair')}
                />
              )}
            </div>
            {/* Label */}
            <div className={cn(!last && 'pb-[18px]')}>
              <div
                className={cn(
                  'text-[14px] font-semibold',
                  step.state === 'current' && 'text-brand',
                  step.state === 'pending' && 'text-faint',
                  step.state === 'done' && 'text-ink',
                )}
              >
                {step.label}
              </div>
              {step.caption && <div className="text-[12px] text-faint">{step.caption}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
