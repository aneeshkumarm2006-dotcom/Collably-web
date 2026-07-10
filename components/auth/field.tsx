import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/**
 * Labelled form field with an inline error / hint slot, used across the auth
 * forms. Pass the control (usually `<Input>`) as `children` so the field stays
 * agnostic about the input type. `action` renders inline with the label (e.g. the
 * "Forgot password?" link on the password field).
 */
export interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * Shared input classes for the auth fields in the "sticker" language: a solid
 * 2px ink border on the cream page, `rounded-md`, that turns `brand` with a soft
 * focus ring on focus. `aria-invalid` (set by the forms from field errors) flips
 * the border to `danger`. Spread onto each `<Input>` so the Field stays
 * input-agnostic while matching the design.
 */
export const authInputClass = cn(
  'h-auto rounded-md border-2 border-ink bg-card px-[15px] py-[13px] text-[15px] font-medium text-ink',
  'placeholder:font-normal placeholder:text-faint',
  'focus-visible:border-brand focus-visible:shadow-focus focus-visible:ring-0',
  'aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:border-danger aria-[invalid=true]:focus-visible:shadow-none',
);

export function Field({ label, htmlFor, error, hint, action, children, className }: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={htmlFor} className="font-mono text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
          {label}
        </Label>
        {action}
      </div>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-[13px] font-medium text-danger-ink">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[13px] text-faint">{hint}</p>
      ) : null}
    </div>
  );
}
