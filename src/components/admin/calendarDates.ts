// Date-key math for the Brow Services calendar. Date keys are 'YYYY-MM-DD' in the
// client's time zone; arithmetic goes through Date.UTC so the viewer's own zone never leaks in.
import type { CalendarBlock, CalendarView } from './calendarTypes'

function parseKey(key: string): number {
  const [y, m, d] = key.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

function toKey(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}

export function addDays(dateKey: string, n: number): string {
  return toKey(parseKey(dateKey) + n * 86400000)
}

/** The Sunday on or before `dateKey`. */
export function weekStart(dateKey: string): string {
  return addDays(dateKey, -new Date(parseKey(dateKey)).getUTCDay())
}

function monthStart(dateKey: string): string {
  return `${dateKey.slice(0, 7)}-01`
}

/** Visible range for a view, `to` exclusive. Month is the full 6-week grid. */
export function rangeFor(view: CalendarView, anchor: string): { from: string; to: string } {
  if (view === 'day') return { from: anchor, to: addDays(anchor, 1) }
  if (view === 'week') {
    const from = weekStart(anchor)
    return { from, to: addDays(from, 7) }
  }
  const from = weekStart(monthStart(anchor))
  return { from, to: addDays(from, 42) }
}

export function shiftAnchor(view: CalendarView, anchor: string, dir: -1 | 1): string {
  if (view === 'day') return addDays(anchor, dir)
  if (view === 'week') return addDays(anchor, 7 * dir)
  const d = new Date(parseKey(monthStart(anchor)))
  d.setUTCMonth(d.getUTCMonth() + dir)
  return toKey(d.getTime())
}

/** Formats a date key for display without letting the viewer's time zone shift the day. */
export function dayLabel(dateKey: string, opts: Intl.DateTimeFormatOptions): string {
  return new Date(`${dateKey}T12:00:00Z`).toLocaleDateString('en-CA', { timeZone: 'UTC', ...opts })
}

export function weekDays(from: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(from, i))
}

export function todayKey(tz: string, nowMs: number): string {
  // en-CA formats dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(
    new Date(nowMs),
  )
}

type Timed = Pick<CalendarBlock, 'startMinute' | 'durationMinutes'>

/** Hour rail for the week/day grid: always covers 9am–7pm, widened to fit every block. */
export function hourBounds(blocks: Timed[]): { startHour: number; endHour: number } {
  let startHour = 9
  let endHour = 19
  for (const b of blocks) {
    startHour = Math.min(startHour, Math.floor(b.startMinute / 60))
    endHour = Math.max(endHour, Math.ceil((b.startMinute + b.durationMinutes) / 60))
  }
  return { startHour, endHour: Math.min(endHour, 24) }
}

export interface LaidOut<T> {
  block: T
  lane: number
  lanes: number
}

/** Side-by-side lanes for overlapping blocks; `lanes` is the width of each overlap cluster. */
export function layoutDay<T extends Timed>(blocks: T[]): LaidOut<T>[] {
  const sorted = [...blocks].sort((a, b) => a.startMinute - b.startMinute)
  const out: LaidOut<T>[] = []
  let cluster: LaidOut<T>[] = []
  let laneEnds: number[] = []
  let clusterEnd = -1

  const closeCluster = () => {
    for (const item of cluster) item.lanes = laneEnds.length
    cluster = []
    laneEnds = []
  }

  for (const block of sorted) {
    const end = block.startMinute + block.durationMinutes
    if (block.startMinute >= clusterEnd) closeCluster()
    let lane = laneEnds.findIndex((laneEnd) => laneEnd <= block.startMinute)
    if (lane === -1) lane = laneEnds.length
    laneEnds[lane] = end
    clusterEnd = Math.max(clusterEnd, end)
    const item = { block, lane, lanes: 1 }
    cluster.push(item)
    out.push(item)
  }
  closeCluster()
  return out
}
