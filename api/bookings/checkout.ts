// POST /api/bookings/checkout
// Body: { bookingId?, serviceName, tierLabel, price }
// Creates a Square payment link and returns the URL to redirect the user to.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { randomUUID } from 'crypto'
import { squareFetch, getLocationId } from '../_square'

// Parse "$123.81" → 12381 (smallest currency unit, CAD cents)
function priceInCents(priceStr: string): number {
  return Math.round(parseFloat(priceStr.replace(/[$,]/g, '')) * 100)
}

function getSiteOrigin(): string {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { bookingId, serviceName, tierLabel, price } = req.body ?? {}

  if (!serviceName || !tierLabel || !price) {
    return res.status(400).json({ error: 'serviceName, tierLabel, and price are required' })
  }

  try {
    const locationId = await getLocationId()
    const lineItemName = `${serviceName} — ${tierLabel}`
    const amountCents = priceInCents(String(price))
    const redirectUrl = `${getSiteOrigin()}/book?confirmed=1`

    const checkoutData = await squareFetch('/v2/online-checkout/payment-links', {
      method: 'POST',
      body: JSON.stringify({
        idempotency_key: randomUUID(),
        order: {
          location_id: locationId,
          reference_id: bookingId ?? undefined,
          line_items: [
            {
              name: lineItemName,
              quantity: '1',
              base_price_money: {
                amount: amountCents,
                currency: 'CAD',
              },
            },
          ],
        },
        checkout_options: {
          redirect_url: redirectUrl,
          ask_for_shipping_address: false,
        },
      }),
    })

    const checkoutUrl = checkoutData.payment_link?.url as string | undefined
    if (!checkoutUrl) throw new Error('No checkout URL returned from Square')

    res.status(200).json({ checkoutUrl })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
}
