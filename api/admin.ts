// GET  /api/admin                                        → { requests }
// GET  /api/admin?resource=auth                          → { ok: true }
// GET  /api/admin?resource=dashboard                     → { requests, bookings, dates }
// POST /api/admin { action: 'accept', requestId }       → { squareBookingId }
// POST /api/admin { action: 'decline', requestId }      → { ok: true }
// GET  /api/admin?resource=mfm-tickets                   → { tickets }
// POST /api/admin { resource: 'mfm-tickets', action: 'create' | 'resend' | 'delete' }
// All routes require: Authorization: Bearer <ADMIN_SECRET>

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { randomUUID } from 'crypto'
import { Resend } from 'resend'
import { supabase } from './_supabase.js'
import { squareFetch, getLocationId, getCatalogItems, findVariation } from './_square.js'
import { escapeHtml } from './_html.js'
import { enforceRateLimit, adminLimiter } from './_ratelimit.js'
import { setCorsHeaders } from './_cors.js'
import { isNonEmptyString, isValidIsoDateTime, isValidEmail, isOptionalString } from './_validate.js'
import {
  renderTicketEmail,
  ticketEmailText,
  ticketEmailSubject,
  type TicketEmailData,
} from './_mfm-ticket-email.js'
import {
  EARLY_BIRD_ENDS_AT,
  MFM_MANUAL_PREFIX,
  MFM_PAYMENT_NOTE,
  mfmInstallmentCents,
  mfmPlanTotal,
  isManualTicket,
  mfmManualKey,
  resolveMfmTier,
} from './_mfm-config.js'

const VALID_STATUSES = ['pending', 'accepted', 'declined', 'cancelled']
const VALID_TRAINING_OPTIONS = ['group', 'private']

const resend = new Resend(process.env.RESEND_API_KEY)
const CLIENT_TIMEZONE = 'America/Winnipeg'

function isAuthorized(req: VercelRequest): boolean {
  return req.headers['authorization'] === `Bearer ${process.env.ADMIN_SECRET}`
}

interface RequestedItem {
  serviceName: string
  variationId: string | null
  tierLabel: string
  teamMemberId: string | null
}

/** Every service on a request — from `items`, or the pre-multi-service columns. */
function requestedItems(request: any): RequestedItem[] {
  if (Array.isArray(request.items) && request.items.length > 0) {
    return request.items.map((item: any) => ({
      serviceName: String(item.serviceName ?? request.service_name),
      variationId: item.variationId ?? null,
      tierLabel: String(item.tierLabel ?? request.tier_label),
      teamMemberId: item.teamMemberId ?? null,
    }))
  }
  return [{
    serviceName: request.service_name,
    variationId: null,
    tierLabel: request.tier_label,
    teamMemberId: request.team_member_id ?? null,
  }]
}

// ── Reads, shared by the single-resource routes and the dashboard bootstrap ──

function listBookingRequests(status?: string) {
  let query = supabase
    .from('booking_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (status && VALID_STATUSES.includes(status)) query = query.eq('status', status)
  return query
}

function listTrainingDates() {
  return supabase.from('training_availability').select('*').order('starts_at', { ascending: true })
}

async function listTrainingBookings() {
  const { data, error } = await supabase
    .from('training_bookings')
    .select('*, training_dates(option, starts_at, location)')
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) return { data: null, error }

  const now = Date.now()
  const bookings = (data ?? []).map((b: any) => ({
    ...b,
    effective_status:
      b.status === 'hold' && new Date(b.expires_at).getTime() <= now ? 'expired' : b.status,
  }))
  return { data: bookings, error: null }
}

