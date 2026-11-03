import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  serviceColorKey,
  bookingSourceKey,
  isHiddenOnGrid,
  historyStatus,
  splitWindows,
  zonedMidnightUtc,
  toLocalParts,
  computeTotals,
  toCalendarBlock,
  withRetry,
  fetchUnlessMissing,
  mapLimit,
  makeVersionResolver,
  type ResolvedVariation,
} from '../api/_calendar.ts'

test('serviceColorKey maps the six item ids and falls back', () => {
  assert.equal(serviceColorKey('YC5WXRVSX5IZ3UW7DYKPZZEE'), 'lamination')
  assert.equal(serviceColorKey('W65IACOA3FHRYB37VBKLJ6UR'), 'wax')
  assert.equal(serviceColorKey('3RAVUNV7FLJBFDJ7QKW4QZYL'), 'tint')
  assert.equal(serviceColorKey('BVWO65BJPHOOPXK4ZMMVRXC3'), 'lash')
  assert.equal(serviceColorKey('BKVWRKCQQW55XGLWSGQV77CD'), 'henna')
  assert.equal(serviceColorKey('CFLP5EFAXG45SVMX23YLSMMU'), 'student')
  assert.equal(serviceColorKey('SOMETHING_ELSE'), 'other')
  assert.equal(serviceColorKey(null), 'other')
})

test('bookingSourceKey', () => {
  assert.equal(bookingSourceKey('API'), 'website')
  assert.equal(bookingSourceKey('FIRST_PARTY_MERCHANT'), 'square')
  assert.equal(bookingSourceKey('FIRST_PARTY_BUYER'), 'square-booking-page')
  assert.equal(bookingSourceKey('THIRD_PARTY_BUYER'), 'google-instagram')
  assert.equal(bookingSourceKey(undefined), 'other')
})

test('grid hides cancelled, declined, no-show only', () => {
  for (const s of ['CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_SELLER', 'DECLINED', 'NO_SHOW']) {
    assert.equal(isHiddenOnGrid(s), true)
  }
  for (const s of ['ACCEPTED', 'PENDING']) assert.equal(isHiddenOnGrid(s), false)
})

test('historyStatus', () => {
  const now = Date.parse('2026-11-03T12:00:00Z')
  assert.equal(historyStatus('ACCEPTED', '2026-08-06T20:00:00Z', now), 'Completed')
  assert.equal(historyStatus('ACCEPTED', '2026-12-17T17:00:00Z', now), 'Upcoming')
  assert.equal(historyStatus('PENDING', '2026-12-17T17:00:00Z', now), 'Upcoming')
  assert.equal(historyStatus('CANCELLED_BY_SELLER', '2026-04-28T15:00:00Z', now), 'Cancelled')
  assert.equal(historyStatus('NO_SHOW', '2026-07-01T15:00:00Z', now), 'No-show')
  assert.equal(historyStatus('DECLINED', '2026-07-01T15:00:00Z', now), 'Declined')
})

test('splitWindows covers range in ≤31-day contiguous pieces', () => {
  const w = splitWindows('2026-11-01T00:00:00Z', '2026-12-13T00:00:00Z')
  assert.equal(w.length, 2)
  assert.equal(w[0][0], '2026-11-01T00:00:00.000Z')
  assert.equal(w[0][1], w[1][0])
  assert.equal(w[1][1], '2026-12-13T00:00:00.000Z')
  assert.equal(splitWindows('2026-11-01T00:00:00Z', '2026-11-08T00:00:00Z').length, 1)
  assert.equal(splitWindows('2026-11-01T00:00:00Z', '2026-12-02T00:00:00Z').length, 1)
})

test('zonedMidnightUtc across the 2026-11-01 DST change', () => {
  assert.equal(zonedMidnightUtc('2026-11-01', 'America/Winnipeg'), '2026-11-01T05:00:00.000Z')
  assert.equal(zonedMidnightUtc('2026-11-02', 'America/Winnipeg'), '2026-11-02T06:00:00.000Z')
  assert.equal(zonedMidnightUtc('2026-07-15', 'America/Winnipeg'), '2026-07-15T05:00:00.000Z')
})

test('toLocalParts', () => {
  assert.deepEqual(toLocalParts('2026-11-08T16:30:00Z', 'America/Winnipeg'), { dateKey: '2026-11-08', minuteOfDay: 630 })
  assert.deepEqual(toLocalParts('2026-11-03T04:30:00Z', 'America/Winnipeg'), { dateKey: '2026-11-02', minuteOfDay: 1350 })
})

