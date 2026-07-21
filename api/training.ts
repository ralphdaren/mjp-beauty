// GET  /api/training?option=group|private   → { dates } — published, upcoming, with spotsRemaining
// POST /api/training { dateId, paymentMethod, firstName, lastName, email, phone, city, province }
//   → { bookingId } — creates a soft hold via the create_training_hold RPC.
//     Duration comes from that RPC's p_hold_hours default (48h), not from here.
// Replaces the old Shopify training metaobjects. Notifies the admin on a new hold;
// no student-facing email yet (Flodesk TBD).

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { randomUUID } from 'crypto'
import { Resend } from 'resend'
import { supabase } from './_supabase.js'
import { escapeHtml } from './_html.js'
import { enforceRateLimit, trainingReadLimiter, trainingCreateLimiter } from './_ratelimit.js'
import { setCorsHeaders } from './_cors.js'
import { isValidEmail, isNonEmptyString, isOptionalString, isValidUuid } from './_validate.js'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL ?? 'MJP Beauty <onboarding@resend.dev>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? ''
const CLIENT_TIMEZONE = 'America/Winnipeg'
const SITE_URL = process.env.SITE_URL ?? 'https://mjp-beauty-ralph-daren-s-projects.vercel.app'

const VALID_OPTIONS = ['group', 'private']
const VALID_PAYMENT_METHODS = ['e-transfer', 'credit-card']

const OPTION_LABELS: Record<string, string> = {
  group: 'Group training',
  private: 'Private training',
}

const PAYMENT_LABELS: Record<string, string> = {
  'e-transfer': 'E-transfer (deposit must be collected manually)',
  'credit-card': 'Credit card',
}

// Canadian provinces and territories — mirrors src/data/provinces.ts. Kept as a
// literal because api/ never imports from src/.
const VALID_PROVINCES = [
  'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT',
]

// Phone arrives as dial code + digits, e.g. "+12045550134". A floor rather than
// real validation — the client enforces the stricter per-country rule; this just
// rejects blank and obviously-truncated numbers from direct API calls.
function hasEnoughDigits(phone: string): boolean {
  return phone.replace(/\D/g, '').length >= 8
}

type HoldDetails = {
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  province: string
  paymentMethod: string
}

// Fire-and-forget admin notification. A hold is only good for 48h and nothing
// else tells Micah it exists, so this is the prompt to go open the dashboard.
// Never throws: the hold is already committed, and a mail failure shouldn't
// turn a successful booking into a 500.
async function notifyAdmin(dateId: string, hold: HoldDetails): Promise<void> {
  if (!ADMIN_EMAIL) return

  try {
    // Read back after the RPC so spotsRemaining reflects this hold.
    const { data } = await supabase
      .from('training_availability')
      .select('option, starts_at, location, spots_remaining')
      .eq('id', dateId)
      .single()

    const row = data as Pick<AvailabilityRow, 'option' | 'starts_at' | 'location' | 'spots_remaining'> | null

    const sessionDate = row
      ? new Date(row.starts_at).toLocaleString('en-CA', {
          timeZone: CLIENT_TIMEZONE,
          dateStyle: 'full',
          timeStyle: 'short',
        })
      : 'Unknown date'
    const optionLabel = row ? OPTION_LABELS[row.option] ?? row.option : 'In-person training'

    const fullName = `${hold.firstName}${hold.lastName ? ` ${hold.lastName}` : ''}`
    const safeName = escapeHtml(fullName)

    await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `New in-person training booking — ${fullName}`,
      html: `
        <p>${safeName} just reserved a spot for in-person training:</p>
        <ul>
          <li><strong>Name:</strong> ${safeName}</li>
          <li><strong>Email:</strong> ${escapeHtml(hold.email)}</li>
          <li><strong>Phone:</strong> ${escapeHtml(hold.phone)}</li>
          <li><strong>Location:</strong> ${escapeHtml(`${hold.city}, ${hold.province}`)}</li>
          <li><strong>Training:</strong> ${escapeHtml(optionLabel)}</li>
          <li><strong>Session:</strong> ${escapeHtml(sessionDate)}</li>
          ${row ? `<li><strong>Venue:</strong> ${escapeHtml(row.location)}</li>` : ''}
          <li><strong>Payment method:</strong> ${escapeHtml(PAYMENT_LABELS[hold.paymentMethod] ?? hold.paymentMethod)}</li>
          ${row ? `<li><strong>Spots left after this hold:</strong> ${Math.max(0, row.spots_remaining)}</li>` : ''}
        </ul>
        <p>This is a <strong>48-hour hold</strong> — the spot is released automatically if the deposit isn't received in time.</p>
        <p>Check your dashboard to confirm the booking once the deposit lands:</p>
        <p><a href="${SITE_URL}/admin" style="display:inline-block;padding:10px 20px;background:#3d3530;color:#ffffff;text-decoration:none;border-radius:999px;font-size:13px;">Open my dashboard</a></p>
      `,
    })
  } catch (err) {
    console.error('training admin notification failed:', err)
  }
}

