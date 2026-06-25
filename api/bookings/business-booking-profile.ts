// GET  /api/bookings/business-booking-profile
//   Returns the current Square business booking profile, including the booking_policy.
//   Expected: booking_policy === "REQUIRES_SELLER_ACTION"
//   If it says "ACCEPTS_ALL", call this endpoint with POST to fix it.
//
// POST /api/bookings/business-booking-profile
//   Sets booking_policy to REQUIRES_SELLER_ACTION so every new booking starts as
//   PENDING_SELLER_CONFIRMATION.  Square will then send the customer an "awaiting review"
//   email/SMS on creation, and "confirmed" or "cancelled" email/SMS once the salon decides.
//
// Call POST once after deploy (or whenever the Square dashboard resets the policy).

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { squareFetch } from '../_square.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method === 'GET') {
    try {
      const data = await squareFetch('/v2/bookings/business-booking-profile')
      const profile = data.business_booking_profile ?? {}
      return res.status(200).json({
        booking_policy: profile.booking_policy ?? null,
        booking_enabled: profile.booking_enabled ?? null,
        customer_timezone_choice: profile.customer_timezone_choice ?? null,
        allow_user_cancel: profile.allow_user_cancel ?? null,
        raw: profile,
      })
    } catch (err) {
      return res.status(500).json({ error: String(err) })
    }
  }

  if (req.method === 'POST') {
    try {
      const data = await squareFetch('/v2/bookings/business-booking-profile', {
        method: 'PUT',
        body: JSON.stringify({
          business_booking_profile: {
            booking_policy: 'REQUIRES_SELLER_ACTION',
            booking_enabled: true,
          },
        }),
      })
      const profile = data.business_booking_profile ?? {}
      return res.status(200).json({
        success: true,
        booking_policy: profile.booking_policy ?? null,
      })
    } catch (err) {
      return res.status(500).json({ error: String(err) })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
