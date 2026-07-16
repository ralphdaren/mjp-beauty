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
import { setCorsHeaders } from './_cors.js'
import { isNonEmptyString, isValidIsoDateTime } from './_validate.js'

const VALID_STATUSES = ['pending', 'accepted', 'declined', 'cancelled']
const VALID_TRAINING_OPTIONS = ['group', 'private']

const resend = new Resend(process.env.RESEND_API_KEY)
const CLIENT_TIMEZONE = 'America/Winnipeg'

function isAuthorized(req: VercelRequest): boolean {
  return req.headers['authorization'] === `Bearer ${process.env.ADMIN_SECRET}`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res)
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (!(await enforceRateLimit(req, res, adminLimiter))) return

  if (!isAuthorized(req)) return res.status(401).json({ error: 'Unauthorized' })

  // ── Training resources (dates CRUD + booking actions) ──────────────────────
  const resource = req.method === 'GET' ? req.query.resource : req.body?.resource
  if (resource === 'training-dates' || resource === 'training-bookings') {
    return handleTraining(req, res, resource)
  }

  // ── GET: list booking requests ─────────────────────────────────────────────
  if (req.method === 'GET') {
    const { status } = req.query
    let query = supabase
      .from('booking_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (status && typeof status === 'string' && VALID_STATUSES.includes(status)) {
      query = query.eq('status', status)
    }

    const { data, error } = await query
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ requests: data })
  }

  // ── POST: accept or decline ────────────────────────────────────────────────
  if (req.method === 'POST') {
    const { action, requestId } = req.body ?? {}
    if (!isNonEmptyString(requestId, 100)) return res.status(400).json({ error: 'requestId is required' })

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

// ── Training dates CRUD + booking confirm/cancel ─────────────────────────────
async function handleTraining(
  req: VercelRequest,
  res: VercelResponse,
  resource: 'training-dates' | 'training-bookings',
) {
  // ── GET ────────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    if (resource === 'training-dates') {
      const { data, error } = await supabase
        .from('training_availability')
        .select('*')
        .order('starts_at', { ascending: true })
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ dates: data })
    }

    // training-bookings: return all, deriving an effective status for expired holds
    const { data, error } = await supabase
      .from('training_bookings')
      .select('*, training_dates(option, starts_at, location)')
      .order('created_at', { ascending: false })
      .limit(200)
    if (error) return res.status(500).json({ error: error.message })

    const now = Date.now()
    const bookings = (data ?? []).map((b: any) => ({
      ...b,
      effective_status:
        b.status === 'hold' && new Date(b.expires_at).getTime() <= now ? 'expired' : b.status,
    }))
    return res.status(200).json({ bookings })
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { action } = req.body ?? {}

  // ── Training dates: create / update / delete ───────────────────────────────
  if (resource === 'training-dates') {
    if (action === 'create') {
      const { option, startsAt, location, spotsTotal, isPublished } = req.body ?? {}
      if (typeof option !== 'string' || !VALID_TRAINING_OPTIONS.includes(option)) {
        return res.status(400).json({ error: 'option must be "group" or "private"' })
      }
      if (!isValidIsoDateTime(startsAt)) return res.status(400).json({ error: 'startsAt must be a valid date/time' })
      if (!isNonEmptyString(location, 200)) return res.status(400).json({ error: 'location is required' })
      if (!Number.isInteger(spotsTotal) || spotsTotal < 0) {
        return res.status(400).json({ error: 'spotsTotal must be a non-negative integer' })
      }

      const { data, error } = await supabase
        .from('training_dates')
        .insert({
          option,
          starts_at: String(startsAt),
          location: String(location),
          spots_total: spotsTotal,
          is_published: isPublished !== false,
        })
        .select('id')
        .single()
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ id: data.id })
    }

    if (action === 'update') {
      const { id, option, startsAt, location, spotsTotal, isPublished } = req.body ?? {}
      if (!isNonEmptyString(id, 100)) return res.status(400).json({ error: 'id is required' })

      const updates: Record<string, unknown> = {}
      if (option !== undefined) {
        if (typeof option !== 'string' || !VALID_TRAINING_OPTIONS.includes(option)) {
          return res.status(400).json({ error: 'option must be "group" or "private"' })
        }
        updates.option = option
      }
      if (startsAt !== undefined) {
        if (!isValidIsoDateTime(startsAt)) return res.status(400).json({ error: 'startsAt must be a valid date/time' })
        updates.starts_at = String(startsAt)
      }
      if (location !== undefined) {
        if (!isNonEmptyString(location, 200)) return res.status(400).json({ error: 'location is required' })
        updates.location = String(location)
      }
      if (isPublished !== undefined) updates.is_published = Boolean(isPublished)

      if (spotsTotal !== undefined) {
        if (!Number.isInteger(spotsTotal) || spotsTotal < 0) {
          return res.status(400).json({ error: 'spotsTotal must be a non-negative integer' })
        }
        // Never oversell: block lowering capacity below the seats already taken.
        const { data: avail, error: availError } = await supabase
          .from('training_availability')
          .select('spots_taken')
          .eq('id', String(id))
          .single()
        if (availError || !avail) return res.status(404).json({ error: 'Training date not found' })
        if (spotsTotal < avail.spots_taken) {
          return res.status(409).json({
            error: `This date already has ${avail.spots_taken} student${avail.spots_taken === 1 ? '' : 's'} booked. Capacity can't be set below that.`,
          })
        }
        updates.spots_total = spotsTotal
      }

      if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No fields to update' })

      const { error } = await supabase.from('training_dates').update(updates).eq('id', String(id))
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ ok: true })
    }

    if (action === 'delete') {
      const { id } = req.body ?? {}
      if (!isNonEmptyString(id, 100)) return res.status(400).json({ error: 'id is required' })
      const { error } = await supabase.from('training_dates').delete().eq('id', String(id))
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ ok: true })
    }

    return res.status(400).json({ error: 'action must be "create", "update", or "delete"' })
  }

  // ── Training bookings: confirm / cancel ────────────────────────────────────
  const { bookingId } = req.body ?? {}
  if (!isNonEmptyString(bookingId, 100)) return res.status(400).json({ error: 'bookingId is required' })

  if (action === 'confirm') {
    const { error } = await supabase.rpc('confirm_training_booking', { p_booking_id: String(bookingId) })
    if (error) {
      const msg = error.message ?? ''
      if (msg.includes('SOLD_OUT')) {
        return res.status(409).json({ error: "This date is full — the hold expired and its seat was taken. Can't confirm." })
      }
      if (msg.includes('BOOKING_CANCELLED')) return res.status(409).json({ error: 'This booking was cancelled.' })
      if (msg.includes('BOOKING_NOT_FOUND')) return res.status(404).json({ error: 'Booking not found' })
      return res.status(500).json({ error: msg })
    }
    return res.status(200).json({ ok: true })
  }

  if (action === 'cancel') {
    const { error } = await supabase
      .from('training_bookings')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
      .eq('id', String(bookingId))
      .neq('status', 'cancelled')
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  return res.status(400).json({ error: 'action must be "confirm" or "cancel"' })
}
