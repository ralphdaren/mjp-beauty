import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  FEE_REASONS,
  bookingTotalCents,
  feeCents,
  gstPortionCents,
  inclusiveBaseCents,
  isChargeable,
  validateAmount,
  pickCard,
  reclaimMissError,
} from '../api/_fee.ts'

test('bookingTotalCents adds GST over all services', () => {
  assert.equal(bookingTotalCents([10952]), 11500)
  assert.equal(bookingTotalCents([9048, 10952]), 21000)
})
test('bookingTotalCents returns null when any price is missing', () => {
  assert.equal(bookingTotalCents([10952, null]), null)
  assert.equal(bookingTotalCents([]), null)
})
test('feeCents applies reason percentage', () => {
  assert.equal(feeCents(11500, 'late'), 5750)
  assert.equal(feeCents(11500, 'same_day'), 11500)
  assert.equal(feeCents(11500, 'no_show'), 11500)
  assert.equal(feeCents(11500, 'late_arrival'), 5750)
  assert.equal(feeCents(5001, 'late'), 2501)
})
test('gstPortionCents and inclusiveBaseCents', () => {
  assert.equal(inclusiveBaseCents(5750), 5476)
  assert.equal(gstPortionCents(5750), 274)
})
const base = { status: 'cancelled', start_at: '2026-10-29T17:30:00Z', square_booking_id: 'b1', square_customer_id: 'c1', fee_status: null, fee_claimed_at: null }
const now = Date.parse('2026-11-06T12:00:00Z')
test('isChargeable for cancelled confirmed booking', () => assert.equal(isChargeable(base, now), true))
test('isChargeable false when square_booking_id is null', () => assert.equal(isChargeable({ ...base, square_booking_id: null }, now), false))
test('isChargeable false when no customer', () => assert.equal(isChargeable({ ...base, square_customer_id: null }, now), false))
test('isChargeable for past accepted, not future accepted', () => {
  assert.equal(isChargeable({ ...base, status: 'accepted' }, now), true)
  assert.equal(isChargeable({ ...base, status: 'accepted', start_at: '2026-11-20T17:00:00Z' }, now), false)
})
test('isChargeable false for pending, declined, charged, fresh charging', () => {
  assert.equal(isChargeable({ ...base, status: 'pending' }, now), false)
  assert.equal(isChargeable({ ...base, status: 'declined' }, now), false)
  assert.equal(isChargeable({ ...base, fee_status: 'charged' }, now), false)
  assert.equal(isChargeable({ ...base, fee_status: 'charging', fee_claimed_at: '2026-11-06T11:58:00Z' }, now), false)
})
test('isChargeable true for stale charging claim', () => {
  assert.equal(isChargeable({ ...base, fee_status: 'charging', fee_claimed_at: '2026-11-06T11:50:00Z' }, now), true)
})
test('validateAmount', () => {
  assert.equal(validateAmount(5750, 11500), null)
  assert.notEqual(validateAmount(0, 11500), null)
  assert.notEqual(validateAmount(-5, 11500), null)
  assert.notEqual(validateAmount(11501, 11500), null)
  assert.notEqual(validateAmount(12.5, 11500), null)
  assert.notEqual(validateAmount('5750', 11500), null)
})
test('validateAmount allows any positive amount when total is null', () => {
  assert.equal(validateAmount(99999, null), null)
})
test('validateAmount enforces ceiling when total is null', () => {
  assert.equal(validateAmount(1000000, null), null)
  assert.notEqual(validateAmount(1000001, null), null)
})
test('FEE_REASONS percentages', () => {
  assert.deepEqual(Object.fromEntries(Object.entries(FEE_REASONS).map(([k, v]) => [k, v.pct])),
    { late: 50, same_day: 100, no_show: 100, late_arrival: 50 })
})

const cards = [
  { id: 'a', customer_id: 'c1', enabled: true, created_at: '2026-08-01T00:00:00Z', card_brand: 'VISA', last_4: '1111' },
  { id: 'b', customer_id: 'c1', enabled: true, created_at: '2026-09-01T00:00:00Z', card_brand: 'MASTERCARD', last_4: '4084' },
  { id: 'x', customer_id: 'c2', enabled: true, created_at: '2026-10-01T00:00:00Z', card_brand: 'VISA', last_4: '9999' },
  { id: 'd', customer_id: 'c1', enabled: false, created_at: '2026-10-02T00:00:00Z', card_brand: 'VISA', last_4: '0000' },
]
test('pickCard prefers stored card', () => assert.deepEqual(pickCard(cards, 'c1', 'a'), { id: 'a', brand: 'VISA', last4: '1111' }))
test('pickCard falls back to newest enabled', () => {
  const r = pickCard(cards, 'c1', null)
  assert.ok(!('error' in r))
  assert.equal(r.id, 'b')
})
test('pickCard rejects card of another customer', () => {
  const r = pickCard(cards, 'c1', 'x')
  assert.ok(!('error' in r))
  assert.equal(r.id, 'b')
})
test('pickCard ignores disabled preferred', () => {
  const r = pickCard(cards, 'c1', 'd')
  assert.ok(!('error' in r))
  assert.equal(r.id, 'b')
})
test('pickCard error when none', () => assert.ok('error' in pickCard(cards, 'c3', null)))

test('reclaimMissError: charged row reports already charged', () => {
  assert.deepEqual(reclaimMissError('charged'), { message: 'Already charged', alreadyCharged: true })
})
test('reclaimMissError: fresh charging claim reports in progress, not already charged', () => {
  const e = reclaimMissError('charging')
  assert.equal(e.alreadyCharged, false)
  assert.equal(e.message, 'A charge for this booking is already in progress. Wait a moment and refresh.')
})
test('reclaimMissError: unknown or released status is never reported as charged', () => {
  assert.equal(reclaimMissError(null).alreadyCharged, false)
})
