// Square reads for the admin Brow Services calendar. View-only: nothing here writes to Square.

import { squareFetch, getLocationId, getCatalogItems } from './_square.js'
import {
  HISTORY_FLOOR,
  bookingSourceKey,
  computeTotals,
  fetchUnlessMissing,
  historyStatus,
  isHiddenOnGrid,
  makeVersionResolver,
  mapLimit,
  serviceColorKey,
  splitWindows,
  toCalendarBlock,
  toLocalParts,
  withRetry,
  zonedMidnightUtc,
  type BookingSourceKey,
  type CalendarBlock,
  type HistoryStatus,
  type ResolvedVariation,
  type ServiceColorKey,
} from './_calendar.js'

const TZ = 'America/Winnipeg'
const CONCURRENCY = 12

export interface Customer {
  id: string
  name: string
  phone: string | null
  email: string | null
  note: string | null
}

export interface AppointmentService extends ResolvedVariation {
  colorKey: ServiceColorKey
  taxPercents: number[]
}

export interface AppointmentDetail {
  id: string
  startAt: string
  endAt: string
  dateKey: string
  startMinute: number
  durationMinutes: number
  status: string
  source: BookingSourceKey
  bookedAt: string
  teamMemberName: string | null
  customer: Customer | null
  customerNote: string | null
  services: AppointmentService[]
  totals: { subtotalCents: number; taxCents: number; totalCents: number }
}

export interface HistoryEntry {
  id: string
  startAt: string
  dateKey: string
  serviceNames: string[]
  status: HistoryStatus
}

export interface HistoryChunk {
  entries: HistoryEntry[]
  nextBefore: string | null
  failedWindows: number
}

/** Runs `fn` over windows, CONCURRENCY at a time, retrying Square 429s. Failures are counted, never dropped silently. */
async function runWindows<T>(
  windows: Array<[string, string]>,
  fn: (w: [string, string]) => Promise<T[]>,
): Promise<{ results: T[]; failed: number }> {
  const batches = await mapLimit(windows, CONCURRENCY, (w) => withRetry(() => fn(w)).catch(() => null))
  return {
    results: batches.flatMap((b) => b ?? []),
    failed: batches.filter((b) => b === null).length,
  }
}

async function listBookingsWindow([from, to]: [string, string], customerId?: string): Promise<any[]> {
  const locationId = await getLocationId()
  const bookings: any[] = []
  let cursor: string | undefined
  do {
    const q = new URLSearchParams({ location_id: locationId, start_at_min: from, start_at_max: to, limit: '100' })
    if (customerId) q.set('customer_id', customerId)
    if (cursor) q.set('cursor', cursor)
    const data = await squareFetch(`/v2/bookings?${q}`)
    bookings.push(...(data.bookings ?? []))
    cursor = data.cursor
  } while (cursor)
  return bookings
}

let _taxCache: { taxes: Map<string, number>; fetchedAt: number } | null = null

async function getTaxPercents(): Promise<Map<string, number>> {
  const now = Date.now()
  if (_taxCache && now - _taxCache.fetchedAt < 5 * 60 * 1000) return _taxCache.taxes
  const data = await squareFetch('/v2/catalog/list?types=TAX')
  const taxes = new Map<string, number>()
  for (const t of data.objects ?? []) {
    const d = t.tax_data
    if (d?.enabled && d.inclusion_type === 'ADDITIVE' && d.percentage) taxes.set(t.id, Number(d.percentage))
  }
  _taxCache = { taxes, fetchedAt: now }
  return taxes
}

function toResolved(item: any, variation: any): ResolvedVariation {
  const v = variation.item_variation_data ?? {}
  return {
    itemId: item?.id ?? v.item_id ?? null,
    serviceName: item?.item_data?.name ?? 'Unknown service',
    variationName: v.name ?? '',
    durationMinutes: v.service_duration != null ? Math.round(v.service_duration / 60000) : 0,
    priceCents: v.price_money?.amount ?? null,
    taxIds: item?.item_data?.tax_ids ?? [],
  }
}

