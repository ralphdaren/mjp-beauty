// GET /api/bookings/policy
// Returns the business-level booking policy (ACCEPT_ALL or REQUIRES_ACCEPTANCE).

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { squareFetch } from '../_square.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const data = await squareFetch('/v2/bookings/business-booking-profile')
    const profile = data.business_booking_profile
    res.status(200).json({
      bookingPolicy: profile?.booking_policy,
      bookingEnabled: profile?.booking_enabled,
      raw: profile,
    })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
}
