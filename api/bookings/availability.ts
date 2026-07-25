// GET /api/bookings/availability?tierLabel=…&variationId=…&date=YYYY-MM-DD → { slots }
// GET /api/bookings/availability?tierLabel=…&variationId=…&month=YYYY-MM   → { dates }
//
// `tierLabel` may be repeated, once per service, for an appointment that books
// several services back to back — Square searches for one opening long enough
// to fit them all, in the order they're passed. `variationId` is optional and
// positional: the nth id goes with the nth label, and an empty one falls back to
// resolving that service by name.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { squareFetch, getCatalogItems, getLocationId, findVariations, variationMinutes, type VariationRef } from '../_square.js'
import { getHeldBlocks, overlapsBlock } from '../_holds.js'
import { enforceRateLimit, availabilityLimiter } from '../_ratelimit.js'
import { setCorsHeaders } from '../_cors.js'
import { isNonEmptyString, isValidDateOnly } from '../_validate.js'

const CLIENT_TIMEZONE = 'America/Winnipeg'
const MAX_SERVICES = 5

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res)
  if (!(await enforceRateLimit(req, res, availabilityLimiter))) return

  const { tierLabel, variationId, date, month } = req.query

  // Zipped before filtering so a service whose id is blank keeps its label lined
  // up with the right position.
  const rawLabels = Array.isArray(tierLabel) ? tierLabel : [tierLabel]
  const rawIds = Array.isArray(variationId) ? variationId : [variationId]
  const refs: VariationRef[] = rawLabels.flatMap((label, index) => {
    if (!isNonEmptyString(label, 100)) return []
    const id = rawIds[index]
    return [{ tierLabel: label, variationId: isNonEmptyString(id, 100) ? id : null }]
  })
  const tierLabels = refs.map((ref) => ref.tierLabel)

  if (tierLabels.length === 0) {
    return res.status(400).json({ error: 'tierLabel is required' })
  }
  if (tierLabels.length > MAX_SERVICES) {
    return res.status(400).json({ error: `At most ${MAX_SERVICES} services can be booked in one appointment` })
  }
  if (!date && !month) {
    return res.status(400).json({ error: 'either date (YYYY-MM-DD) or month (YYYY-MM) is required' })
  }
  if (date !== undefined && !isValidDateOnly(date)) {
    return res.status(400).json({ error: 'date must be in YYYY-MM-DD format' })
  }

  try {
    const [locationId, catalogItems] = await Promise.all([getLocationId(), getCatalogItems()])

    let matches
    try {
      matches = findVariations(catalogItems, refs)
    } catch (err) {
      return res.status(404).json({ error: String(err instanceof Error ? err.message : err) })
    }

    // One segment per service — Square chains them and only returns start times
    // with room for the whole appointment.
    const segmentFilters = matches.map((match) => ({ service_variation_id: match.id }))
    const totalMinutes = matches.reduce((total, match) => total + variationMinutes(match), 0)
    const totalMs = Math.max(totalMinutes, 1) * 60_000

    // ── Slots for a specific day ──────────────────────────────────────────────
    if (date && typeof date === 'string') {
      const now = new Date()
      const dayStart = new Date(`${date}T00:00:00.000Z`)
      const startAt = dayStart > now ? dayStart.toISOString() : now.toISOString()
      const endAt = `${date}T23:59:59.999Z`

      const [availData, heldBlocks] = await Promise.all([
        squareFetch('/v2/bookings/availability/search', {
          method: 'POST',
          body: JSON.stringify({
            query: {
              filter: {
                location_id: locationId,
                start_at_range: { start_at: startAt, end_at: endAt },
                segment_filters: segmentFilters,
              },
            },
          }),
        }),
        getHeldBlocks(dayStart.toISOString(), endAt, catalogItems),
      ])

      const slots = (availData.availabilities as any[] ?? [])
        .filter((a: any) => {
          const start = new Date(a.start_at).getTime()
          return !overlapsBlock(start, start + totalMs, heldBlocks)
        })
        .map((a: any) => {
          const segments = (a.appointment_segments as any[]) ?? []
          const teamMemberIds = matches.map(
            (_, index) => (segments[index]?.team_member_id as string | undefined) ?? segments[0]?.team_member_id ?? null,
          )
          return {
            time: new Date(a.start_at).toLocaleTimeString('en-US', {
              hour: 'numeric', minute: '2-digit', hour12: true, timeZone: CLIENT_TIMEZONE,
            }),
            startAt: a.start_at as string,
            teamMemberId: teamMemberIds[0],
            teamMemberIds,
          }
        })

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

      const [availData, heldBlocks] = await Promise.all([
        squareFetch('/v2/bookings/availability/search', {
          method: 'POST',
          body: JSON.stringify({
            query: {
              filter: {
                location_id: locationId,
                start_at_range: { start_at: startAt, end_at: endAt },
                segment_filters: segmentFilters,
              },
            },
          }),
        }),
        getHeldBlocks(monthStart.toISOString(), endAt, catalogItems),
      ])

      const dateSet = new Set<string>()
      for (const a of (availData.availabilities as any[] ?? [])) {
        const start = new Date(a.start_at).getTime()
        if (overlapsBlock(start, start + totalMs, heldBlocks)) continue
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