// Retired variations, looked up at the catalog version the booking used. Lives for the function instance.
const resolveRetired = makeVersionResolver(async (id, version) => {
  const data = await squareFetch(
    `/v2/catalog/object/${encodeURIComponent(id)}?catalog_version=${version}&include_related_objects=true`,
  )
  const item = (data.related_objects ?? []).find((o: any) => o.type === 'ITEM')
  return data.object ? toResolved(item, data.object) : null
})

async function resolveVariation(id: string, version: number): Promise<{ value: ResolvedVariation | null; failed: boolean }> {
  for (const item of await getCatalogItems()) {
    const v = (item.item_data?.variations ?? []).find((x: any) => x.id === id)
    if (v) return { value: toResolved(item, v), failed: false }
  }
  return resolveRetired(id, version)
}

/**
 * Resolves every distinct (variation, version) in the bookings, returning a synchronous lookup.
 * `failedLookups` counts names Square couldn't return right now, so callers can surface it.
 */
async function buildResolver(bookings: any[]) {
  const keys = new Map<string, [string, number]>()
  for (const b of bookings) {
    for (const s of b.appointment_segments ?? []) {
      keys.set(`${s.service_variation_id}@${s.service_variation_version}`, [
        s.service_variation_id,
        s.service_variation_version,
      ])
    }
  }
  const resolved = new Map<string, ResolvedVariation | null>()
  const results = await mapLimit([...keys], CONCURRENCY, async ([key, [id, version]]) => {
    const r = await resolveVariation(id, version)
    resolved.set(key, r.value)
    return r.failed
  })
  return {
    resolve: (id: string, version: number) => resolved.get(`${id}@${version}`) ?? null,
    failedLookups: results.filter(Boolean).length,
  }
}

function toCustomer(c: any): Customer {
  const name = [c.given_name, c.family_name].filter(Boolean).join(' ').trim()
  return {
    id: c.id,
    name: name || c.company_name || '',
    phone: c.phone_number ?? null,
    email: c.email_address ?? null,
    note: c.note ?? null,
  }
}

async function getCustomers(ids: string[]): Promise<Map<string, Customer>> {
  const out = new Map<string, Customer>()
  const unique = [...new Set(ids)]
  for (let i = 0; i < unique.length; i += 100) {
    const data = await squareFetch('/v2/customers/bulk-retrieve', {
      method: 'POST',
      body: JSON.stringify({ customer_ids: unique.slice(i, i + 100) }),
    })
    for (const r of Object.values<any>(data.responses ?? {})) {
      if (r.customer) out.set(r.customer.id, toCustomer(r.customer))
    }
  }
  return out
}

export async function listCalendarBlocks(
  fromDateKey: string,
  toDateKeyExclusive: string,
): Promise<{ blocks: CalendarBlock[]; failedWindows: number }> {
  const windows = splitWindows(zonedMidnightUtc(fromDateKey, TZ), zonedMidnightUtc(toDateKeyExclusive, TZ))
  const { results, failed } = await runWindows(windows, (w) => listBookingsWindow(w))
  const visible = results.filter((b) => !isHiddenOnGrid(b.status))
  const [{ resolve, failedLookups }, customers] = await Promise.all([
    buildResolver(visible),
    getCustomers(visible.map((b) => b.customer_id).filter(Boolean)),
  ])
  const blocks = visible
    .map((b) => toCalendarBlock(b, resolve, customers.get(b.customer_id)?.name || null, TZ))
    .sort((a, b) => a.startAt.localeCompare(b.startAt))
  return { blocks, failedWindows: failed + failedLookups }
}

