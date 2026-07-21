// Shared input validators for public API routes.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 254 && EMAIL_RE.test(value)
}

// Catches malformed ids before they reach Postgres, where an invalid uuid cast
// would surface as a database error string.
export function isValidUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value)
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
