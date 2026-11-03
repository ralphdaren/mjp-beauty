import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  addDays,
  weekStart,
  rangeFor,
  shiftAnchor,
  todayKey,
  hourBounds,
  layoutDay,
} from '../src/components/admin/calendarDates.ts'

test('addDays crosses month and year', () => {
  assert.equal(addDays('2026-12-30', 3), '2027-01-02')
  assert.equal(addDays('2026-03-01', -1), '2026-02-28')
})

test('weekStart / rangeFor week', () => {
  assert.equal(weekStart('2026-11-03'), '2026-11-01')
  assert.equal(weekStart('2026-11-01'), '2026-11-01')
  assert.deepEqual(rangeFor('week', '2026-11-03'), { from: '2026-11-01', to: '2026-11-08' })
  assert.deepEqual(rangeFor('day', '2026-11-03'), { from: '2026-11-03', to: '2026-11-04' })
})

test('rangeFor month is 42 days from the Sunday on/before the 1st', () => {
  assert.deepEqual(rangeFor('month', '2026-12-17'), { from: '2026-11-29', to: '2027-01-10' })
})

test('shiftAnchor', () => {
  assert.equal(shiftAnchor('week', '2026-12-29', 1), '2027-01-05')
  assert.equal(shiftAnchor('month', '2026-01-31', 1), '2026-02-01')
  assert.equal(shiftAnchor('month', '2026-01-15', -1), '2025-12-01')
  assert.equal(shiftAnchor('day', '2026-11-01', -1), '2026-10-31')
})

test('todayKey in Winnipeg', () => {
  assert.equal(todayKey('America/Winnipeg', Date.parse('2026-11-04T03:00:00Z')), '2026-11-03')
})

test('hourBounds', () => {
  assert.deepEqual(hourBounds([]), { startHour: 9, endHour: 19 })
  assert.deepEqual(
    hourBounds([
      { startMinute: 450, durationMinutes: 75 },
      { startMinute: 1170, durationMinutes: 60 },
    ]),
    { startHour: 7, endHour: 21 },
  )
  assert.deepEqual(hourBounds([{ startMinute: 660, durationMinutes: 60 }]), { startHour: 9, endHour: 19 })
})

test('layoutDay puts overlaps side by side', () => {
  const out = layoutDay([
    { startMinute: 600, durationMinutes: 60 },
    { startMinute: 630, durationMinutes: 60 },
    { startMinute: 720, durationMinutes: 30 },
  ])
  assert.deepEqual(
    out.map((o) => [o.lane, o.lanes]),
    [
      [0, 2],
      [1, 2],
      [0, 1],
    ],
  )
})

test('layoutDay reuses a freed lane inside one cluster', () => {
  const out = layoutDay([
    { startMinute: 600, durationMinutes: 120 },
    { startMinute: 600, durationMinutes: 30 },
    { startMinute: 660, durationMinutes: 30 },
  ])
  assert.deepEqual(
    out.map((o) => [o.lane, o.lanes]),
    [
      [0, 2],
      [1, 2],
      [1, 2],
    ],
  )
})
