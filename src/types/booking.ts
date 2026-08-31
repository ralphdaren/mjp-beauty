export interface PriceTier {
  label: string
  price: string
  duration?: string
  squareVariationId?: string
  priceCents?: number
  durationMs?: number
}

export interface Slot {
  time: string
  startAt: string
  teamMemberId: string | null
  teamMemberIds: (string | null)[]
}

export interface BookingItem {
  id: string
  service: Service
  tier: PriceTier
}

export interface Service {
  id: string
  name: string
  squareItemId?: string
  tagline: string
  description: string
  duration: string
  tiers: PriceTier[]
  images: string[]
  video: string | null
}

export const DRAWER_STEPS = ['Service', 'Summary', 'Time', 'Details', 'Confirm'] as const
export type DrawerStep = 1 | 2 | 3 | 4 | 5

export const MAX_SERVICES_PER_BOOKING = 5