function listMfmTickets() {
  return supabase
    .from('mfm_tickets')
    .select('*')
    .order('ordered_at', { ascending: false })
    .limit(500)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res)
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (!(await enforceRateLimit(req, res, adminLimiter))) return

  if (!isAuthorized(req)) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'GET' && req.query.resource === 'auth') {
    return res.status(200).json({ ok: true })
  }

  if (req.method === 'GET' && req.query.resource === 'dashboard') {
    const [requests, bookings, dates, tickets] = await Promise.all([
      listBookingRequests(),
      listTrainingBookings(),
      listTrainingDates(),
      listMfmTickets(),
    ])
    const failed = requests.error ?? bookings.error ?? dates.error ?? tickets.error
    if (failed) return res.status(500).json({ error: failed.message })
    return res.status(200).json({
      requests: requests.data,
      bookings: bookings.data,
      dates: dates.data,
      tickets: tickets.data,
    })
  }

  // ── Training resources (dates CRUD + booking actions) ──────────────────────
  const resource = req.method === 'GET' ? req.query.resource : req.body?.resource
  if (resource === 'training-dates' || resource === 'training-bookings') {
    return handleTraining(req, res, resource)
  }
  if (resource === 'mfm-tickets') return handleMfmTickets(req, res)

  // ── GET: list booking requests ─────────────────────────────────────────────
  if (req.method === 'GET') {
    const { status } = req.query
    const { data, error } = await listBookingRequests(typeof status === 'string' ? status : undefined)
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

        const appointmentSegments = requestedItems(request).map((item) => {
          const match = findVariation(catalogItems, item)
          if (!match) throw new Error(`No Square variation found for: "${item.tierLabel}"`)

          const segment: Record<string, unknown> = {
            service_variation_id: match.id,
            service_variation_version: match.version,
          }
          const teamMemberId = item.teamMemberId ?? request.team_member_id
          if (teamMemberId) segment.team_member_id = teamMemberId
          return segment
        })

        const bookingData = await squareFetch('/v2/bookings', {
          method: 'POST',
          body: JSON.stringify({
            idempotency_key: randomUUID(),
            booking: {
              location_id: locationId,
              start_at: request.start_at,
              ...(request.square_customer_id ? { customer_id: request.square_customer_id } : {}),
              appointment_segments: appointmentSegments,
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
            <p>Thank you for reaching out to MJP Beauty. Unfortunately, we're unable to accommodate your request for ${
              requestedItems(request)
                .map((item) => `<strong>${escapeHtml(item.serviceName)} — ${escapeHtml(item.tierLabel)}</strong>`)
                .join(' and ')
            } on <strong>${appointmentDate}</strong>.</p>
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
      const { data, error } = await listTrainingDates()
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ dates: data })
    }

    const { data, error } = await listTrainingBookings()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ bookings: data })
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

// ── Made For More tickets ────────────────────────────────────────────────────
//
// Shopify orders land here automatically via api/webhooks/shopify.ts. This is
// the manual path for the buyers Micah invoices through Square on a payment
// plan — Shopify never sees those, so they'd otherwise get no ticket.
//
// Square stays the source of truth for what's actually been paid; the
// dashboard only records who is on a plan and whether their ticket went out.

interface MfmTicketRow {
  id: string
  shopify_order_id: string
  order_number: string | null
  email: string
  customer_name: string
  instagram: string | null
  items: { tier: string; quantity: number }[]
  total_cents: number
  currency: string
  ordered_at: string
  email_sent_at: string | null
  notes?: string | null
}

/** Rebuilds the exact email payload the Shopify webhook would have produced. */
function ticketDataFromRow(row: MfmTicketRow): TicketEmailData {
  const items = Array.isArray(row.items) ? row.items : []
  // total_cents is always the whole plan, so gross stays honest. The buyer is
  // shown what each Square invoice charges them instead.
  const plan = isManualTicket(row.shopify_order_id)
  const amountShown = plan ? mfmInstallmentCents(row.total_cents) : row.total_cents
  return {
    firstName: String(row.customer_name ?? '').trim().split(/\s+/)[0] || 'there',
    items: items.map((i) => (i.quantity > 1 ? `${i.tier} × ${i.quantity}` : i.tier)),
    total: `$${(amountShown / 100).toFixed(2)} ${row.currency ?? 'CAD'}`,
    orderNumber: row.order_number ?? '#MFM',
    showGiveaway: Date.parse(row.ordered_at) < Date.parse(EARLY_BIRD_ENDS_AT),
    ...(plan ? { paymentNote: MFM_PAYMENT_NOTE, amountLabel: 'Payment' } : {}),
  }
}