type AvailabilityRow = {
  id: string
  option: string
  starts_at: string
  location: string
  spots_total: number
  spots_remaining: number
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  // ── GET: published, upcoming dates with live availability ──────────────────
  if (req.method === 'GET') {
    if (!(await enforceRateLimit(req, res, trainingReadLimiter))) return

    const { option } = req.query
    if (option !== undefined && (typeof option !== 'string' || !VALID_OPTIONS.includes(option))) {
      return res.status(400).json({ error: 'option must be "group" or "private"' })
    }

    let query = supabase
      .from('training_availability')
      .select('id, option, starts_at, location, spots_total, spots_remaining')
      .eq('is_published', true)
      .gte('starts_at', new Date().toISOString())
      .order('starts_at', { ascending: true })

    if (typeof option === 'string') query = query.eq('option', option)

    const { data, error } = await query
    if (error) return res.status(500).json({ error: error.message })

    const dates = (data as AvailabilityRow[] ?? []).map((d) => ({
      id: d.id,
      option: d.option,
      startsAt: d.starts_at,
      location: d.location,
      spotsTotal: d.spots_total,
      spotsRemaining: Math.max(0, d.spots_remaining),
    }))
    return res.status(200).json({ dates })
  }

  // ── POST: create a soft hold ───────────────────────────────────────────────
  if (req.method === 'POST') {
    if (!(await enforceRateLimit(req, res, trainingCreateLimiter))) return

    const { dateId, paymentMethod, firstName, lastName, email, phone, city, province, honeypot } =
      req.body ?? {}

    if (honeypot) {
      return res.status(200).json({ bookingId: randomUUID() })
    }

    if (!isValidUuid(dateId)) {
      return res.status(400).json({ error: 'dateId is required' })
    }
    if (typeof paymentMethod !== 'string' || !VALID_PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({ error: 'paymentMethod must be "e-transfer" or "credit-card"' })
    }
    if (!isNonEmptyString(firstName, 100)) {
      return res.status(400).json({ error: 'firstName is required' })
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'email must be a valid email address' })
    }
    if (!isNonEmptyString(phone, 30) || !hasEnoughDigits(phone)) {
      return res.status(400).json({ error: 'A valid phone number is required' })
    }
    if (!isNonEmptyString(city, 100)) {
      return res.status(400).json({ error: 'city is required' })
    }
    if (typeof province !== 'string' || !VALID_PROVINCES.includes(province)) {
      return res.status(400).json({ error: 'province must be a valid province or territory code' })
    }
    if (!isOptionalString(lastName, 100)) {
      return res.status(400).json({ error: 'One or more fields exceed the allowed length' })
    }

    const { data, error } = await supabase.rpc('create_training_hold', {
      p_date_id: String(dateId),
      p_payment_method: paymentMethod,
      p_first_name: String(firstName),
      p_last_name: lastName ? String(lastName) : '',
      p_email: String(email),
      p_phone: String(phone),
      p_city: String(city).trim().replace(/\s+/g, ' '),
      p_province: province,
    })

    if (error) {
      const msg = error.message ?? ''
      if (msg.includes('SOLD_OUT')) {
        return res.status(409).json({ error: 'This training date just filled up. Please choose another date.' })
      }
      if (msg.includes('DATE_NOT_FOUND')) {
        return res.status(404).json({ error: 'That training date is no longer available.' })
      }
      // Anything else is unexpected — log the real error for Vercel, but don't
      // hand the database's own wording back to the caller.
      console.error('create_training_hold failed:', error)
      return res.status(500).json({ error: 'Something went wrong. Please try again.' })
    }

    await notifyAdmin(String(dateId), {
      firstName: String(firstName),
      lastName: lastName ? String(lastName) : '',
      email: String(email),
      phone: String(phone),
      city: String(city).trim().replace(/\s+/g, ' '),
      province,
      paymentMethod,
    })

    return res.status(200).json({ bookingId: data as string })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
