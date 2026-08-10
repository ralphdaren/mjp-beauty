import { useCallback, useEffect, useRef, useState } from 'react'
import type { BookingRequest } from './serviceRequests'
import type { TrainingBooking } from './TrainingBookingsPanel'
import type { TrainingDateRow } from './TrainingDatesPanel'

const TOKEN_KEY = 'mjp_admin_token'

export interface FetchOpts {
  silent?: boolean
}

async function loadResource<T>({
  url,
  token,
  silent,
  pick,
  apply,
  setLoading,
  setError,
  onUnauthorized,
  fallbackError,
}: {
  url: string
  token: string
  silent?: boolean
  pick: (data: Record<string, unknown>) => T
  apply: (value: T) => void
  setLoading: (v: boolean) => void
  setError: (v: string) => void
  onUnauthorized: () => void
  fallbackError: string
}) {
  if (!silent) setLoading(true)
  setError('')
  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    if (res.status === 401) return onUnauthorized()
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? fallbackError)
    apply(pick(data))
  } catch (err) {
    setError(String(err))
  } finally {
    setLoading(false)
  }
}

export function useAdminSession() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) ?? '')
  const [authenticated, setAuthenticated] = useState(false)
  const restoring = !!token

  const [requests, setRequests] = useState<BookingRequest[]>([])
  const [requestsLoading, setRequestsLoading] = useState(restoring)
  const [requestsError, setRequestsError] = useState('')

  const [trainingBookings, setTrainingBookings] = useState<TrainingBooking[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(restoring)
  const [bookingsError, setBookingsError] = useState('')

  const [trainingDates, setTrainingDates] = useState<TrainingDateRow[]>([])
  const [datesLoading, setDatesLoading] = useState(restoring)
  const [datesError, setDatesError] = useState('')

  const signOutUnauthorized = useCallback(() => {
    setAuthenticated(false)
    sessionStorage.removeItem(TOKEN_KEY)
  }, [])

  const refetchRequests = useCallback(
    (opts?: FetchOpts) =>
      loadResource<BookingRequest[]>({
        url: '/api/admin',
        token,
        silent: opts?.silent,
        pick: (d) => (d.requests as BookingRequest[]) ?? [],
        apply: setRequests,
        setLoading: setRequestsLoading,
        setError: setRequestsError,
        onUnauthorized: signOutUnauthorized,
        fallbackError: 'Failed to load requests',
      }),
    [token, signOutUnauthorized],
  )

  const refetchTrainingBookings = useCallback(
    (opts?: FetchOpts) =>
      loadResource<TrainingBooking[]>({
        url: '/api/admin?resource=training-bookings',
        token,
        silent: opts?.silent,
        pick: (d) => (d.bookings as TrainingBooking[]) ?? [],
        apply: setTrainingBookings,
        setLoading: setBookingsLoading,
        setError: setBookingsError,
        onUnauthorized: signOutUnauthorized,
        fallbackError: 'Failed to load bookings',
      }),
    [token, signOutUnauthorized],
  )

  const refetchTrainingDates = useCallback(
    (opts?: FetchOpts) =>
      loadResource<TrainingDateRow[]>({
        url: '/api/admin?resource=training-dates',
        token,
        silent: opts?.silent,
        pick: (d) => (d.dates as TrainingDateRow[]) ?? [],
        apply: setTrainingDates,
        setLoading: setDatesLoading,
        setError: setDatesError,
        onUnauthorized: signOutUnauthorized,
        fallbackError: 'Failed to load dates',
      }),
    [token, signOutUnauthorized],
  )

  const loadAll = useCallback(
    async (t: string) => {
      setRequestsLoading(true)
      setBookingsLoading(true)
      setDatesLoading(true)
      setRequestsError('')
      setBookingsError('')
      setDatesError('')
      try {
        const res = await fetch('/api/admin?resource=dashboard', {
          headers: { Authorization: `Bearer ${t}` },
        })
        if (res.status === 401) return signOutUnauthorized()
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Failed to load dashboard')
        setRequests(data.requests ?? [])
        setTrainingBookings(data.bookings ?? [])
        setTrainingDates(data.dates ?? [])
      } catch (err) {
        setRequestsError(String(err))
        setBookingsError(String(err))
        setDatesError(String(err))
      } finally {
        setRequestsLoading(false)
        setBookingsLoading(false)
        setDatesLoading(false)
      }
    },
    [signOutUnauthorized],
  )

  const bootstrapped = useRef(false)
  useEffect(() => {
    if (!token || bootstrapped.current) return
    bootstrapped.current = true
    setAuthenticated(true)
    loadAll(token)
  }, [])

  const signIn = useCallback(
    async (password: string): Promise<string | null> => {
      try {
        const res = await fetch('/api/admin?resource=auth', {
          headers: { Authorization: `Bearer ${password}` },
        })
        if (res.status === 401) return 'Incorrect password.'
        if (!res.ok) throw new Error('Sign-in failed')
        sessionStorage.setItem(TOKEN_KEY, password)
        setToken(password)
        setAuthenticated(true)
        loadAll(password)
        return null
      } catch {
        return 'Could not connect. Try again.'
      }
    },
    [loadAll],
  )

  const signOut = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY)
    setToken('')
    setAuthenticated(false)
    setRequests([])
    setTrainingBookings([])
    setTrainingDates([])
  }, [])

  return {
    token,
    authenticated,
    signIn,
    signOut,

    requests,
    requestsLoading,
    requestsError,
    refetchRequests,

    trainingBookings,
    bookingsLoading,
    bookingsError,
    refetchTrainingBookings,

    trainingDates,
    datesLoading,
    datesError,
    refetchTrainingDates,

    reloadAll: useCallback(() => loadAll(token), [loadAll, token]),
    anyLoading: requestsLoading || bookingsLoading || datesLoading,
  }
}
