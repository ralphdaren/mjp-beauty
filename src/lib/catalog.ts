import type { BookingItem, Service, PriceTier } from '../types/booking'
import { formatMoney } from './pricing'

export interface CatalogVariation {
  id: string
  name: string
  priceCents: number | null
  durationMs: number | null
  bookable: boolean
}

export interface CatalogItem {
  id: string
  name: string
  variations: CatalogVariation[]
}

export function formatDuration(ms: number): string {
  const totalMinutes = Math.round(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours && minutes) return `${hours} hr ${minutes} min`
  if (hours) return `${hours} hr`
  return `${minutes} min`
}

export function parseDurationLabel(label?: string): number {
  if (!label) return 0
  const hours = /(\d+)\s*hr/.exec(label)
  const minutes = /(\d+)\s*min/.exec(label)
  return (hours ? Number(hours[1]) * 60 : 0) + (minutes ? Number(minutes[1]) : 0)
}

export function tierMinutes(tier: PriceTier): number {
  return tier.durationMs != null
    ? Math.round(tier.durationMs / 60000)
    : parseDurationLabel(tier.duration)
}

export function basketMinutes(items: BookingItem[]): number {
  return items.reduce((total, item) => total + tierMinutes(item.tier), 0)
}

function toTier(tier: PriceTier, match: CatalogVariation): PriceTier {
  return {
    ...tier,
    squareVariationId: match.id,
    label: match.name,
    price: match.priceCents != null ? formatMoney('$', match.priceCents / 100) : tier.price,
    duration: match.durationMs != null ? formatDuration(match.durationMs) : tier.duration,
    ...(match.priceCents != null ? { priceCents: match.priceCents } : {}),
    ...(match.durationMs != null ? { durationMs: match.durationMs } : {}),
  }
}

export function mergeCatalog(services: Service[], items: CatalogItem[]): Service[] {
  const itemById = new Map(items.map((item) => [item.id, item]))
  const variationById = new Map<string, CatalogVariation>()
  for (const item of items) {
    for (const variation of item.variations) variationById.set(variation.id, variation)
  }

  const merged: Service[] = []
  for (const service of services) {
    const item = service.squareItemId ? itemById.get(service.squareItemId) : undefined
    const claimed = new Set<string>()
    const tiers = service.tiers.flatMap<PriceTier>((tier) => {
      const match = tier.squareVariationId
        ? variationById.get(tier.squareVariationId)
        : item?.variations.find(
            (v) => v.name.toLowerCase().trim() === tier.label.toLowerCase().trim(),
          )
      if (!match || !match.bookable) return []
      claimed.add(match.id)
      return [toTier(tier, match)]
    })
    for (const variation of item?.variations ?? []) {
      if (!variation.bookable || claimed.has(variation.id)) continue
      if (variation.priceCents == null || variation.durationMs == null) continue
      tiers.push(toTier({ label: variation.name, price: '' }, variation))
    }

    if (tiers.length === 0) continue
    merged.push({ ...service, name: item?.name || service.name, tiers })
  }
  return merged
}
