export type FeeReason = 'late' | 'same_day' | 'no_show' | 'late_arrival'

export const FEE_REASONS: Record<FeeReason, { label: string; detail: string; pct: number }> = {
  late: { label: 'Late cancellation', detail: "Less than 48 hours' notice", pct: 50 },
  same_day: { label: 'Same-day cancellation', detail: 'Cancelled within 24 hours', pct: 100 },
  no_show: { label: 'No-show', detail: "Didn't come to the appointment", pct: 100 },
  late_arrival: { label: 'Late arrival', detail: 'More than 10 minutes late', pct: 50 },
}

export function isFeeReason(v: unknown): v is FeeReason {
  return typeof v === 'string' && Object.prototype.hasOwnProperty.call(FEE_REASONS, v)
}

export const GST_RATE = 0.05

const CLAIM_STALE_MS = 5 * 60 * 1000
const MAX_AMOUNT_CENTS = 1_000_000

export function bookingTotalCents(priceCents: Array<number | null>): number | null {
  if (priceCents.length === 0) return null
  let sum = 0
  for (const p of priceCents) {
    if (p === null) return null
    sum += p
  }
  return Math.round(sum * (1 + GST_RATE))
}

export function feeCents(totalCents: number, reason: FeeReason): number {
  return Math.round((totalCents * FEE_REASONS[reason].pct) / 100)
}

export function inclusiveBaseCents(amountCents: number): number {
  return Math.round(amountCents / (1 + GST_RATE))
}

export function gstPortionCents(amountCents: number): number {
  return amountCents - inclusiveBaseCents(amountCents)
}

export interface FeeRow {
  status: string
  start_at: string
  square_booking_id: string | null
  square_customer_id: string | null
  fee_status: string | null
  fee_claimed_at: string | null
}

export function isClaimStale(row: Pick<FeeRow, 'fee_status' | 'fee_claimed_at'>, nowMs: number): boolean {
  if (row.fee_status !== 'charging') return false
  const claimed = row.fee_claimed_at ? Date.parse(row.fee_claimed_at) : NaN
  if (Number.isNaN(claimed)) return true
  return nowMs - claimed > CLAIM_STALE_MS
}

/**
 * The stale-reclaim UPDATE matched no row: another request holds a fresh claim, or the row
 * was charged meanwhile. Only a row that reads back as 'charged' is reported as already charged.
 */
export function reclaimMissError(feeStatus: string | null): { message: string; alreadyCharged: boolean } {
  if (feeStatus === 'charged') return { message: 'Already charged', alreadyCharged: true }
  return { message: 'A charge for this booking is already in progress. Wait a moment and refresh.', alreadyCharged: false }
}

export function isChargeable(row: FeeRow, nowMs: number): boolean {
  if (!row.square_booking_id || !row.square_customer_id) return false
  if (row.fee_status !== null && !isClaimStale(row, nowMs)) return false
  if (row.status === 'cancelled') return true
  return row.status === 'accepted' && Date.parse(row.start_at) < nowMs
}

export function validateAmount(amountCents: unknown, totalCents: number | null): string | null {
  if (typeof amountCents !== 'number' || !Number.isInteger(amountCents) || amountCents <= 0) {
    return 'Amount must be a positive whole number of cents.'
  }
  if (totalCents !== null) {
    if (amountCents > totalCents) return 'Amount cannot exceed the booking total.'
  } else if (amountCents > MAX_AMOUNT_CENTS) {
    return 'Amount is too large.'
  }
  return null
}

export function pickCard(
  cards: Array<{ id: string; customer_id: string; enabled: boolean; created_at: string; card_brand: string; last_4: string }>,
  customerId: string,
  preferredId: string | null,
): { id: string; brand: string; last4: string } | { error: string } {
  const usable = cards.filter((c) => c.customer_id === customerId && c.enabled)
  const chosen =
    (preferredId ? usable.find((c) => c.id === preferredId) : undefined) ??
    [...usable].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))[0]
  if (!chosen) return { error: 'No card on file for this client.' }
  return { id: chosen.id, brand: chosen.card_brand, last4: chosen.last_4 }
}
