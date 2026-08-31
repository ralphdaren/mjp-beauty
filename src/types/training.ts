import type { TrainingDate } from '../lib/training'

export interface TrainingOption {
  id: 'group' | 'private'
  title: string
  price: string
}

export interface TrainingDateGroup {
  id: 'group' | 'private'
  title: string
  dates: TrainingDate[]
}

export interface TrainingOptionCard extends TrainingOption {
  img: string
  alt: string
  label: string
  shadowClass: string
  description: string
}

export interface TrainingFormatItem {
  img: string
  alt: string
  step: string
  title: string
  paragraphs: string[]
}

export type PerkKey = 'cert' | 'discounts' | 'ebook' | 'masterclass'

export interface FlipPerk {
  number: string
  title: string
  teaser?: string
  backTitle: string
  body: string
}

export type DepositPaymentMethod = 'e-transfer' | 'credit-card'

export const TRAINING_DRAWER_STEPS = ['Select Date', 'Deposit Payment', 'Your Details', 'Confirm'] as const
export type TrainingDrawerStep = 1 | 2 | 3 | 4
