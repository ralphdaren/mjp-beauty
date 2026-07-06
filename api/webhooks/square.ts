// POST /api/webhooks/square
// Square calls this when a booking changes status (e.g. the store cancels an
// accepted appointment directly from the Square dashboard, bypassing this
// app's admin dashboard entirely). Keeps booking_requests.status in sync so
// the admin dashboard doesn't keep showing a cancelled appointment as
// "accepted".
//
// Runs on the Edge runtime (not the default Node runtime used by the rest of
// api/*) because signature verification needs the exact raw request bytes —
// Vercel's Node runtime parses JSON into req.body before the handler runs,
// which would make the HMAC input diverge from what Square actually signed.
//
// Requires a webhook subscription configured in the Square Developer
// Dashboard for the `booking.updated` event, pointed at this route's URL,
// plus that subscription's signature key stored as SQUARE_WEBHOOK_SIGNATURE_KEY.

import { supabase } from '../_supabase.js'

export const config = { runtime: 'edge' }

const CANCELLED_STATUSES = new Set(['CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_SELLER', 'DECLINED'])

async function isValidSignature(rawBody: string, signature: string | null): Promise<boolean> {
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY
  const notificationUrl = process.env.SQUARE_WEBHOOK_URL
  if (!signature || !key || !notificationUrl) return false

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const digest = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(notificationUrl + rawBody))
  const expected = btoa(String.fromCharCode(...new Uint8Array(digest)))

  if (expected.length !== signature.length) return false
  let mismatch = 0
  for (let i = 0; i < expected.length; i++) mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i)
  return mismatch === 0
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  const rawBody = await req.text()
  const signature = req.headers.get('x-square-hmacsha256-signature')

  if (!(await isValidSignature(rawBody, signature))) {
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 })
  }

  let event: { type?: string; data?: { object?: { booking?: { id?: string; status?: string } } } }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  if (event.type === 'booking.updated') {
    const booking = event.data?.object?.booking
    const squareBookingId = booking?.id
    const status = booking?.status

    if (squareBookingId && status && CANCELLED_STATUSES.has(status)) {
      await supabase
        .from('booking_requests')
        .update({ status: 'cancelled', reviewed_at: new Date().toISOString() })
        .eq('square_booking_id', squareBookingId)
        .eq('status', 'accepted')
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
}
