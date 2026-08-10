import { useState, useEffect, useCallback } from 'react'
import { MapPin, ChevronDown } from 'lucide-react'
import StatusTabs from './StatusTabs'
import SearchFilterBar from './SearchFilterBar'
import type { OnPanelRefreshChange } from './adminShell'

type EffectiveStatus = 'hold' | 'confirmed' | 'cancelled' | 'expired'

interface TrainingBooking {
  id: string
  status: 'hold' | 'confirmed' | 'cancelled' | 'expired'
  effective_status: EffectiveStatus
  payment_method: 'e-transfer' | 'credit-card' | null
  first_name: string
  last_name: string
  email: string
  phone: string | null
  city: string | null
  province: string | null
  expires_at: string
  created_at: string
  training_dates: { option: 'group' | 'private'; starts_at: string; location: string } | null
}

const TIMEZONE = 'America/Winnipeg'
const OPTION_LABEL: Record<'group' | 'private', string> = { group: 'Small Group', private: 'Private 1-on-1' }
const PAYMENT_LABEL: Record<'e-transfer' | 'credit-card', string> = { 'e-transfer': 'E-Transfer', 'credit-card': 'Credit Card' }

const STATUS_STYLES: Record<EffectiveStatus, { dot: string }> = {
  hold: { dot: 'bg-amber-500' },
  confirmed: { dot: 'bg-[#4a9d6f]' },
  cancelled: { dot: 'bg-red-400' },
  expired: { dot: 'bg-[#a0948a]' },
}

