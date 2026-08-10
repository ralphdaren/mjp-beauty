import { useState, useEffect, useCallback, useRef } from 'react'
import { Menu, RefreshCw, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import TrainingBookingsPanel, { type TrainingBooking } from '../components/admin/TrainingBookingsPanel'
import TrainingDatesPanel, { type TrainingDateRow } from '../components/admin/TrainingDatesPanel'
import MentorshipPanel from '../components/admin/MentorshipPanel'
import AdminSidebar from '../components/admin/AdminSidebar'
import StatusTabs from '../components/admin/StatusTabs'
import SearchFilterBar from '../components/admin/SearchFilterBar'
import { CATEGORY_LABEL, type AdminCategory, type TrainingView, type PanelRefresh } from '../components/admin/adminShell'

interface BookingRequest {
  id: string
  created_at: string
  status: 'pending' | 'accepted' | 'declined' | 'cancelled'
  first_name: string
  last_name: string
  email: string
  phone: string | null
  service_name: string
  tier_label: string
  items: Array<{ serviceName: string; tierLabel: string }> | null
  duration_minutes: number | null
  start_at: string
  reviewed_at: string | null
}
function requestServices(r: BookingRequest): Array<{ serviceName: string; tierLabel: string }> {
  return r.items?.length ? r.items : [{ serviceName: r.service_name, tierLabel: r.tier_label }]
}

type Tab = 'pending' | 'accepted' | 'declined' | 'cancelled'

const PAGE_SIZE = 10

function RequestRowSkeleton({ columns }: { columns: number }) {
  return (
    <tr className="border-b border-[#f1ece5] last:border-0">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-3 w-24 bg-[#ece7e0] rounded-full animate-pulse" />
        </td>
      ))}
    </tr>
  )
}

function RequestRowSkeletonMobile() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="w-1.5 h-1.5 rounded-full bg-[#ece7e0] shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-28 bg-[#ece7e0] rounded-full animate-pulse" />
        <div className="h-2.5 w-40 bg-[#f1ece5] rounded-full animate-pulse" />
      </div>
    </div>
  )
}

const STATUS_STYLES: Record<BookingRequest['status'], { dot: string }> = {
  pending: { dot: 'bg-amber-500' },
  accepted: { dot: 'bg-[#4a9d6f]' },
  declined: { dot: 'bg-red-400' },
  cancelled: { dot: 'bg-[#a0948a]' },
}

