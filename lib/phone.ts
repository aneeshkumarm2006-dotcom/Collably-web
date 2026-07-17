/**
 * International phone helpers for SMS-OTP verification.
 *
 * The mobile app hardcodes `+1` (US/Canada only); the web supports any country by
 * pairing a dial-code picker with a national-number field and composing an E.164
 * string that matches the backend's validation exactly:
 *
 *   /^\+[1-9]\d{7,14}$/   (a leading "+" then 8–15 digits, country code included)
 *
 * We keep a curated list rather than a full metadata library (libphonenumber is
 * ~200KB): it covers the markets that matter and stays dependency-free. Per-country
 * national-number length rules aren't enforced here — the backend + the live SMS
 * send are the source of truth for deliverability — but the E.164 shape is.
 */

export interface Country {
  /** ISO 3166-1 alpha-2, used as the stable key. */
  iso: string;
  name: string;
  /** Dial code without the leading "+". */
  dial: string;
  /** Emoji flag, for the picker. */
  flag: string;
}

// Curated, alphabetical by name. `dial` has no "+". Regions sharing a code (e.g.
// NANP +1) each get a row so the picker reads naturally; E.164 is identical.
export const COUNTRIES: Country[] = [
  { iso: 'AU', name: 'Australia', dial: '61', flag: '🇦🇺' },
  { iso: 'AT', name: 'Austria', dial: '43', flag: '🇦🇹' },
  { iso: 'BE', name: 'Belgium', dial: '32', flag: '🇧🇪' },
  { iso: 'BR', name: 'Brazil', dial: '55', flag: '🇧🇷' },
  { iso: 'CA', name: 'Canada', dial: '1', flag: '🇨🇦' },
  { iso: 'CN', name: 'China', dial: '86', flag: '🇨🇳' },
  { iso: 'DK', name: 'Denmark', dial: '45', flag: '🇩🇰' },
  { iso: 'EG', name: 'Egypt', dial: '20', flag: '🇪🇬' },
  { iso: 'FI', name: 'Finland', dial: '358', flag: '🇫🇮' },
  { iso: 'FR', name: 'France', dial: '33', flag: '🇫🇷' },
  { iso: 'DE', name: 'Germany', dial: '49', flag: '🇩🇪' },
  { iso: 'GH', name: 'Ghana', dial: '233', flag: '🇬🇭' },
  { iso: 'HK', name: 'Hong Kong', dial: '852', flag: '🇭🇰' },
  { iso: 'IN', name: 'India', dial: '91', flag: '🇮🇳' },
  { iso: 'ID', name: 'Indonesia', dial: '62', flag: '🇮🇩' },
  { iso: 'IE', name: 'Ireland', dial: '353', flag: '🇮🇪' },
  { iso: 'IL', name: 'Israel', dial: '972', flag: '🇮🇱' },
  { iso: 'IT', name: 'Italy', dial: '39', flag: '🇮🇹' },
  { iso: 'JP', name: 'Japan', dial: '81', flag: '🇯🇵' },
  { iso: 'KE', name: 'Kenya', dial: '254', flag: '🇰🇪' },
  { iso: 'MY', name: 'Malaysia', dial: '60', flag: '🇲🇾' },
  { iso: 'MX', name: 'Mexico', dial: '52', flag: '🇲🇽' },
  { iso: 'NL', name: 'Netherlands', dial: '31', flag: '🇳🇱' },
  { iso: 'NZ', name: 'New Zealand', dial: '64', flag: '🇳🇿' },
  { iso: 'NG', name: 'Nigeria', dial: '234', flag: '🇳🇬' },
  { iso: 'NO', name: 'Norway', dial: '47', flag: '🇳🇴' },
  { iso: 'PK', name: 'Pakistan', dial: '92', flag: '🇵🇰' },
  { iso: 'PH', name: 'Philippines', dial: '63', flag: '🇵🇭' },
  { iso: 'PL', name: 'Poland', dial: '48', flag: '🇵🇱' },
  { iso: 'PT', name: 'Portugal', dial: '351', flag: '🇵🇹' },
  { iso: 'QA', name: 'Qatar', dial: '974', flag: '🇶🇦' },
  { iso: 'SA', name: 'Saudi Arabia', dial: '966', flag: '🇸🇦' },
  { iso: 'SG', name: 'Singapore', dial: '65', flag: '🇸🇬' },
  { iso: 'ZA', name: 'South Africa', dial: '27', flag: '🇿🇦' },
  { iso: 'KR', name: 'South Korea', dial: '82', flag: '🇰🇷' },
  { iso: 'ES', name: 'Spain', dial: '34', flag: '🇪🇸' },
  { iso: 'SE', name: 'Sweden', dial: '46', flag: '🇸🇪' },
  { iso: 'CH', name: 'Switzerland', dial: '41', flag: '🇨🇭' },
  { iso: 'TW', name: 'Taiwan', dial: '886', flag: '🇹🇼' },
  { iso: 'TH', name: 'Thailand', dial: '66', flag: '🇹🇭' },
  { iso: 'TR', name: 'Türkiye', dial: '90', flag: '🇹🇷' },
  { iso: 'AE', name: 'United Arab Emirates', dial: '971', flag: '🇦🇪' },
  { iso: 'GB', name: 'United Kingdom', dial: '44', flag: '🇬🇧' },
  { iso: 'US', name: 'United States', dial: '1', flag: '🇺🇸' },
  { iso: 'VN', name: 'Vietnam', dial: '84', flag: '🇻🇳' },
];

/** Default selection: Canada, matching the app's Canada-first positioning. */
export const DEFAULT_COUNTRY = COUNTRIES.find((c) => c.iso === 'CA')!;

const E164 = /^\+[1-9]\d{7,14}$/;

/** Keep digits only (drops spaces, dashes, parens, and a leading 0). */
export function nationalDigits(input: string): string {
  return input.replace(/\D/g, '').replace(/^0+/, '');
}

/** Compose an E.164 string from a country + a raw national-number entry. */
export function toE164(country: Country, national: string): string {
  return `+${country.dial}${nationalDigits(national)}`;
}

/** Whether a composed E.164 string satisfies the backend's shape. */
export function isValidE164(value: string): boolean {
  return E164.test(value);
}
