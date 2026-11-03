import { addDays, dayLabel } from './calendarDates'
import { swatchStyle } from './calendarColors'
import type { CalendarBlock } from './calendarTypes'

const MAX_DOTS = 4
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface CalendarMonthGridProps {
  from: string
  month: string
  blocks: CalendarBlock[]
  today: string
  onSelectDay: (dateKey: string) => void
}

export default function CalendarMonthGrid({ from, month, blocks, today, onSelectDay }: CalendarMonthGridProps) {
  const days = Array.from({ length: 42 }, (_, i) => addDays(from, i))

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="grid grid-cols-7 border-b border-[#ece7e0]">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-2.5 text-center text-[10px] uppercase tracking-[0.15em] text-[#a0948a]">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((d) => {
          const dayBlocks = blocks.filter((b) => b.dateKey === d)
          const inMonth = d.startsWith(month)
          return (
            <button
              key={d}
              onClick={() => onSelectDay(d)}
              className={`min-h-[76px] border-b border-l border-[#f1ede8] p-1.5 text-left transition-colors hover:bg-[#faf8f5] sm:min-h-[92px] sm:p-2 ${
                inMonth ? '' : 'bg-[#fcfbf9] text-[#c4b9ae]'
              }`}
            >
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                  d === today ? 'bg-[#3d3530] font-semibold text-white' : inMonth ? 'text-[#3d3530]' : ''
                }`}
              >
                {dayLabel(d, { day: 'numeric' })}
              </span>
              {dayBlocks.length > 0 && (
                <>
                  <span className="mt-1 flex flex-wrap gap-0.5">
                    {dayBlocks.slice(0, MAX_DOTS).map((b) => (
                      <span
                        key={b.id}
                        className="h-1.5 w-3 rounded-full"
                        style={swatchStyle(b.services[0]?.colorKey ?? 'other')}
                      />
                    ))}
                    {dayBlocks.length > MAX_DOTS && (
                      <span className="text-[9px] leading-none text-[#a0948a]">+{dayBlocks.length - MAX_DOTS}</span>
                    )}
                  </span>
                  <span className="mt-1 block text-[10px] font-medium text-[#6b5f58]">
                    {dayBlocks.length} appt{dayBlocks.length === 1 ? '' : 's'}
                  </span>
                </>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