const TIMEZONE = 'America/Winnipeg'
const TOKEN_KEY = 'mjp_admin_token'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-CA', {
    timeZone: TIMEZONE,
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function formatSubmitted(iso: string) {
  return new Date(iso).toLocaleString('en-CA', {
    timeZone: TIMEZONE,
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/** `silent` skips the skeleton — see loadResource. */
interface FetchOpts {
  silent?: boolean
}

/**
 * Shared GET for the dashboard's three datasets.
 *
 * `silent` suppresses the loading flag, so a reload that follows an action does
 * not blank the table the admin just clicked in — the row's own button already
 * shows "…". A visible skeleton is therefore reserved for the two moments it
 * actually means something: signing in, and the header's refresh button.
 */
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

export default function AdminPage() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) ?? '')
  const [passwordInput, setPasswordInput] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const [category, setCategory] = useState<AdminCategory>('services')
  const [trainingView, setTrainingView] = useState<TrainingView>('bookings')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Every dataset lives here rather than in the panels. Panels mount and unmount
  // as the admin moves around the sidebar, and state that lived in them was lost
  // and refetched on each visit — so switching panels flashed a skeleton every
  // time. Held up here, the rows survive, and a skeleton only means a real load:
  // signing in, or the header's refresh button.
  //
  // A restored session starts out loading, so the first paint is already the
  // skeleton. Starting at false renders one frame of "No pending requests."
  // before the effect below fires.
  const restoring = !!token
  const [requests, setRequests] = useState<BookingRequest[]>([])
  const [fetchLoading, setFetchLoading] = useState(restoring)
  const [fetchError, setFetchError] = useState('')

  const [trainingBookings, setTrainingBookings] = useState<TrainingBooking[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(restoring)
  const [bookingsError, setBookingsError] = useState('')

  const [trainingDates, setTrainingDates] = useState<TrainingDateRow[]>([])
  const [datesLoading, setDatesLoading] = useState(restoring)
  const [datesError, setDatesError] = useState('')

  const [tab, setTab] = useState<Tab>('pending')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [serviceFilter, setServiceFilter] = useState('')
  const [optionFilter, setOptionFilter] = useState('')
  const [page, setPage] = useState(1)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  const signOutUnauthorized = useCallback(() => {
    setAuthenticated(false)
    sessionStorage.removeItem(TOKEN_KEY)
  }, [])

  const fetchRequests = useCallback(
    (t: string, opts?: FetchOpts) =>
      loadResource<BookingRequest[]>({
        url: '/api/admin',
        token: t,
        silent: opts?.silent,
        pick: (d) => (d.requests as BookingRequest[]) ?? [],
        apply: setRequests,
        setLoading: setFetchLoading,
        setError: setFetchError,
        onUnauthorized: signOutUnauthorized,
        fallbackError: 'Failed to load requests',
      }),
    [signOutUnauthorized],
  )

  const fetchTrainingBookings = useCallback(
    (t: string, opts?: FetchOpts) =>
      loadResource<TrainingBooking[]>({
        url: '/api/admin?resource=training-bookings',
        token: t,
        silent: opts?.silent,
        pick: (d) => (d.bookings as TrainingBooking[]) ?? [],
        apply: setTrainingBookings,
        setLoading: setBookingsLoading,
        setError: setBookingsError,
        onUnauthorized: signOutUnauthorized,
        fallbackError: 'Failed to load bookings',
      }),
    [signOutUnauthorized],
  )

  const fetchTrainingDates = useCallback(
    (t: string, opts?: FetchOpts) =>
      loadResource<TrainingDateRow[]>({
        url: '/api/admin?resource=training-dates',
        token: t,
        silent: opts?.silent,
        pick: (d) => (d.dates as TrainingDateRow[]) ?? [],
        apply: setTrainingDates,
        setLoading: setDatesLoading,
        setError: setDatesError,
        onUnauthorized: signOutUnauthorized,
        fallbackError: 'Failed to load dates',
      }),
    [signOutUnauthorized],
  )

  /**
   * Loads all three panels in one request. Kicked off once per sign-in and
   * never awaited: the dashboard is already on screen showing skeletons.
   *
   * Deliberately not three parallel fetches — every request spends a slot of
   * the admin rate limit (20/min per IP, which also guards the password), so
   * three-per-load meant a handful of browser reloads returned 429.
   */
  const loadAll = useCallback(
    async (t: string) => {
      setFetchLoading(true)
      setBookingsLoading(true)
      setDatesLoading(true)
      setFetchError('')
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
        // One request backs all three panels, so a failure blanks all three.
        setFetchError(String(err))
        setBookingsError(String(err))
        setDatesError(String(err))
      } finally {
        setFetchLoading(false)
        setBookingsLoading(false)
        setDatesLoading(false)
      }
    },
    [signOutUnauthorized],
  )

  // A stored token is trusted on sight so the dashboard paints immediately; if
  // it turns out to be stale, the 401 on the fetch drops back to the login.
  //
  // The ref makes this a true once-per-mount bootstrap: StrictMode double-invokes
  // effects in dev, which doubled every reload's cost against the admin rate
  // limit and had local reloads returning 429 after a handful of refreshes.
  const bootstrapped = useRef(false)
  useEffect(() => {
    if (!token || bootstrapped.current) return
    bootstrapped.current = true
    setAuthenticated(true)
    loadAll(token)
  }, [])

  useEffect(() => {
    setPage(1)
    setExpanded(new Set())
  }, [tab, search, dateFrom, dateTo, serviceFilter, optionFilter])

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')
    try {
      // Checks the password and nothing else, so sign-in costs one quick round
      // trip. The data then loads behind the dashboard, under its skeletons,
      // instead of holding the admin on this button.
      const res = await fetch('/api/admin?resource=auth', {
        headers: { Authorization: `Bearer ${passwordInput}` },
      })
      if (res.status === 401) {
        setLoginError('Incorrect password.')
        return
      }
      if (!res.ok) throw new Error('Sign-in failed')
      sessionStorage.setItem(TOKEN_KEY, passwordInput)
      setToken(passwordInput)
      setAuthenticated(true)
      loadAll(passwordInput)
    } catch {
      setLoginError('Could not connect. Try again.')
    } finally {
      setLoginLoading(false)
    }
  }

  function handleLogout() {
    sessionStorage.removeItem(TOKEN_KEY)
    setToken('')
    setAuthenticated(false)
    setPasswordInput('')
    setRequests([])
    setTrainingBookings([])
    setTrainingDates([])
    setSidebarOpen(false)
  }

  async function handleAction(requestId: string, action: 'accept' | 'decline') {
    setActionLoading(requestId)
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ action, requestId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `Failed to ${action}`)
      await fetchRequests(token, { silent: true })
    } catch (err) {
      alert(String(err))
    } finally {
      setActionLoading(null)
    }
  }

  function clearFilters() {
    setDateFrom('')
    setDateTo('')
    setServiceFilter('')
    setOptionFilter('')
  }

  const tabFiltered = requests.filter((r) => r.status === tab)

  const searched = search.trim()
    ? tabFiltered.filter((r) => {
        const q = search.trim().toLowerCase()
        return `${r.first_name} ${r.last_name}`.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
      })
    : tabFiltered

  const filtered = searched.filter((r) => {
    const services = requestServices(r)
    if (serviceFilter && !services.some((i) => i.serviceName === serviceFilter)) return false
    if (optionFilter && !services.some((i) => i.tierLabel === optionFilter)) return false
    if (dateFrom && r.start_at < dateFrom) return false
    if (dateTo && r.start_at.slice(0, 10) > dateTo) return false
    return true
  })

  const serviceOptions = [...new Set(requests.flatMap((r) => requestServices(r).map((i) => i.serviceName)))].sort()
  const optionOptions = [...new Set(requests.flatMap((r) => requestServices(r).map((i) => i.tierLabel)))].sort()
  const hasActiveFilters = !!(dateFrom || dateTo || serviceFilter || optionFilter)

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // ── Login screen ────────────────────────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#f6f2ec] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <p className="text-center text-xs tracking-[0.2em] uppercase text-[#a0948a] mb-1">MJP Beauty</p>
          <h1 className="text-center text-xl font-semibold text-[#3d3530] mb-8">Admin</h1>
          <form onSubmit={handleLogin} className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a] block mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full border border-[#e3e2de] rounded-xl px-4 py-3 text-sm text-[#3d3530] focus:outline-none focus:border-[#3d3530] transition-colors"
                placeholder="Enter admin password"
                autoFocus
              />
            </div>
            {loginError && <p className="text-xs text-red-500">{loginError}</p>}
            <button
              type="submit"
              disabled={loginLoading || !passwordInput}
              className="w-full py-3 bg-[#3d3530] text-white text-xs tracking-[0.15em] uppercase rounded-full disabled:opacity-50 hover:enabled:bg-[#2a2320] transition-colors"
            >
              {loginLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ── Dashboard ───────────────────────────────────────────────────────────────
  const tabCount = (t: Tab) => requests.filter((r) => r.status === t).length

  // The header's refresh button reloads every dataset, not just the visible
  // panel — it is the same single request the page load uses, so refreshing the
  // whole dashboard costs no more than refreshing one panel, and it keeps the
  // sidebar's counts honest. Mentorship has no data, hence null.
  const refresh: PanelRefresh | null =
    category === 'mentorship'
      ? null
      : { run: () => loadAll(token), loading: fetchLoading || bookingsLoading || datesLoading }

  const holdCount = trainingBookings.filter((b) => b.effective_status === 'hold').length

  return (
    <div className="min-h-screen bg-[#f6f2ec]">
      {/* Selecting a panel deliberately leaves the mobile drawer open — admins
          dismiss it themselves, via the close icon or the backdrop. */}
      <AdminSidebar
        category={category}
        onSelect={setCategory}
        counts={{ services: tabCount('pending'), training: holdCount, mentorship: 0 }}
        trainingView={trainingView}
        onTrainingViewSelect={setTrainingView}
        onSignOut={handleLogout}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-72">
      <div className="sticky top-0 z-30 bg-[#f6f2ec]">
      {/* Header bar. Below lg the sidebar is a drawer, so it also carries the
          hamburger and the branding the sidebar would otherwise show. */}
      <div className="flex items-center gap-3 bg-white px-4 py-4 lg:px-6">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-[#6b5f58] transition-colors hover:text-[#3d3530] lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <p className="text-[10px] uppercase tracking-[0.25em] text-[#a0948a] lg:hidden">MJP Beauty Dashboard</p>
        <p className="hidden text-[10px] uppercase tracking-[0.25em] text-[#a0948a] lg:block">
          {CATEGORY_LABEL[category]}
        </p>
        {refresh && (
          <button
            onClick={refresh.run}
            disabled={refresh.loading}
            className="ml-auto shrink-0 rounded-xl border border-[#e3e2de] bg-white p-2.5 text-[#6b5f58] transition-colors hover:border-[#3d3530] hover:text-[#3d3530] disabled:opacity-50"
            title="Refresh"
            aria-label="Refresh"
          >
            <RefreshCw size={15} className={refresh.loading ? 'animate-spin' : ''} />
          </button>
        )}
      </div>

      {category === 'services' && (<>
      {/* Search + Filter */}
      <div className="px-6 pt-5 max-w-5xl mx-auto">
        <SearchFilterBar
          search={search}
          onSearchChange={setSearch}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          selects={[
            { label: 'Service', allLabel: 'All services', value: serviceFilter, options: serviceOptions, onChange: setServiceFilter },
            { label: 'Option', allLabel: 'All options', value: optionFilter, options: optionOptions, onChange: setOptionFilter },
          ]}
          hasActiveFilters={hasActiveFilters}
          onClear={clearFilters}
        />
      </div>

      {/* Tabs */}
      <div className="px-6 pt-5 pb-3 max-w-5xl mx-auto">
        <StatusTabs<Tab>
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'pending', label: 'Pending', count: tabCount('pending') },
            { id: 'accepted', label: 'Accepted', count: tabCount('accepted') },
          ]}
          more={[
            { id: 'declined', label: 'Declined', count: tabCount('declined') },
            { id: 'cancelled', label: 'Cancelled', count: tabCount('cancelled') },
          ]}
        />
      </div>
      </>)}

      </div>

      {category === 'training' && trainingView === 'bookings' && (
        <TrainingBookingsPanel
          token={token}
          bookings={trainingBookings}
          loading={bookingsLoading}
          error={bookingsError}
          onRefetch={(opts) => fetchTrainingBookings(token, opts)}
        />
      )}
      {category === 'training' && trainingView === 'dates' && (
        <TrainingDatesPanel
          token={token}
          dates={trainingDates}
          loading={datesLoading}
          error={datesError}
          onRefetch={(opts) => fetchTrainingDates(token, opts)}
        />
      )}
      {category === 'mentorship' && <MentorshipPanel />}

      {/* Content */}
      {category === 'services' && (
      <div className="px-6 py-5 max-w-5xl mx-auto">
        {fetchError && (
          <p className="text-sm text-red-500 mb-4">{fetchError}</p>
        )}

        {!fetchLoading && filtered.length === 0 ? (
          <div className="text-center py-16 text-[#a0948a] text-sm">
            No {tab} requests{search.trim() || hasActiveFilters ? ' match your search.' : '.'}
          </div>
        ) : (
        <>
        <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#ece7e0]">
                  <th className="w-[28%] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a0948a]">Client</th>
                  <th className="w-[26%] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a0948a]">Service</th>
                  <th className="w-[18%] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a0948a]">Appointment</th>
                  <th className="w-[14%] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a0948a]">Submitted</th>
                  {tab === 'pending' && (
                    <th className="w-[1%] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a0948a] text-right whitespace-nowrap">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {fetchLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <RequestRowSkeleton key={i} columns={tab === 'pending' ? 5 : 4} />
                    ))
                  : pageItems.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b border-[#f1ece5] last:border-0 align-top hover:bg-[#faf8f5] transition-colors"
                      >
                        <td className="px-5 py-4">
                          <p className="text-xs font-semibold text-[#3d3530]">
                            {r.first_name} {r.last_name}
                          </p>
                          <p className="text-xs text-[#6b5f58] break-all">{r.email}</p>
                          {r.phone && <p className="text-xs text-[#a0948a]">{r.phone}</p>}
                        </td>
                        <td className="px-5 py-4 space-y-1.5">
                          {requestServices(r).map((item, index) => (
                            <div key={`${item.tierLabel}-${index}`}>
                              <p className="text-xs font-medium text-[#3d3530]">{item.serviceName}</p>
                              <p className="text-xs text-[#6b5f58]">{item.tierLabel}</p>
                            </div>
                          ))}
                        </td>
                        <td className="px-5 py-4 text-xs text-[#3d3530] whitespace-nowrap">
                          {formatDate(r.start_at)}
                          {r.duration_minutes ? (
                            <span className="block text-[#a0948a]">{r.duration_minutes} min</span>
                          ) : null}
                        </td>
                        <td className="px-5 py-4 text-xs text-[#a0948a] whitespace-nowrap">
                          {formatSubmitted(r.created_at)}
                        </td>
                        {tab === 'pending' && (
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleAction(r.id, 'decline')}
                                disabled={actionLoading === r.id}
                                className="px-4 py-1.5 bg-white border border-red-300 text-red-500 text-[11px] tracking-[0.1em] uppercase rounded-full disabled:opacity-50 hover:enabled:bg-red-500 hover:enabled:border-red-500 hover:enabled:text-white transition-colors"
                              >
                                {actionLoading === r.id ? '…' : 'Decline'}
                              </button>
                              <button
                                onClick={() => handleAction(r.id, 'accept')}
                                disabled={actionLoading === r.id}
                                className="px-4 py-1.5 bg-[#3d3530] text-white text-[11px] tracking-[0.1em] uppercase rounded-full disabled:opacity-50 hover:enabled:bg-[#2a2320] transition-colors"
                              >
                                {actionLoading === r.id ? '…' : 'Accept'}
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="md:hidden bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-[#f1ece5]">
          {fetchLoading
            ? Array.from({ length: 5 }).map((_, i) => <RequestRowSkeletonMobile key={i} />)
            : pageItems.map((r) => {
                const services = requestServices(r)
                const isOpen = expanded.has(r.id)
                return (
                  <div key={r.id}>
                    <button
                      onClick={() => toggleExpanded(r.id)}
                      aria-expanded={isOpen}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_STYLES[r.status].dot}`} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold text-[#3d3530] truncate">
                          {r.first_name} {r.last_name}
                        </span>
                        <span className="block text-[11px] text-[#6b5f58] truncate">
                          {services[0].serviceName}
                          {services.length > 1 ? ` +${services.length - 1}` : ''} · {formatSubmitted(r.start_at)}
                        </span>
                      </span>
                      <ChevronDown
                        size={15}
                        className={`shrink-0 text-[#a0948a] transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 space-y-3">
                        <div className="bg-[#f6f2ec] rounded-xl p-4 space-y-2 text-xs">
                          <div className="flex justify-between gap-3">
                            <span className="text-[#a0948a] uppercase tracking-[0.1em] shrink-0">Email</span>
                            <span className="text-[#3d3530] text-right break-all">{r.email}</span>
                          </div>
                          {r.phone && (
                            <div className="flex justify-between gap-3">
                              <span className="text-[#a0948a] uppercase tracking-[0.1em] shrink-0">Phone</span>
                              <span className="text-[#3d3530] text-right">{r.phone}</span>
                            </div>
                          )}
                          {services.map((item, index) => (
                            <div key={`${item.tierLabel}-${index}`} className="flex justify-between gap-3">
                              <span className="text-[#a0948a] uppercase tracking-[0.1em] shrink-0">
                                {services.length > 1 ? `Service ${index + 1}` : 'Service'}
                              </span>
                              <span className="text-right">
                                <span className="text-[#3d3530] font-medium block">{item.serviceName}</span>
                                <span className="text-[#6b5f58] block">{item.tierLabel}</span>
                              </span>
                            </div>
                          ))}
                          <div className="flex justify-between gap-3">
                            <span className="text-[#a0948a] uppercase tracking-[0.1em] shrink-0">Appointment</span>
                            <span className="text-[#3d3530] text-right">
                              {formatDate(r.start_at)}
                              {r.duration_minutes ? (
                                <span className="block text-[#a0948a]">{r.duration_minutes} min</span>
                              ) : null}
                            </span>
                          </div>
                          <div className="flex justify-between gap-3">
                            <span className="text-[#a0948a] uppercase tracking-[0.1em] shrink-0">Submitted</span>
                            <span className="text-[#a0948a] text-right">{formatSubmitted(r.created_at)}</span>
                          </div>
                        </div>

                        {r.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAction(r.id, 'decline')}
                              disabled={actionLoading === r.id}
                              className="flex-1 py-2.5 bg-white border border-red-300 text-red-500 text-xs tracking-[0.1em] uppercase rounded-full disabled:opacity-50 hover:enabled:bg-red-500 hover:enabled:border-red-500 hover:enabled:text-white transition-colors"
                            >
                              {actionLoading === r.id ? '…' : 'Decline'}
                            </button>
                            <button
                              onClick={() => handleAction(r.id, 'accept')}
                              disabled={actionLoading === r.id}
                              className="flex-1 py-2.5 bg-[#3d3530] text-white text-xs tracking-[0.1em] uppercase rounded-full disabled:opacity-50 hover:enabled:bg-[#2a2320] transition-colors"
                            >
                              {actionLoading === r.id ? '…' : 'Accept'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
        </div>
        </>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-full border border-[#e3e2de] text-[#6b5f58] hover:border-[#3d3530] hover:text-[#3d3530] disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-xs text-[#6b5f58]">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-full border border-[#e3e2de] text-[#6b5f58] hover:border-[#3d3530] hover:text-[#3d3530] disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>
      )}
      </div>
    </div>
  )
}
