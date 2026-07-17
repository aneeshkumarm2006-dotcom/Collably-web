'use client';

import { cn } from '@/lib/utils';
import { COUNTRIES, type Country } from '@/lib/phone';

/**
 * International phone entry: a dial-code country picker + a national-number field.
 * The parent composes E.164 via `toE164(country, national)`; this component only
 * collects the two parts. A native `<select>` is used deliberately — it gives the
 * OS's searchable, accessible country list for free on every device.
 */
export function PhoneField({
  country,
  onCountryChange,
  national,
  onNationalChange,
  disabled,
  invalid,
}: {
  country: Country;
  onCountryChange: (c: Country) => void;
  national: string;
  onNationalChange: (v: string) => void;
  disabled?: boolean;
  invalid?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-stretch overflow-hidden rounded-md border-2 border-ink bg-card focus-within:border-brand focus-within:shadow-focus',
        invalid && 'border-danger focus-within:border-danger focus-within:shadow-none',
        disabled && 'opacity-60',
      )}
    >
      <div className="relative flex items-center gap-1.5 border-r-2 border-ink pl-3 pr-2">
        <span aria-hidden className="text-[18px] leading-none">
          {country.flag}
        </span>
        <span className="font-mono text-[15px] font-semibold text-ink">+{country.dial}</span>
        {/* Transparent native select overlaid for full-width, accessible tapping. */}
        <select
          aria-label="Country calling code"
          disabled={disabled}
          value={country.iso}
          onChange={(e) => {
            const next = COUNTRIES.find((c) => c.iso === e.target.value);
            if (next) onCountryChange(next);
          }}
          className="absolute inset-0 cursor-pointer opacity-0"
        >
          {COUNTRIES.map((c) => (
            <option key={c.iso} value={c.iso}>
              {c.flag} {c.name} (+{c.dial})
            </option>
          ))}
        </select>
      </div>
      <input
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        disabled={disabled}
        aria-invalid={invalid || undefined}
        placeholder="Phone number"
        value={national}
        onChange={(e) => onNationalChange(e.target.value)}
        className="min-w-0 flex-1 bg-transparent px-[15px] py-[13px] text-[15px] font-medium text-ink placeholder:font-normal placeholder:text-faint focus:outline-none"
      />
    </div>
  );
}
