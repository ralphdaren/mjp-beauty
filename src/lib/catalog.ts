import type { BookingItem, Service, PriceTier } from '../types/booking'
import { formatMoney } from './pricing'

/** Shape returned by /api/services — mirrors CatalogVariation in api/_square.ts. */
export interface CatalogVariation {
  id: string
  name: string
  priceCents: number | null
  durationMs: number | null
  bookable: boolean
}

/** One Square service with its options — mirrors CatalogItem in api/_square.ts. */
export interface CatalogItem {
  id: string
  name: string
  variations: CatalogVariation[]
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

/** "1 hr 15 min" → 75. Inverse of formatDuration, for the booking.ts fallbacks. */
export function parseDurationLabel(label?: string): number {
  if (!label) return 0
  const hours = /(\d+)\s*hr/.exec(label)
  const minutes = /(\d+)\s*min/.exec(label)
  return (hours ? Number(hours[1]) * 60 : 0) + (minutes ? Number(minutes[1]) : 0)
}

/** Square's duration once the catalog has loaded, the display string otherwise. */
export function tierMinutes(tier: PriceTier): number {
  return tier.durationMs != null
    ? Math.round(tier.durationMs / 60000)
    : parseDurationLabel(tier.duration)
}

/** How long the whole appointment runs — services are booked back to back. */
export function basketMinutes(items: BookingItem[]): number {
  return items.reduce((total, item) => total + tierMinutes(item.tier), 0)
}

// Rebuilds SERVICES from the live catalog. Names, prices and durations are all
// Square's — joined on the catalog ids in booking.ts, so renaming a service or
// an option in the Square dashboard changes the site without a deploy. A tier
// Square no longer offers — deleted, archived, or unchecked for online booking
// — is dropped, and a service left with no bookable tiers drops out with it.
// Copy, photos, video and display order stay local; Square has no field for them.
export function mergeCatalog(services: Service[], items: CatalogItem[]): Service[] {
  const itemById = new Map(items.map((item) => [item.id, item]))
  const variationById = new Map<string, CatalogVariation>()
  const variationByName = new Map<string, CatalogVariation>()
  for (const item of items) {
    for (const variation of item.variations) {
      variationById.set(variation.id, variation)
      variationByName.set(variation.name.toLowerCase().trim(), variation)
    }
  }

  const merged: Service[] = []
  for (const service of services) {
    const tiers = service.tiers.flatMap<PriceTier>((tier) => {
      // Name lookup only covers a tier that has no id yet; ids are what survive
      // a rename, and two items can share an option name.
      const match = (tier.squareVariationId && variationById.get(tier.squareVariationId))
        || variationByName.get(tier.label.toLowerCase().trim())
      if (!match || !match.bookable) return []
      return [{
        ...tier,
        label: match.name,
        price: match.priceCents != null ? formatMoney('$', match.priceCents / 100) : tier.price,
        duration: match.durationMs != null ? formatDuration(match.durationMs) : tier.duration,
        ...(match.priceCents != null ? { priceCents: match.priceCents } : {}),
        ...(match.durationMs != null ? { durationMs: match.durationMs } : {}),
      }]
    })
    if (tiers.length === 0) continue
    const item = service.squareItemId ? itemById.get(service.squareItemId) : undefined
    merged.push({ ...service, name: item?.name || service.name, tiers })
  }
  return merged
}
