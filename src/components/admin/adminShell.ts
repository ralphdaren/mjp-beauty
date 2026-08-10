/** Contract between the dashboard shell (sidebar + header) and the panels it hosts. */

export type AdminCategory = 'services' | 'training' | 'mentorship'
export type TrainingView = 'bookings' | 'dates'

export const CATEGORY_LABEL: Record<AdminCategory, string> = {
  services: 'Brow Services',
  training: 'In-Person Training',
  mentorship: 'Biz Mentorship',
}

/**
 * Refresh lives in the header, but the fetchers live in the panels — so a panel
 * hands its fetcher and loading flag up, and clears them when it unmounts.
 */
export interface PanelRefresh {
  run: () => void
  loading: boolean
}

export type OnPanelRefreshChange = (state: PanelRefresh | null) => void
