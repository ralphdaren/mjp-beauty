// Pure rules for Square-side holds on pending website requests. No I/O here so
// it can be unit tested; the Square calls live in _square-hold.ts.

/** Square booking statuses that no longer occupy the calendar. */
const FREED_STATUSES = new Set(['CANCELLED_BY_SELLER', 'CANCELLED_BY_CUSTOMER', 'DECLINED', 'NO_SHOW'])

interface SquareBookingLike {
  id: string
  status?: string
  start_at: string
  appointment_segments?: Array<{ duration_minutes?: number }>
}

/** Bookings that still occupy time and overlap [startMs, endMs), minus excludeIds. */
export function findConflicts<T extends SquareBookingLike>(
  bookings: T[],
  startMs: number,
  endMs: number,
  excludeIds: string[] = [],
): T[] {
  return bookings.filter((b) => {
    if (excludeIds.includes(b.id)) return false
    if (b.status && FREED_STATUSES.has(b.status)) return false
    const start = new Date(b.start_at).getTime()
    const minutes = (b.appointment_segments ?? []).reduce((sum, s) => sum + (Number(s.duration_minutes) || 0), 0)
    const end = start + Math.max(minutes, 1) * 60_000
    return start < endMs && startMs < end
  })
}

export interface HoldNoteInput {
  firstName: string
  lastName: string
  email: string
  phone: string | null
  services: string[]
}

/** The private note Micah sees on the hold in her Square app. */
export function holdSellerNote(input: HoldNoteInput): string {
  const name = [input.firstName.trim(), input.lastName.trim()].filter(Boolean).join(' ')
  const contact = [input.email, input.phone].filter(Boolean).join(', ')
  return [
    `Pending website request from ${name} (${contact}).`,
    `Services: ${input.services.join('; ')}.`,
    'This time is held until you accept or decline the request in the MJP admin dashboard.',
  ].join('\n')
}
