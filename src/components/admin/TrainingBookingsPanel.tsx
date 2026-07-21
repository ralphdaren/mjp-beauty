import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, MapPin } from 'lucide-react'

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
  /** Where the student lives — not where the training is held. */
  city: string | null
  province: string | null
  expires_at: string
  created_at: string
  training_dates: { option: 'group' | 'private'; starts_at: string; location: string } | null
}

const TIMEZONE = 'America/Winnipeg'
const OPTION_LABEL: Record<'group' | 'private', string> = { group: 'Small Group', private: 'Private 1-on-1' }
const PAYMENT_LABEL: Record<'e-transfer' | 'credit-card', string> = { 'e-transfer': 'E-Transfer', 'credit-card': 'Credit Card' }

const TABS: EffectiveStatus[] = ['hold', 'confirmed', 'cancelled', 'expired']

const STATUS_STYLES: Record<EffectiveStatus, { bg: string; text: string; dot: string }> = {
  hold: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
  confirmed: { bg: 'bg-[#eaf5ee]', text: 'text-[#4a9d6f]', dot: 'bg-[#4a9d6f]' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-500', dot: 'bg-red-400' },
  expired: { bg: 'bg-[#f3f0ec]', text: 'text-[#8a8078]', dot: 'bg-[#a0948a]' },
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

export default function TrainingBookingsPanel({ token }: { token: string }) {
  const [bookings, setBookings] = useState<TrainingBooking[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<EffectiveStatus>('hold')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

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

  const tabCount = (t: EffectiveStatus) => bookings.filter((b) => b.effective_status === t).length
  const visible = bookings.filter((b) => b.effective_status === tab)

  return (
    <div className="px-6 py-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-colors capitalize flex items-center gap-1.5 ${
                tab === t ? 'bg-[#3d3530] text-white' : 'bg-white text-[#6b5f58] hover:bg-[#ede9e3]'
              }`}
            >
              {t}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tab === t ? 'bg-white/20' : 'bg-[#f6f2ec]'}`}>
                {tabCount(t)}
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={fetchBookings}
          disabled={loading}
          className="p-2.5 border border-[#e3e2de] rounded-full text-[#6b5f58] hover:border-[#3d3530] hover:text-[#3d3530] transition-colors disabled:opacity-50 bg-white shrink-0"
          title="Refresh"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {!loading && visible.length === 0 && (
        <div className="text-center py-16 text-[#a0948a] text-sm">No {tab} training bookings.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visible.map((b) => {
          const s = STATUS_STYLES[b.effective_status]
          return (
            <div key={b.id} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#3d3530]">{b.first_name} {b.last_name}</p>
                  <p className="text-xs text-[#6b5f58] break-all">{b.email}</p>
                  {b.phone && <p className="text-xs text-[#a0948a]">{b.phone}</p>}
                  {b.city && (
                    <p className="text-xs text-[#6b5f58] flex items-center gap-1 mt-0.5">
                      <MapPin size={11} className="shrink-0 text-[#a0948a]" />
                      {b.province ? `${b.city}, ${b.province}` : b.city}
                    </p>
                  )}
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.08em] shrink-0 ${s.bg} ${s.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                  {b.effective_status}
                </span>
              </div>

              <div className="bg-[#f6f2ec] rounded-xl p-4 space-y-2 mb-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#a0948a] uppercase tracking-[0.1em]">Training</span>
                  <span className="text-[#3d3530] font-medium text-right">
                    {b.training_dates ? OPTION_LABEL[b.training_dates.option] : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a0948a] uppercase tracking-[0.1em]">Date</span>
                  <span className="text-[#3d3530] text-right">{b.training_dates ? formatDateTime(b.training_dates.starts_at) : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a0948a] uppercase tracking-[0.1em]">Location</span>
                  <span className="text-[#3d3530] text-right">{b.training_dates?.location ?? '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a0948a] uppercase tracking-[0.1em]">Deposit</span>
                  <span className="text-[#3d3530] text-right">{b.payment_method ? PAYMENT_LABEL[b.payment_method] : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a0948a] uppercase tracking-[0.1em]">Submitted</span>
                  <span className="text-[#a0948a] text-right">{formatSubmitted(b.created_at)}</span>
                </div>
                {b.effective_status === 'hold' && (
                  <div className="flex justify-between">
                    <span className="text-[#a0948a] uppercase tracking-[0.1em]">Hold</span>
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
          )
        })}
      </div>
    </div>
  )
}