async function sendTicketEmail(row: MfmTicketRow, to?: string) {
  const data = ticketDataFromRow(row)
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'MJP Beauty <onboarding@resend.dev>',
    to: to ?? row.email,
    subject: ticketEmailSubject(data.orderNumber),
    html: renderTicketEmail(data),
    text: ticketEmailText(data),
  })
  if (error) throw new Error(error.message ?? 'Resend rejected the email')
}

/** `notes` is a late addition; tolerate it not existing yet in Supabase. */
const isUnknownColumn = (error: { code?: string; message?: string } | null) =>
  error?.code === '42703' || error?.code === 'PGRST204' || /column .*notes/i.test(error?.message ?? '')

async function handleMfmTickets(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const { data, error } = await listMfmTickets()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ tickets: data })
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { action } = req.body ?? {}

  // ── Issue a ticket to someone paying by Square invoice ─────────────────────
  if (action === 'create') {
    const { email, name, tier: rawTier, quantity: rawQty, total: rawTotal, notes, instagram, testTo } = req.body ?? {}

    if (!isValidEmail(email)) return res.status(400).json({ error: 'A valid email address is required' })
    if (!isNonEmptyString(name, 120)) return res.status(400).json({ error: "The buyer's name is required" })
    if (!isOptionalString(notes, 500)) return res.status(400).json({ error: 'Notes are too long' })
    if (!isOptionalString(instagram, 100)) return res.status(400).json({ error: 'Instagram handle is too long' })
    if (testTo !== undefined && !isValidEmail(testTo)) {
      return res.status(400).json({ error: 'testTo must be a valid email address' })
    }

    const tier = resolveMfmTier(rawTier)
    if (!tier) return res.status(400).json({ error: 'Ticket type must be General Admission or VIP' })

    const quantity = rawQty === undefined || rawQty === '' ? 1 : Number(rawQty)
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      return res.status(400).json({ error: 'Quantity must be a whole number between 1 and 20' })
    }

    // Payment-plan pricing is Micah's rounded quote, not Shopify's exact
    // price + GST — see MFM_PLAN_INSTALLMENT.
    const expected = mfmPlanTotal(tier, quantity)
    const total =
      rawTotal === undefined || rawTotal === '' ? expected : Number(String(rawTotal).replace(/[$,\s]/g, ''))
    if (!Number.isFinite(total) || total <= 0 || total > 100000) {
      return res.status(400).json({ error: 'Total must be a positive amount' })
    }

    const normalisedEmail = String(email).toLowerCase()

    // Anyone already holding a ticket — Shopify buyer or a previous manual add
    // — must go through Resend instead, so nobody gets two ticket numbers.
    // A test issues nothing, so it skips this and can be repeated freely.
    if (!testTo) {
      const { data: existing, error: existingError } = await supabase
        .from('mfm_tickets')
        .select('order_number, shopify_order_id')
        .ilike('email', normalisedEmail)
        .limit(1)
      if (existingError) return res.status(500).json({ error: existingError.message })
      if (existing && existing.length > 0) {
        const which = isManualTicket(existing[0].shopify_order_id) ? 'a payment-plan ticket' : 'a Shopify order'
        return res.status(409).json({
          error: `${email} already has ${which} (${existing[0].order_number}). Use Resend on that row instead of adding them again.`,
        })
      }
    }

    // Continue from the highest number ever issued, so removing a row can
    // never cause a number to be handed out twice.
    const { data: numbered, error: numberError } = await supabase
      .from('mfm_tickets')
      .select('order_number')
      .like('order_number', `${MFM_MANUAL_PREFIX}%`)
    if (numberError) return res.status(500).json({ error: numberError.message })

    let highest = 0
    for (const r of numbered ?? []) {
      const match = new RegExp(`^${MFM_MANUAL_PREFIX}(\\d+)$`).exec(String(r.order_number ?? ''))
      if (match) highest = Math.max(highest, parseInt(match[1], 10))
    }
    const orderNumber = `${MFM_MANUAL_PREFIX}${String(highest + 1).padStart(2, '0')}`

    const record = {
      shopify_order_id: mfmManualKey(normalisedEmail),
      order_number: orderNumber,
      email: normalisedEmail,
      customer_name: String(name).trim(),
      instagram: instagram ? String(instagram).trim() : null,
      items: [{ tier, quantity }],
      total_cents: Math.round(total * 100),
      currency: 'CAD',
      ordered_at: new Date().toISOString(),
    }

    // A test never touches the table. Recording one left a phantom ticket
    // behind, burned a ticket number, and tripped the "recorded but never
    // emailed" banner — all for an email that only ever went to Micah.
    if (testTo) {
      const preview: MfmTicketRow = { ...record, id: 'preview', email_sent_at: null }
      try {
        await sendTicketEmail(preview, String(testTo))
      } catch (err) {
        return res.status(502).json({
          error: `The test email could not be sent: ${String(err).replace('Error: ', '')}`,
        })
      }
      return res.status(200).json({ ok: true, orderNumber, expected, testTo: String(testTo) })
    }

    // Record before sending: the unique index on shopify_order_id is what
    // stops a double-send, not this handler remembering to check.
    let inserted = await supabase
      .from('mfm_tickets')
      .insert({ ...record, notes: notes ? String(notes).trim() : null })
      .select('*')
      .single()

    if (inserted.error && isUnknownColumn(inserted.error)) {
      inserted = await supabase.from('mfm_tickets').insert(record).select('*').single()
    }
    if (inserted.error) {
      if (inserted.error.code === '23505') {
        return res.status(409).json({ error: `${email} already has a ticket.` })
      }
      return res.status(500).json({ error: inserted.error.message })
    }

    const row = inserted.data as MfmTicketRow

    try {
      await sendTicketEmail(row)
    } catch (err) {
      // The row stays with a null email_sent_at so the UI shows it as unsent
      // and Micah can retry with Resend.
      return res.status(502).json({
        error: `Ticket ${orderNumber} was saved, but the email failed to send: ${String(err).replace('Error: ', '')}. Use Resend on that row to try again.`,
      })
    }

    await supabase
      .from('mfm_tickets')
      .update({ email_sent_at: new Date().toISOString() })
      .eq('id', row.id)

    return res.status(200).json({ ok: true, orderNumber, expected, testTo: null })
  }

  // ── Re-send an existing ticket (works for Shopify buyers too) ──────────────
  if (action === 'resend') {
    const { id, testTo } = req.body ?? {}
    if (!isNonEmptyString(id, 100)) return res.status(400).json({ error: 'id is required' })
    if (testTo !== undefined && !isValidEmail(testTo)) {
      return res.status(400).json({ error: 'testTo must be a valid email address' })
    }

    const { data: row, error } = await supabase.from('mfm_tickets').select('*').eq('id', String(id)).single()
    if (error || !row) return res.status(404).json({ error: 'Ticket not found' })

    try {
      await sendTicketEmail(row as MfmTicketRow, testTo ? String(testTo) : undefined)
    } catch (err) {
      return res.status(502).json({ error: String(err).replace('Error: ', '') })
    }

    if (!testTo) {
      await supabase
        .from('mfm_tickets')
        .update({ email_sent_at: new Date().toISOString() })
        .eq('id', String(id))
    }

    return res.status(200).json({ ok: true })
  }

  // ── Remove a manually added ticket ─────────────────────────────────────────
  if (action === 'delete') {
    const { id } = req.body ?? {}
    if (!isNonEmptyString(id, 100)) return res.status(400).json({ error: 'id is required' })

    const { data: row, error } = await supabase
      .from('mfm_tickets')
      .select('shopify_order_id')
      .eq('id', String(id))
      .single()
    if (error || !row) return res.status(404).json({ error: 'Ticket not found' })

    // Shopify orders are the webhook's record of a real payment — never let
    // the dashboard delete one.
    if (!isManualTicket(row.shopify_order_id)) {
      return res.status(403).json({ error: 'Shopify orders can\'t be removed here — only payment-plan tickets.' })
    }

    const { error: deleteError } = await supabase.from('mfm_tickets').delete().eq('id', String(id))
    if (deleteError) return res.status(500).json({ error: deleteError.message })
    return res.status(200).json({ ok: true })
  }

  return res.status(400).json({ error: 'action must be "create", "resend", or "delete"' })
}
