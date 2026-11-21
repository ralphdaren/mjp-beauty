import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { Service } from '../src/types/booking.ts'
import { fromPrice, initialOpenId, resolveSelection, summaryLine } from '../src/lib/serviceMenu.ts'

const lam: Service = {
  id: 'brow-lam',
  name: 'Brow Lamination',
  tagline: '',
  description: '',
  duration: '',
  images: [],
  video: null,
  tiers: [
    { squareVariationId: 'J6EZ', label: 'Signature Lamination Package (with Tint)', price: '$123.81', priceCents: 12381 },
    { squareVariationId: '4RVT', label: 'Brow Lamination Maintenance (No Tint)', price: '$47.62' },
    { squareVariationId: 'E6FT', label: 'Brow Lamination Only (No Shaping, No Tint)', price: '$80.95' },
  ],
}

const lash: Service = {
  ...lam,
  id: 'keratin-lt',
  name: 'Keratin Lash Lift',
  tiers: [
    { squareVariationId: 'QUUX', label: 'With Tint', price: '$104.76', duration: '1 hr' },
    { squareVariationId: '4TCR', label: 'No Tint', price: '$95.24', duration: '45 min' },
  ],
}

const wax: Service = {
  ...lam,
  id: 'brow-wt',
  name: 'Brow Shape & Wax',
  tiers: [{ label: 'Returning Client', price: '$47.62' }],
}

test('fromPrice returns the lowest tier price', () => {
  assert.equal(fromPrice(lam), '$47.62')
})

test('fromPrice is null for a service with no tiers', () => {
  assert.equal(fromPrice({ ...lam, tiers: [] }), null)
})

test('initialOpenId opens the service named in the hash', () => {
  assert.equal(initialOpenId([lam, lash], '#keratin-lt'), 'keratin-lt')
})

test('initialOpenId falls back to the first service for unknown or empty hash', () => {
  assert.equal(initialOpenId([lam, lash], '#nope'), 'brow-lam')
  assert.equal(initialOpenId([lam, lash], ''), 'brow-lam')
  assert.equal(initialOpenId([], ''), null)
})

test('resolveSelection keeps a pick when Square data replaces the list', () => {
  const sel = { serviceId: 'brow-lam', tierKey: 'J6EZ' }
  const fromSquare = [{ ...lam, tiers: [{ ...lam.tiers[0], price: '$130.00', priceCents: 13000 }] }]
  assert.equal(resolveSelection(fromSquare, sel)?.tier.price, '$130.00')
})

test('resolveSelection drops a pick whose variation no longer exists', () => {
  assert.equal(resolveSelection([{ ...lam, tiers: [] }], { serviceId: 'brow-lam', tierKey: 'J6EZ' }), null)
  assert.equal(resolveSelection([lam], null), null)
})

test('resolveSelection falls back to label when a tier has no Square id', () => {
  const picked = resolveSelection([wax], { serviceId: 'brow-wt', tierKey: 'Returning Client' })
  assert.equal(picked?.tier.label, 'Returning Client')
})

test('summaryLine joins service and variation with a colon', () => {
  assert.equal(summaryLine(lash, lash.tiers[0]), 'Keratin Lash Lift: With Tint')
})
