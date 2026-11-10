import { test } from 'node:test'
import assert from 'node:assert/strict'
import { destinationFor, safeNext } from '../src/lib/auth/redirects.ts'

test('destinationFor sends admins to /admin and everyone else to /portal', () => {
  assert.equal(destinationFor('admin'), '/admin')
  assert.equal(destinationFor('student'), '/portal')
  assert.equal(destinationFor(null), '/portal')
})

test('destinationFor prefers a safe next path', () => {
  assert.equal(destinationFor('student', '/portal/account'), '/portal/account')
  assert.equal(destinationFor('admin', '/admin?x=1'), '/admin?x=1')
})

test('safeNext rejects open redirects and non-paths', () => {
  for (const bad of ['//evil.com', 'https://evil.com', '/\\evil.com', 'javascript:alert(1)', 'portal', '', null, undefined]) {
    assert.equal(safeNext(bad), null, String(bad))
    assert.equal(destinationFor('admin', bad), '/admin')
  }
})
