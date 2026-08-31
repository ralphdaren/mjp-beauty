// Slot holds for booking requests Square doesn't know about yet.
//
// A request still awaiting admin review holds its time even though no Square
// booking exists, otherwise a second customer could book over it. Since an
// appointment can now run several services back to back, a hold is a range —
// not a single start time — and anything overlapping that range is taken.

import { supabase } from './_supabase.js'
import { findVariation, variationMinutes } from './_square.js'

export interface Block {
  start: number
  end: number
}

const LOOKBACK_MINUTES = 8 * 60

interface HoldRow {
  start_at: string
  duration_minutes: number | null
  tier_label: string | null
  items: Array<{ tierLabel?: string; variationId?: string | null }> | null
}
function rowMinutes(row: HoldRow, catalogItems: any[]): number {
  if (row.duration_minutes != null) return row.duration_minutes

  const refs = Array.isArray(row.items) && row.items.length
    ? row.items.flatMap((item) =>
        item.tierLabel ? [{ tierLabel: item.tierLabel, variationId: item.variationId ?? null }] : [])
    : row.tier_label
      ? [{ tierLabel: row.tier_label, variationId: null }]
      : []

  return refs.reduce((total, ref) => {
    const match = findVariation(catalogItems, ref)
    return total + (match ? variationMinutes(match) : 0)
  }, 0)
}

export async function getHeldBlocks(
  fromIso: string,
  toIso: string,
  catalogItems: any[],
  statuses: string[] = ['pending'],
): Promise<Block[]> {
  const lookbackFrom = new Date(new Date(fromIso).getTime() - LOOKBACK_MINUTES * 60_000).toISOString()

  const { data } = await supabase
    .from('booking_requests')
    .select('start_at, duration_minutes, tier_label, items')
    .in('status', statuses)
    .gte('start_at', lookbackFrom)
    .lte('start_at', toIso)

  return ((data ?? []) as HoldRow[]).map((row) => {
    const start = new Date(row.start_at).getTime()
    // Floor of one minute so a zero-duration row still blocks its exact start.
    return { start, end: start + Math.max(rowMinutes(row, catalogItems), 1) * 60_000 }
  })
}

/** True when [start, end) runs into any held range. */
export function overlapsBlock(start: number, end: number, blocks: Block[]): boolean {
  return blocks.some((block) => start < block.end && block.start < end)
}
