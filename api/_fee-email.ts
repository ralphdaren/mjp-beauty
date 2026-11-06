// The email a client gets after Micah charges a cancellation fee.
// No runtime imports on purpose: tests load this file directly with Node.
import type { FeeReason } from './_fee.js'

export interface FeeEmailData {
  firstName: string
  appointmentText: string
  services: Array<{ serviceName: string; tierLabel: string }>
  totalCents: number | null
  reason: FeeReason
  reasonLabel: string
  pct: number
  amountCents: number
  edited: boolean
  cardBrand: string
  cardLast4: string
}

const REASON_SENTENCES: Record<FeeReason, string> = {
  late: "Your appointment was cancelled with less than 48 hours' notice.",
  same_day: 'Your appointment was cancelled within 24 hours of the appointment time.',
  no_show: 'You did not come to your appointment.',
  late_arrival: 'You arrived more than 10 minutes late, so your appointment was cancelled.',
}

const CONTACT_LINE =
  'If you have any questions about this charge, please text Micah or send a DM on Instagram at @mjpbeauty.'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** 5750 → "$57.50" */
export function formatMoney(cents: number): string {
  const sign = cents < 0 ? '-' : ''
  const abs = Math.abs(Math.round(cents))
  const dollars = Math.floor(abs / 100).toLocaleString('en-CA')
  return `${sign}$${dollars}.${String(abs % 100).padStart(2, '0')}`
}

/** Square's "AMERICAN_EXPRESS" → "American Express" */
export function formatCardBrand(brand: string): string {
  if (brand.toUpperCase() === 'MASTERCARD') return 'Mastercard'
  return brand
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

const INK = '#3d3530'
const INK_FAINT = '#8a7f78'
const RULE = '#e6ded4'

function row(label: string, value: string) {
  return `
      <tr>
        <td style="padding:8px 16px 8px 0;border-bottom:1px solid ${RULE};color:${INK_FAINT};vertical-align:top;white-space:nowrap;">${label}</td>
        <td style="padding:8px 0;border-bottom:1px solid ${RULE};color:${INK};">${value}</td>
      </tr>`
}

export function renderFeeEmail(d: FeeEmailData): { subject: string; html: string } {
  const amount = formatMoney(d.amountCents)
  const gst = formatMoney(d.amountCents - Math.round(d.amountCents / 1.05))
  const card = `${escapeHtml(formatCardBrand(d.cardBrand))} ending in ${escapeHtml(d.cardLast4)}`
  const services = d.services
    .map((s) => `${escapeHtml(s.serviceName)} · ${escapeHtml(s.tierLabel)}`)
    .join('<br>')
  const feeValue = d.edited ? amount : `${amount} (${d.pct}% of your booking)`

  const rows = [
    row('Appointment', escapeHtml(d.appointmentText)),
    row(d.services.length === 1 ? 'Service' : 'Services', services),
    d.totalCents !== null ? row('Booking total', `${formatMoney(d.totalCents)} (GST included)`) : '',
    row('Reason', escapeHtml(d.reasonLabel)),
    row('Fee charged', feeValue),
    row('GST portion', `${gst} (included in the fee)`),
  ].join('')

  const html = `
    <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:${INK};">
      <p>Hi ${escapeHtml(d.firstName)},</p>
      <p>${REASON_SENTENCES[d.reason]} As per our cancellation policy, a fee of <strong>${amount}</strong> has been charged to your ${card}.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:16px 0;font-size:14px;">${rows}
      </table>
      <p style="margin-bottom:4px;">Our cancellation policy:</p>
      <ul style="margin-top:0;padding-left:20px;">
        <li>Less than 48 hours' notice: 50% of the booking</li>
        <li>Within 24 hours of the appointment, or a no-show: 100% of the booking</li>
        <li>Arriving more than 10 minutes late: 50% of the booking</li>
      </ul>
      <p>${CONTACT_LINE}</p>
      <p>Micah at MJP Beauty</p>
    </div>
  `

  return { subject: 'Cancellation fee for your MJP Beauty appointment', html }
}
