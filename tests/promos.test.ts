import { test } from 'node:test'
import assert from 'node:assert/strict'
import { BLACK_FRIDAY, countdownParts, hasBlackFridayStarted } from '../src/data/promos.ts'

test('countdownParts splits the time left into days, hours, minutes, seconds', () => {
  const now = new Date('2026-11-18T06:58:30-05:00')
  assert.deepEqual(countdownParts(BLACK_FRIDAY.startsAt, now), { days: 1, hours: 1, minutes: 1, seconds: 30 })
})

test('countdownParts clamps at zero once the target has passed', () => {
  const now = new Date('2026-11-19T08:00:05-05:00')
  assert.deepEqual(countdownParts(BLACK_FRIDAY.startsAt, now), { days: 0, hours: 0, minutes: 0, seconds: 0 })
})

test('countdownParts counts down to the sale end at midnight after Nov 25', () => {
  const now = new Date('2026-11-25T23:59:00-05:00')
  assert.deepEqual(countdownParts(BLACK_FRIDAY.endsAt, now), { days: 0, hours: 0, minutes: 1, seconds: 0 })
})

test('the sale starts at 8 AM Manitoba time on Nov 19', () => {
  assert.equal(hasBlackFridayStarted(new Date('2026-11-19T07:59:59-05:00')), false)
  assert.equal(hasBlackFridayStarted(new Date('2026-11-19T08:00:00-05:00')), true)
})
