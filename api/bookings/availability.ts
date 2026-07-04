// GET /api/bookings/availability?tierLabel=...&date=YYYY-MM-DD   → { slots }
// GET /api/bookings/availability?tierLabel=...&month=YYYY-MM     → { dates }

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { squareFetch, getCatalogItems, getLocationId, findVariationByLabel } from '../_square.js'
import { enforceRateLimit, availabilityLimiter } from '../_ratelimit.js'

const CLIENT_TIMEZONE = 'America/Winnipeg'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (!(await enforceRateLimit(req, res, availabilityLimiter))) return

  const { tierLabel, date, month } = req.query

  if (!tierLabel || typeof tierLabel !== 'string') {
    return res.status(400).json({ error: 'tierLabel is required' })
  }
  if (!date && !month) {
    return res.status(400).json({ error: 'either date (YYYY-MM-DD) or month (YYYY-MM) is required' })
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

    const { id: variationId, version: variationVersion } = match as { id: string; version: number }

    // ── Slots for a specific day ──────────────────────────────────────────────
    if (date && typeof date === 'string') {
      const now = new Date()
      const dayStart = new Date(`${date}T00:00:00.000Z`)
      const startAt = dayStart > now ? dayStart.toISOString() : now.toISOString()
      const endAt = `${date}T23:59:59.999Z`

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

      const slots = (availData.availabilities as any[] ?? []).map((a: any) => ({
        time: new Date(a.start_at).toLocaleTimeString('en-US', {
          hour: 'numeric', minute: '2-digit', hour12: true, timeZone: CLIENT_TIMEZONE,
        }),
        startAt: a.start_at as string,
        teamMemberId: (a.appointment_segments as any[])?.[0]?.team_member_id ?? null,
        serviceVariationId: variationId,
        serviceVariationVersion: variationVersion,
      }))

      return res.status(200).json({ slots })
    }

    // ── Available dates for a month ───────────────────────────────────────────
    if (month && typeof month === 'string' && /^\d{4}-\d{2}$/.test(month)) {
      const [year, mon] = month.split('-').map(Number)
      const now = new Date()
      const monthStart = new Date(`${month}-01T00:00:00.000Z`)
      const startAt = monthStart > now ? monthStart.toISOString() : now.toISOString()
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

      const dateSet = new Set<string>()
      for (const a of (availData.availabilities as any[] ?? [])) {
        const local = new Date(a.start_at).toLocaleDateString('en-CA', { timeZone: CLIENT_TIMEZONE })
        dateSet.add(local)
      }

      return res.status(200).json({ dates: Array.from(dateSet).sort() })
    }

    return res.status(400).json({ error: 'month must be in YYYY-MM format' })
  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
}
