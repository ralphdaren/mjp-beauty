export interface PriceTier {
  label: string
  price: string
  duration?: string
  squareVariationName?: string
  // Raw numbers from Square, set by mergeCatalog. `price`/`duration` stay the
  // display strings; these are what the basket totals add up.
  priceCents?: number
  durationMs?: number
}

export interface Slot {
  time: string
  startAt: string
  teamMemberId: string | null
  // One team member per booked service, in basket order — a multi-service
  // appointment is one Square booking with one segment per service.
  teamMemberIds: (string | null)[]
}

/** One service+option pair in the appointment being built. */
export interface BookingItem {
  id: string
  service: Service
  tier: PriceTier
}

export interface Service {
  id: string
  name: string
  tagline: string
  description: string
  duration: string
  tiers: PriceTier[]
  images: string[]
  video: string | null
}

export const DRAWER_STEPS = ['Service', 'Summary', 'Time', 'Details', 'Confirm'] as const
export type DrawerStep = 1 | 2 | 3 | 4 | 5

/** Keeps one appointment to a length Square can actually schedule in a day. */
export const MAX_SERVICES_PER_BOOKING = 5
