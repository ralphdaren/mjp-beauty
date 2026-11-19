import { hasBlackFridayStarted, isBlackFridayRunning } from '../data/promos.ts'

// Whole-number percent off when Shopify has a compare-at price above the selling price, else null.
export function percentOff(price: string, compareAtPrice: string | null): number | null {
  if (!compareAtPrice) return null
  const now = parseFloat(price)
  const was = parseFloat(compareAtPrice)
  if (!(now > 0) || !(was > now)) return null
  const percent = Math.round((1 - now / was) * 100)
  return percent >= 1 ? percent : null
}

export function saleTagLabel(percent: number, now = new Date()): string {
  const label = `${percent}% off`
  return hasBlackFridayStarted(now) && isBlackFridayRunning(now) ? `Black Friday · ${label}` : label
}
