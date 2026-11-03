import { useCallback, useEffect, useRef, useState } from 'react'
import { TIMEZONE } from './adminFormat'
import { rangeFor, shiftAnchor, todayKey } from './calendarDates'
import type { AppointmentDetail, CalendarBlock, CalendarView } from './calendarTypes'

export class UnauthorizedError extends Error {}

/** GET an admin calendar resource, waiting out our own rate limit once before giving up. */
export async function fetchCalendarJson<T>(token: string, query: string, signal?: AbortSignal): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`/api/admin?${query}`, { headers: { Authorization: `Bearer ${token}` }, signal })
    if (res.status === 401) throw new UnauthorizedError('Unauthorized')
    if (res.status === 429 && attempt === 0) {
      const wait = Number(res.headers.get('Retry-After')) || 2
      await new Promise((r) => setTimeout(r, wait * 1000))
      continue
    }
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Failed to load calendar')
    return data as T
  }
}

export async function fetchAppointment(token: string, id: string): Promise<AppointmentDetail> {
  const data = await fetchCalendarJson<{ appointment: AppointmentDetail }>(
    token,
    `resource=calendar-booking&id=${encodeURIComponent(id)}`,
  )
  return data.appointment
}

export function useBrowCalendar(token: string, enabled: boolean, onUnauthorized: () => void) {
  const [view, setView] = useState<CalendarView>('week')
  const [anchor, setAnchor] = useState(() => todayKey(TIMEZONE, Date.now()))
  const [blocks, setBlocks] = useState<CalendarBlock[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [partial, setPartial] = useState(false)
  const cache = useRef(new Map<string, { blocks: CalendarBlock[]; partial: boolean }>())
  const latest = useRef('')

  const { from, to } = rangeFor(view, anchor)
  const key = `${from}_${to}`

  const load = useCallback(
    async (force: boolean) => {
      latest.current = key
      const cached = cache.current.get(key)
      if (cached && !force) {
        setBlocks(cached.blocks)
        setPartial(cached.partial)
        setError('')
        // A request for another range may still be in flight; it no longer owns the spinner.
        setLoading(false)
        return
      }
      setLoading(true)
      setError('')
      try {
        const data = await fetchCalendarJson<{ blocks: CalendarBlock[]; failedWindows: number }>(
          token,
          `resource=calendar&from=${from}&to=${to}`,
        )
        const entry = { blocks: data.blocks, partial: data.failedWindows > 0 }
        cache.current.set(key, entry)
        if (latest.current !== key) return
        setBlocks(entry.blocks)
        setPartial(entry.partial)
      } catch (err) {
        if (err instanceof UnauthorizedError) return onUnauthorized()
        if (latest.current === key) setError(err instanceof Error ? err.message : String(err))
      } finally {
        if (latest.current === key) setLoading(false)
      }
    },
    [token, key, from, to, onUnauthorized],
  )

  useEffect(() => {
    if (enabled && token) load(false)
  }, [enabled, token, load])

  return {
    view,
    setView,
    anchor,
    setAnchor,
    goToday: () => setAnchor(todayKey(TIMEZONE, Date.now())),
    shift: (dir: -1 | 1) => setAnchor((a) => shiftAnchor(view, a, dir)),
    blocks,
    loading,
    error,
    partial,
    reload: () => load(true),
  }
}

export type BrowCalendar = ReturnType<typeof useBrowCalendar>
