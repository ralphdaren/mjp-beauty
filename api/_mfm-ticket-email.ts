// The Made For More confirmation ticket.
//
// Shopify sends its own order receipt automatically and that can't be turned
// off, so this is deliberately the *ticket* rather than a second receipt: it
// leads with the event details someone needs on the day, and carries the price
// only so it stands on its own if they never open the Shopify one.
//
// Everything is inline-styled and table-based because email clients strip
// <style> blocks, ignore flex/grid, and fall back to system fonts. The palette
// matches the Made For More page.

import { escapeHtml } from './_html.js'

const CREAM = '#f6f2ec'
const CARD = '#fffdfa'
const INK = '#3d3028'
const INK_SOFT = '#6b5f58'
const INK_FAINT = '#a0948a'
const RULE = '#ded5c8'

const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif"
const SERIF = "Georgia, 'Times New Roman', serif"

export interface TicketEmailData {
  firstName: string
  /** One line per purchased tier, e.g. "General Admission × 1". */
  items: string[]
  /** Formatted total including tax, e.g. "$206.85 CAD". */
  total: string
  orderNumber: string
  /** Micah announces the winner once early bird closes, so the giveaway block
   *  is suppressed for anyone buying after that — otherwise an October buyer
   *  reads an announcement date that has already passed. */
  showGiveaway: boolean
}

export const EVENT = {
  name: 'Made For More',
  date: 'Saturday, October 18, 2026',
  time: '10:00am – 4:00pm',
  venue: 'Offsite YYC',
  address: '221 10 Ave SE #110, Calgary, AB T2G 0V9',
  dressCode: 'Shades of brown, business casual',
  instagram: '@mjpbeauty.ca',
  instagramUrl: 'https://www.instagram.com/mjpbeauty.ca',
} as const

function detailRow(label: string, value: string, last = false) {
  const border = last ? '' : `border-bottom:1px solid ${RULE};`
  return `
    <tr>
      <td style="padding:14px 0;${border}font-family:${SANS};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${INK_FAINT};vertical-align:top;width:112px;">${label}</td>
      <td style="padding:14px 0;${border}font-family:${SANS};font-size:15px;line-height:1.5;color:${INK};">${value}</td>
    </tr>`
}

/** The email's inner markup — reused as-is by the preview page. */
export function ticketEmailBody(data: TicketEmailData): string {
  const name = escapeHtml(data.firstName)
  const order = escapeHtml(data.orderNumber)
  const total = escapeHtml(data.total)
  const items = data.items
    .map((item) => `<div style="padding:2px 0;">${escapeHtml(item)}</div>`)
    .join('')

  const giveaway = data.showGiveaway
    ? `
      <tr>
        <td style="padding:0 32px 32px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${CREAM};border-radius:4px;">
            <tr>
              <td style="padding:22px 24px;font-family:${SANS};font-size:14px;line-height:1.65;color:${INK};">
                <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${INK_FAINT};padding-bottom:8px;">Win back your ticket</div>
                Share that you're coming on Instagram and tag us to be entered for a chance to
                win back what you paid. We'll announce the winner once early-bird sales close.
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    : ''

  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${CREAM};margin:0;padding:0;">
  <tr>
    <td align="center" style="padding:32px 16px;">

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;background-color:${CARD};border:1px solid ${RULE};border-radius:6px;">

        <tr>
          <td style="padding:40px 32px 8px;text-align:center;">
            <div style="font-family:${SANS};font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${INK_FAINT};">You're going to</div>
            <div style="font-family:${SERIF};font-size:34px;line-height:1.15;color:${INK};padding-top:10px;">Made For <em>More</em></div>
            <div style="font-family:${SANS};font-size:13px;letter-spacing:1px;color:${INK_SOFT};padding-top:10px;">Calgary, Alberta</div>
          </td>
        </tr>

        <tr>
          <td style="padding:28px 32px 0;font-family:${SANS};font-size:15px;line-height:1.65;color:${INK};">
            <p style="margin:0 0 14px;">Hi ${name},</p>
            <p style="margin:0;">
              You're in — this is your confirmation ticket for Made For More in Calgary.
              Keep this email; it's everything you'll need on the day.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:26px 32px 8px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              ${detailRow('Ticket', items)}
              ${detailRow('Paid', total)}
              ${detailRow('Order', order)}
              ${detailRow('Date', EVENT.date)}
              ${detailRow('Time', EVENT.time)}
              ${detailRow('Where', `${EVENT.venue}<br><span style="color:${INK_SOFT};font-size:14px;">${EVENT.address}</span>`)}
              ${detailRow('Dress code', EVENT.dressCode, true)}
            </table>
          </td>
        </tr>

        ${giveaway}

        <tr>
          <td style="padding:0 32px 36px;font-family:${SANS};font-size:14px;line-height:1.7;color:${INK_SOFT};">
            <p style="margin:0 0 12px;">
              More updates to follow — keep an eye on your inbox closer to the date.
            </p>
            <p style="margin:0;">
              Any questions? DM us on Instagram at
              <a href="${EVENT.instagramUrl}" style="color:${INK};text-decoration:underline;">${EVENT.instagram}</a>.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:22px 32px 30px;border-top:1px solid ${RULE};font-family:${SANS};font-size:13px;line-height:1.6;color:${INK_FAINT};text-align:center;">
            We can't wait to see you there.<br>
            <span style="color:${INK_SOFT};">Micah, Mia &amp; Nicole</span>
          </td>
        </tr>

      </table>

      <div style="font-family:${SANS};font-size:11px;line-height:1.6;color:${INK_FAINT};padding-top:18px;max-width:560px;">
        You're receiving this because you bought a ticket to Made For More.
      </div>

    </td>
  </tr>
</table>`
}

export function renderTicketEmail(data: TicketEmailData): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your Made For More ticket</title>
</head>
<body style="margin:0;padding:0;background-color:${CREAM};">
${ticketEmailBody(data)}
</body>
</html>`
}

export function ticketEmailText(data: TicketEmailData): string {
  const lines = [
    `Hi ${data.firstName},`,
    '',
    "You're in — this is your confirmation ticket for Made For More in Calgary.",
    "Keep this email; it's everything you'll need on the day.",
    '',
    `Ticket:     ${data.items.join(', ')}`,
    `Paid:       ${data.total}`,
    `Order:      ${data.orderNumber}`,
    `Date:       ${EVENT.date}`,
    `Time:       ${EVENT.time}`,
    `Where:      ${EVENT.venue}, ${EVENT.address}`,
    `Dress code: ${EVENT.dressCode}`,
    '',
  ]

  if (data.showGiveaway) {
    lines.push(
      'Share that you\'re coming on Instagram and tag us to be entered for a',
      'chance to win back your investment. We\'ll announce the winner once',
      'early-bird sales close.',
      '',
    )
  }

  lines.push(
    'More updates to follow — keep an eye on your inbox closer to the date.',
    `Any questions? DM us on Instagram at ${EVENT.instagram}.`,
    '',
    "We can't wait to see you there.",
    'Micah, Mia & Nicole',
  )

  return lines.join('\n')
}

export const ticketEmailSubject = (orderNumber: string) =>
  `Your ticket to Made For More — ${orderNumber}`
