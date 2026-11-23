// Square-side holds for pending website booking requests.
//
// A website request used to live only in Supabase until Micah accepted it, so
// Square's own booking channels (Square booking page, Google, Instagram) kept
// selling that time. Now every pending request gets a real Square booking under
// a shared placeholder customer, which blocks the slot everywhere. Accepting
// creates the client's real booking and then cancels the hold (a booking's
// customer can't be changed); declining or cancelling just cancels the hold.
//
// The placeholder customer has no email or phone on purpose: Square can't be
// told to skip client notifications for API bookings, so there must be nowhere
// for them to go.

import { randomUUID } from 'crypto'
import { squareFetch, findVariation, type VariationRef } from './_square.js'
import { findConflicts } from './_hold-rules.js'

const HOLD_CUSTOMER_REFERENCE = 'mjp-website-hold'
// Longest single appointment we expect; bookings that started this long before
// the range can still run into it.
const LOOKBACK_MS = 8 * 60 * 60_000

let holdCustomerId: string | null = null

/** The shared "Website Request (pending)" customer, created on first use. */
export async function getHoldCustomerId(): Promise<string> {
  if (holdCustomerId) return holdCustomerId

  const found = await squareFetch('/v2/customers/search', {
    method: 'POST',
    body: JSON.stringify({ query: { filter: { reference_id: { exact: HOLD_CUSTOMER_REFERENCE } } }, limit: 1 }),
  })
  const existing = (found.customers as Array<{ id: string }> | undefined)?.[0]?.id
  if (existing) return (holdCustomerId = existing)

  const created = await squareFetch('/v2/customers', {
    method: 'POST',
    body: JSON.stringify({
      idempotency_key: randomUUID(),
      given_name: 'Website Request',
      family_name: '(pending)',
      reference_id: HOLD_CUSTOMER_REFERENCE,
      note: 'Placeholder used by mjpbeauty.com to hold times for pending booking requests. Do not add an email or phone number.',
    }),
  })
  return (holdCustomerId = created.customer.id as string)
}

export interface SegmentItem extends VariationRef {
  teamMemberId: string | null
}

/** Square appointment segments for a request's services, in order. */
export function bookingSegments(
  items: SegmentItem[],
  catalogItems: any[],
  fallbackTeamMemberId: string | null,
): Array<Record<string, unknown>> {
  return items.map((item) => {
    const match = findVariation(catalogItems, item)
    if (!match) throw new Error(`No Square variation found for: "${item.tierLabel}"`)
    const segment: Record<string, unknown> = {
      service_variation_id: match.id,
      service_variation_version: match.version,
    }
    const teamMemberId = item.teamMemberId ?? fallbackTeamMemberId
    if (teamMemberId) segment.team_member_id = teamMemberId
    return segment
  })
}

/** Creates the hold booking and returns its Square id. */
export async function createSquareHold(input: {
  locationId: string
  startAt: string
  segments: Array<Record<string, unknown>>
  sellerNote: string
  idempotencyKey: string
}): Promise<string> {
  const data = await squareFetch('/v2/bookings', {
    method: 'POST',
    body: JSON.stringify({
      idempotency_key: input.idempotencyKey,
      booking: {
        location_id: input.locationId,
        start_at: input.startAt,
        customer_id: await getHoldCustomerId(),
        seller_note: input.sellerNote,
        appointment_segments: input.segments,
      },
    }),
  })
  return data.booking.id as string
}

/** Cancels a Square booking. A booking that's already cancelled or gone counts as done. */
export async function cancelSquareBooking(bookingId: string): Promise<void> {
  let booking: any
  try {
    booking = (await squareFetch(`/v2/bookings/${encodeURIComponent(bookingId)}`)).booking
  } catch (err) {
    if ((err as { status?: number }).status === 404) return
    throw err
  }
  if (String(booking.status).startsWith('CANCELLED') || booking.status === 'DECLINED') return

  await squareFetch(`/v2/bookings/${encodeURIComponent(bookingId)}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ idempotency_key: `cancel-${bookingId}-${booking.version}`, booking_version: booking.version }),
  })
}

/** Cancels the hold without failing the caller; returns whether it worked. */
export async function releaseSquareHold(bookingId: string | null | undefined): Promise<boolean> {
  if (!bookingId) return true
  try {
    await cancelSquareBooking(bookingId)
    return true
  } catch (err) {
    console.error(`Could not cancel Square hold ${bookingId}:`, err)
    return false
  }
}

/** Live Square bookings for these team members that overlap [startMs, endMs). */
export async function findSquareConflicts(input: {
  locationId: string
  teamMemberIds: string[]
  startMs: number
  endMs: number
  excludeIds?: string[]
}): Promise<any[]> {
  const teamMembers = [...new Set(input.teamMemberIds.filter(Boolean))]
  const bookings: any[] = []

  for (const teamMemberId of teamMembers.length ? teamMembers : [null]) {
    let cursor: string | undefined
    do {
      const q = new URLSearchParams({
        location_id: input.locationId,
        start_at_min: new Date(input.startMs - LOOKBACK_MS).toISOString(),
        start_at_max: new Date(input.endMs).toISOString(),
        limit: '100',
      })
      if (teamMemberId) q.set('team_member_id', teamMemberId)
      if (cursor) q.set('cursor', cursor)
      const data = await squareFetch(`/v2/bookings?${q}`)
      bookings.push(...((data.bookings as any[]) ?? []))
      cursor = data.cursor
    } while (cursor)
  }

  const unique = [...new Map(bookings.map((b) => [b.id, b])).values()]
  return findConflicts(unique, input.startMs, input.endMs, input.excludeIds)
}
