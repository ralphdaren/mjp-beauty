// Ticket constants shared by the Made For More API routes.
//
// These mirror values in src/data/madeForMore.ts. The api/ functions are built
// separately from the Vite app and can't resolve the @/ alias, so the
// duplication is deliberate — if one side changes, change the other.
export const MFM_TICKETS_PRODUCT_ID = '8732835938476'
export const EARLY_BIRD_ENDS_AT = '2026-09-04T17:00:00Z'

export type MfmTier = 'General Admission' | 'VIP'

/** Payment plans are always split into this many Square invoices. */
export const MFM_PLAN_PAYMENTS = 2

/**
 * What each Square invoice charges, per seat. Micah quotes these rounded
 * figures rather than Shopify's price + GST, so a plan lands slightly over for
 * GA ($260 vs $259.35) and slightly under for VIP ($415 vs $416.85). That
 * spread is intentional — don't "correct" it to match the storefront.
 */
export const MFM_PLAN_INSTALLMENT: Record<MfmTier, number> = {
  'General Admission': 130.0,
  VIP: 207.5,
}

/**
 * The whole plan, in dollars. This is what gets stored in total_cents and
 * counted toward gross — the buyer is shown one invoice instead.
 */
export function mfmPlanTotal(tier: MfmTier, quantity: number) {
  return Math.round(MFM_PLAN_INSTALLMENT[tier] * MFM_PLAN_PAYMENTS * quantity * 100) / 100
}

/**
 * What one invoice charges, in cents. Derived from the stored total rather
 * than the tier, so a custom total Micah types still splits evenly.
 */
export function mfmInstallmentCents(totalCents: number) {
  return Math.round(totalCents / MFM_PLAN_PAYMENTS)
}

/** Shown under the amount on tickets Micah invoices through Square. */
export const MFM_PAYMENT_NOTE = `${MFM_PLAN_PAYMENTS} payments — invoiced via Square`

export const MFM_MANUAL_PREFIX = '#MFM-SQ-'

/**
 * Identity key stored in mfm_tickets.shopify_order_id for a manually issued
 * ticket. The `square:` prefix can never collide with a numeric Shopify order
 * id, so the table's unique index is what prevents a double-send.
 */
export const mfmManualKey = (email: string) => `square:${email.toLowerCase()}`

export const isManualTicket = (shopifyOrderId: unknown) =>
  String(shopifyOrderId ?? '').startsWith('square:')

/** Normalises "GA", "gen ad", "VIP" etc. to a tier name, or null. */
export function resolveMfmTier(raw: unknown): MfmTier | null {
  const v = String(raw ?? '').trim().toLowerCase()
  if (v === 'vip') return 'VIP'
  if (v === 'ga' || v === 'gen ad' || v === 'general' || v === 'general admission') {
    return 'General Admission'
  }
  return null
}
