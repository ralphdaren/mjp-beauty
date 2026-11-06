// Cancellation fee: quote, preview and charge for a website booking.
// Double-charge protection is layered:
//   1. a conditional claim on the booking_requests row (only one request can win it),
//   2. a per-attempt Square idempotency key stored on the claim; a reclaim reuses it, so a
//      payment that went through earlier is replayed instead of charged again,
//   3. the claim is released only when Square definitely rejected the payment.
import { createHash } from 'crypto'
import { Resend } from 'resend'
import { supabase } from './_supabase.js'
import { SQUARE_BASE_URL, squareFetch, getLocationId, getCatalogItems, findVariation } from './_square.js'
import {
  FEE_REASONS,
  bookingTotalCents,
  feeCents,
  inclusiveBaseCents,
  isChargeable,
  validateAmount,
  pickCard,
  reclaimMissError,
  type FeeReason,
  type FeeRow,
} from './_fee.js'
import { renderFeeEmail } from './_fee-email.js'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL ?? 'MJP Beauty <onboarding@resend.dev>'
const CLIENT_TIMEZONE = 'America/Winnipeg'
const CURRENCY = 'CAD'
const CLAIM_STALE_MS = 5 * 60 * 1000

export interface FeeQuote {
  requestId: string
  chargeable: boolean
  services: Array<{ serviceName: string; tierLabel: string; priceCents: number | null }>
  totalCents: number | null
  options: Array<{ reason: FeeReason; label: string; detail: string; pct: number; amountCents: number | null }>
  card: { brand: string; last4: string } | null
  cardError: string | null
  email: string
  firstName: string
  lastName: string
  startAt: string
}

export type FeeHttpError = Error & { status: number; feeError: true; keepClaim?: boolean; alreadyCharged?: boolean }

function httpError(status: number, message: string): FeeHttpError {
  return Object.assign(new Error(message), { status, feeError: true as const })
}

/**
 * Errors we raised keep their status. Anything else (squareFetch carries Square's own
 * status, e.g. 401/402, which the dashboard must not mistake for its own) becomes a 502
 * with Square's detail message.
 */
export function toFeeHttpError(err: unknown): FeeHttpError {
  if (err instanceof Error && (err as Partial<FeeHttpError>).feeError) return err as FeeHttpError
  return httpError(502, err instanceof Error ? err.message : String(err))
}
const squareError = toFeeHttpError

// ── Square response shapes (only the fields used here) ──────────────────────

interface SquareMoney {
  amount?: number
  currency?: string
}
interface SquareOrder {
  id: string
  total_money?: SquareMoney
  total_tax_money?: SquareMoney
}
interface SquarePayment {
  id: string
  status?: string
  amount_money?: SquareMoney
}
interface SquareTaxObject {
  id: string
  is_deleted?: boolean
  tax_data?: { name?: string; percentage?: string; enabled?: boolean; inclusion_type?: string }
}

// ── Row + prices ─────────────────────────────────────────────────────────────

type BookingRow = FeeRow & {
  id: string
  email: string
  first_name: string
  last_name: string | null
  service_name: string
  tier_label: string
  square_card_id: string | null
  items: unknown
}

async function loadRow(requestId: string): Promise<BookingRow> {
  const { data, error } = await supabase.from('booking_requests').select('*').eq('id', requestId).maybeSingle()
  if (error) throw httpError(500, error.message)
  if (!data) throw httpError(404, 'Booking request not found')
  return data as BookingRow
}

interface PricedItem {
  serviceName: string
  tierLabel: string
  variationId: string | null
  /** undefined = no snapshot (older row), null = variable price */
  priceCents: number | null | undefined
}

function rowItems(row: BookingRow): PricedItem[] {
  if (Array.isArray(row.items) && row.items.length > 0) {
    return (row.items as Array<Record<string, unknown>>).map((item) => ({
      serviceName: String(item.serviceName ?? row.service_name),
      tierLabel: String(item.tierLabel ?? row.tier_label),
      variationId: typeof item.variationId === 'string' ? item.variationId : null,
      priceCents:
        typeof item.priceCents === 'number' && Number.isInteger(item.priceCents) && item.priceCents >= 0
          ? item.priceCents
          : item.priceCents === null
            ? null
            : undefined,
    }))
  }
  return [{ serviceName: row.service_name, tierLabel: row.tier_label, variationId: null, priceCents: undefined }]
}

