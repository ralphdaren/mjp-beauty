// POST /api/bookings/create
// Body: { items: [{ serviceName, tierLabel, teamMemberId }], startAt, customerId,
//         firstName, lastName, email, phone }
// An appointment holds one or more services, booked back to back in the order
// they're listed. Stores a pending booking request in Supabase — the Square
// booking is NOT created until admin accepts.
// Nothing the browser sends about the services themselves is trusted: `tierLabel`
// is resolved against the Square catalog, and the duration, the service names and
// whether the slot exists at all all come back from Square.
// Sends two emails: "request received" to customer, "new request" notification to admin.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { randomUUID } from 'crypto'
import { Resend } from 'resend'
import { supabase } from '../_supabase.js'
import { escapeHtml } from '../_html.js'
import {
  squareFetch, getCatalogItems, getLocationId, findVariationByLabel, variationMinutes,
  type VariationMatch,
} from '../_square.js'
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
    if (!isNonEmptyString(tierLabel, 100)) return null
    if (!isOptionalString(serviceName, 200) || !isOptionalString(teamMemberId, 100)) return null
    items.push({
      // Only a hint until Square confirms it — see resolveServiceName below.
      serviceName: serviceName ? String(serviceName) : '',
      tierLabel: String(tierLabel),
      teamMemberId: teamMemberId ? String(teamMemberId) : null,
    })
  }
  return items
}

// Only `tierLabel` is checked against the catalog, so the service name that
// arrives with it is unverified free text — and it lands in the admin's
// notification email. Square's own item name wins; the browser's value is kept
// only when the two agree, so the dashboard keeps the site's wording without
// letting anyone plant arbitrary text in Micah's inbox.
function resolveServiceName(claimed: string, match: VariationMatch, tierLabel: string): string {
  const itemName = match.itemName.trim()
  if (claimed && itemName && claimed.toLowerCase().trim() === itemName.toLowerCase()) return claimed
  return itemName || tierLabel
}

// True when Square lists `startMs` as an opening long enough for the whole
// appointment. Searches the same day-wide window /api/bookings/availability
// uses, so a slot the customer was actually shown always matches here.
async function isOfferedBySquare(
  locationId: string,
  matches: VariationMatch[],
  startMs: number,
): Promise<boolean> {
  const day = new Date(startMs).toISOString().slice(0, 10)
  const dayStart = new Date(`${day}T00:00:00.000Z`)
  const now = new Date()

  const data = await squareFetch('/v2/bookings/availability/search', {
    method: 'POST',
    body: JSON.stringify({
      query: {
        filter: {
          location_id: locationId,
          start_at_range: {
            start_at: (dayStart > now ? dayStart : now).toISOString(),
            end_at: `${day}T23:59:59.999Z`,
          },
          segment_filters: matches.map((match) => ({ service_variation_id: match.id })),
        },
      },
    }),
  })

  return ((data.availabilities as any[]) ?? []).some(
    (a: any) => new Date(a.start_at).getTime() === startMs,
  )
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

  const requested = parseItems(rawItems)
  if (!requested) {
    return res.status(400).json({ error: `items must be 1–${MAX_SERVICES} services, each with a tierLabel` })
  }
  if (!isNonEmptyString(firstName, 100)) {
    return res.status(400).json({ error: 'firstName must be a non-empty string' })
  }
  if (!isValidIsoDateTime(startAt)) {
    return res.status(400).json({ error: 'startAt must be a valid date/time' })
  }
  if (new Date(String(startAt)).getTime() <= Date.now()) {
    return res.status(400).json({ error: 'startAt must be in the future' })
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'email must be a valid email address' })
  }
  if (!isOptionalString(lastName, 100) || !isOptionalString(phone, 30) || !isOptionalString(customerId, 100)) {
    return res.status(400).json({ error: 'One or more fields exceed the allowed length' })
  }

  try {
    // How long the visit runs, and what each service is really called, are
    // Square's answers rather than the browser's — the conflict check below and
    // the admin's calendar both depend on them.
    const [locationId, catalogItems] = await Promise.all([getLocationId(), getCatalogItems()])

    const matches: VariationMatch[] = []
    for (const item of requested) {
      const match = findVariationByLabel(catalogItems, item.tierLabel)
      if (!match) return res.status(404).json({ error: `No Square variation found matching: "${item.tierLabel}"` })
      matches.push(match)
    }

    const durationMinutes = matches.reduce((total, match) => total + variationMinutes(match), 0)
    const items: RequestedItem[] = requested.map((item, index) => ({
      ...item,
      serviceName: resolveServiceName(item.serviceName, matches[index], item.tierLabel),
    }))

    const startMs = new Date(String(startAt)).getTime()
    const endMs = startMs + Math.max(durationMinutes, 1) * 60_000

    // A pending request holds its whole range on the public calendar, so a time
    // Square never offered would black out hours of the day on nothing more than
    // a hand-made request. Re-ask Square the same question the booking page did.
    if (!(await isOfferedBySquare(locationId, matches, startMs))) {
      return res.status(409).json({ error: 'That time is no longer available. Please pick another slot.' })
    }

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
      // The overlap check above can't see a request that lands between it and
      // this insert, so the database has the final say: 23P01 is the no-overlap
      // exclusion constraint firing, 23505 a duplicate on an older unique index.
      if (error.code === '23P01' || error.code === '23505') {
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
