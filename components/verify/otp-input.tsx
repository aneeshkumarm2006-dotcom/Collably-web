'use client';

import { useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Six-box OTP input. Each box holds one digit; typing advances, Backspace on an
 * empty box steps back, and pasting a full code fills every box at once. The
 * value is owned by the parent so the flow can clear it between steps and submit
 * automatically when all six are entered.
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  disabled,
  invalid,
}: {
  value: string;
  onChange: (next: string) => void;
  /** Called once the sixth digit lands (autosubmit hook). */
  onComplete?: (code: string) => void;
  disabled?: boolean;
  invalid?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6).slice(0, 6).split('');

  function setAt(index: number, digit: string) {
    const chars = value.padEnd(6).split('');
    chars[index] = digit;
    const next = chars.join('').replace(/\s/g, '');
    onChange(next);
    if (next.length === 6 && !next.includes(' ')) onComplete?.(next);
  }

  return (
    <div className="flex justify-center gap-2 sm:gap-2.5" role="group" aria-label="6-digit code">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={invalid || undefined}
          value={d.trim()}
          onChange={(e) => {
            const digit = e.target.value.replace(/\D/g, '').slice(-1);
            if (!digit) {
              setAt(i, ' ');
              return;
            }
            setAt(i, digit);
            refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !d.trim()) {
              refs.current[i - 1]?.focus();
            }
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
            if (!pasted) return;
            onChange(pasted);
            if (pasted.length === 6) onComplete?.(pasted);
            refs.current[Math.min(pasted.length, 5)]?.focus();
          }}
          className={cn(
            'h-14 w-11 rounded-md border-2 border-ink bg-card text-center font-mono text-[22px] font-semibold text-ink sm:w-12',
            'focus-visible:border-brand focus-visible:shadow-focus focus-visible:outline-none',
            invalid && 'border-danger',
            disabled && 'opacity-60',
          )}
        />
      ))}
    </div>
  );
}
