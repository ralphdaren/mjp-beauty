import { useState, useEffect, useCallback } from 'react'
import { LogOut, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react'

interface BookingRequest {
  id: string
  created_at: string
  status: 'pending' | 'accepted' | 'declined'
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

type Tab = 'pending' | 'accepted' | 'declined'

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

  const [requests, setRequests] = useState<BookingRequest[]>([])
  const [fetchLoading, setFetchLoading] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [tab, setTab] = useState<Tab>('pending')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

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

  const filtered = requests.filter((r) => r.status === tab)

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
      {/* Header */}
      <div className="bg-white border-b border-[#e3e2de] px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#a0948a]">MJP Beauty</p>
          <h1 className="text-base font-semibold text-[#3d3530]">Booking Requests</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchRequests(token)}
            disabled={fetchLoading}
            className="p-2 text-[#a0948a] hover:text-[#3d3530] transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={16} className={fetchLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-[#a0948a] hover:text-[#3d3530] transition-colors"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-5 pb-0 flex gap-1">
        {(['pending', 'accepted', 'declined'] as Tab[]).map((t) => (
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

      {/* Content */}
      <div className="px-6 py-5 max-w-3xl">
        {fetchError && (
          <p className="text-sm text-red-500 mb-4">{fetchError}</p>
        )}

        {!fetchLoading && filtered.length === 0 && (
          <div className="text-center py-16 text-[#a0948a] text-sm">
            No {tab} requests.
          </div>
        )}

        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl p-5 shadow-sm">
              {/* Customer */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm font-semibold text-[#3d3530]">
                    {r.first_name} {r.last_name}
                  </p>
                  <p className="text-xs text-[#6b5f58]">{r.email}</p>
                  {r.phone && <p className="text-xs text-[#a0948a]">{r.phone}</p>}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {r.status === 'pending' && <Clock size={13} className="text-amber-500" />}
                  {r.status === 'accepted' && <CheckCircle2 size={13} className="text-[#4a9d6f]" />}
                  {r.status === 'declined' && <XCircle size={13} className="text-red-400" />}
                  <span className={`text-[10px] uppercase tracking-[0.1em] font-medium ${
                    r.status === 'pending' ? 'text-amber-500' :
                    r.status === 'accepted' ? 'text-[#4a9d6f]' : 'text-red-400'
                  }`}>
                    {r.status}
                  </span>
                </div>
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
                    onClick={() => handleAction(r.id, 'accept')}
                    disabled={actionLoading === r.id}
                    className="flex-1 py-2.5 bg-[#3d3530] text-white text-xs tracking-[0.1em] uppercase rounded-full disabled:opacity-50 hover:enabled:bg-[#2a2320] transition-colors"
                  >
                    {actionLoading === r.id ? '…' : 'Accept'}
                  </button>
                  <button
                    onClick={() => handleAction(r.id, 'decline')}
                    disabled={actionLoading === r.id}
                    className="flex-1 py-2.5 border border-[#e3e2de] text-[#6b5f58] text-xs tracking-[0.1em] uppercase rounded-full disabled:opacity-50 hover:enabled:bg-[#f6f2ec] transition-colors"
                  >
                    {actionLoading === r.id ? '…' : 'Decline'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
