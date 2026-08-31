import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getCatalogItems, listServiceItems, listServiceVariations } from './_square.js'
import { enforceRateLimit, servicesLimiter } from './_ratelimit.js'
import { setCorsHeaders } from './_cors.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res)
  if (!(await enforceRateLimit(req, res, servicesLimiter))) return
  try {
    const items = await getCatalogItems()
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600')
    res.status(200).json({
      items: listServiceItems(items),
      variations: listServiceVariations(items),
    })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
}
