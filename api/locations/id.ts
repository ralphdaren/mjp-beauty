import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getLocationId } from '../_square.js'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  try {
    const locationId = await getLocationId()
    res.status(200).json({ locationId })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
}
