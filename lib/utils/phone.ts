import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";

export function normalizePhone(
  raw: string | null | undefined,
  defaultCountry: CountryCode = "US"
): string | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[^\d+]/g, "");
  if (!cleaned) return null;
  try {
    const p = parsePhoneNumberFromString(cleaned, defaultCountry);
    if (p && p.isValid()) return p.number;
    const p2 = parsePhoneNumberFromString(raw, defaultCountry);
    if (p2 && p2.isValid()) return p2.number;
  } catch {
    return null;
  }
  return null;
}

export function isValidPhone(raw: string | null | undefined): boolean {
  return normalizePhone(raw) !== null;
}
