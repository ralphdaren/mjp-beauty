/** Contract between the dashboard shell (sidebar + header) and the panels it hosts. */

export type AdminCategory = 'services' | 'training' | 'mentorship' | 'mfm'
export type TrainingView = 'bookings' | 'dates'

export const CATEGORY_LABEL: Record<AdminCategory, string> = {
  services: 'Brow Services',
  training: 'In-Person Training',
  mentorship: 'Biz Mentorship',
  mfm: 'Made For More',
}

export interface PanelRefresh {
  run: () => void
  loading: boolean
}

export type Refetch = (opts?: { silent?: boolean }) => Promise<void>
