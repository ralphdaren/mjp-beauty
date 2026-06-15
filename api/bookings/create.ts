// POST /api/bookings/create
// Body: { tierLabel, startAt, teamMemberId? }
// Creates a booking in Square and returns the booking ID.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { randomUUID } from 'crypto'
import { squareFetch, getLocationId, getCatalogItems, findVariationByLabel } from '../_square.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { tierLabel, startAt, teamMemberId } = req.body ?? {}

  if (!tierLabel || !startAt) {
    return res.status(400).json({ error: 'tierLabel and startAt are required' })
  }

  try {
    const [locationId, catalogItems] = await Promise.all([
      getLocationId(),
      getCatalogItems(),
    ])

    const match = findVariationByLabel(catalogItems, String(tierLabel))
    if (!match.id) {
      return res.status(404).json({
        error: `No Square variation found matching: "${tierLabel}"`,
        availableVariations: (match as any).availableNames,
      })
    }

    const { id: variationId, version: variationVersion } = match as { id: string; version: number }
    const appointmentSegment: Record<string, unknown> = {
      service_variation_id: variationId,
      service_variation_version: variationVersion,
    }
    if (teamMemberId) {
      appointmentSegment.team_member_id = String(teamMemberId)
    }

    const bookingData = await squareFetch('/v2/bookings', {
      method: 'POST',
      body: JSON.stringify({
        idempotency_key: randomUUID(),
        booking: {
          location_id: locationId,
          start_at: String(startAt),
          appointment_segments: [appointmentSegment],
        },
      }),
    })

    res.status(200).json({ bookingId: bookingData.booking?.id as string })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
}
