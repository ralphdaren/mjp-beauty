export interface PriceTier {
  label: string
  price: string
  duration?: string
  squareVariationName?: string
}

export interface Slot {
  time: string
  startAt: string
  teamMemberId: string | null
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

export const DRAWER_STEPS = ['Service', 'Date & Options', 'Your Details', 'Confirm'] as const
export type DrawerStep = 1 | 2 | 3 | 4
