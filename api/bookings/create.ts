// POST /api/bookings/create
// Body: { items: [{ serviceName, tierLabel, teamMemberId }], startAt, customerId,
//         firstName, lastName, email, phone }
// An appointment holds one or more services, booked back to back in the order
// they're listed. Stores a pending booking request in Supabase — the Square
// booking is NOT created until admin accepts.
// Sends two emails: "request received" to customer, "new request" notification to admin.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { randomUUID } from 'crypto'
import { Resend } from 'resend'
import { supabase } from '../_supabase.js'
import { escapeHtml } from '../_html.js'
import { getCatalogItems, findVariationByLabel, variationMinutes } from '../_square.js'
import { getHeldBlocks, overlapsBlock } from '../_holds.js'
import { enforceRateLimit, bookingCreateLimiter } from '../_ratelimit.js'
import { setCorsHeaders } from '../_cors.js'
import { isValidEmail, isValidIsoDateTime, isNonEmptyString, isOptionalString } from '../_validate.js'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL ?? 'MJP Beauty <onboarding@resend.dev>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? ''
const CLIENT_TIMEZONE = 'America/Winnipeg'
const SITE_URL = process.env.SITE_URL ?? 'https://mjp-beauty-ralph-daren-s-projects.vercel.app'
const MAX_SERVICES = 5

interface RequestedItem {
  serviceName: string
  tierLabel: string
  teamMemberId: string | null
}