test('computeTotals matches real Square charges', () => {
  assert.deepEqual(computeTotals([{ priceCents: 6667, taxPercents: [5] }]), {
    subtotalCents: 6667,
    taxCents: 333,
    totalCents: 7000,
  })
  assert.deepEqual(
    computeTotals([
      { priceCents: 6190, taxPercents: [5] },
      { priceCents: 4762, taxPercents: [5] },
    ]),
    { subtotalCents: 10952, taxCents: 548, totalCents: 11500 },
  )
  assert.deepEqual(
    computeTotals([
      { priceCents: null, taxPercents: [5] },
      { priceCents: 4762, taxPercents: [5] },
    ]),
    { subtotalCents: 4762, taxCents: 238, totalCents: 5000 },
  )
})

test('toCalendarBlock: multi-service, unknown service, no customer', () => {
  const booking = {
    id: 'b1',
    start_at: '2026-11-08T16:30:00Z',
    status: 'ACCEPTED',
    source: 'API',
    customer_id: null,
    appointment_segments: [
      { service_variation_id: 'v1', service_variation_version: 1, duration_minutes: 75 },
      { service_variation_id: 'gone', service_variation_version: 9, duration_minutes: 30 },
    ],
  }
  const resolve = (id: string): ResolvedVariation | null =>
    id === 'v1'
      ? {
          itemId: 'YC5WXRVSX5IZ3UW7DYKPZZEE',
          serviceName: 'BROW LAMINATION',
          variationName: 'x',
          durationMinutes: 75,
          priceCents: 6190,
          taxIds: [],
        }
      : null
  const block = toCalendarBlock(booking, resolve, null, 'America/Winnipeg')
  assert.equal(block.durationMinutes, 105)
  assert.equal(block.startMinute, 630)
  assert.equal(block.dateKey, '2026-11-08')
  assert.equal(block.source, 'website')
  assert.equal(block.customerName, null)
  assert.deepEqual(block.services, [
    { serviceName: 'BROW LAMINATION', colorKey: 'lamination' },
    { serviceName: 'Unknown service', colorKey: 'other' },
  ])
})

// ── Square failure handling (review findings #2, #3) ──────────────────────────

const noSleep = async () => {}
const squareError = (status: number) => Object.assign(new Error(`HTTP ${status}`), { status })

test('withRetry retries 429s, then succeeds', async () => {
  let calls = 0
  const result = await withRetry(async () => {
    calls++
    if (calls < 3) throw squareError(429)
    return 'ok'
  }, noSleep)
  assert.equal(result, 'ok')
  assert.equal(calls, 3)
})

test('withRetry gives up after the backoff schedule and rethrows', async () => {
  let calls = 0
  await assert.rejects(
    withRetry(async () => {
      calls++
      throw squareError(429)
    }, noSleep),
    /HTTP 429/,
  )
  assert.equal(calls, 3)
})

test('withRetry does not retry non-429 errors', async () => {
  let calls = 0
  await assert.rejects(
    withRetry(async () => {
      calls++
      throw squareError(500)
    }, noSleep),
    /HTTP 500/,
  )
  assert.equal(calls, 1)
})

test('fetchUnlessMissing returns null only for 404 and throws other failures', async () => {
  assert.equal(await fetchUnlessMissing(async () => { throw squareError(404) }, noSleep), null)
  await assert.rejects(fetchUnlessMissing(async () => { throw squareError(503) }, noSleep), /HTTP 503/)
  assert.equal(await fetchUnlessMissing(async () => 'customer', noSleep), 'customer')
})

test('mapLimit never runs more than the limit at once and keeps order', async () => {
  let running = 0
  let peak = 0
  const out = await mapLimit([1, 2, 3, 4, 5, 6, 7], 3, async (n) => {
    running++
    peak = Math.max(peak, running)
    await new Promise((r) => setTimeout(r, 5))
    running--
    return n * 10
  })
  assert.deepEqual(out, [10, 20, 30, 40, 50, 60, 70])
  assert.ok(peak <= 3, `peak ${peak}`)
})

test('versioned lookup cache: 404 is cached as missing, a transient failure is not', async () => {
  let calls = 0
  let mode: 'missing' | 'flaky' | 'ok' = 'missing'
  const resolve = makeVersionResolver(async () => {
    calls++
    if (mode === 'missing') throw squareError(404)
    if (mode === 'flaky') throw squareError(429)
    return 'BROW LAMINATION'
  }, noSleep)

  assert.deepEqual(await resolve('gone', 1), { value: null, failed: false })
  assert.deepEqual(await resolve('gone', 1), { value: null, failed: false })
  assert.equal(calls, 1, '404 result is cached')

  mode = 'flaky'
  calls = 0
  assert.deepEqual(await resolve('v', 2), { value: null, failed: true })
  assert.equal(calls, 3, 'retried before failing')
  mode = 'ok'
  assert.deepEqual(await resolve('v', 2), { value: 'BROW LAMINATION', failed: false }, 'failure was not cached')
})
