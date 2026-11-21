import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

// Customer-facing copy on the booking page must not use em dashes (they read as AI-written).
// Read as text because booking.ts imports through the "@/" alias, which node can't resolve.
const FILES = ['src/data/booking.ts', 'src/components/booking/visitContent.tsx']

for (const file of FILES) {
  test(`${file} has no em dashes`, () => {
    const text = readFileSync(file, 'utf8')
    const lines = text.split('\n').filter((l) => l.includes('—')).map((l) => l.trim())
    assert.deepEqual(lines, [], `${file} still has em dashes`)
  })
}
