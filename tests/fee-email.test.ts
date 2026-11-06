import { test } from 'node:test'
import assert from 'node:assert/strict'
import { renderFeeEmail, formatCardBrand, formatMoney } from '../api/_fee-email.ts'

const d = {
  firstName: 'Jo<b>',
  appointmentText: 'Thursday, October 29, 2026 at 12:30 p.m.',
  services: [{ serviceName: 'BROW LAMINATION', tierLabel: 'Naked Brow Lamination (No Tint)' }],
  totalCents: 11500,
  reason: 'late' as const,
  reasonLabel: 'Late cancellation',
  pct: 50,
  amountCents: 5750,
  edited: false,
  cardBrand: 'MASTERCARD',
  cardLast4: '4084',
}

test('subject', () => assert.equal(renderFeeEmail(d).subject, 'Cancellation fee for your MJP Beauty appointment'))

test('escapes client name', () => assert.ok(renderFeeEmail(d).html.includes('Jo&lt;b&gt;')))

test('shows amount, card, pct and GST', () => {
  const h = renderFeeEmail(d).html
  for (const s of ['$57.50', '4084', '50% of your booking', '$2.74', 'Late cancellation', 'Mastercard']) {
    assert.ok(h.includes(s), s)
  }
})

test('edited amount drops pct text', () =>
  assert.ok(!renderFeeEmail({ ...d, edited: true, amountCents: 3000 }).html.includes('% of your booking')))

test('late arrival reason text', () => {
  const h = renderFeeEmail({ ...d, reason: 'late_arrival', reasonLabel: 'Late arrival', pct: 50 }).html
  assert.ok(h.includes('Late arrival'))
  assert.ok(h.includes('You arrived more than 10 minutes late, so your appointment was cancelled.'))
})

test('reason sentences', () => {
  assert.ok(renderFeeEmail(d).html.includes("Your appointment was cancelled with less than 48 hours' notice."))
  assert.ok(
    renderFeeEmail({ ...d, reason: 'same_day', reasonLabel: 'Same-day cancellation', pct: 100 }).html.includes(
      'Your appointment was cancelled within 24 hours of the appointment time.',
    ),
  )
  assert.ok(
    renderFeeEmail({ ...d, reason: 'no_show', reasonLabel: 'No-show', pct: 100 }).html.includes(
      'You did not come to your appointment.',
    ),
  )
})

test('contact line, no reply-to text, no em dash', () => {
  const h = renderFeeEmail(d).html
  assert.ok(h.includes('please text Micah or send a DM on Instagram at @mjpbeauty'))
  assert.ok(!/reply to this email/i.test(h))
  assert.ok(!h.includes('—'))
  assert.ok(h.includes('Micah at MJP Beauty'))
})

test('unknown total omits booking total row', () =>
  assert.ok(!renderFeeEmail({ ...d, totalCents: null, edited: true }).html.includes('Booking total')))

test('formatCardBrand', () => {
  assert.equal(formatCardBrand('MASTERCARD'), 'Mastercard')
  assert.equal(formatCardBrand('VISA'), 'Visa')
  assert.equal(formatCardBrand('AMERICAN_EXPRESS'), 'American Express')
  assert.equal(formatCardBrand('DISCOVER_DINERS'), 'Discover Diners')
})

test('formatMoney', () => {
  assert.equal(formatMoney(5750), '$57.50')
  assert.equal(formatMoney(123456), '$1,234.56')
  assert.equal(formatMoney(5), '$0.05')
})
