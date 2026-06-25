// GET /api/bookings/policy
// Returns the location's booking policy (ACCEPT_ALL or REQUIRES_ACCEPTANCE).
// Used to diagnose why bookings may be auto-accepted despite dashboard settings.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { squareFetch, getLocationId } from '../_square.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const locationId = await getLocationId()
    const data = await squareFetch(`/v2/bookings/location-booking-profiles/${locationId}`)
    const profile = data.location_booking_profile
    res.status(200).json({
      locationId,
      bookingPolicy: profile?.booking_policy,
      onlineBookingEnabled: profile?.online_booking_enabled,
      raw: profile,
    })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
}
