import { cn } from '@/lib/utils';

/**
 * StatusChip: the soft rectangular status pill used across the creator
 * dashboard (Overview, Collabs, Applications, Messages), per the design. Unlike
 * the shared `StatusBadge` (uppercase mono + dot, sticker anatomy), this is a
 * quiet sentence-case pill tuned to the Facebook-clean surface.
 */
type Tone = 'money' | 'brand' | 'warn' | 'danger' | 'neutral';

const TONE_CLASS: Record<Tone, string> = {
  money: 'bg-money-soft text-money-ink',
  brand: 'bg-brand-soft-2 text-brand',
  warn: 'bg-warn-soft text-warn',
  danger: 'bg-danger-soft text-danger-ink',
  neutral: 'bg-secondary text-muted',
};

/** Maps a status / progress label to a tone. */
const STATUS_TONE: Record<string, Tone> = {
  // Application lifecycle
  Pending: 'warn',
  Accepted: 'money',
  Approved: 'money',
  Rejected: 'danger',
  Declined: 'danger',
  Withdrawn: 'neutral',
  Cancelled: 'neutral',
  Completed: 'brand',
  Overdue: 'danger',
  New: 'neutral',
  // Collab / submission progress
  'Content due': 'warn',
  'Not started': 'neutral',
  Submitted: 'brand',
  'In review': 'brand',
  'Under review': 'warn',
  Claimed: 'money',
  Done: 'money',
};

export function statusChipTone(status: string): Tone {
  return STATUS_TONE[status] ?? 'neutral';
}

export function StatusChip({
  status,
  tone,
  className,
}: {
  status: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[6px] px-2.5 py-1 text-[11px] font-semibold leading-none',
        TONE_CLASS[tone ?? statusChipTone(status)],
        className,
      )}
    >
      {status}
    </span>
  );
}
