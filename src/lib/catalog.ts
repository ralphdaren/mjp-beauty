import type { Service, PriceTier } from '../types/booking'
import { formatMoney } from './pricing'

/** Shape returned by /api/services — mirrors CatalogVariation in api/_square.ts. */
export interface CatalogVariation {
  name: string
  priceCents: number | null
  durationMs: number | null
  bookable: boolean
}

/** 4_500_000 → "1 hr 15 min". Matches the strings booking.ts used to hardcode. */
export function formatDuration(ms: number): string {
  const totalMinutes = Math.round(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours && minutes) return `${hours} hr ${minutes} min`
  if (hours) return `${hours} hr`
  return `${minutes} min`
}

/** The name Square knows a tier by — the same lookup key the booking API uses. */
export function squareNameFor(tier: PriceTier): string {
  return tier.squareVariationName ?? tier.label
}

// Rebuilds SERVICES with live prices and durations from Square. A tier Square no
// longer offers — deleted, archived, or unchecked for online booking — is dropped,
// and a service left with no bookable tiers drops out with it. Everything visual
// (tagline, description, photos, video, order) always comes from booking.ts.
export function mergeCatalog(services: Service[], variations: CatalogVariation[]): Service[] {
  const byName = new Map<string, CatalogVariation>()
  for (const variation of variations) {
    byName.set(variation.name.toLowerCase().trim(), variation)
  }

  const merged: Service[] = []
  for (const service of services) {
    const tiers = service.tiers.flatMap<PriceTier>((tier) => {
      const match = byName.get(squareNameFor(tier).toLowerCase().trim())
      if (!match || !match.bookable) return []
      return [{
        ...tier,
        price: match.priceCents != null ? formatMoney('$', match.priceCents / 100) : tier.price,
        duration: match.durationMs != null ? formatDuration(match.durationMs) : tier.duration,
      }]
    })
    if (tiers.length > 0) merged.push({ ...service, tiers })
  }
  return merged
}
