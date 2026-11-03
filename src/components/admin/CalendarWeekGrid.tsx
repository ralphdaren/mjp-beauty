import { dayLabel, hourBounds, layoutDay } from './calendarDates'
import { SERVICE_STYLE, displayServiceName, formatMinuteOfDay } from './calendarColors'
import type { CalendarBlock } from './calendarTypes'

const HOUR_PX = 56

export function BlockLabel({ block, compact }: { block: CalendarBlock; compact?: boolean }) {
  const [first, ...rest] = block.services
  const name = first ? displayServiceName(first.serviceName) : 'Appointment'
  return (
    <>
      <span className="block truncate font-semibold">
        {name}
        {rest.length > 0 && <span className="font-normal opacity-70"> +{rest.length}</span>}
      </span>
      {!compact && block.customerName && <span className="block truncate">{block.customerName}</span>}
    </>
  )
}

interface CalendarWeekGridProps {
  days: string[]
  blocks: CalendarBlock[]
  today: string
  onSelect: (block: CalendarBlock) => void
}

export default function CalendarWeekGrid({ days, blocks, today, onSelect }: CalendarWeekGridProps) {
  const { startHour, endHour } = hourBounds(blocks)
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i)
  const height = hours.length * HOUR_PX

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
      <div className="grid min-w-[720px]" style={{ gridTemplateColumns: `48px repeat(${days.length}, minmax(0, 1fr))` }}>
        <div className="border-b border-[#ece7e0]" />
        {days.map((d) => (
          <div
            key={d}
            className={`border-b border-l border-[#ece7e0] px-2 py-3 text-center text-xs ${
              d === today ? 'font-semibold text-[#3d3530]' : 'text-[#6b5f58]'
            }`}
          >
            <span className="block text-[10px] uppercase tracking-[0.15em] text-[#a0948a]">
              {dayLabel(d, { weekday: 'short' })}
            </span>
            <span
              className={`mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full ${
                d === today ? 'bg-[#3d3530] text-white' : ''
              }`}
            >
              {dayLabel(d, { day: 'numeric' })}
            </span>
          </div>
        ))}

        <div className="relative" style={{ height }}>
          {hours.map((h, i) => (
            <span key={h} className="absolute right-2 -translate-y-1/2 text-[10px] text-[#a0948a]" style={{ top: i * HOUR_PX }}>
              {i === 0 ? '' : formatMinuteOfDay(h * 60)}
            </span>
          ))}
        </div>

        {days.map((d) => (
          <div
            key={d}
            className={`relative border-l border-[#ece7e0] ${d === today ? 'bg-[#faf8f5]' : ''}`}
            style={{ height }}
          >
            {hours.map((h, i) => (
              <div key={h} className="absolute inset-x-0 border-t border-[#f1ede8]" style={{ top: i * HOUR_PX }} />
            ))}
            {layoutDay(blocks.filter((b) => b.dateKey === d)).map(({ block, lane, lanes }) => {
              const top = ((block.startMinute - startHour * 60) / 60) * HOUR_PX
              const blockHeight = Math.max((block.durationMinutes / 60) * HOUR_PX, 22)
              const style = SERVICE_STYLE[block.services[0]?.colorKey ?? 'other'].style
              return (
                <button
                  key={block.id}
                  onClick={() => onSelect(block)}
                  title={`${formatMinuteOfDay(block.startMinute)} ${block.services.map((s) => displayServiceName(s.serviceName)).join(' + ')}${block.customerName ? `, ${block.customerName}` : ''}`}
                  className="absolute overflow-hidden rounded-md border-l-[3px] px-1.5 py-1 text-left text-[11px] leading-tight text-[#3d3530] transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-[#3d3530]"
                  style={{
                    ...style,
                    top,
                    height: blockHeight,
                    left: `calc(${(lane / lanes) * 100}% + 2px)`,
                    width: `calc(${100 / lanes}% - 4px)`,
                  }}
                >
                  {blockHeight >= 44 && (
                    <span className="block text-[10px] opacity-70">{formatMinuteOfDay(block.startMinute)}</span>
                  )}
                  <BlockLabel block={block} compact={blockHeight < 44} />
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
