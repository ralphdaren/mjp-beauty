import { useState, useEffect, useCallback, useRef } from 'react'
import { LogOut, RefreshCw, Search, SlidersHorizontal, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import TrainingBookingsPanel from '../components/admin/TrainingBookingsPanel'
import TrainingDatesPanel from '../components/admin/TrainingDatesPanel'

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
  start_at: string
  square_booking_id: string | null
  reviewed_at: string | null
}

type Tab = 'pending' | 'accepted' | 'declined' | 'cancelled'
type Category = 'services' | 'training'
type TrainingView = 'bookings' | 'dates'

const PAGE_SIZE = 10

function RequestCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="space-y-2">
          <div className="h-3.5 w-32 bg-[#ece7e0] rounded-full animate-pulse" />
          <div className="h-3 w-40 bg-[#ece7e0] rounded-full animate-pulse" />
        </div>
        <div className="h-3 w-14 bg-[#ece7e0] rounded-full animate-pulse shrink-0" />
      </div>
      <div className="bg-[#f6f2ec] rounded-xl p-4 space-y-3 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-2.5 w-16 bg-[#e3ded5] rounded-full animate-pulse" />
            <div className="h-2.5 w-24 bg-[#e3ded5] rounded-full animate-pulse" />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <div className="flex-1 h-9 bg-[#f6f2ec] rounded-full animate-pulse" />
        <div className="flex-1 h-9 bg-[#f6f2ec] rounded-full animate-pulse" />
      </div>
    </div>
  )
}

const STATUS_STYLES: Record<BookingRequest['status'], { bg: string; text: string; dot: string }> = {
  pending:  { bg: 'bg-amber-50',  text: 'text-amber-600', dot: 'bg-amber-500' },
  accepted: { bg: 'bg-[#eaf5ee]', text: 'text-[#4a9d6f]', dot: 'bg-[#4a9d6f]' },
  declined: { bg: 'bg-red-50',    text: 'text-red-500',   dot: 'bg-red-400' },
  cancelled: { bg: 'bg-[#f3f0ec]', text: 'text-[#8a8078]', dot: 'bg-[#a0948a]' },
}