/** Price each service from the booking-time snapshot, else today's Square catalog. */
async function pricedServices(row: BookingRow): Promise<FeeQuote['services']> {
  const items = rowItems(row)
  const needsCatalog = items.some((i) => i.priceCents === undefined)
  const catalog = needsCatalog ? await getCatalogItems().catch((err) => { throw squareError(err) }) : []
  return items.map((i) => ({
    serviceName: i.serviceName,
    tierLabel: i.tierLabel,
    priceCents:
      i.priceCents !== undefined
        ? i.priceCents
        : (findVariation(catalog, { variationId: i.variationId, tierLabel: i.tierLabel })?.priceCents ?? null),
  }))
}

// ── Square helpers ───────────────────────────────────────────────────────────

interface SquareCard {
  id: string
  customer_id: string
  enabled: boolean
  created_at: string
  card_brand: string
  last_4: string
}

async function listCustomerCards(customerId: string): Promise<SquareCard[]> {
  const cards: SquareCard[] = []
  let cursor: string | undefined
  for (let page = 0; page < 5; page++) {
    const qs = new URLSearchParams({ customer_id: customerId })
    if (cursor) qs.set('cursor', cursor)
    const data = await squareFetch(`/v2/cards?${qs.toString()}`)
    cards.push(...((data.cards as SquareCard[] | undefined) ?? []))
    cursor = data.cursor
    if (!cursor) break
  }
  return cards
}

let _gstTaxId: string | null = null

/** The seller's 5% ADDITIVE GST catalog tax. Looked up, not hard-coded; cached per instance. */
async function getGstTaxId(): Promise<string> {
  if (_gstTaxId) return _gstTaxId
  const candidates: SquareTaxObject[] = []
  let cursor: string | undefined
  for (let page = 0; page < 10; page++) {
    const qs = new URLSearchParams({ types: 'TAX' })
    if (cursor) qs.set('cursor', cursor)
    const data = await squareFetch(`/v2/catalog/list?${qs.toString()}`)
    for (const obj of (data.objects as SquareTaxObject[] | undefined) ?? []) {
      const t = obj.tax_data
      if (!t || obj.is_deleted) continue
      if (t.enabled === false) continue
      if (parseFloat(String(t.percentage)) !== 5) continue
      if (t.inclusion_type && t.inclusion_type !== 'ADDITIVE') continue
      candidates.push(obj)
    }
    cursor = data.cursor
    if (!cursor) break
  }
  const chosen =
    candidates.find((o) => /goods|gst/i.test(String(o.tax_data?.name ?? ''))) ?? candidates[0]
  if (!chosen) throw httpError(500, 'No enabled 5% additive GST tax found in the Square catalog.')
  _gstTaxId = chosen.id
  return _gstTaxId
}

function appointmentText(startAt: string, style: 'full' | 'medium'): string {
  return new Date(startAt).toLocaleString('en-CA', { timeZone: CLIENT_TIMEZONE, dateStyle: style, timeStyle: 'short' })
}

function serviceSummary(services: Array<{ serviceName: string; tierLabel: string }>): string {
  return services.map((s) => `${s.serviceName} (${s.tierLabel})`).join(', ')
}

async function buildOrder(
  row: BookingRow,
  services: FeeQuote['services'],
  amountCents: number,
  reason: FeeReason | null,
) {
  const [locationId, taxId] = await Promise.all([getLocationId(), getGstTaxId()])
  const noteParts = [
    reason ? FEE_REASONS[reason].label : 'Cancellation fee',
    serviceSummary(services),
    appointmentText(row.start_at, 'medium'),
  ]
  return {
    location_id: locationId,
    customer_id: row.square_customer_id ?? undefined,
    line_items: [
      {
        name: 'Cancellation fee',
        quantity: '1',
        note: noteParts.join(' · ').slice(0, 500),
        base_price_money: { amount: inclusiveBaseCents(amountCents), currency: CURRENCY },
        applied_taxes: [{ tax_uid: 'gst' }],
      },
    ],
    taxes: [{ uid: 'gst', catalog_object_id: taxId, scope: 'LINE_ITEM' }],
  }
}

