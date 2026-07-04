import type { VercelRequest, VercelResponse } from '@vercel/node'
import { randomUUID } from 'crypto'

const APP_ID = process.env.VITE_SQUARE_APP_ID as string
const ENVIRONMENT = process.env.SQUARE_ENVIRONMENT as string
const REDIRECT_URL = process.env.SQUARE_REDIRECT_URL as string

const SCOPES = [
  'APPOINTMENTS_READ',
  'APPOINTMENTS_WRITE',
  'PAYMENTS_WRITE',
  'ORDERS_WRITE',
  'ITEMS_READ',
  'MERCHANT_PROFILE_READ',
].join('+')

// One-time setup tool (site owner links their Square account). Gated behind
// ADMIN_SECRET so it isn't a publicly reachable link, and a random `state`
// nonce is bound to an HttpOnly cookie so /oauth/callback can reject any
// authorization code that wasn't the result of a flow started here.
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.query.key !== process.env.ADMIN_SECRET) {
    return res.status(401).send('Unauthorized')
  }

  const baseUrl =
    ENVIRONMENT === 'sandbox'
      ? 'https://connect.squareupsandbox.com'
      : 'https://connect.squareup.com'

  const state = randomUUID()
  res.setHeader(
    'Set-Cookie',
    `sq_oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Max-Age=600; Path=/api/oauth`,
  )

  const url =
    `${baseUrl}/oauth2/authorize` +
    `?client_id=${APP_ID}` +
    `&scope=${SCOPES}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URL)}` +
    `&session=false` +
    `&state=${state}`

  res.redirect(302, url)
}
