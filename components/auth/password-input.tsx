'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { authInputClass } from '@/components/auth/field';
import { cn } from '@/lib/utils';

/**
 * Password field with a show/hide eye toggle. Wraps the shared `<Input>` and the
 * sticker `authInputClass`, adding trailing padding so text never sits under the
 * toggle. The toggle is a real `<button>` (keyboard-reachable, `aria-pressed`,
 * `aria-label`) and never submits the form (`type="button"`).
 *
 * All standard input props pass through, so the forms keep their `value`,
 * `onChange`, `autoComplete`, `aria-invalid`, and error wiring unchanged.
 */
export type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, 'type'>;

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        type={visible ? 'text' : 'password'}
        className={cn(authInputClass, 'pr-12', className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-pressed={visible}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:text-brand"
      >
        {visible ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
      </button>
    </div>
  );
}
