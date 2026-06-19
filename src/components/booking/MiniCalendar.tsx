import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface MiniCalendarProps {
  selected: string | null
  availableDates: Set<string>
  datesLoading: boolean
  onSelect: (date: string) => void
  onMonthChange: (year: number, month: number) => void
}

function toKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function MiniCalendar({
  selected,
  availableDates,
  datesLoading,
  onSelect,
  onMonthChange,
}: MiniCalendarProps) {
  const todayDate = new Date()
  todayDate.setHours(0, 0, 0, 0)
  const todayKey = toKey(todayDate)

  const [viewYear, setViewYear] = useState(todayDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(todayDate.getMonth())

  const firstDay  = new Date(viewYear, viewMonth, 1)
  const lastDate  = new Date(viewYear, viewMonth + 1, 0).getDate()
  const startDow  = firstDay.getDay()
  const monthLabel = firstDay.toLocaleString('en-US', { month: 'long', year: 'numeric' })

  function prevMonth() {
    const newYear  = viewMonth === 0 ? viewYear - 1 : viewYear
    const newMonth = viewMonth === 0 ? 11 : viewMonth - 1
    setViewYear(newYear)
    setViewMonth(newMonth)
    onMonthChange(newYear, newMonth)
  }

  function nextMonth() {
    const newYear  = viewMonth === 11 ? viewYear + 1 : viewYear
    const newMonth = viewMonth === 11 ? 0 : viewMonth + 1
    setViewYear(newYear)
    setViewMonth(newMonth)
    onMonthChange(newYear, newMonth)
  }

  const cells: Array<{ date: Date; key: string } | null> = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= lastDate; d++) {
    const date = new Date(viewYear, viewMonth, d)
    cells.push({ date, key: toKey(date) })
  }

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="p-1 rounded-md hover:bg-[#f0ece6] text-[#827064] transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-xs font-semibold text-[#3d3530]">{monthLabel}</span>
        <button
          onClick={nextMonth}
          className="p-1 rounded-md hover:bg-[#f0ece6] text-[#827064] transition-colors"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="text-center text-[10px] text-[#a0948a] font-medium py-0.5">{d}</div>
        ))}
      </div>

      <div className={`grid grid-cols-7 gap-y-0.5 transition-opacity duration-200 ${datesLoading ? 'opacity-40' : 'opacity-100'}`}>
        {cells.map((cell, i) => {
          if (!cell) return <div key={`e-${i}`} />
          const { date, key } = cell
          const isPast        = date < todayDate
          const isAvailable   = !isPast && availableDates.has(key)
          const isSelected    = selected === key
          const isToday       = key === todayKey

          return (
            <button
              key={key}
              disabled={!isAvailable}
              onClick={() => onSelect(key)}
              className={[
                'mx-auto flex items-center justify-center w-7 h-7 rounded-full text-xs transition-all duration-150',
                isSelected
                  ? 'bg-[#3d3530] text-white font-semibold'
                  : isAvailable
                  ? 'text-[#3d3530] hover:bg-[#ede8e0] cursor-pointer'
                  : 'text-[#d0c4bc] cursor-not-allowed',
                isToday && !isSelected ? 'ring-1 ring-[#827064]' : '',
              ].join(' ')}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}
