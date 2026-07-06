// GET  /api/bookings/manage?token=...              → { status, serviceName, tierLabel, startAt, firstName }
// POST /api/bookings/manage { token, action: 'cancel' } → { ok: true }
// Lets a customer look up and cancel their own booking request while it's
// still pending, using the opaque manage_token emailed to them at creation.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../_supabase.js'
import { enforceRateLimit, manageBookingLimiter } from '../_ratelimit.js'
import { setCorsHeaders } from '../_cors.js'
import { isNonEmptyString } from '../_validate.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!(await enforceRateLimit(req, res, manageBookingLimiter))) return

  const token = req.method === 'GET' ? req.query.token : req.body?.token
  if (!isNonEmptyString(token, 100)) return res.status(400).json({ error: 'token is required' })

  const { data: request, error: fetchError } = await supabase
    .from('booking_requests')
    .select('*')
    .eq('manage_token', String(token))
    .single()

  if (fetchError || !request) return res.status(404).json({ error: 'Booking request not found' })

  if (req.method === 'GET') {
    return res.status(200).json({
      status: request.status,
      serviceName: request.service_name,
      tierLabel: request.tier_label,
      startAt: request.start_at,
      firstName: request.first_name,
    })
  }

  const { action } = req.body ?? {}
  if (action !== 'cancel') return res.status(400).json({ error: 'action must be "cancel"' })

  if (request.status !== 'pending') {
    return res.status(400).json({ error: `Request is already ${request.status}` })
  }

  const { error: updateError } = await supabase
    .from('booking_requests')
    .update({ status: 'cancelled', reviewed_at: new Date().toISOString() })
    .eq('id', request.id)
    .eq('status', 'pending')

  if (updateError) return res.status(500).json({ error: updateError.message })
  return res.status(200).json({ ok: true })
}
