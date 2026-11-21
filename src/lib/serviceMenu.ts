import type { PriceTier, Service } from '../types/booking.ts'
import { formatMoney, parsePrice, tierAmount } from './pricing.ts'

/** What the client picked on the services menu, stored by stable keys so it survives Square data replacing the list. */
export type Selection = { serviceId: string; tierKey: string }

export function tierKey(tier: PriceTier): string {
  return tier.squareVariationId ?? tier.label
}

/** Lowest variation price, formatted like "$47.62"; null when the service has no variations. */
export function fromPrice(service: Service): string | null {
  if (service.tiers.length === 0) return null
  const cheapest = service.tiers.reduce((min, t) => (tierAmount(t) < tierAmount(min) ? t : min))
  return formatMoney(parsePrice(cheapest.price).prefix, tierAmount(cheapest))
}

/** Service to open first: the one named by the URL hash, else the first service. */
export function initialOpenId(services: Service[], hash: string): string | null {
  const wanted = hash.replace(/^#/, '')
  const match = services.find((s) => s.id === wanted)
  return match?.id ?? services[0]?.id ?? null
}

export function resolveSelection(
  services: Service[],
  sel: Selection | null,
): { service: Service; tier: PriceTier } | null {
  if (!sel) return null
  const service = services.find((s) => s.id === sel.serviceId)
  const tier = service?.tiers.find((t) => tierKey(t) === sel.tierKey)
  return service && tier ? { service, tier } : null
}

export function summaryLine(service: Service, tier: PriceTier): string {
  return `${service.name}: ${tier.label}`
}
