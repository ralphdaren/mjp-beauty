import { test } from 'node:test'
import assert from 'node:assert/strict'
import { findConflicts, holdSellerNote } from '../api/_hold-rules.ts'

const at = (hhmm: string) => new Date(`2026-11-26T${hhmm}:00Z`).getTime()

function booking(id: string, start: string, minutes: number, status = 'ACCEPTED') {
  return {
    id,
    status,
    start_at: `2026-11-26T${start}:00Z`,
    appointment_segments: [{ duration_minutes: minutes }],
  }
}

test('findConflicts flags a booking that overlaps the range', () => {
  const kiah = booking('kiah', '19:35', 60)
  assert.deepEqual(findConflicts([kiah], at('19:35'), at('20:35')), [kiah])
})

test('findConflicts ignores bookings that only touch the edges', () => {
  const before = booking('before', '18:35', 60)
  const after = booking('after', '20:35', 30)
  assert.deepEqual(findConflicts([before, after], at('19:35'), at('20:35')), [])
})

test('findConflicts adds up every segment of a multi-service booking', () => {
  const long = { ...booking('long', '19:00', 20), appointment_segments: [{ duration_minutes: 20 }, { duration_minutes: 30 }] }
  assert.deepEqual(findConflicts([long], at('19:35'), at('20:35')), [long])
})

test('findConflicts ignores cancelled, declined and no-show bookings', () => {
  const gone = ['CANCELLED_BY_SELLER', 'CANCELLED_BY_CUSTOMER', 'DECLINED', 'NO_SHOW']
    .map((status, i) => booking(`gone${i}`, '19:35', 60, status))
  assert.deepEqual(findConflicts(gone, at('19:35'), at('20:35')), [])
})

test('findConflicts counts pending Square bookings as taken', () => {
  const pending = booking('pending', '19:35', 60, 'PENDING')
  assert.deepEqual(findConflicts([pending], at('19:35'), at('20:35')), [pending])
})

test('findConflicts skips the excluded ids (our own hold)', () => {
  const hold = booking('hold', '19:35', 60)
  assert.deepEqual(findConflicts([hold], at('19:35'), at('20:35'), ['hold']), [])
})

test('holdSellerNote names the client, contact details and services', () => {
  const note = holdSellerNote({
    firstName: 'Patricia',
    lastName: 'Smith',
    email: 'pat@example.com',
    phone: '204-555-0100',
    services: ['Brow Lamination: Signature Lamination Package (with Tint)'],
  })
  assert.match(note, /Patricia Smith/)
  assert.match(note, /pat@example\.com/)
  assert.match(note, /204-555-0100/)
  assert.match(note, /Signature Lamination Package/)
  assert.match(note, /admin dashboard/i)
})

test('holdSellerNote leaves out a missing phone and uses no em dashes', () => {
  const note = holdSellerNote({ firstName: 'Kara', lastName: '', email: 'k@example.com', phone: null, services: ['Returning Client'] })
  assert.doesNotMatch(note, /null|undefined/)
  assert.doesNotMatch(note, /—/)
})
