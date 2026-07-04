// GET  /api/judgeme          — fetch reviews
// POST /api/judgeme          — submit a review

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { enforceRateLimit, judgemeReadLimiter, judgemeWriteLimiter } from './_ratelimit.js'
import { setCorsHeaders } from './_cors.js'
import { isValidEmail, isNonEmptyString, isOptionalString } from './_validate.js'

const SHOP_DOMAIN = process.env.VITE_JUDGEME_SHOP_DOMAIN as string
const API_TOKEN = process.env.JUDGEME_PRIVATE_TOKEN as string

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(204).end()

  if (req.method === 'GET') {
    if (!(await enforceRateLimit(req, res, judgemeReadLimiter))) return
    const per_page_raw = Array.isArray(req.query.per_page) ? req.query.per_page[0] : req.query.per_page
    const per_page_num = per_page_raw !== undefined ? Number(per_page_raw) : 200
    if (!Number.isInteger(per_page_num) || per_page_num < 1 || per_page_num > 200) {
      return res.status(400).json({ message: 'per_page must be an integer between 1 and 200' })
    }
    const per_page = String(per_page_num)
    try {
      const upstream = await fetch(
        `https://api.judge.me/api/v1/reviews?shop_domain=${SHOP_DOMAIN}&per_page=${per_page}`,
        { headers: { 'X-Api-Token': API_TOKEN } },
      )
      const data = await upstream.json()
      return res.status(upstream.status).json(data)
    } catch {
      return res.status(500).json({ reviews: [] })
    }
  }

  if (req.method === 'POST') {
    if (!(await enforceRateLimit(req, res, judgemeWriteLimiter))) return
    const { id, email, name, rating, title, body } = (req.body ?? {}) as Record<string, unknown>
    if (!isNonEmptyString(id, 100) || !isValidEmail(email) || !isNonEmptyString(name, 200) || !isNonEmptyString(body, 5000)) {
      return res.status(400).json({ message: 'Missing or invalid required fields: id, email, name, rating, body' })
    }
    const ratingNum = Number(rating)
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: 'rating must be an integer between 1 and 5' })
    }
    if (!isOptionalString(title, 200)) {
      return res.status(400).json({ message: 'title is too long' })
    }
    try {
      const upstream = await fetch('https://api.judge.me/api/v1/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Api-Token': API_TOKEN },
        body: JSON.stringify({ shop_domain: SHOP_DOMAIN, platform: 'shopify', id, email, name, rating, title, body }),
      })
      const data = await upstream.json()
      return res.status(upstream.status).json(data)
    } catch {
      return res.status(500).json({ message: 'Failed to submit review. Please try again.' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
