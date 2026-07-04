// Shared input validators for public API routes.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/

export function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 254 && EMAIL_RE.test(value)
}

export function isValidDateOnly(value: unknown): value is string {
  return typeof value === 'string' && DATE_ONLY_RE.test(value)
}

export function isValidIsoDateTime(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 40 && !Number.isNaN(Date.parse(value))
}

export function isNonEmptyString(value: unknown, maxLength = 200): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength
}

// For optional fields: absent/empty is fine, but if present it must respect the length limit.
export function isOptionalString(value: unknown, maxLength = 200): boolean {
  return value === undefined || value === null || value === '' || (typeof value === 'string' && value.length <= maxLength)
}
