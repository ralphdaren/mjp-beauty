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

export type DepositPaymentMethod = 'e-transfer' | 'credit-card'

export const TRAINING_DRAWER_STEPS = ['Select Date', 'Deposit Payment', 'Your Details', 'Confirm'] as const
export type TrainingDrawerStep = 1 | 2 | 3 | 4
