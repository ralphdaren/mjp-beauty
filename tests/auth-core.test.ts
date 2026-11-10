import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isAdminRole, parseBearer } from '../api/_auth-core.ts'

test('parseBearer extracts the token', () => {
  assert.equal(parseBearer('Bearer abc.def'), 'abc.def')
  assert.equal(parseBearer('bearer abc'), 'abc')
})

test('parseBearer rejects missing, empty and repeated headers', () => {
  assert.equal(parseBearer(undefined), null)
  assert.equal(parseBearer('Bearer '), null)
  assert.equal(parseBearer('Basic abc'), null)
  assert.equal(parseBearer(['Bearer a', 'Bearer b']), null)
})

test('isAdminRole only accepts admin', () => {
  assert.equal(isAdminRole('admin'), true)
  assert.equal(isAdminRole('student'), false)
  assert.equal(isAdminRole('Admin'), false)
  assert.equal(isAdminRole(undefined), false)
})
