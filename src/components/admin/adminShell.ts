/** Contract between the dashboard shell (sidebar + header) and the panels it hosts. */

export type AdminCategory = 'services' | 'training' | 'mentorship'
export type TrainingView = 'bookings' | 'dates'

export const CATEGORY_LABEL: Record<AdminCategory, string> = {
  services: 'Brow Services',
  training: 'In-Person Training',
  mentorship: 'Biz Mentorship',
}

/**
 * AdminPage owns every dataset and hands panels their rows, so the header's
 * refresh button reloads all of them in one request rather than tracking
 * whichever panel happens to be on screen.
 */
export interface PanelRefresh {
  run: () => void
  loading: boolean
}

/** Refetch a panel's rows. `silent` skips the skeleton — for post-action reloads. */
export type Refetch = (opts?: { silent?: boolean }) => Promise<void>
