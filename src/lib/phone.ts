import { COUNTRIES, CANADA, type Country } from '../data/countries'

export function formatNANP(digits: string): string {
  const d = digits.slice(0, 10)
  if (d.length === 0) return ''
  if (d.length < 4) return `(${d}`
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
}

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

export function localDigits(phone: string): string {
  if (!phone) return ''
  return phone.slice(countryForPhone(phone).dialCode.length).replace(/\D/g, '')
}

export function isValidPhone(phone: string): boolean {
  return localDigits(phone).length >= 7
}
