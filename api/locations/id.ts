import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getLocationId } from '../_square.js'
import { enforceRateLimit, locationLimiter } from '../_ratelimit.js'
import { setCorsHeaders } from '../_cors.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res)
  if (!(await enforceRateLimit(req, res, locationLimiter))) return
  try {
    const locationId = await getLocationId()
    res.status(200).json({ locationId })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
}
