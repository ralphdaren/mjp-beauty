import type { VercelRequest, VercelResponse } from '@vercel/node'

const SHOP_DOMAIN = process.env.VITE_JUDGEME_SHOP_DOMAIN as string
const API_TOKEN = process.env.JUDGEME_PRIVATE_TOKEN as string

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' })
    return
  }

  const { id, email, name, rating, title, body } = (req.body ?? {}) as Record<string, unknown>

  if (!id || !email || !name || !rating || !body) {
    res.status(400).json({ message: 'Missing required fields: id, email, name, rating, body' })
    return
  }

  try {
    const upstream = await fetch('https://api.judge.me/api/v1/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Token': API_TOKEN,
      },
      body: JSON.stringify({
        shop_domain: SHOP_DOMAIN,
        platform: 'shopify',
        id,
        email,
        name,
        rating,
        title,
        body,
      }),
    })
    const data = await upstream.json()
    res.status(upstream.status).json(data)
  } catch {
    res.status(500).json({ message: 'Failed to submit review. Please try again.' })
  }
}
