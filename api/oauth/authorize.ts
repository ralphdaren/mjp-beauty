import type { VercelRequest, VercelResponse } from '@vercel/node'

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

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const baseUrl =
    ENVIRONMENT === 'sandbox'
      ? 'https://connect.squareupsandbox.com'
      : 'https://connect.squareup.com'

  const url =
    `${baseUrl}/oauth2/authorize` +
    `?client_id=${APP_ID}` +
    `&scope=${SCOPES}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URL)}` +
    `&session=false`

  res.redirect(302, url)
}
