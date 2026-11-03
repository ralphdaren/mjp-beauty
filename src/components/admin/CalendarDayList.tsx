import { SERVICE_STYLE, SOURCE_LABEL, displayServiceName, formatDuration, formatMinuteOfDay } from './calendarColors'
import type { CalendarBlock } from './calendarTypes'

interface CalendarDayListProps {
  blocks: CalendarBlock[]
  onSelect: (block: CalendarBlock) => void
}

export default function CalendarDayList({ blocks, onSelect }: CalendarDayListProps) {
  if (blocks.length === 0) {
    return <div className="rounded-2xl bg-white py-16 text-center text-sm text-[#a0948a] shadow-sm">No appointments this day.</div>
  }

  return (
    <div className="space-y-2 rounded-2xl bg-white p-3 shadow-sm sm:p-4">
      {blocks.map((b) => (
        <button key={b.id} onClick={() => onSelect(b)} className="flex w-full items-stretch gap-3 text-left">
          <span className="w-16 shrink-0 pt-2.5 text-xs text-[#a0948a]">{formatMinuteOfDay(b.startMinute)}</span>
          <span
            className="flex-1 rounded-xl border-l-[3px] px-3 py-2.5 transition-shadow hover:shadow-md"
            style={SERVICE_STYLE[b.services[0]?.colorKey ?? 'other'].style}
          >
            <span className="block text-sm font-semibold text-[#3d3530]">
              {b.services.map((s) => displayServiceName(s.serviceName)).join(' + ') || 'Appointment'}
            </span>
            <span className="block text-xs text-[#6b5f58]">
              {[b.customerName ?? 'No client on file', formatDuration(b.durationMinutes), SOURCE_LABEL[b.source]].join(' · ')}
            </span>
          </span>
        </button>
      ))}
    </div>
  )
}
