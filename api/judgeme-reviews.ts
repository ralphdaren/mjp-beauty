import type { VercelRequest, VercelResponse } from '@vercel/node'

const SHOP_DOMAIN = process.env.VITE_JUDGEME_SHOP_DOMAIN as string
const API_TOKEN = process.env.JUDGEME_PRIVATE_TOKEN as string

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { per_page = '200' } = req.query

  try {
    const url = `https://api.judge.me/api/v1/reviews?shop_domain=${SHOP_DOMAIN}&per_page=${per_page}`
    const upstream = await fetch(url, { headers: { 'X-Api-Token': API_TOKEN } })
    const data = await upstream.json()
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(upstream.status).json(data)
  } catch {
    res.status(500).json({ reviews: [] })
  }
}