function StatusBadge({ status }: { status: BookingRequest['status'] }) {
  const s = STATUS_STYLES[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.08em] shrink-0 ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  )
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

  const [category, setCategory] = useState<Category>('services')
  const [trainingView, setTrainingView] = useState<TrainingView>('bookings')

  const [requests, setRequests] = useState<BookingRequest[]>([])
  const [fetchLoading, setFetchLoading] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [tab, setTab] = useState<Tab>('pending')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [serviceFilter, setServiceFilter] = useState('')
  const [optionFilter, setOptionFilter] = useState('')
  const [page, setPage] = useState(1)
  const filterPanelRef = useRef<HTMLDivElement>(null)

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

  // Auto-login if token already in sessionStorage
  useEffect(() => {
    if (token) {
      fetchRequests(token).then(() => setAuthenticated(true))
    }
  }, [])

  // Close the filter panel on outside click
  useEffect(() => {
    if (!filterOpen) return
    function handleClick(e: MouseEvent) {
      if (filterPanelRef.current && !filterPanelRef.current.contains(e.target as Node)) {
        setFilterOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [filterOpen])

  // Reset to page 1 whenever the visible result set could change shape
  useEffect(() => {
    setPage(1)
  }, [tab, search, dateFrom, dateTo, serviceFilter, optionFilter])

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
    if (serviceFilter && r.service_name !== serviceFilter) return false
    if (optionFilter && r.tier_label !== optionFilter) return false
    if (dateFrom && r.start_at < dateFrom) return false
    if (dateTo && r.start_at.slice(0, 10) > dateTo) return false
    return true
  })

  const serviceOptions = [...new Set(requests.map((r) => r.service_name))].sort()
  const optionOptions = [...new Set(requests.map((r) => r.tier_label))].sort()
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

  return (
    <div className="min-h-screen bg-[#f6f2ec]">
      <div className="sticky top-0 z-30 bg-[#f6f2ec]">
      {/* Header */}
      <div className="bg-white border-b border-[#e3e2de] px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#a0948a]">MJP Beauty</p>
          <h1 className="text-base font-semibold text-[#3d3530]">
            {category === 'services' ? 'Booking Requests' : 'In-Person Training'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {category === 'services' && (
            <div className="group relative">
              <button
                onClick={() => fetchRequests(token)}
                disabled={fetchLoading}
                className="p-2.5 border border-[#e3e2de] rounded-full text-[#6b5f58] hover:border-[#3d3530] hover:text-[#3d3530] transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw size={16} className={fetchLoading ? 'animate-spin' : ''} />
              </button>
              <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#3d3530] text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10">
                Refresh
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 border border-[#e3e2de] rounded-full px-4 py-2 text-xs font-medium text-[#6b5f58] hover:border-[#3d3530] hover:text-[#3d3530] transition-colors"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </div>

      {/* Category switch */}
      <div className="px-6 pt-4 max-w-5xl mx-auto">
        <div className="inline-flex bg-white rounded-full p-1 border border-[#e3e2de]">
          {([['services', 'Brow Services'], ['training', 'In-Person Training']] as const).map(([c, label]) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                category === c ? 'bg-[#3d3530] text-white' : 'text-[#6b5f58] hover:text-[#3d3530]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {category === 'services' && (<>
      {/* Search + Filter */}
      <div className="px-6 pt-5 flex items-center gap-3 max-w-5xl mx-auto">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a0948a]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-white border border-[#e3e2de] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#3d3530] focus:outline-none focus:border-[#3d3530] transition-colors"
          />
        </div>
        <div className="relative" ref={filterPanelRef}>
          <button
            onClick={() => setFilterOpen((o) => !o)}
            className={`flex items-center gap-2 border rounded-xl px-4 py-2.5 text-xs font-medium transition-colors ${
              filterOpen || hasActiveFilters
                ? 'border-[#3d3530] text-[#3d3530]'
                : 'border-[#e3e2de] text-[#6b5f58] hover:border-[#3d3530] hover:text-[#3d3530]'
            }`}
          >
            <SlidersHorizontal size={14} />
            Filter
          </button>
          {filterOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-lg border border-[#e3e2de] p-5 z-20 space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a] block mb-1.5">From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full border border-[#e3e2de] rounded-xl px-3 py-2.5 text-sm text-[#3d3530] focus:outline-none focus:border-[#3d3530]"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a] block mb-1.5">To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full border border-[#e3e2de] rounded-xl px-3 py-2.5 text-sm text-[#3d3530] focus:outline-none focus:border-[#3d3530]"
                />
              </div>

              <div className="border-t border-[#e3e2de]" />

              <div>
                <label className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a] block mb-1.5">Service</label>
                <div className="relative">
                  <select
                    value={serviceFilter}
                    onChange={(e) => setServiceFilter(e.target.value)}
                    className="w-full appearance-none border border-[#e3e2de] rounded-xl pl-3 pr-9 py-2.5 text-sm text-[#3d3530] focus:outline-none focus:border-[#3d3530] bg-white"
                  >
                    <option value="">All services</option>
                    {serviceOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#a0948a]" />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a] block mb-1.5">Option</label>
                <div className="relative">
                  <select
                    value={optionFilter}
                    onChange={(e) => setOptionFilter(e.target.value)}
                    className="w-full appearance-none border border-[#e3e2de] rounded-xl pl-3 pr-9 py-2.5 text-sm text-[#3d3530] focus:outline-none focus:border-[#3d3530] bg-white"
                  >
                    <option value="">All options</option>
                    {optionOptions.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#a0948a]" />
                </div>
              </div>

              <button
                onClick={clearFilters}
                className="w-full py-2.5 border border-[#e3e2de] rounded-full text-xs font-medium text-[#6b5f58] hover:border-[#3d3530] hover:text-[#3d3530] transition-colors"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-5 pb-3 flex gap-1 max-w-5xl mx-auto">
        {(['pending', 'accepted', 'declined', 'cancelled'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-colors capitalize flex items-center gap-1.5 ${
              tab === t
                ? 'bg-[#3d3530] text-white'
                : 'bg-white text-[#6b5f58] hover:bg-[#ede9e3]'
            }`}
          >
            {t}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tab === t ? 'bg-white/20' : 'bg-[#f6f2ec]'}`}>
              {tabCount(t)}
            </span>
          </button>
        ))}
      </div>
      </>)}

      {category === 'training' && (
        <div className="px-6 pt-5 pb-3 flex gap-1 max-w-5xl mx-auto">
          {([['bookings', 'Bookings'], ['dates', 'Manage Dates']] as const).map(([v, label]) => (
            <button
              key={v}
              onClick={() => setTrainingView(v)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                trainingView === v ? 'bg-[#3d3530] text-white' : 'bg-white text-[#6b5f58] hover:bg-[#ede9e3]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      </div>

      {category === 'training' && trainingView === 'bookings' && <TrainingBookingsPanel token={token} />}
      {category === 'training' && trainingView === 'dates' && <TrainingDatesPanel token={token} />}

      {/* Content */}
      {category === 'services' && (
      <div className="px-6 py-5 max-w-5xl mx-auto">
        {fetchError && (
          <p className="text-sm text-red-500 mb-4">{fetchError}</p>
        )}

        {!fetchLoading && filtered.length === 0 && (
          <div className="text-center py-16 text-[#a0948a] text-sm">
            No {tab} requests{search.trim() || hasActiveFilters ? ' match your search.' : '.'}
          </div>
        )}

        {fetchLoading && filtered.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <RequestCardSkeleton key={i} />
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pageItems.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl p-5 shadow-sm">
              {/* Customer */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#3d3530]">
                    {r.first_name} {r.last_name}
                  </p>
                  <p className="text-xs text-[#6b5f58]">{r.email}</p>
                  {r.phone && <p className="text-xs text-[#a0948a]">{r.phone}</p>}
                </div>
                <StatusBadge status={r.status} />
              </div>

              {/* Booking details */}
              <div className="bg-[#f6f2ec] rounded-xl p-4 space-y-2 mb-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#a0948a] uppercase tracking-[0.1em]">Service</span>
                  <span className="text-[#3d3530] font-medium text-right">{r.service_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a0948a] uppercase tracking-[0.1em]">Option</span>
                  <span className="text-[#3d3530] text-right">{r.tier_label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a0948a] uppercase tracking-[0.1em]">Appointment</span>
                  <span className="text-[#3d3530] text-right">{formatDate(r.start_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a0948a] uppercase tracking-[0.1em]">Submitted</span>
                  <span className="text-[#a0948a] text-right">{formatSubmitted(r.created_at)}</span>
                </div>
                {r.square_booking_id && (
                  <div className="flex justify-between">
                    <span className="text-[#a0948a] uppercase tracking-[0.1em]">Square ID</span>
                    <span className="text-[#a0948a] font-mono text-right">{r.square_booking_id}</span>
                  </div>
                )}
              </div>

              {/* Actions — pending only */}
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
          ))}
        </div>

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
  )
}
