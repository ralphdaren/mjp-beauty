import { useState, useEffect, useCallback } from 'react'
import { Menu, RefreshCw, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import TrainingBookingsPanel from '../components/admin/TrainingBookingsPanel'
import TrainingDatesPanel from '../components/admin/TrainingDatesPanel'
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

export default function AdminPage() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) ?? '')
  const [passwordInput, setPasswordInput] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const [category, setCategory] = useState<AdminCategory>('services')
  const [trainingView, setTrainingView] = useState<TrainingView>('bookings')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [trainingHolds, setTrainingHolds] = useState(0)
  // The header's refresh button drives whichever panel is on screen; panels that
  // load data register their fetcher here and clear it on unmount.
  const [panelRefresh, setPanelRefresh] = useState<PanelRefresh | null>(null)

  const [requests, setRequests] = useState<BookingRequest[]>([])
  const [fetchLoading, setFetchLoading] = useState(false)
  const [fetchError, setFetchError] = useState('')
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

  const fetchRequests = useCallback(async (t: string) => {
    setFetchLoading(true)
    setFetchError('')
    try {
      const res = await fetch('/api/admin', { headers: { Authorization: `Bearer ${t}` } })
      if (res.status === 401) {
        setAuthenticated(false)
        sessionStorage.removeItem(TOKEN_KEY)
        return
      }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load requests')
      setRequests(data.requests ?? [])
    } catch (err) {
      setFetchError(String(err))
    } finally {
      setFetchLoading(false)
    }
  }, [])

  const fetchTrainingHolds = useCallback(async (t: string) => {
    try {
      const res = await fetch('/api/admin?resource=training-bookings', { headers: { Authorization: `Bearer ${t}` } })
      if (!res.ok) return
      const data = await res.json()
      const bookings: Array<{ effective_status: string }> = data.bookings ?? []
      setTrainingHolds(bookings.filter((b) => b.effective_status === 'hold').length)
    } catch {
    }
  }, [])

  useEffect(() => {
    if (token) {
      fetchRequests(token).then(() => setAuthenticated(true))
      fetchTrainingHolds(token)
    }
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
      const res = await fetch('/api/admin', {
        headers: { Authorization: `Bearer ${passwordInput}` },
      })
      if (res.status === 401) {
        setLoginError('Incorrect password.')
        return
      }
      const data = await res.json()
      setRequests(data.requests ?? [])
      sessionStorage.setItem(TOKEN_KEY, passwordInput)
      setToken(passwordInput)
      setAuthenticated(true)
      fetchTrainingHolds(passwordInput)
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
    setTrainingHolds(0)
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
      await fetchRequests(token)
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

  // Services is rendered by this component, so it wires its own fetcher; the rest
  // arrive from whichever panel is mounted. Mentorship has no data, hence null.
  const refresh: PanelRefresh | null =
    category === 'services' ? { run: () => fetchRequests(token), loading: fetchLoading } : panelRefresh

  return (
    <div className="min-h-screen bg-[#f6f2ec]">
      {/* Selecting a panel deliberately leaves the mobile drawer open — admins
          dismiss it themselves, via the close icon or the backdrop. */}
      <AdminSidebar
        category={category}
        onSelect={setCategory}
        counts={{ services: tabCount('pending'), training: trainingHolds, mentorship: 0 }}
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
          onHoldCountChange={setTrainingHolds}
          onRefreshChange={setPanelRefresh}
        />
      )}
      {category === 'training' && trainingView === 'dates' && (
        <TrainingDatesPanel token={token} onRefreshChange={setPanelRefresh} />
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
                {fetchLoading && filtered.length === 0
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
          {fetchLoading && filtered.length === 0
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
