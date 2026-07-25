import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getCatalogItems, listServiceItems, listServiceVariations } from './_square.js'
import { enforceRateLimit, servicesLimiter } from './_ratelimit.js'
import { setCorsHeaders } from './_cors.js'

// Live service pricing for the booking page. Reuses the same 5-minute catalog
// cache the availability route already fills, so this costs no extra Square call
// on a warm instance.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res)
  if (!(await enforceRateLimit(req, res, servicesLimiter))) return
  try {
    const items = await getCatalogItems()
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600')
    // `variations` is the old flat shape — a browser holding a cached bundle from
    // before service names went live still reads it. Drop it once that's aged out.
    res.status(200).json({
      items: listServiceItems(items),
      variations: listServiceVariations(items),
    })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
}
