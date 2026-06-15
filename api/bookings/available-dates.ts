// GET /api/bookings/available-dates?tierLabel=...&month=YYYY-MM
// Returns an array of YYYY-MM-DD strings that have at least one available slot.
// Used by the calendar to disable dates with no real Square availability.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { squareFetch, getCatalogItems, getLocationId, findVariationByLabel } from '../_square.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  const { tierLabel, month } = req.query

  if (
    !tierLabel || !month ||
    typeof tierLabel !== 'string' || typeof month !== 'string' ||
    !/^\d{4}-\d{2}$/.test(month)
  ) {
    return res.status(400).json({ error: 'tierLabel and month (YYYY-MM) are required' })
  }

  try {
    const [locationId, catalogItems] = await Promise.all([getLocationId(), getCatalogItems()])
    const match = findVariationByLabel(catalogItems, tierLabel)

    if (!match.id) {
      return res.status(404).json({
        error: `No Square variation found matching: "${tierLabel}"`,
        availableVariations: (match as any).availableNames,
      })
    }

    const { id: variationId } = match

    // Query Square for the entire month in one request
    const [year, mon] = month.split('-').map(Number)
    const now = new Date()
    const monthStart = new Date(`${month}-01T00:00:00.000Z`)
    const startAt = monthStart > now ? monthStart.toISOString() : now.toISOString()
    // Last day of month: day 0 of next month
    const lastDay = new Date(year, mon, 0).getDate()
    const endAt = `${month}-${String(lastDay).padStart(2, '0')}T23:59:59.999Z`

    const availData = await squareFetch('/v2/bookings/availability/search', {
      method: 'POST',
      body: JSON.stringify({
        query: {
          filter: {
            location_id: locationId,
            start_at_range: { start_at: startAt, end_at: endAt },
            segment_filters: [{ service_variation_id: variationId }],
          },
        },
      }),
    })

    // Extract unique YYYY-MM-DD dates from the returned slots
    // Slots are in UTC; convert to Edmonton local date so the day matches what the user picks
    const dateSet = new Set<string>()
    for (const a of (availData.availabilities as any[] ?? [])) {
      const local = new Date(a.start_at).toLocaleDateString('en-CA', {
        timeZone: 'America/Edmonton',
      })
      dateSet.add(local)
    }

    res.status(200).json({ dates: Array.from(dateSet).sort() })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
}
