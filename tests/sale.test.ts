import { test } from 'node:test'
import assert from 'node:assert/strict'
import { percentOff, saleTagLabel } from '../src/lib/sale.ts'
import { isVipBonusShowing } from '../src/data/promos.ts'

test('percentOff rounds the discount from the two Shopify prices', () => {
  assert.equal(percentOff('551.65', '649.00'), 15)
  assert.equal(percentOff('721.65', '849.00'), 15)
  assert.equal(percentOff('24.65', '29.00'), 15)
})

test('percentOff is null when there is no real discount', () => {
  assert.equal(percentOff('649.00', null), null)
  assert.equal(percentOff('649.00', '649.00'), null)
  assert.equal(percentOff('649.00', '500.00'), null)
  assert.equal(percentOff('0', '29'), null)
})

test('percentOff is null when a compare-at typo rounds to 0% off', () => {
  assert.equal(percentOff('649.00', '650.00'), null)
})

test('saleTagLabel says Black Friday only while the sale dates run', () => {
  assert.equal(saleTagLabel(15, new Date('2026-11-20T12:00:00-05:00')), 'Black Friday · 15% off')
  assert.equal(saleTagLabel(15, new Date('2026-11-18T12:00:00-05:00')), '15% off')
  assert.equal(saleTagLabel(15, new Date('2026-11-27T12:00:00-05:00')), '15% off')
})

test('isVipBonusShowing follows the sale dates', () => {
  assert.equal(isVipBonusShowing(new Date('2026-11-20T12:00:00-05:00')), true)
  assert.equal(isVipBonusShowing(new Date('2026-11-18T12:00:00-05:00')), false)
  assert.equal(isVipBonusShowing(new Date('2026-11-26T00:00:00-05:00')), false)
})
