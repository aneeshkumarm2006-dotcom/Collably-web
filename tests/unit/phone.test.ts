import { describe, expect, it } from 'vitest';
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  isValidE164,
  nationalDigits,
  toE164,
} from '@/lib/phone';

const byIso = (iso: string) => COUNTRIES.find((c) => c.iso === iso)!;

describe('nationalDigits', () => {
  it('strips spaces, dashes, parens', () => {
    expect(nationalDigits('(416) 555-0199')).toBe('4165550199');
    expect(nationalDigits('020 7946 0958')).toBe('2079460958');
  });

  it('drops a leading zero (trunk prefix) so it is not double-counted', () => {
    expect(nationalDigits('07911 123456')).toBe('7911123456');
    expect(nationalDigits('0')).toBe(''); // only a trunk zero → empty
  });
});

describe('toE164', () => {
  it('composes a Canada/US (+1) number', () => {
    expect(toE164(byIso('CA'), '(416) 555-0199')).toBe('+14165550199');
    expect(toE164(byIso('US'), '212-555-0100')).toBe('+12125550100');
  });

  it('composes international numbers, stripping the national trunk zero', () => {
    // UK: national 020 7946 0958 → +44 20 7946 0958
    expect(toE164(byIso('GB'), '020 7946 0958')).toBe('+442079460958');
    // India: 91 + 10-digit mobile
    expect(toE164(byIso('IN'), '98765 43210')).toBe('+919876543210');
    // Australia: national 0412 345 678 → +61 412 345 678
    expect(toE164(byIso('AU'), '0412 345 678')).toBe('+61412345678');
    // Germany
    expect(toE164(byIso('DE'), '030 1234567')).toBe('+49301234567');
  });
});

describe('isValidE164', () => {
  it('accepts well-formed international numbers', () => {
    expect(isValidE164('+14165550199')).toBe(true);
    expect(isValidE164('+442079460958')).toBe(true);
    expect(isValidE164('+919876543210')).toBe(true);
  });

  it('rejects malformed values', () => {
    expect(isValidE164('4165550199')).toBe(false); // no +
    expect(isValidE164('+0123456789')).toBe(false); // leading 0 after +
    expect(isValidE164('+1416')).toBe(false); // too short
    expect(isValidE164('+1234567890123456')).toBe(false); // too long (>15 digits)
    expect(isValidE164('+1 416 555 0199')).toBe(false); // spaces not allowed in E.164
  });

  it('every curated country produces a valid E.164 for a plausible number', () => {
    for (const c of COUNTRIES) {
      // 9 national digits is within 8–15 total for every dial code we ship.
      expect(isValidE164(toE164(c, '123456789'))).toBe(true);
    }
  });
});

describe('country catalog', () => {
  it('defaults to Canada', () => {
    expect(DEFAULT_COUNTRY.iso).toBe('CA');
  });

  it('has unique ISO codes and non-empty dial codes', () => {
    const isos = new Set(COUNTRIES.map((c) => c.iso));
    expect(isos.size).toBe(COUNTRIES.length);
    for (const c of COUNTRIES) expect(c.dial).toMatch(/^[1-9]\d*$/);
  });
});
