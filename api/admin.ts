// GET  /api/admin                                        → { requests }
// POST /api/admin { action: 'accept', requestId }       → { squareBookingId }
// POST /api/admin { action: 'decline', requestId }      → { ok: true }
// All routes require: Authorization: Bearer <ADMIN_SECRET>

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { randomUUID } from 'crypto'
import { Resend } from 'resend'
import { supabase } from './_supabase.js'
import { squareFetch, getLocationId, getCatalogItems, findVariationByLabel } from './_square.js'
import { escapeHtml } from './_html.js'
import { enforceRateLimit, adminLimiter } from './_ratelimit.js'

const resend = new Resend(process.env.RESEND_API_KEY)
const CLIENT_TIMEZONE = 'America/Winnipeg'

function isAuthorized(req: VercelRequest): boolean {
  return req.headers['authorization'] === `Bearer ${process.env.ADMIN_SECRET}`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (!(await enforceRateLimit(req, res, adminLimiter))) return

  if (!isAuthorized(req)) return res.status(401).json({ error: 'Unauthorized' })

  // ── GET: list booking requests ─────────────────────────────────────────────
  if (req.method === 'GET') {
    const { status } = req.query
    let query = supabase
      .from('booking_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (status && typeof status === 'string') {
      query = query.eq('status', status)
    }

    const { data, error } = await query
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ requests: data })
  }

  // ── POST: accept or decline ────────────────────────────────────────────────
  if (req.method === 'POST') {
    const { action, requestId } = req.body ?? {}
    if (!requestId) return res.status(400).json({ error: 'requestId is required' })

    const { data: request, error: fetchError } = await supabase
      .from('booking_requests')
      .select('*')
      .eq('id', String(requestId))
      .single()

    if (fetchError || !request) return res.status(404).json({ error: 'Booking request not found' })
    if (request.status !== 'pending') {
      return res.status(400).json({ error: `Request is already ${request.status}` })
    }

    if (action === 'accept') {
      try {
        const [locationId, catalogItems] = await Promise.all([getLocationId(), getCatalogItems()])
        const match = findVariationByLabel(catalogItems, request.tier_label)
        if (!match.id) throw new Error(`No Square variation found for: "${request.tier_label}"`)

        const { id: variationId, version: variationVersion } = match as { id: string; version: number }
        const appointmentSegment: Record<string, unknown> = {
          service_variation_id: variationId,
          service_variation_version: variationVersion,
        }
        if (request.team_member_id) appointmentSegment.team_member_id = request.team_member_id

        const bookingData = await squareFetch('/v2/bookings', {
          method: 'POST',
          body: JSON.stringify({
            idempotency_key: randomUUID(),
            booking: {
              location_id: locationId,
              start_at: request.start_at,
              ...(request.square_customer_id ? { customer_id: request.square_customer_id } : {}),
              appointment_segments: [appointmentSegment],
            },
          }),
        })

        const squareBookingId = bookingData.booking?.id as string

        await supabase
          .from('booking_requests')
          .update({
            status: 'accepted',
            square_booking_id: squareBookingId,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', String(requestId))

        return res.status(200).json({ squareBookingId })
      } catch (err) {
        return res.status(500).json({ error: String(err) })
      }
    }

    if (action === 'decline') {
      try {
        await supabase
          .from('booking_requests')
          .update({ status: 'declined', reviewed_at: new Date().toISOString() })
          .eq('id', String(requestId))

        const appointmentDate = new Date(request.start_at).toLocaleString('en-CA', {
          timeZone: CLIENT_TIMEZONE,
          dateStyle: 'full',
          timeStyle: 'short',
        })

        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL ?? 'MJP Beauty <onboarding@resend.dev>',
          to: request.email,
          subject: 'Your booking request — MJP Beauty',
          html: `
            <p>Hi ${escapeHtml(request.first_name)},</p>
            <p>Thank you for reaching out to MJP Beauty. Unfortunately, we're unable to accommodate your request for <strong>${escapeHtml(request.service_name)} — ${escapeHtml(request.tier_label)}</strong> on <strong>${appointmentDate}</strong>.</p>
            <p>We'd love to find another time that works for you. Feel free to submit a new booking request anytime.</p>
            <p>— Micah at MJP Beauty</p>
          `,
        })

        return res.status(200).json({ ok: true })
      } catch (err) {
        return res.status(500).json({ error: String(err) })
      }
    }

    return res.status(400).json({ error: 'action must be "accept" or "decline"' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
