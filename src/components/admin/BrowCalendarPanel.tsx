import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { TIMEZONE } from './adminFormat'
import { addDays, dayLabel, rangeFor, todayKey, weekDays } from './calendarDates'
import { LEGEND_KEYS, SERVICE_STYLE, swatchStyle } from './calendarColors'
import CalendarWeekGrid from './CalendarWeekGrid'
import CalendarMonthGrid from './CalendarMonthGrid'
import CalendarDayList from './CalendarDayList'
import AppointmentPanel from './AppointmentPanel'
import type { BrowCalendar } from './useBrowCalendar'
import type { CalendarBlock, CalendarView } from './calendarTypes'

const VIEWS: Array<{ id: CalendarView; label: string }> = [
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
]

function rangeTitle(view: CalendarView, anchor: string, from: string, to: string): string {
  if (view === 'day') return dayLabel(anchor, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  if (view === 'month') return dayLabel(anchor, { month: 'long', year: 'numeric' })
  const last = addDays(to, -1)
  const sameMonth = from.slice(0, 7) === last.slice(0, 7)
  return `${dayLabel(from, { month: 'short', day: 'numeric' })} to ${dayLabel(last, {
    month: sameMonth ? undefined : 'short',
    day: 'numeric',
  })}, ${dayLabel(last, { year: 'numeric' })}`
}

interface BrowCalendarPanelProps {
  token: string
  calendar: BrowCalendar
  onUnauthorized: () => void
}

export default function BrowCalendarPanel({ token, calendar, onUnauthorized }: BrowCalendarPanelProps) {
  const [selected, setSelected] = useState<CalendarBlock | null>(null)
  const { view, anchor, blocks, loading, error, partial } = calendar
  const { from, to } = rangeFor(view, anchor)
  const [today] = useState(() => todayKey(TIMEZONE, Date.now()))

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 lg:px-6">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => calendar.shift(-1)}
            className="rounded-full p-2 text-[#6b5f58] transition-colors hover:bg-white hover:text-[#3d3530]"
            aria-label="Previous"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => calendar.shift(1)}
            className="rounded-full p-2 text-[#6b5f58] transition-colors hover:bg-white hover:text-[#3d3530]"
            aria-label="Next"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={calendar.goToday}
            className="ml-1 rounded-full border border-[#e3e2de] bg-white px-3.5 py-1.5 text-xs font-medium text-[#3d3530] transition-colors hover:border-[#3d3530]"
          >
            Today
          </button>
        </div>
        <p className="flex-1 text-sm font-semibold text-[#3d3530]">{rangeTitle(view, anchor, from, to)}</p>
        <div className="flex rounded-xl bg-[#ece7e0] p-0.5">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => calendar.setView(v.id)}
              aria-pressed={view === v.id}
              className={`rounded-[10px] px-3.5 py-1.5 text-xs transition-colors ${
                view === v.id ? 'bg-white font-semibold text-[#3d3530] shadow-sm' : 'text-[#6b5f58] hover:text-[#3d3530]'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-[#6b5f58]">
        {LEGEND_KEYS.map((k) => (
          <span key={k} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={swatchStyle(k)} />
            {SERVICE_STYLE[k].label}
          </span>
        ))}
      </div>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
      {partial && !error && (
        <p className="mb-4 rounded-xl bg-amber-50 px-4 py-2.5 text-xs text-amber-700">
          Some appointments couldn't load. Refresh to try again.
        </p>
      )}

      <div className={`transition-opacity ${loading ? 'pointer-events-none opacity-50' : ''}`} aria-busy={loading}>
        {view === 'week' && (
          <CalendarWeekGrid days={weekDays(from)} blocks={blocks} today={today} onSelect={setSelected} />
        )}
        {view === 'day' && <CalendarDayList blocks={blocks} onSelect={setSelected} />}
        {view === 'month' && (
          <CalendarMonthGrid
            from={from}
            month={anchor.slice(0, 7)}
            blocks={blocks}
            today={today}
            onSelectDay={(d) => {
              calendar.setAnchor(d)
              calendar.setView('day')
            }}
          />
        )}
      </div>

      {selected && (
        <AppointmentPanel
          key={selected.id}
          token={token}
          block={selected}
          onClose={() => setSelected(null)}
          onUnauthorized={onUnauthorized}
        />
      )}
    </div>
  )
}
