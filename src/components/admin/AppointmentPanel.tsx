import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { TIMEZONE } from './adminFormat'
import {
  SOURCE_LABEL,
  displayServiceName,
  formatDuration,
  formatMinuteOfDay,
  formatMoney,
  swatchStyle,
} from './calendarColors'
import { dayLabel } from './calendarDates'
import { fetchAppointment, UnauthorizedError } from './useBrowCalendar'
import { useClientHistory } from './useClientHistory'
import type { AppointmentDetail, CalendarBlock } from './calendarTypes'

interface AppointmentPanelProps {
  token: string
  block: CalendarBlock
  onClose: () => void
  onUnauthorized: () => void
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 mt-6 text-[10px] uppercase tracking-[0.2em] text-[#a0948a]">{children}</p>
}

function Bar({ w }: { w: string }) {
  return <div className={`h-3 ${w} animate-pulse rounded-full bg-[#ece7e0]`} />
}

export default function AppointmentPanel({ token, block, onClose, onUnauthorized }: AppointmentPanelProps) {
  const [detail, setDetail] = useState<AppointmentDetail | null>(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const history = useClientHistory(token, block.customerId)

  useEffect(() => {
    let cancelled = false
    fetchAppointment(token, block.id)
      .then((d) => !cancelled && setDetail(d))
      .catch((err) => {
        if (err instanceof UnauthorizedError) return onUnauthorized()
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      })
    return () => {
      cancelled = true
    }
  }, [token, block.id, onUnauthorized, attempt])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const endMinute = block.startMinute + block.durationMinutes
  const taxRates = detail
    ? [...new Set(detail.services.flatMap((s) => s.taxPercents))].map((p) => `${p}%`).join(' + ')
    : ''
  const notes = detail ? [
    detail.customerNote && { label: 'From client', text: detail.customerNote },
    detail.customer?.note && { label: 'Client profile', text: detail.customer.note },
  ].filter((n): n is { label: string; text: string } => !!n) : []

  return (
    <>
      <div onClick={onClose} aria-hidden="true" className="fixed inset-0 z-40 bg-[#3d3530]/30" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Appointment details"
        className="fixed inset-0 z-50 overflow-y-auto bg-white px-5 pb-10 pt-5 text-[#3d3530] shadow-xl lg:inset-y-0 lg:left-auto lg:w-[380px]"
      >
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full bg-[#f6ebe0] px-2.5 py-1 text-[10px] font-semibold text-[#b07d4e]">
            {SOURCE_LABEL[block.source]}
          </span>
          <button onClick={onClose} className="text-[#a0948a] transition-colors hover:text-[#3d3530]" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="mt-3 space-y-1">
          {detail ? (
            <>
              <p className="text-lg font-semibold">{detail.customer?.name || 'No client on file'}</p>
              {detail.customer && (
                <p className="break-words text-sm text-[#6b5f58]">
                  {[detail.customer.phone, detail.customer.email].filter(Boolean).join(' · ')}
                </p>
              )}
            </>
          ) : error ? (
            <p className="text-sm text-red-500">
              {error}{' '}
              <button
                onClick={() => {
                  setError('')
                  setAttempt((n) => n + 1)
                }}
                className="text-[#b07d4e] underline"
              >
                Retry
              </button>
            </p>
          ) : (
            <div className="space-y-2 pt-1">
              <Bar w="w-40" />
              <Bar w="w-56" />
            </div>
          )}
        </div>

        <SectionLabel>Appointment</SectionLabel>
        <p className="text-sm font-semibold">
          {dayLabel(block.dateKey, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          <span className="font-normal">
            {' '}
            · {formatMinuteOfDay(block.startMinute)} to {formatMinuteOfDay(endMinute)}
          </span>
        </p>
        <p className="text-sm text-[#6b5f58]">
          {[
            detail?.teamMemberName && `With ${detail.teamMemberName}`,
            formatDuration(block.durationMinutes),
            detail &&
              `Booked ${new Date(detail.bookedAt).toLocaleDateString('en-CA', {
                timeZone: TIMEZONE,
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}`,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>

        <SectionLabel>Services</SectionLabel>
        {detail ? (
          <div className="text-sm">
            {detail.services.map((s, i) => (
              <div key={i} className="flex items-start justify-between gap-3 py-1">
                <span className="flex min-w-0 items-start gap-2">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={swatchStyle(s.colorKey)} />
                  <span>
                    {displayServiceName(s.serviceName)}
                    {s.variationName && <span className="block text-xs text-[#6b5f58]">{s.variationName}</span>}
                  </span>
                </span>
                <span className="shrink-0">{s.priceCents != null ? formatMoney(s.priceCents) : 'n/a'}</span>
              </div>
            ))}
            <div className="mt-2 space-y-1 border-t border-[#ece7e0] pt-2 text-[#6b5f58]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatMoney(detail.totals.subtotalCents)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax{taxRates && ` (${taxRates})`}</span>
                <span>{formatMoney(detail.totals.taxCents)}</span>
              </div>
              <div className="flex justify-between pt-1 font-semibold text-[#3d3530]">
                <span>Total</span>
                <span>{formatMoney(detail.totals.totalCents)}</span>
              </div>
            </div>
          </div>
        ) : (
          !error && (
            <div className="space-y-2">
              <Bar w="w-full" />
              <Bar w="w-2/3" />
            </div>
          )
        )}

        {notes.length > 0 && (
          <>
            <SectionLabel>Notes</SectionLabel>
            <div className="space-y-2 rounded-xl bg-[#faf8f5] px-3 py-2.5 text-sm text-[#6b5f58]">
              {notes.map((n) => (
                <p key={n.label} className="whitespace-pre-line">
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#a0948a]">{n.label}</span>
                  {n.text}
                </p>
              ))}
            </div>
          </>
        )}

        {block.customerId && (
          <>
            <SectionLabel>
              Appointment history{history.entries.length > 0 && ` · ${history.entries.length}`}
            </SectionLabel>
            <div className="text-sm">
              {history.entries.map((h) => (
                <div
                  key={h.id}
                  className={`flex justify-between gap-3 border-b border-[#f1ede8] py-2 ${h.id === block.id ? 'font-semibold' : ''}`}
                >
                  <span className="min-w-0">
                    <span className="block">
                      {dayLabel(h.dateKey, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="block truncate text-xs text-[#6b5f58]">
                      {h.serviceNames.map(displayServiceName).join(' + ')}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-[#6b5f58]">{h.status}</span>
                </div>
              ))}
              {history.loadingOlder && <p className="pt-2 text-xs text-[#a0948a]">Loading older appointments…</p>}
              {history.failed && !history.loadingOlder && (
                <button onClick={history.retry} className="pt-2 text-left text-xs text-[#b07d4e] underline">
                  Some older appointments couldn't load. Retry
                </button>
              )}
              {!history.loadingOlder && !history.failed && history.entries.length === 0 && (
                <p className="text-xs text-[#a0948a]">No appointments found.</p>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  )
}
