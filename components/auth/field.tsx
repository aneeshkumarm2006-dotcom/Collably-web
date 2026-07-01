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
 * Shared input classes for the redesigned auth fields: taller, softer inputs with
 * a 1.5px hairline that turns brand on focus. Spread onto each `<Input>` so the
 * Field stays input-agnostic while matching the mockups.
 */
export const authInputClass =
  'h-auto rounded-md border-[1.5px] border-hair-strong px-[15px] py-[13px] text-[15px]';

export function Field({ label, htmlFor, error, hint, action, children, className }: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={htmlFor} className="text-[13px] font-bold text-muted">
          {label}
        </Label>
        {action}
      </div>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-[13px] text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[13px] text-faint">{hint}</p>
      ) : null}
    </div>
  );
}
