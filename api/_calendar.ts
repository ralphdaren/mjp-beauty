// Pure helpers for the admin Brow Services calendar. No runtime imports, so
// tests can load this file directly with `node --test`.

export type ServiceColorKey = 'lamination' | 'wax' | 'tint' | 'lash' | 'henna' | 'student' | 'other'
export type BookingSourceKey = 'website' | 'square' | 'square-booking-page' | 'google-instagram' | 'other'
export type HistoryStatus = 'Completed' | 'Upcoming' | 'Cancelled' | 'Declined' | 'No-show'

/** Earliest booking in Micah's Square account. */
export const HISTORY_FLOOR = '2021-11-01T00:00:00Z'

export const CALENDAR_RESOURCES: ReadonlySet<string> = new Set(['calendar', 'calendar-booking', 'client-history'])

const COLOR_BY_ITEM_ID: Record<string, ServiceColorKey> = {
  YC5WXRVSX5IZ3UW7DYKPZZEE: 'lamination',
  W65IACOA3FHRYB37VBKLJ6UR: 'wax',
  '3RAVUNV7FLJBFDJ7QKW4QZYL': 'tint',
  BVWO65BJPHOOPXK4ZMMVRXC3: 'lash',
  BKVWRKCQQW55XGLWSGQV77CD: 'henna',
  CFLP5EFAXG45SVMX23YLSMMU: 'student',
}

export function serviceColorKey(itemId: string | null): ServiceColorKey {
  return (itemId && COLOR_BY_ITEM_ID[itemId]) || 'other'
}

const SOURCE_KEYS: Record<string, BookingSourceKey> = {
  API: 'website',
  FIRST_PARTY_MERCHANT: 'square',
  FIRST_PARTY_BUYER: 'square-booking-page',
  THIRD_PARTY_BUYER: 'google-instagram',
}

export function bookingSourceKey(source: string | undefined): BookingSourceKey {
  return (source && SOURCE_KEYS[source]) || 'other'
}

const HIDDEN_STATUSES = new Set(['CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_SELLER', 'DECLINED', 'NO_SHOW'])

export function isHiddenOnGrid(status: string): boolean {
  return HIDDEN_STATUSES.has(status)
}

export function historyStatus(status: string, startAtIso: string, nowMs: number): HistoryStatus {
  if (status === 'CANCELLED_BY_CUSTOMER' || status === 'CANCELLED_BY_SELLER') return 'Cancelled'
  if (status === 'DECLINED') return 'Declined'
  if (status === 'NO_SHOW') return 'No-show'
  return Date.parse(startAtIso) > nowMs ? 'Upcoming' : 'Completed'
}

const DAY_MS = 24 * 60 * 60 * 1000

/** Contiguous [from, to) windows of at most `maxDays`, the ListBookings range limit. */
export function splitWindows(fromIso: string, toIso: string, maxDays = 31): Array<[string, string]> {
  const end = Date.parse(toIso)
  const windows: Array<[string, string]> = []
  for (let start = Date.parse(fromIso); start < end; start += maxDays * DAY_MS) {
    const stop = Math.min(start + maxDays * DAY_MS, end)
    windows.push([new Date(start).toISOString(), new Date(stop).toISOString()])
  }
  return windows
}

export function toLocalParts(iso: string, tz: string): { dateKey: string; minuteOfDay: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(iso))
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00'
  return {
    dateKey: `${get('year')}-${get('month')}-${get('day')}`,
    minuteOfDay: Number(get('hour')) * 60 + Number(get('minute')),
  }
}

/** UTC instant of 00:00 local time on `dateKey` in `tz`. */
export function zonedMidnightUtc(dateKey: string, tz: string): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  const target = Date.UTC(y, m - 1, d)
  let guess = target
  // Two passes: the second corrects when the first guess lands across a DST change.
  for (let i = 0; i < 2; i++) {
    const local = toLocalParts(new Date(guess).toISOString(), tz)
    const [ly, lm, ld] = local.dateKey.split('-').map(Number)
    const localAsUtc = Date.UTC(ly, lm - 1, ld) + local.minuteOfDay * 60000
    guess += target - localAsUtc
  }
  return new Date(guess).toISOString()
}

