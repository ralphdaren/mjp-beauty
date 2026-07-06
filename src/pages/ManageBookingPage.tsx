import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react'
import { SERVICES } from '../data/booking'

const CLIENT_TIMEZONE = 'America/Winnipeg'

interface ManageBookingData {
  status: 'pending' | 'accepted' | 'declined' | 'cancelled'
  serviceName: string
  tierLabel: string
  startAt: string
  firstName: string
}

function formatAppointment(startAt: string): string {
  return new Date(startAt).toLocaleString('en-CA', {
    timeZone: CLIENT_TIMEZONE,
    dateStyle: 'full',
    timeStyle: 'short',
  })
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-lg mx-auto my-16 px-6">
      <div className="bg-white border border-[#e3e2de] rounded-2xl p-8 shadow-sm">{children}</div>
    </div>
  )
}

export default function ManageBookingPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ManageBookingData | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [cancelled, setCancelled] = useState(false)

  useEffect(() => {
    if (!token) { setLoading(false); return }
    fetch(`/api/bookings/manage?token=${encodeURIComponent(token)}`)
      .then(async (r) => {
        if (!r.ok) { setNotFound(true); return }
        setData(await r.json())
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [token])

  async function handleCancel() {
    if (!token) return
    setActionLoading(true)
    try {
      const res = await fetch('/api/bookings/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'cancel' }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Failed to cancel request')
      setCancelled(true)
    } catch (err) {
      alert(String(err))
    } finally {
      setActionLoading(false)
    }
  }

  async function handleReschedule() {
    if (!token || !data) return
    setActionLoading(true)
    try {
      const res = await fetch('/api/bookings/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'cancel' }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Failed to reschedule request')

      const service = SERVICES.find((s) => s.name === data.serviceName)
      const params = new URLSearchParams()
      if (service) {
        params.set('reschedule', service.id)
        params.set('tier', data.tierLabel)
      }
      navigate(`/book-appointment${params.toString() ? `?${params.toString()}` : ''}`)
    } catch (err) {
      alert(String(err))
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <div className="space-y-3 animate-pulse">
          <div className="h-4 w-2/3 bg-[#ece7e0] rounded-full" />
          <div className="h-3 w-1/2 bg-[#ece7e0] rounded-full" />
          <div className="h-24 bg-[#f6f2ec] rounded-xl mt-4" />
        </div>
      </Card>
    )
  }

  if (!token || notFound) {
    return (
      <Card>
        <div className="flex flex-col items-center text-center gap-3">
          <AlertCircle className="text-[#a0948a]" size={32} />
          <h1 className="text-lg font-semibold text-[#3d3530]">Booking not found</h1>
          <p className="text-sm text-[#6b5f58]">
            {token ? "We couldn't find a booking request for this link." : 'This link is invalid.'}
          </p>
        </div>
      </Card>
    )
  }

  if (!data) return null

  if (cancelled) {
    return (
      <Card>
        <div className="flex flex-col items-center text-center gap-3">
          <CheckCircle2 className="text-[#4a9d6f]" size={32} />
          <h1 className="text-lg font-semibold text-[#3d3530]">Request cancelled</h1>
          <p className="text-sm text-[#6b5f58]">
            Your booking request has been cancelled. Feel free to submit a new one anytime.
          </p>
        </div>
      </Card>
    )
  }

  if (data.status !== 'pending') {
    const messages: Record<string, { icon: React.ReactNode; title: string; body: string }> = {
      accepted: {
        icon: <CheckCircle2 className="text-[#4a9d6f]" size={32} />,
        title: 'Already confirmed',
        body: 'This request has already been accepted — check your email for confirmation details.',
      },
      declined: {
        icon: <XCircle className="text-red-400" size={32} />,
        title: 'Already declined',
        body: 'This request has already been declined. Feel free to submit a new booking anytime.',
      },
      cancelled: {
        icon: <XCircle className="text-[#a0948a]" size={32} />,
        title: 'Already cancelled',
        body: 'This request has already been cancelled.',
      },
    }
    const m = messages[data.status]
    return (
      <Card>
        <div className="flex flex-col items-center text-center gap-3">
          {m.icon}
          <h1 className="text-lg font-semibold text-[#3d3530]">{m.title}</h1>
          <p className="text-sm text-[#6b5f58]">{m.body}</p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <p className="text-[10px] tracking-[0.2em] uppercase text-[#a0948a] mb-1">Manage booking</p>
      <h1 className="text-lg font-semibold text-[#3d3530] mb-4">Hi {data.firstName},</h1>

      <div className="bg-[#f6f2ec] rounded-xl p-4 space-y-2 mb-6">
        <p className="text-sm text-[#3d3530]"><strong>{data.serviceName}</strong> — {data.tierLabel}</p>
        <p className="flex items-center gap-1.5 text-sm text-[#6b5f58]">
          <Clock size={13} />
          {formatAppointment(data.startAt)}
        </p>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.08em] bg-amber-50 text-amber-600">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Pending review
        </span>
      </div>

      <p className="text-sm text-[#6b5f58] mb-5">
        Need to change something before we review your request? You can reschedule or cancel below.
      </p>

      <div className="flex gap-2">
        <button
          disabled={actionLoading}
          onClick={handleReschedule}
          className="flex-1 py-3 bg-[#3d3530] text-white text-xs tracking-[0.15em] uppercase rounded-full disabled:opacity-50 hover:enabled:bg-[#2a2320] transition-colors"
        >
          Reschedule
        </button>
        <button
          disabled={actionLoading}
          onClick={handleCancel}
          className="flex-1 py-3 border border-[#e3e2de] text-[#3d3530] text-xs tracking-[0.15em] uppercase rounded-full disabled:opacity-50 hover:enabled:border-[#c0b4ac] hover:enabled:bg-[#fdf9f6] transition-colors"
        >
          Cancel request
        </button>
      </div>
    </Card>
  )
}
