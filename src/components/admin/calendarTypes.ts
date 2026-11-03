/** Response shapes of the admin calendar resources (mirrors api/_calendar.ts + api/_calendar-square.ts). */

export type ServiceColorKey = 'lamination' | 'wax' | 'tint' | 'lash' | 'henna' | 'student' | 'other'
export type BookingSourceKey = 'website' | 'square' | 'square-booking-page' | 'google-instagram' | 'other'
export type HistoryStatus = 'Completed' | 'Upcoming' | 'Cancelled' | 'Declined' | 'No-show'
export type CalendarView = 'day' | 'week' | 'month'

export interface CalendarBlock {
  id: string
  startAt: string
  dateKey: string
  startMinute: number
  durationMinutes: number
  status: string
  source: BookingSourceKey
  customerId: string | null
  customerName: string | null
  services: Array<{ serviceName: string; colorKey: ServiceColorKey }>
}

export interface Customer {
  id: string
  name: string
  phone: string | null
  email: string | null
  note: string | null
}

export interface AppointmentService {
  itemId: string | null
  serviceName: string
  variationName: string
  durationMinutes: number
  priceCents: number | null
  taxIds: string[]
  colorKey: ServiceColorKey
  taxPercents: number[]
}

export interface AppointmentDetail {
  id: string
  startAt: string
  endAt: string
  dateKey: string
  startMinute: number
  durationMinutes: number
  status: string
  source: BookingSourceKey
  bookedAt: string
  teamMemberName: string | null
  customer: Customer | null
  customerNote: string | null
  services: AppointmentService[]
  totals: { subtotalCents: number; taxCents: number; totalCents: number }
}

export interface HistoryEntry {
  id: string
  startAt: string
  dateKey: string
  serviceNames: string[]
  status: HistoryStatus
}

export interface HistoryChunk {
  entries: HistoryEntry[]
  nextBefore: string | null
  failedWindows: number
}
