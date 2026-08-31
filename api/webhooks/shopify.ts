// POST /api/webhooks/shopify
//
// Shopify calls this when an order is paid. It records the ticket in Supabase
// and sends the buyer their Made For More confirmation ticket.
//
// Runs on the Edge runtime for the same reason api/webhooks/square.ts does:
// signature verification needs the exact raw request bytes, and Vercel's Node
// runtime parses JSON into req.body before the handler sees it, which would
// make the HMAC input diverge from what Shopify actually signed.
//
// Requires a webhook subscription in the Shopify admin (Settings > Notifications
// > Webhooks) for the `orders/paid` event pointed at this route, plus that
// subscription's signing secret stored as SHOPIFY_WEBHOOK_SECRET.

import { supabase } from '../_supabase.js'
import { renderTicketEmail, ticketEmailText, ticketEmailSubject } from '../_mfm-ticket-email.js'
import { MFM_TICKETS_PRODUCT_ID, EARLY_BIRD_ENDS_AT } from '../_mfm-config.js'

export const config = { runtime: 'edge' }

const RESEND_ENDPOINT = 'https://api.resend.com/emails'

async function isValidSignature(rawBody: string, signature: string | null): Promise<boolean> {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET
  if (!signature || !secret) return false

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody))
  const expected = btoa(String.fromCharCode(...new Uint8Array(digest)))

  if (expected.length !== signature.length) return false
  let mismatch = 0
  for (let i = 0; i < expected.length; i++) mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i)
  return mismatch === 0
}

interface ShopifyLineItem {
  title?: string
  variant_title?: string
  quantity?: number
  product_id?: number | string
}

interface ShopifyOrder {
  id?: number | string
  name?: string
  email?: string
  contact_email?: string
  created_at?: string
  current_total_price?: string
  total_price?: string
  currency?: string
  customer?: { first_name?: string; last_name?: string }
  billing_address?: { first_name?: string; last_name?: string; province?: string; city?: string }
  line_items?: ShopifyLineItem[]
  note_attributes?: { name?: string; value?: string }[]
}

const ok = (body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  const rawBody = await req.text()
  if (!(await isValidSignature(rawBody, req.headers.get('x-shopify-hmac-sha256')))) {
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 })
  }

  let order: ShopifyOrder
  try {
    order = JSON.parse(rawBody)
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  const orderId = order.id != null ? String(order.id) : ''
  if (!orderId) return ok({ ignored: 'no order id' })

  // The store sells brow academy products too — only ticket orders belong here.
  // Match on product id first so renaming the product in Shopify can't quietly
  // stop tickets being recognised; the title check is a backstop.
  const ticketLines = (order.line_items ?? []).filter(
    (line) =>
      String(line.product_id ?? '') === MFM_TICKETS_PRODUCT_ID ||
      (line.title ?? '').toLowerCase().includes('made for more'),
  )
  if (ticketLines.length === 0) return ok({ ignored: 'not a ticket order' })

  const email = order.email ?? order.contact_email ?? ''
  if (!email) return ok({ ignored: 'no email on order' })

  const firstName =
    order.customer?.first_name ?? order.billing_address?.first_name ?? 'there'
  const lastName = order.customer?.last_name ?? order.billing_address?.last_name ?? ''
  const instagram =
    (order.note_attributes ?? []).find((a) => (a.name ?? '').toLowerCase() === 'instagram')?.value ?? null

  const items = ticketLines.map((line) => ({
    tier: line.variant_title ?? line.title ?? 'Ticket',
    quantity: line.quantity ?? 1,
  }))

  const totalRaw = order.current_total_price ?? order.total_price ?? '0'
  const currency = order.currency ?? 'CAD'
  const orderedAt = order.created_at ?? new Date().toISOString()

  // Shopify retries a webhook until it gets a 2xx, and can deliver the same
  // event more than once. The unique constraint on shopify_order_id is what
  // stops a retry from sending a second ticket for the same order.
  const { error: insertError } = await supabase.from('mfm_tickets').insert({
    shopify_order_id: orderId,
    order_number: order.name ?? null,
    email,
    customer_name: `${firstName} ${lastName}`.trim(),
    instagram,
    items,
    total_cents: Math.round(parseFloat(totalRaw) * 100),
    currency,
    ordered_at: orderedAt,
  })

  if (insertError) {
    // 23505 = unique violation: this order was already handled, so the buyer
    // already has their ticket. Ack it so Shopify stops retrying.
    if (insertError.code === '23505') return ok({ duplicate: orderId })
    // Anything else is a real failure — 500 so Shopify retries rather than
    // silently dropping someone's ticket.
    return new Response(JSON.stringify({ error: 'Could not record ticket' }), { status: 500 })
  }

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL ?? 'MJP Beauty <onboarding@resend.dev>'
  if (!apiKey) return ok({ recorded: orderId, emailed: false, reason: 'no RESEND_API_KEY' })

  const emailData = {
    firstName,
    items: items.map(({ tier, quantity }) => (quantity > 1 ? `${tier} × ${quantity}` : tier)),
    total: `$${parseFloat(totalRaw).toFixed(2)} ${currency}`,
    orderNumber: order.name ?? `#${orderId}`,
    showGiveaway: Date.parse(orderedAt) < Date.parse(EARLY_BIRD_ENDS_AT),
  }

  const sent = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: email,
      subject: ticketEmailSubject(order.name ?? `#${orderId}`),
      html: renderTicketEmail(emailData),
      text: ticketEmailText(emailData),
    }),
  })

  if (sent.ok) {
    await supabase
      .from('mfm_tickets')
      .update({ email_sent_at: new Date().toISOString() })
      .eq('shopify_order_id', orderId)
  }

  // The ticket is recorded either way. A failed send is left for the admin to
  // chase rather than retried, since a retry would re-run the whole webhook and
  // the insert above would already read as a duplicate.
  return ok({ recorded: orderId, emailed: sent.ok })
}
