// Diagnostic endpoint — call this once to see your Square services and variation IDs.
// GET /api/bookings/catalog
// Not used by the UI in production; useful for confirming tier label → Square variation name mapping.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getCatalogItems } from '../_square'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  try {
    const items = await getCatalogItems()
    const services = items.map((item: any) => ({
      squareItemId: item.id as string,
      name: item.item_data?.name as string,
      variations: (item.item_data?.variations as any[] ?? []).map((v: any) => ({
        squareVariationId: v.id as string,
        version: v.version as number,
        name: v.item_variation_data?.name as string,
        priceMoney: v.item_variation_data?.price_money,
        durationMs: v.item_variation_data?.service_duration,
      })),
    }))
    res.status(200).json({ services })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
}