export async function getAppointmentDetail(bookingId: string): Promise<AppointmentDetail> {
  const { booking } = await withRetry(() => squareFetch(`/v2/bookings/${encodeURIComponent(bookingId)}`))
  const segments: any[] = booking.appointment_segments ?? []
  const teamMemberId = segments[0]?.team_member_id

  // A missing customer (404) is "No client on file"; any other failure throws so the panel
  // shows an error with Retry instead of quietly hiding a real client.
  const [{ resolve, failedLookups }, taxes, customer, teamMemberName] = await Promise.all([
    buildResolver([booking]),
    getTaxPercents(),
    booking.customer_id
      ? fetchUnlessMissing(() => squareFetch(`/v2/customers/${encodeURIComponent(booking.customer_id)}`)).then(
          (d) => (d?.customer ? toCustomer(d.customer) : null),
        )
      : Promise.resolve(null),
    teamMemberId
      ? squareFetch(`/v2/team-members/${encodeURIComponent(teamMemberId)}`)
          .then((d) => [d.team_member?.given_name, d.team_member?.family_name].filter(Boolean).join(' ') || null)
          .catch(() => null)
      : Promise.resolve(null),
  ])

  if (failedLookups > 0) throw new Error("Couldn't load service details from Square. Try again.")

  const services: AppointmentService[] = segments.map((s) => {
    const v = resolve(s.service_variation_id, s.service_variation_version) ?? {
      itemId: null,
      serviceName: 'Unknown service',
      variationName: '',
      durationMinutes: Number(s.duration_minutes) || 0,
      priceCents: null,
      taxIds: [],
    }
    return {
      ...v,
      colorKey: serviceColorKey(v.itemId),
      taxPercents: v.taxIds.map((id) => taxes.get(id)).filter((p): p is number => p != null),
    }
  })

  const durationMinutes = segments.reduce((sum, s) => sum + (Number(s.duration_minutes) || 0), 0)
  const local = toLocalParts(booking.start_at, TZ)
  return {
    id: booking.id,
    startAt: booking.start_at,
    endAt: new Date(Date.parse(booking.start_at) + durationMinutes * 60000).toISOString(),
    dateKey: local.dateKey,
    startMinute: local.minuteOfDay,
    durationMinutes,
    status: booking.status,
    source: bookingSourceKey(booking.source),
    bookedAt: booking.created_at,
    teamMemberName,
    customer,
    customerNote: booking.customer_note || null,
    services,
    totals: computeTotals(services),
  }
}

export async function getClientHistoryChunk(
  customerId: string,
  beforeIso: string | null,
  months: number,
): Promise<HistoryChunk> {
  // Two round trips: the first covers upcoming bookings plus the last `months`, so the
  // panel fills almost at once; the second (`beforeIso` set) fetches everything older
  // in one request, which shares one warm catalog/location cache instead of seven.
  const before = beforeIso ? new Date(beforeIso) : new Date(Date.now() + 366 * 24 * 60 * 60 * 1000)
  const start = new Date()
  start.setUTCMonth(start.getUTCMonth() - months)
  const reachedFloor = beforeIso !== null || start.getTime() <= Date.parse(HISTORY_FLOOR)
  const from = reachedFloor ? HISTORY_FLOOR : start.toISOString()

  const { results, failed } = await runWindows(splitWindows(from, before.toISOString()), (w) =>
    listBookingsWindow(w, customerId),
  )
  const { resolve, failedLookups } = await buildResolver(results)
  const now = Date.now()
  const entries = results
    .sort((a, b) => b.start_at.localeCompare(a.start_at))
    .map((b) => ({
      id: b.id,
      startAt: b.start_at,
      dateKey: toLocalParts(b.start_at, TZ).dateKey,
      serviceNames: (b.appointment_segments ?? []).map(
        (s: any) => resolve(s.service_variation_id, s.service_variation_version)?.serviceName ?? 'Unknown service',
      ),
      status: historyStatus(b.status, b.start_at, now),
    }))
  return { entries, nextBefore: reachedFloor ? null : from, failedWindows: failed + failedLookups }
}
