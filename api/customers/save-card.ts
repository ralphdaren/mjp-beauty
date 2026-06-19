// POST /api/customers/save-card
// Body: { customerId, sourceId }
// Saves a card on file in Square for the given customer.
// sourceId is the nonce returned by the Square Web Payments SDK on the frontend.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { squareFetch } from '../_square.js'
import { randomUUID } from 'crypto'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { customerId, sourceId } = req.body ?? {}
  if (!customerId || !sourceId) {
    return res.status(400).json({ error: 'customerId and sourceId are required' })
  }

  try {
    const data = await squareFetch('/v2/cards', {
      method: 'POST',
      body: JSON.stringify({
        idempotency_key: randomUUID(),
        source_id: String(sourceId),
        card: { customer_id: String(customerId) },
      }),
    })

    res.status(200).json({ cardId: data.card?.id as string })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
}
