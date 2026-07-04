// Shared origin allow-list for CORS. Reflects back the request's Origin only
// if it's on the list, instead of `*` — so responses (some of which sit behind
// Bearer/rate-limit auth) can't be read by arbitrary third-party sites.

import type { VercelRequest, VercelResponse } from '@vercel/node'

const ALLOWED_ORIGINS = [
  'https://mjp-beauty-ralph-daren-s-projects.vercel.app',
  'http://localhost:5173',
  'http://localhost:4173',
]

export function setCorsHeaders(req: VercelRequest, res: VercelResponse): void {
  const origin = req.headers.origin
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }
}
