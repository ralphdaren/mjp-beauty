// Client-side data access for in-person training dates + bookings.
// Backed by Supabase via /api/training (replaces the old Shopify metaobjects).

const CLIENT_TIMEZONE = 'America/Winnipeg'

export type TrainingDate = {
  id: string
  option: 'group' | 'private'
  startsAt: string // raw ISO datetime
  date: string // YYYY-MM-DD in the studio's timezone (for the existing date formatters)
  location: string
  spotsTotal: number
  spotsRemaining: number
}

type TrainingDateApi = {
  id: string
  option: 'group' | 'private'
  startsAt: string
  location: string
  spotsTotal: number
  spotsRemaining: number
}

function toTrainingDate(d: TrainingDateApi): TrainingDate {
  return {
    id: d.id,
    option: d.option,
    startsAt: d.startsAt,
    date: new Date(d.startsAt).toLocaleDateString('en-CA', { timeZone: CLIENT_TIMEZONE }),
    location: d.location,
    spotsTotal: d.spotsTotal,
    spotsRemaining: d.spotsRemaining,
  }
}

export async function getTrainingDates(option?: 'group' | 'private'): Promise<TrainingDate[]> {
  try {
    const qs = option ? `?option=${option}` : ''
    const res = await fetch(`/api/training${qs}`)
    if (!res.ok) return []
    const data = await res.json()
    return (data.dates as TrainingDateApi[] ?? []).map(toTrainingDate)
  } catch {
    return []
  }
}

export interface CreateTrainingHoldPayload {
  dateId: string
  paymentMethod: 'e-transfer' | 'credit-card'
  firstName: string
  lastName?: string
  email: string
  phone?: string
  honeypot?: string
}

export interface CreateTrainingHoldResult {
  ok: boolean
  bookingId?: string
  error?: string
}

export async function createTrainingHold(payload: CreateTrainingHoldPayload): Promise<CreateTrainingHoldResult> {
  try {
    const res = await fetch('/api/training', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return { ok: false, error: data.error ?? 'Something went wrong. Please try again.' }
    return { ok: true, bookingId: data.bookingId }
  } catch {
    return { ok: false, error: 'Could not connect. Please try again.' }
  }
}
