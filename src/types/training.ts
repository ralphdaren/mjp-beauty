export interface TrainingOption {
  id: 'group' | 'private'
  title: string
  price: string
  handle: string
}

export type DepositPaymentMethod = 'e-transfer' | 'credit-card'

export const TRAINING_DRAWER_STEPS = ['Select Date', 'Deposit Payment', 'Your Details', 'Confirm'] as const
export type TrainingDrawerStep = 1 | 2 | 3 | 4
