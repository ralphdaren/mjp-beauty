// POST /api/bookings/create
// Body: { tierLabel, startAt, teamMemberId, customerId, serviceName, firstName, lastName, email, phone }
// Stores a pending booking request in Supabase. Square booking is NOT created until admin accepts.
// Sends two emails: "request received" to customer, "new request" notification to admin.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { randomUUID } from 'crypto'
import { Resend } from 'resend'
import { supabase } from '../_supabase.js'
import { escapeHtml } from '../_html.js'
import { enforceRateLimit, bookingCreateLimiter } from '../_ratelimit.js'
import { setCorsHeaders } from '../_cors.js'
import { isValidEmail, isValidIsoDateTime, isNonEmptyString, isOptionalString } from '../_validate.js'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL ?? 'MJP Beauty <onboarding@resend.dev>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? ''
const CLIENT_TIMEZONE = 'America/Winnipeg'
const SITE_URL = process.env.SITE_URL ?? 'https://mjp-beauty-ralph-daren-s-projects.vercel.app'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!(await enforceRateLimit(req, res, bookingCreateLimiter))) return

  const {
    tierLabel, startAt, teamMemberId, customerId,
    serviceName, firstName, lastName, email, phone, honeypot,
  } = req.body ?? {}

  // Hidden field real users never fill in — bots that auto-fill every input do.
  // Pretend success without touching Supabase/Resend.
  if (honeypot) {
    return res.status(200).json({ requestId: randomUUID() })
  }

  if (!isNonEmptyString(tierLabel, 100) || !isNonEmptyString(serviceName, 200) || !isNonEmptyString(firstName, 100)) {
    return res.status(400).json({ error: 'tierLabel, serviceName, and firstName must be non-empty strings' })
  }
  if (!isValidIsoDateTime(startAt)) {
    return res.status(400).json({ error: 'startAt must be a valid date/time' })
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'email must be a valid email address' })
  }
  if (
    !isOptionalString(lastName, 100) ||
    !isOptionalString(phone, 30) ||
    !isOptionalString(teamMemberId, 100) ||
    !isOptionalString(customerId, 100)
  ) {
    return res.status(400).json({ error: 'One or more fields exceed the allowed length' })
  }

  try {
    // Belt-and-suspenders against two customers submitting for the same slot
    // at nearly the same time — the availability endpoint already hides slots
    // held by a pending request, but that's a check the client can race.
    const { data: conflict } = await supabase
      .from('booking_requests')
      .select('id')
      .eq('start_at', String(startAt))
      .in('status', ['pending', 'accepted'])
      .limit(1)
      .maybeSingle()

    if (conflict) {
      return res.status(409).json({ error: 'This time slot was just booked by someone else. Please choose another.' })
    }

    const manageToken = randomUUID()

    const { data, error } = await supabase
      .from('booking_requests')
      .insert({
        tier_label: String(tierLabel),
        start_at: String(startAt),
        team_member_id: teamMemberId ? String(teamMemberId) : null,
        square_customer_id: customerId ? String(customerId) : null,
        service_name: String(serviceName),
        first_name: String(firstName),
        last_name: lastName ? String(lastName) : '',
        email: String(email),
        phone: phone ? String(phone) : null,
        manage_token: manageToken,
      })
      .select('id')
      .single()

    if (error) throw new Error(error.message)

    const appointmentDate = new Date(String(startAt)).toLocaleString('en-CA', {
      timeZone: CLIENT_TIMEZONE,
      dateStyle: 'full',
      timeStyle: 'short',
    })

    const safeFirstName = escapeHtml(String(firstName))
    const safeLastName = escapeHtml(lastName ? String(lastName) : '')
    const safeServiceName = escapeHtml(String(serviceName))
    const safeTierLabel = escapeHtml(String(tierLabel))
    const safeEmail = escapeHtml(String(email))
    const safePhone = phone ? escapeHtml(String(phone)) : ''
    const manageUrl = `${SITE_URL}/manage-booking?token=${manageToken}`

    // Fire both emails in parallel — don't block the response if they fail
    await Promise.allSettled([
      // Customer: "we received your request"
      resend.emails.send({
        from: FROM,
        to: String(email),
        subject: 'We received your booking request — MJP Beauty',
        html: `
          <p>Hi ${safeFirstName},</p>
          <p>Thanks for reaching out! We've received your booking request for <strong>${safeServiceName} — ${safeTierLabel}</strong> on <strong>${appointmentDate}</strong>.</p>
          <p>Your request is currently <strong>pending review</strong>. We'll send you a follow-up email once it's been confirmed or if we need to make other arrangements.</p>
          <p>Need to change something? You can reschedule or cancel your request here:</p>
          <p><a href="${manageUrl}" style="display:inline-block;padding:10px 20px;background:#3d3530;color:#ffffff;text-decoration:none;border-radius:999px;font-size:13px;">Manage my booking</a></p>
          <p>— Micah at MJP Beauty</p>
        `,
      }),

      // Admin: new booking request notification
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
                <li><strong>Service:</strong> ${safeServiceName} — ${safeTierLabel}</li>
                <li><strong>Appointment:</strong> ${appointmentDate}</li>
              </ul>
              <p>Log in to your admin dashboard to accept or decline.</p>
            `,
          })
        : Promise.resolve(),
    ])

    res.status(200).json({ requestId: data.id })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
}