function parseItems(raw: unknown): RequestedItem[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_SERVICES) return null

  const items: RequestedItem[] = []
  for (const entry of raw) {
    const { serviceName, tierLabel, teamMemberId } = (entry ?? {}) as Record<string, unknown>
    if (!isNonEmptyString(tierLabel, 100) || !isNonEmptyString(serviceName, 200)) return null
    if (!isOptionalString(teamMemberId, 100)) return null
    items.push({
      serviceName: String(serviceName),
      tierLabel: String(tierLabel),
      teamMemberId: teamMemberId ? String(teamMemberId) : null,
    })
  }
  return items
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!(await enforceRateLimit(req, res, bookingCreateLimiter))) return

  const { items: rawItems, startAt, customerId, firstName, lastName, email, phone, honeypot } = req.body ?? {}

  if (honeypot) {
    return res.status(200).json({ requestId: randomUUID() })
  }

  const items = parseItems(rawItems)
  if (!items) {
    return res.status(400).json({ error: `items must be 1–${MAX_SERVICES} services with a serviceName and tierLabel` })
  }
  if (!isNonEmptyString(firstName, 100)) {
    return res.status(400).json({ error: 'firstName must be a non-empty string' })
  }
  if (!isValidIsoDateTime(startAt)) {
    return res.status(400).json({ error: 'startAt must be a valid date/time' })
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'email must be a valid email address' })
  }
  if (!isOptionalString(lastName, 100) || !isOptionalString(phone, 30) || !isOptionalString(customerId, 100)) {
    return res.status(400).json({ error: 'One or more fields exceed the allowed length' })
  }

  try {
    // How long the visit runs is Square's answer, not the browser's — the
    // conflict check below and the admin's calendar both depend on it.
    const catalogItems = await getCatalogItems()
    let durationMinutes = 0
    for (const item of items) {
      const match = findVariationByLabel(catalogItems, item.tierLabel)
      if (!match) return res.status(404).json({ error: `No Square variation found matching: "${item.tierLabel}"` })
      durationMinutes += variationMinutes(match)
    }

    const startMs = new Date(String(startAt)).getTime()
    const endMs = startMs + Math.max(durationMinutes, 1) * 60_000

    const heldBlocks = await getHeldBlocks(
      String(startAt),
      new Date(endMs).toISOString(),
      catalogItems,
      ['pending', 'accepted'],
    )

    if (overlapsBlock(startMs, endMs, heldBlocks)) {
      return res.status(409).json({ error: 'This time slot was just booked by someone else. Please choose another.' })
    }

    const manageToken = randomUUID()

    const { data, error } = await supabase
      .from('booking_requests')
      .insert({
        // The first service fills the legacy single-service columns, so the
        // admin filters and older rows keep lining up; `items` holds them all.
        tier_label: items[0].tierLabel,
        service_name: items[0].serviceName,
        team_member_id: items[0].teamMemberId,
        items,
        duration_minutes: durationMinutes,
        start_at: String(startAt),
        square_customer_id: customerId ? String(customerId) : null,
        first_name: String(firstName),
        last_name: lastName ? String(lastName) : '',
        email: String(email),
        phone: phone ? String(phone) : null,
        manage_token: manageToken,
      })
      .select('id')
      .single()

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'This time slot was just booked by someone else. Please choose another.' })
      }
      throw new Error(error.message)
    }

    const appointmentDate = new Date(String(startAt)).toLocaleString('en-CA', {
      timeZone: CLIENT_TIMEZONE,
      dateStyle: 'full',
      timeStyle: 'short',
    })

    const safeFirstName = escapeHtml(String(firstName))
    const safeLastName = escapeHtml(lastName ? String(lastName) : '')
    const safeEmail = escapeHtml(String(email))
    const safePhone = phone ? escapeHtml(String(phone)) : ''
    const serviceLines = items
      .map((item) => `<li>${escapeHtml(item.serviceName)} — ${escapeHtml(item.tierLabel)}</li>`)
      .join('')
    const serviceSummary = items.length === 1
      ? `<strong>${escapeHtml(items[0].serviceName)} — ${escapeHtml(items[0].tierLabel)}</strong>`
      : `<strong>${items.length} services</strong><ul>${serviceLines}</ul>`
    const manageUrl = `${SITE_URL}/manage-booking?token=${manageToken}`

    await Promise.allSettled([
      resend.emails.send({
        from: FROM,
        to: String(email),
        subject: 'We received your booking request — MJP Beauty',
        html: `
          <p>Hi ${safeFirstName},</p>
          <p>Thanks for reaching out! We've received your booking request for ${serviceSummary} on <strong>${appointmentDate}</strong>.</p>
          <p>Your request is currently <strong>pending review</strong>. We'll send you a follow-up email once it's been confirmed or if we need to make other arrangements.</p>
          <p>Need to change something? You can reschedule or cancel your request here:</p>
          <p><a href="${manageUrl}" style="display:inline-block;padding:10px 20px;background:#3d3530;color:#ffffff;text-decoration:none;border-radius:999px;font-size:13px;">Manage my booking</a></p>
          <p>— Micah at MJP Beauty</p>
        `,
      }),

      ADMIN_EMAIL
        ? resend.emails.send({
            from: FROM,
            to: ADMIN_EMAIL,
            subject: `New booking request — ${String(firstName)} ${lastName ? String(lastName) : ''}`,
            html: `
              <p>You have a new booking request:</p>
              <ul>
                <li><strong>Name:</strong> ${safeFirstName} ${safeLastName}</li>
                <li><strong>Email:</strong> ${safeEmail}</li>
                ${safePhone ? `<li><strong>Phone:</strong> ${safePhone}</li>` : ''}
                <li><strong>${items.length === 1 ? 'Service' : 'Services'}:</strong><ul>${serviceLines}</ul></li>
                <li><strong>Appointment:</strong> ${appointmentDate}${durationMinutes ? ` (${durationMinutes} min)` : ''}</li>
              </ul>
              <p>Head to your dashboard to accept or decline this request:</p>
              <p><a href="${SITE_URL}/admin" style="display:inline-block;padding:10px 20px;background:#3d3530;color:#ffffff;text-decoration:none;border-radius:999px;font-size:13px;">Open my dashboard</a></p>
            `,
          })
        : Promise.resolve(),
    ])

    res.status(200).json({ requestId: data.id })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
}
