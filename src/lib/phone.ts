import { COUNTRIES, CANADA, type Country } from '../data/countries'

// North American Numbering Plan (+1: Canada, US, etc.) — (XXX) XXX-XXXX
export function formatNANP(digits: string): string {
  const d = digits.slice(0, 10)
  if (d.length === 0) return ''
  if (d.length < 4) return `(${d}`
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
}

// Which country a stored number belongs to. Numbers are stored as dial code +
// digits, so the longest matching dial code wins — otherwise '+1' would swallow
// every '+1xx' country. Falls back to Canada for empty or unrecognised input.
export function countryForPhone(phone: string): Country {
  if (!phone) return CANADA
  let best: Country | null = null
  for (const c of COUNTRIES) {
    if (phone.startsWith(c.dialCode) && (!best || c.dialCode.length > best.dialCode.length)) {
      best = c
    }
  }
  return best ?? CANADA
}

// The subscriber digits, with the country's dial code stripped off.
export function localDigits(phone: string): string {
  if (!phone) return ''
  return phone.slice(countryForPhone(phone).dialCode.length).replace(/\D/g, '')
}

// Loose length check — enough to catch blank and obviously-truncated entries
// without rejecting the many valid national formats.
export function isValidPhone(phone: string): boolean {
  return localDigits(phone).length >= 7
}