/** The order's total must land within a cent of what Micah entered, or something is misconfigured. */
function checkOrderTotal(order: SquareOrder | undefined, amountCents: number): number {
  const total = order?.total_money?.amount
  if (typeof total !== 'number' || Math.abs(total - amountCents) > 1) {
    throw httpError(500, `Square calculated ${total} cents for a ${amountCents} cent fee. Check the GST tax setup.`)
  }
  return total
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function getFeeQuote(requestId: string): Promise<FeeQuote> {
  const row = await loadRow(requestId)
  const services = await pricedServices(row)
  const totalCents = bookingTotalCents(services.map((s) => s.priceCents))

  let card: FeeQuote['card'] = null
  let cardError: string | null = null
  if (!row.square_customer_id) {
    cardError = 'No card on file'
  } else {
    try {
      const picked = pickCard(await listCustomerCards(row.square_customer_id), row.square_customer_id, row.square_card_id)
      if ('error' in picked) cardError = picked.error
      else card = { brand: picked.brand, last4: picked.last4 }
    } catch (err) {
      cardError = `Could not load the card from Square: ${err instanceof Error ? err.message : String(err)}`
    }
  }

  return {
    requestId: row.id,
    chargeable: isChargeable(row, Date.now()),
    services,
    totalCents,
    options: (Object.keys(FEE_REASONS) as FeeReason[]).map((reason) => ({
      reason,
      ...FEE_REASONS[reason],
      amountCents: totalCents === null ? null : feeCents(totalCents, reason),
    })),
    card,
    cardError,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name ?? '',
    startAt: row.start_at,
  }
}

function assertChargeable(row: BookingRow) {
  if (isChargeable(row, Date.now())) return
  if (row.fee_status === 'charged') throw Object.assign(httpError(409, 'Already charged'), { alreadyCharged: true })
  if (row.fee_status === 'charging') throw httpError(409, 'A charge for this booking is already in progress.')
  throw httpError(409, "This booking can't be charged.")
}

async function validatedServices(row: BookingRow, amountCents: number) {
  const services = await pricedServices(row)
  const amountError = validateAmount(amountCents, bookingTotalCents(services.map((s) => s.priceCents)))
  if (amountError) throw httpError(400, amountError)
  return services
}

export async function previewFee(requestId: string, amountCents: number): Promise<{ chargeCents: number; gstCents: number }> {
  const row = await loadRow(requestId)
  assertChargeable(row)
  const services = await validatedServices(row, amountCents)

  let calculated: SquareOrder | undefined
  try {
    const order = await buildOrder(row, services, amountCents, null)
    const data = await squareFetch('/v2/orders/calculate', { method: 'POST', body: JSON.stringify({ order }) })
    calculated = data.order as SquareOrder | undefined
  } catch (err) {
    throw squareError(err)
  }
  const chargeCents = checkOrderTotal(calculated, amountCents)
  return { chargeCents, gstCents: Number(calculated?.total_tax_money?.amount ?? 0) }
}

// ── Idempotency keys ─────────────────────────────────────────────────────────
//
// One key per charge attempt, stored in fee_payment_id while the row is 'charging'.
// A definite decline releases the claim (and the key), so the next attempt gets a fresh
// key and the booking can be retried. A stale reclaim reuses the stored key, so a payment
// that went through earlier is replayed by Square instead of charged again.
// Square caps CreatePayment idempotency keys at 45 characters: "fee-" + 32 hex + "-" + 8.

function attemptKey(requestId: string, claimedAt: string): string {
  let compact = requestId.replace(/-/g, '').toLowerCase()
  if (!/^[0-9a-z]{1,32}$/.test(compact)) compact = createHash('sha256').update(requestId).digest('hex').slice(0, 32)
  return `fee-${compact}-${Date.parse(claimedAt).toString(36)}`
}

function orderKeyFor(paymentKey: string): string {
  return `fee-order-${paymentKey.slice('fee-'.length)}`
}

interface Claim {
  claimedAt: string
  paymentKey: string
  /** true when the key came from an earlier attempt whose outcome we don't know */
  reusedKey: boolean
}

/** Claim the row for charging. Each UPDATE is atomic, so two concurrent requests can't both win. */
async function claim(requestId: string): Promise<Claim> {
  const claimedAt = new Date().toISOString()

  const freshKey = attemptKey(requestId, claimedAt)
  const fresh = await supabase
    .from('booking_requests')
    .update({ fee_status: 'charging', fee_claimed_at: claimedAt, fee_payment_id: freshKey })
    .eq('id', requestId)
    .is('fee_status', null)
    .select('id')
  if (fresh.error) throw httpError(500, fresh.error.message)
  if (fresh.data && fresh.data.length > 0) return { claimedAt, paymentKey: freshKey, reusedKey: false }

  // A 'charging' claim left behind by a crashed or unanswered request can be taken over
  // after 5 minutes (a missing fee_claimed_at counts as stale, as in isClaimStale).
  // fee_payment_id is left untouched, so RETURNING gives the old key.
  const staleBefore = new Date(Date.now() - CLAIM_STALE_MS).toISOString()
  const stale = await supabase
    .from('booking_requests')
    .update({ fee_status: 'charging', fee_claimed_at: claimedAt })
    .eq('id', requestId)
    .eq('fee_status', 'charging')
    .or(`fee_claimed_at.is.null,fee_claimed_at.lt.${staleBefore}`)
    .select('id, fee_payment_id')
  if (stale.error) throw httpError(500, stale.error.message)
  const reclaimed = stale.data?.[0] as { id: string; fee_payment_id: string | null } | undefined
  if (!reclaimed) {
    // Lost the race: read the row back so only a real charge is reported as "already charged".
    const current = await supabase.from('booking_requests').select('fee_status').eq('id', requestId).maybeSingle()
    if (current.error) throw httpError(500, current.error.message)
    const miss = reclaimMissError((current.data as { fee_status: string | null } | null)?.fee_status ?? null)
    const err = httpError(409, miss.message)
    throw miss.alreadyCharged ? Object.assign(err, { alreadyCharged: true }) : err
  }

  if (reclaimed.fee_payment_id) return { claimedAt, paymentKey: reclaimed.fee_payment_id, reusedKey: true }

  // Stale row with no key (should not happen): no payment can exist for it, so start fresh.
  const newKey = attemptKey(requestId, claimedAt)
  const keyed = await supabase
    .from('booking_requests')
    .update({ fee_payment_id: newKey })
    .eq('id', requestId)
    .eq('fee_status', 'charging')
    .eq('fee_claimed_at', claimedAt)
    .is('fee_payment_id', null)
    .select('id')
  if (keyed.error) throw httpError(500, keyed.error.message)
  if (!keyed.data || keyed.data.length === 0) throw httpError(409, 'A charge for this booking is already in progress.')
  return { claimedAt, paymentKey: newKey, reusedKey: false }
}

/** Undo our own claim only: never touches a charged row or a newer claim. */
async function releaseClaim(requestId: string, claimedAt: string) {
  const { error } = await supabase
    .from('booking_requests')
    .update({
      fee_status: null,
      fee_claimed_at: null,
      fee_reason: null,
      fee_amount_cents: null,
      fee_payment_id: null,
      fee_charged_at: null,
    })
    .eq('id', requestId)
    .eq('fee_status', 'charging')
    .eq('fee_claimed_at', claimedAt)
  if (error) console.error(`[fee] failed to release claim on ${requestId}:`, error.message)
}

async function recordCharge(requestId: string, reason: FeeReason, chargedCents: number, paymentId: string) {
  const update = {
    fee_status: 'charged',
    fee_reason: reason,
    fee_amount_cents: chargedCents,
    fee_payment_id: paymentId,
    fee_charged_at: new Date().toISOString(),
  }
  for (let attempt = 0; attempt < 2; attempt++) {
    const { error } = await supabase.from('booking_requests').update(update).eq('id', requestId)
    if (!error) return
    console.error(`[fee] payment ${paymentId} completed but recording it failed (attempt ${attempt + 1}):`, error.message)
  }
  // Row stays 'charging' with the attempt key still in fee_payment_id, and becomes
  // reclaimable after 5 minutes. The reclaim reuses that key, so Square replays this
  // payment instead of charging again.
}

// ── Square POST with a tri-state outcome ─────────────────────────────────────
//
// squareFetch throws on everything, which can't tell "Square said no" apart from
// "we don't know what happened". For calls that move (or prepare) money we need that
// difference: only a definite rejection may release the claim.

type SquarePostResult =
  | { kind: 'ok'; data: Record<string, unknown> }
  | { kind: 'rejected'; message: string }
  | { kind: 'unknown'; message: string; keyReused: boolean }

async function squarePost(path: string, body: unknown): Promise<SquarePostResult> {
  let res: Response
  try {
    res = await fetch(`${SQUARE_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Square-Version': '2024-01-18',
      },
      body: JSON.stringify(body),
      // A hung request lands on the 'unknown' path below (fetch rejects with a TimeoutError).
      signal: AbortSignal.timeout(25000),
    })
  } catch (err) {
    return { kind: 'unknown', message: err instanceof Error ? err.message : String(err), keyReused: false }
  }

  let data: Record<string, unknown>
  try {
    data = (await res.json()) as Record<string, unknown>
  } catch {
    return { kind: 'unknown', message: `Square returned an unreadable response (HTTP ${res.status}).`, keyReused: false }
  }
  if (res.ok) return { kind: 'ok', data }

  const errors = Array.isArray(data.errors) ? (data.errors as Array<{ code?: string; detail?: string }>) : []
  const message = errors[0]?.detail ?? `Square returned HTTP ${res.status}.`
  if (errors.some((e) => e.code === 'IDEMPOTENCY_KEY_REUSED')) return { kind: 'unknown', message, keyReused: true }
  const definite = res.status >= 400 && res.status < 500 && res.status !== 408 && res.status !== 429 && errors.length > 0
  return definite ? { kind: 'rejected', message } : { kind: 'unknown', message, keyReused: false }
}

const CHECK_SQUARE =
  'Check this client in Square before trying again. The booking is locked for 5 minutes so it cannot be charged twice.'

function outcomeUnknown(result: { message: string; keyReused: boolean }): FeeHttpError {
  const message = result.keyReused
    ? `A previous charge attempt for this booking may have gone through. ${CHECK_SQUARE}`
    : `We could not confirm whether the payment went through (${result.message}). ${CHECK_SQUARE}`
  return Object.assign(httpError(502, message), { keepClaim: true })
}

export async function chargeFee(
  requestId: string,
  reason: FeeReason,
  amountCents: number,
): Promise<{ chargedCents: number; paymentId: string; emailSent: boolean }> {
  // 1–2. Eligibility and amount, re-checked server-side.
  const row = await loadRow(requestId)
  assertChargeable(row)
  const services = await validatedServices(row, amountCents)
  const customerId = row.square_customer_id as string // isChargeable guarantees it

  // 3. Claim. From here on, a failure releases the claim only when we know no payment
  //    happened under this key: a fresh key that never reached the payment call, or a
  //    definite rejection from Square's payment endpoint.
  const { claimedAt, paymentKey, reusedKey } = await claim(requestId)

  let card: { id: string; brand: string; last4: string }
  let chargedCents: number
  let paymentId: string
  let paymentAttempted = false
  try {
    // 4. Card: must belong to this booking's customer and be enabled.
    let cards: SquareCard[]
    try {
      cards = await listCustomerCards(customerId)
    } catch (err) {
      throw squareError(err)
    }
    const picked = pickCard(cards, customerId, row.square_card_id)
    if ('error' in picked) throw httpError(400, picked.error)
    card = picked

    // 5. Order with GST, then the payment for exactly the order total.
    let order: Awaited<ReturnType<typeof buildOrder>>
    try {
      order = await buildOrder(row, services, amountCents, reason)
    } catch (err) {
      throw squareError(err)
    }
    const orderResult = await squarePost('/v2/orders', { idempotency_key: orderKeyFor(paymentKey), order })
    if (orderResult.kind === 'unknown' && orderResult.keyReused) throw outcomeUnknown(orderResult)
    if (orderResult.kind !== 'ok') throw httpError(502, orderResult.message)
    const created = orderResult.data.order as SquareOrder | undefined
    const orderTotal = checkOrderTotal(created, amountCents)
    if (!created?.id) throw httpError(502, 'Square did not return an order id.')

    paymentAttempted = true
    const paymentResult = await squarePost('/v2/payments', {
      idempotency_key: paymentKey,
      source_id: card.id,
      customer_id: customerId,
      order_id: created.id,
      location_id: order.location_id,
      amount_money: { amount: orderTotal, currency: created.total_money?.currency ?? CURRENCY },
      autocomplete: true,
      note: order.line_items[0].note,
    })
    if (paymentResult.kind === 'unknown') throw outcomeUnknown(paymentResult)
    if (paymentResult.kind === 'rejected') throw httpError(502, paymentResult.message)

    const payment = paymentResult.data.payment as SquarePayment | undefined
    if (payment?.status !== 'COMPLETED') {
      if (payment?.status === 'FAILED' || payment?.status === 'CANCELED') {
        throw httpError(502, 'The card was declined. Nothing was charged.')
      }
      // APPROVED/PENDING or no payment object: money may still move. Keep the claim.
      throw outcomeUnknown({ message: `payment status ${payment?.status ?? 'unknown'}`, keyReused: false })
    }
    chargedCents = payment.amount_money?.amount ?? orderTotal
    paymentId = String(payment.id)
  } catch (err) {
    const httpErr = toFeeHttpError(err)
    // Before the payment call, a fresh key is unused, so releasing is safe. A reused key may
    // belong to a payment that already went through, so it is kept for the next reclaim.
    const safeToRelease = !httpErr.keepClaim && (paymentAttempted || !reusedKey)
    if (safeToRelease) await releaseClaim(requestId, claimedAt)
    else if (!httpErr.keepClaim) {
      Object.assign(httpErr, {
        message: `${httpErr.message} A previous charge attempt for this booking may have gone through. ${CHECK_SQUARE}`,
        keepClaim: true,
      })
    }
    throw httpErr
  }

  // 6. Payment completed: record it, then tell the client. Email failure doesn't undo the charge.
  await recordCharge(requestId, reason, chargedCents, paymentId)

  let emailSent = false
  try {
    const totalCents = bookingTotalCents(services.map((s) => s.priceCents))
    const { subject, html } = renderFeeEmail({
      firstName: row.first_name,
      appointmentText: appointmentText(row.start_at, 'full'),
      services: services.map((s) => ({ serviceName: s.serviceName, tierLabel: s.tierLabel })),
      totalCents,
      reason,
      reasonLabel: FEE_REASONS[reason].label,
      pct: FEE_REASONS[reason].pct,
      amountCents: chargedCents,
      // "% of your booking" only when Micah kept the pre-filled amount.
      edited: totalCents === null || amountCents !== feeCents(totalCents, reason),
      cardBrand: card.brand,
      cardLast4: card.last4,
    })
    const { error } = await resend.emails.send({ from: FROM, to: row.email, subject, html })
    if (error) throw new Error(error.message ?? 'Resend rejected the email')
    emailSent = true
  } catch (err) {
    console.error(`[fee] charged ${requestId} but the client email failed:`, err)
  }

  return { chargedCents, paymentId, emailSent }
}
