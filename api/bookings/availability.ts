// GET /api/bookings/availability?tierLabel=...&date=YYYY-MM-DD
// Returns available time slots for the given tier and date.
// Each slot includes the ISO startAt and teamMemberId needed by the create route.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { squareFetch, getCatalogItems, findVariationByLabel } from '../_square'

const CLIENT_TIMEZONE = 'America/Edmonton'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  const { tierLabel, date } = req.query

  if (
    !tierLabel || !date ||
    typeof tierLabel !== 'string' || typeof date !== 'string'
  ) {
    return res.status(400).json({ error: 'tierLabel and date (YYYY-MM-DD) are required' })
  }

  try {
    // 1. Resolve the Square variation ID from the tier label
    const catalogItems = await getCatalogItems()
    const match = findVariationByLabel(catalogItems, tierLabel)

    if (!match.id) {
      return res.status(404).json({
        error: `No Square variation found matching: "${tierLabel}"`,
        availableVariations: (match as any).availableNames,
      })
    }

    const { id: variationId, version: variationVersion } = match

    // 2. Search availability for the full UTC day.
    //    Edmonton is UTC-6 (MDT) / UTC-7 (MST). All business-hours slots
    //    (9 AM – 5 PM local) fall within the UTC window below.
    const startAt = `${date}T00:00:00.000Z`
    const endAt = `${date}T23:59:59.999Z`

    const availData = await squareFetch('/v2/bookings/availability/search', {
      method: 'POST',
      body: JSON.stringify({
        query: {
          filter: {
            start_at_range: { start_at: startAt, end_at: endAt },
            segment_filters: [{ service_variation_id: variationId }],
          },
        },
      }),
    })

    // 3. Format slots for the UI
    const slots = (availData.availabilities as any[] ?? []).map((a: any) => ({
      time: new Date(a.start_at).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: CLIENT_TIMEZONE,
      }),
      startAt: a.start_at as string,
      teamMemberId: (a.appointment_segments as any[])?.[0]?.team_member_id ?? null,
      serviceVariationId: variationId,
      serviceVariationVersion: variationVersion,
    }))

    res.status(200).json({ slots })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
}