function BookingRowSkeleton({ columns }: { columns: number }) {
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

function BookingRowSkeletonMobile() {
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

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-CA', { timeZone: TIMEZONE, dateStyle: 'medium', timeStyle: 'short' })
}

function formatSubmitted(iso: string) {
  return new Date(iso).toLocaleString('en-CA', {
    timeZone: TIMEZONE, month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

function timeLeft(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (ms <= 0) return 'expired'
  const hours = Math.floor(ms / 3_600_000)
  if (hours >= 24) return `${Math.floor(hours / 24)}d ${hours % 24}h left`
  const mins = Math.floor((ms % 3_600_000) / 60_000)
  return `${hours}h ${mins}m left`
}

interface TrainingBookingsPanelProps {
  token: string
  onHoldCountChange?: (count: number) => void
  onRefreshChange?: OnPanelRefreshChange
}

export default function TrainingBookingsPanel({ token, onHoldCountChange, onRefreshChange }: TrainingBookingsPanelProps) {
  const [bookings, setBookings] = useState<TrainingBooking[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<EffectiveStatus>('hold')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [optionFilter, setOptionFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')

  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin?resource=training-bookings', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load bookings')
      setBookings(data.bookings ?? [])
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  useEffect(() => {
    onHoldCountChange?.(bookings.filter((b) => b.effective_status === 'hold').length)
  }, [bookings, onHoldCountChange])

  useEffect(() => {
    setExpanded(new Set())
  }, [tab, search, dateFrom, dateTo, optionFilter, locationFilter])

  useEffect(() => {
    onRefreshChange?.({ run: fetchBookings, loading })
    return () => onRefreshChange?.(null)
  }, [onRefreshChange, fetchBookings, loading])

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleAction(bookingId: string, action: 'confirm' | 'cancel') {
    if (action === 'cancel' && !confirm('Release this seat? The hold will be cancelled.')) return
    setActionLoading(bookingId)
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ resource: 'training-bookings', action, bookingId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `Failed to ${action}`)
      await fetchBookings()
    } catch (err) {
      alert(String(err))
    } finally {
      setActionLoading(null)
    }
  }

  function clearFilters() {
    setDateFrom('')
    setDateTo('')
    setOptionFilter('')
    setLocationFilter('')
  }

  const tabCount = (t: EffectiveStatus) => bookings.filter((b) => b.effective_status === t).length

  const q = search.trim().toLowerCase()
  const visible = bookings.filter((b) => {
    if (b.effective_status !== tab) return false
    if (q && !`${b.first_name} ${b.last_name}`.toLowerCase().includes(q) && !b.email.toLowerCase().includes(q)) {
      return false
    }
    // A booking whose training date was deleted has nothing left to match on, so
    // any filter drawn from that date excludes it.
    const date = b.training_dates
    if (!date) return !optionFilter && !locationFilter && !dateFrom && !dateTo
    if (optionFilter && OPTION_LABEL[date.option] !== optionFilter) return false
    if (locationFilter && date.location !== locationFilter) return false
    const day = date.starts_at.slice(0, 10)
    if (dateFrom && day < dateFrom) return false
    if (dateTo && day > dateTo) return false
    return true
  })

  const optionOptions = [...new Set(bookings.map((b) => b.training_dates && OPTION_LABEL[b.training_dates.option]))]
    .filter((o): o is string => !!o)
    .sort()
  const locationOptions = [...new Set(bookings.map((b) => b.training_dates?.location))]
    .filter((l): l is string => !!l)
    .sort()
  const hasActiveFilters = !!(dateFrom || dateTo || optionFilter || locationFilter)

  return (
    <div className="px-6 py-5 max-w-5xl mx-auto">
      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        selects={[
          { label: 'Option', allLabel: 'All options', value: optionFilter, options: optionOptions, onChange: setOptionFilter },
          { label: 'Location', allLabel: 'All locations', value: locationFilter, options: locationOptions, onChange: setLocationFilter },
        ]}
        hasActiveFilters={hasActiveFilters}
        onClear={clearFilters}
      />

      <div className="mt-5 mb-4">
        <StatusTabs<EffectiveStatus>
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'hold', label: 'Hold', count: tabCount('hold') },
            { id: 'confirmed', label: 'Confirmed', count: tabCount('confirmed') },
          ]}
          more={[
            { id: 'cancelled', label: 'Cancelled', count: tabCount('cancelled') },
            { id: 'expired', label: 'Expired', count: tabCount('expired') },
          ]}
        />
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {!loading && visible.length === 0 ? (
        <div className="text-center py-16 text-[#a0948a] text-sm">
          No {tab} training bookings{search.trim() || hasActiveFilters ? ' match your search.' : '.'}
        </div>
      ) : (
      <>
      <div className="hidden lg:block bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#ece7e0]">
                <th className="w-[31%] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a0948a]">Student</th>
                <th className="w-[22%] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a0948a]">Training</th>
                <th className="w-[18%] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a0948a]">Date</th>
                <th className="w-[13%] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a0948a]">Deposit</th>
                <th className="w-[13%] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a0948a]">
                  {tab === 'hold' ? 'Hold' : 'Submitted'}
                </th>
                {tab === 'hold' && (
                  <th className="w-[1%] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a0948a] text-right whitespace-nowrap">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading && bookings.length === 0
                ? Array.from({ length: 5 }).map((_, i) => (
                    <BookingRowSkeleton key={i} columns={tab === 'hold' ? 6 : 5} />
                  ))
                : visible.map((b) => (
                    <tr
                      key={b.id}
                      className="border-b border-[#f1ece5] last:border-0 align-top hover:bg-[#faf8f5] transition-colors"
                    >
                      <td className="px-5 py-4">
                        <p className="text-xs font-semibold text-[#3d3530]">{b.first_name} {b.last_name}</p>
                        <p className="text-xs text-[#6b5f58] break-all">{b.email}</p>
                        {b.phone && <p className="text-xs text-[#a0948a]">{b.phone}</p>}
                        {b.city && (
                          <p className="text-xs text-[#6b5f58] flex items-center gap-1 mt-0.5">
                            <MapPin size={11} className="shrink-0 text-[#a0948a]" />
                            {b.province ? `${b.city}, ${b.province}` : b.city}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {b.training_dates ? (
                          <>
                            <p className="text-xs font-medium text-[#3d3530]">
                              {OPTION_LABEL[b.training_dates.option]}
                            </p>
                            <p className="text-xs text-[#6b5f58]">{b.training_dates.location}</p>
                          </>
                        ) : (
                          <p className="text-xs text-[#a0948a]">—</p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs text-[#3d3530]">
                        {b.training_dates ? formatDateTime(b.training_dates.starts_at) : '—'}
                      </td>
                      <td className="px-5 py-4 text-xs text-[#3d3530]">
                        {b.payment_method ? PAYMENT_LABEL[b.payment_method] : '—'}
                      </td>
                      <td className="px-5 py-4 text-xs whitespace-nowrap">
                        {tab === 'hold' ? (
                          <span className="text-amber-600 font-medium">{timeLeft(b.expires_at)}</span>
                        ) : (
                          <span className="text-[#a0948a]">{formatSubmitted(b.created_at)}</span>
                        )}
                      </td>
                      {tab === 'hold' && (
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleAction(b.id, 'cancel')}
                              disabled={actionLoading === b.id}
                              className="px-4 py-1.5 bg-white border border-red-300 text-red-500 text-[11px] tracking-[0.1em] uppercase rounded-full disabled:opacity-50 hover:enabled:bg-red-500 hover:enabled:border-red-500 hover:enabled:text-white transition-colors"
                            >
                              {actionLoading === b.id ? '…' : 'Release'}
                            </button>
                            <button
                              onClick={() => handleAction(b.id, 'confirm')}
                              disabled={actionLoading === b.id}
                              className="px-4 py-1.5 bg-[#3d3530] text-white text-[11px] tracking-[0.1em] uppercase rounded-full disabled:opacity-50 hover:enabled:bg-[#2a2320] transition-colors"
                            >
                              {actionLoading === b.id ? '…' : 'Confirm Payment'}
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

      <div className="lg:hidden bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-[#f1ece5]">
        {loading && bookings.length === 0
          ? Array.from({ length: 5 }).map((_, i) => <BookingRowSkeletonMobile key={i} />)
          : visible.map((b) => {
              const isOpen = expanded.has(b.id)
              return (
                <div key={b.id}>
                  <button
                    onClick={() => toggleExpanded(b.id)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_STYLES[b.effective_status].dot}`} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold text-[#3d3530] truncate">
                        {b.first_name} {b.last_name}
                      </span>
                      <span className="block text-[11px] text-[#6b5f58] truncate">
                        {b.training_dates
                          ? `${OPTION_LABEL[b.training_dates.option]} · ${formatSubmitted(b.training_dates.starts_at)}`
                          : 'Date removed'}
                      </span>
                    </span>
                    {b.effective_status === 'hold' && (
                      <span className="text-[10px] text-amber-600 font-medium shrink-0">{timeLeft(b.expires_at)}</span>
                    )}
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
                          <span className="text-[#3d3530] text-right break-all">{b.email}</span>
                        </div>
                        {b.phone && (
                          <div className="flex justify-between gap-3">
                            <span className="text-[#a0948a] uppercase tracking-[0.1em] shrink-0">Phone</span>
                            <span className="text-[#3d3530] text-right">{b.phone}</span>
                          </div>
                        )}
                        {b.city && (
                          <div className="flex justify-between gap-3">
                            <span className="text-[#a0948a] uppercase tracking-[0.1em] shrink-0">Lives in</span>
                            <span className="text-[#3d3530] text-right">
                              {b.province ? `${b.city}, ${b.province}` : b.city}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between gap-3">
                          <span className="text-[#a0948a] uppercase tracking-[0.1em] shrink-0">Training</span>
                          <span className="text-[#3d3530] font-medium text-right">
                            {b.training_dates ? OPTION_LABEL[b.training_dates.option] : '—'}
                          </span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-[#a0948a] uppercase tracking-[0.1em] shrink-0">Date</span>
                          <span className="text-[#3d3530] text-right">
                            {b.training_dates ? formatDateTime(b.training_dates.starts_at) : '—'}
                          </span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-[#a0948a] uppercase tracking-[0.1em] shrink-0">Location</span>
                          <span className="text-[#3d3530] text-right">{b.training_dates?.location ?? '—'}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-[#a0948a] uppercase tracking-[0.1em] shrink-0">Deposit</span>
                          <span className="text-[#3d3530] text-right">
                            {b.payment_method ? PAYMENT_LABEL[b.payment_method] : '—'}
                          </span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-[#a0948a] uppercase tracking-[0.1em] shrink-0">Submitted</span>
                          <span className="text-[#a0948a] text-right">{formatSubmitted(b.created_at)}</span>
                        </div>
                        {b.effective_status === 'hold' && (
                          <div className="flex justify-between gap-3">
                            <span className="text-[#a0948a] uppercase tracking-[0.1em] shrink-0">Hold</span>
                            <span className="text-amber-600 text-right font-medium">{timeLeft(b.expires_at)}</span>
                          </div>
                        )}
                      </div>

                      {b.effective_status === 'hold' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(b.id, 'cancel')}
                            disabled={actionLoading === b.id}
                            className="flex-1 py-2.5 bg-white border border-red-300 text-red-500 text-xs tracking-[0.1em] uppercase rounded-full disabled:opacity-50 hover:enabled:bg-red-500 hover:enabled:border-red-500 hover:enabled:text-white transition-colors"
                          >
                            {actionLoading === b.id ? '…' : 'Release'}
                          </button>
                          <button
                            onClick={() => handleAction(b.id, 'confirm')}
                            disabled={actionLoading === b.id}
                            className="flex-1 py-2.5 bg-[#3d3530] text-white text-xs tracking-[0.1em] uppercase rounded-full disabled:opacity-50 hover:enabled:bg-[#2a2320] transition-colors"
                          >
                            {actionLoading === b.id ? '…' : 'Confirm Payment'}
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
    </div>
  )
}
