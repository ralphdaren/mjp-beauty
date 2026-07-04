// POST /api/customers { action: 'attach-card', firstName, lastName, email, phone, sourceId }       → { customerId, cardId }
//
// Resolves the customer (search-or-create by email) itself — it never accepts a client-supplied
// customerId. Accepting one directly would let a caller attach a card to *any* Square customer
// record by guessing/enumerating IDs, regardless of whose email they submitted.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { squareFetch } from './_square.js'
import { randomUUID } from 'crypto'
import { enforceRateLimit, attachCardLimiter } from './_ratelimit.js'

async function upsertCustomer(firstName: unknown, lastName: unknown, email: unknown, phone: unknown): Promise<string> {
  const searchData = await squareFetch('/v2/customers/search', {
    method: 'POST',
    body: JSON.stringify({ query: { filter: { email_address: { exact: String(email) } } }, limit: 1 }),
  })
  const existing = (searchData.customers as any[] | undefined)?.[0]
  if (existing) return existing.id as string

  const createData = await squareFetch('/v2/customers', {
    method: 'POST',
    body: JSON.stringify({
      given_name: firstName ? String(firstName) : undefined,
      family_name: lastName ? String(lastName) : undefined,
      email_address: String(email),
      phone_number: phone ? String(phone) : undefined,
    }),
  })
  return createData.customer?.id as string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!(await enforceRateLimit(req, res, attachCardLimiter))) return

  const { action, ...body } = req.body ?? {}

  if (action === 'attach-card') {
    const { firstName, lastName, email, phone, sourceId } = body
    if (!email || !sourceId) return res.status(400).json({ error: 'email and sourceId are required' })
    try {
      const customerId = await upsertCustomer(firstName, lastName, email, phone)
      const data = await squareFetch('/v2/cards', {
        method: 'POST',
        body: JSON.stringify({
          idempotency_key: randomUUID(),
          source_id: String(sourceId),
          card: { customer_id: customerId },
        }),
      })
      return res.status(200).json({ customerId, cardId: data.card?.id as string })
    } catch (err) {
      return res.status(500).json({ error: String(err) })
    }
  }

  return res.status(400).json({ error: 'action must be "attach-card"' })
}
