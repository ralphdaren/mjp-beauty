// POST /api/customers { action: 'upsert', firstName, lastName, email, phone }  → { customerId }
// POST /api/customers { action: 'save-card', customerId, sourceId }            → { cardId }

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { squareFetch } from './_square.js'
import { randomUUID } from 'crypto'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { action, ...body } = req.body ?? {}

  if (action === 'upsert') {
    const { firstName, lastName, email, phone } = body
    if (!email) return res.status(400).json({ error: 'email is required' })
    try {
      const searchData = await squareFetch('/v2/customers/search', {
        method: 'POST',
        body: JSON.stringify({ query: { filter: { email_address: { exact: String(email) } } }, limit: 1 }),
      })
      const existing = (searchData.customers as any[] | undefined)?.[0]
      if (existing) return res.status(200).json({ customerId: existing.id as string })

      const createData = await squareFetch('/v2/customers', {
        method: 'POST',
        body: JSON.stringify({
          given_name: firstName ? String(firstName) : undefined,
          family_name: lastName ? String(lastName) : undefined,
          email_address: String(email),
          phone_number: phone ? String(phone) : undefined,
        }),
      })
      return res.status(200).json({ customerId: createData.customer?.id as string })
    } catch (err) {
      return res.status(500).json({ error: String(err) })
    }
  }

  if (action === 'save-card') {
    const { customerId, sourceId } = body
    if (!customerId || !sourceId) return res.status(400).json({ error: 'customerId and sourceId are required' })
    try {
      const data = await squareFetch('/v2/cards', {
        method: 'POST',
        body: JSON.stringify({
          idempotency_key: randomUUID(),
          source_id: String(sourceId),
          card: { customer_id: String(customerId) },
        }),
      })
      return res.status(200).json({ cardId: data.card?.id as string })
    } catch (err) {
      return res.status(500).json({ error: String(err) })
    }
  }

  return res.status(400).json({ error: 'action must be "upsert" or "save-card"' })
}
