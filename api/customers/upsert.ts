// POST /api/customers/upsert
// Body: { firstName, lastName, email, phone }
// Finds an existing Square customer by email or creates one. Returns customerId.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { squareFetch } from '../_square.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { firstName, lastName, email, phone } = req.body ?? {}
  if (!email) return res.status(400).json({ error: 'email is required' })

  try {
    const searchData = await squareFetch('/v2/customers/search', {
      method: 'POST',
      body: JSON.stringify({
        query: { filter: { email_address: { exact: String(email) } } },
        limit: 1,
      }),
    })

    const existing = (searchData.customers as any[] | undefined)?.[0]
    if (existing) {
      return res.status(200).json({ customerId: existing.id as string })
    }

    const createData = await squareFetch('/v2/customers', {
      method: 'POST',
      body: JSON.stringify({
        given_name: firstName ? String(firstName) : undefined,
        family_name: lastName ? String(lastName) : undefined,
        email_address: String(email),
        phone_number: phone ? String(phone) : undefined,
      }),
    })

    res.status(200).json({ customerId: createData.customer?.id as string })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
}