export interface PricedLine {
  priceCents: number | null
  taxPercents: number[]
}

export function computeTotals(lines: PricedLine[]): { subtotalCents: number; taxCents: number; totalCents: number } {
  let subtotalCents = 0
  let taxCents = 0
  for (const line of lines) {
    if (line.priceCents == null) continue
    subtotalCents += line.priceCents
    for (const pct of line.taxPercents) taxCents += Math.round((line.priceCents * pct) / 100)
  }
  return { subtotalCents, taxCents, totalCents: subtotalCents + taxCents }
}

export interface ResolvedVariation {
  itemId: string | null
  serviceName: string
  variationName: string
  durationMinutes: number
  priceCents: number | null
  taxIds: string[]
}

export interface CalendarBlock {
  id: string
  startAt: string
  dateKey: string
  startMinute: number
  durationMinutes: number
  status: string
  source: BookingSourceKey
  customerId: string | null
  customerName: string | null
  services: Array<{ serviceName: string; colorKey: ServiceColorKey }>
}

export function toCalendarBlock(
  booking: any,
  resolve: (variationId: string, version: number) => ResolvedVariation | null,
  customerName: string | null,
  tz: string,
): CalendarBlock {
  const segments: any[] = booking.appointment_segments ?? []
  const local = toLocalParts(booking.start_at, tz)
  return {
    id: booking.id,
    startAt: booking.start_at,
    dateKey: local.dateKey,
    startMinute: local.minuteOfDay,
    durationMinutes: segments.reduce((sum, s) => sum + (Number(s.duration_minutes) || 0), 0),
    status: booking.status,
    source: bookingSourceKey(booking.source),
    customerId: booking.customer_id ?? null,
    customerName,
    services: segments.map((s) => {
      const v = resolve(s.service_variation_id, s.service_variation_version)
      return v
        ? { serviceName: v.serviceName, colorKey: serviceColorKey(v.itemId) }
        : { serviceName: 'Unknown service', colorKey: 'other' as const }
    }),
  }
}

// ── Square failure handling ───────────────────────────────────────────────────

type Sleep = (ms: number) => Promise<void>
const realSleep: Sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const RETRY_DELAYS_MS = [500, 1500]

function httpStatus(err: unknown): number | undefined {
  return (err as { status?: number } | null)?.status
}

/** Runs `fn`, retrying Square rate limits (429) on a short backoff. Other errors throw at once. */
export async function withRetry<T>(fn: () => Promise<T>, sleep: Sleep = realSleep): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (httpStatus(err) !== 429 || attempt >= RETRY_DELAYS_MS.length) throw err
      await sleep(RETRY_DELAYS_MS[attempt])
    }
  }
}

/** Like withRetry, but a 404 means "doesn't exist" and returns null. Anything else still throws. */
export async function fetchUnlessMissing<T>(fn: () => Promise<T>, sleep: Sleep = realSleep): Promise<T | null> {
  try {
    return await withRetry(fn, sleep)
  } catch (err) {
    if (httpStatus(err) === 404) return null
    throw err
  }
}

/** Maps with at most `limit` calls in flight, preserving order. */
export async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length)
  let next = 0
  const worker = async () => {
    while (next < items.length) {
      const i = next++
      out[i] = await fn(items[i])
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return out
}

/**
 * Cached lookup of a catalog object at a past version. Old versions never change, so a
 * found value or a 404 is cached for good; a transient failure is reported and retried next time.
 */
export function makeVersionResolver<T>(
  fetchVersion: (id: string, version: number) => Promise<T | null>,
  sleep: Sleep = realSleep,
) {
  const cache = new Map<string, T | null>()
  return async (id: string, version: number): Promise<{ value: T | null; failed: boolean }> => {
    const key = `${id}@${version}`
    if (cache.has(key)) return { value: cache.get(key)!, failed: false }
    try {
      const value = await fetchUnlessMissing(() => fetchVersion(id, version), sleep)
      cache.set(key, value)
      return { value, failed: false }
    } catch {
      return { value: null, failed: true }
    }
  }
}
