import { useCallback, useEffect, useState } from 'react'
import { fetchCalendarJson } from './useBrowCalendar'
import type { HistoryChunk, HistoryEntry } from './calendarTypes'

/** Walks a client's Square history newest-first, appending each chunk as it arrives. */
export function useClientHistory(token: string, customerId: string | null) {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    setEntries([])
    setFailed(false)
    if (!customerId) {
      setLoadingOlder(false)
      return
    }
    const controller = new AbortController()
    setLoadingOlder(true)
    ;(async () => {
      let before: string | null = null
      try {
        do {
          const query: string =
            `resource=client-history&customerId=${encodeURIComponent(customerId)}` +
            (before ? `&before=${encodeURIComponent(before)}` : '')
          const chunk: HistoryChunk = await fetchCalendarJson<HistoryChunk>(token, query, controller.signal)
          if (controller.signal.aborted) return
          setEntries((prev) => [...prev, ...chunk.entries])
          if (chunk.failedWindows > 0) setFailed(true)
          before = chunk.nextBefore
        } while (before)
      } catch {
        if (!controller.signal.aborted) setFailed(true)
      } finally {
        if (!controller.signal.aborted) setLoadingOlder(false)
      }
    })()
    return () => controller.abort()
  }, [token, customerId, attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])
  return { entries, loadingOlder, failed, retry }
}
