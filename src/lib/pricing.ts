import type { BookingItem, PriceTier } from '../types/booking'

// Manitoba exempts esthetic/personal-care services from RST — only GST applies.
export const TAX_RATE = 0.05

export function parsePrice(price: string): { prefix: string; amount: number } {
  const match = price.match(/^([^\d]*)([\d,.]+)/)
  const prefix = match?.[1]?.trim() || '$'
  const amount = match ? parseFloat(match[2].replace(/,/g, '')) : 0
  return { prefix, amount }
}

export function formatMoney(prefix: string, amount: number): string {
  return `${prefix}${amount.toFixed(2)}`
}

/** Square's cents when the catalog has loaded, the display string otherwise. */
export function tierAmount(tier: PriceTier): number {
  return tier.priceCents != null ? tier.priceCents / 100 : parsePrice(tier.price).amount
}

/** Subtotal, tax and total for every service in the appointment. */
export function basketTotals(items: BookingItem[]): {
  prefix: string
  subtotal: number
  tax: number
  total: number
} {
  const prefix = items.length ? parsePrice(items[0].tier.price).prefix : '$'
  const subtotal = items.reduce((sum, item) => sum + tierAmount(item.tier), 0)
  const tax = subtotal * TAX_RATE
  return { prefix, subtotal, tax, total: subtotal + tax }
}
