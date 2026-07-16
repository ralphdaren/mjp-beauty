// GET  /api/training?option=group|private   → { dates } — published, upcoming, with spotsRemaining
// POST /api/training { dateId, paymentMethod, firstName, lastName, email, phone }
//   → { bookingId } — creates a 72h soft hold via the create_training_hold RPC.
// Replaces the old Shopify training metaobjects. No emails yet (Flodesk TBD).

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { randomUUID } from 'crypto'
import { supabase } from './_supabase.js'
import { enforceRateLimit, trainingReadLimiter, trainingCreateLimiter } from './_ratelimit.js'
import { setCorsHeaders } from './_cors.js'
import { isValidEmail, isNonEmptyString, isOptionalString } from './_validate.js'

const VALID_OPTIONS = ['group', 'private']
const VALID_PAYMENT_METHODS = ['e-transfer', 'credit-card']

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

    const { dateId, paymentMethod, firstName, lastName, email, phone, honeypot } = req.body ?? {}

    if (honeypot) {
      return res.status(200).json({ bookingId: randomUUID() })
    }

    if (!isNonEmptyString(dateId, 100)) {
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
    if (!isOptionalString(lastName, 100) || !isOptionalString(phone, 30)) {
      return res.status(400).json({ error: 'One or more fields exceed the allowed length' })
    }

    const { data, error } = await supabase.rpc('create_training_hold', {
      p_date_id: String(dateId),
      p_payment_method: paymentMethod,
      p_first_name: String(firstName),
      p_last_name: lastName ? String(lastName) : '',
      p_email: String(email),
      p_phone: phone ? String(phone) : null,
    })

    if (error) {
      const msg = error.message ?? ''
      if (msg.includes('SOLD_OUT')) {
        return res.status(409).json({ error: 'This training date just filled up. Please choose another date.' })
      }
      if (msg.includes('DATE_NOT_FOUND')) {
        return res.status(404).json({ error: 'That training date is no longer available.' })
      }
      return res.status(500).json({ error: msg })
    }

    return res.status(200).json({ bookingId: data as string })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
