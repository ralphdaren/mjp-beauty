import { ChevronLeft, Clock } from 'lucide-react'
import type { BookingItem, Slot } from '../../../types/booking'
import { formatDate } from '../../../lib/utils'
import { formatDuration } from '../../../lib/catalog'
import MiniCalendar from '../MiniCalendar'

interface DrawerDateTimeProps {
  items: BookingItem[]
  totalMinutes: number
  selectedDate: string | null
  selectedTime: string | null
  slots: Slot[] | null
  slotsLoading: boolean
  slotsError: string | null
  availableDates: Set<string>
  datesLoading: boolean
  onSelectDate: (date: string) => void
  onSelectSlot: (slot: Slot) => void
  onMonthChange: (year: number, month: number) => void
  onBack: () => void
  onContinue: () => void
}

export default function DrawerDateTime({
  items,
  totalMinutes,
  selectedDate,
  selectedTime,
  slots,
  slotsLoading,
  slotsError,
  availableDates,
  datesLoading,
  onSelectDate,
  onSelectSlot,
  onMonthChange,
  onBack,
  onContinue,
}: DrawerDateTimeProps) {
  const canContinue = !!selectedDate && !!selectedTime

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-xs text-[#827064] hover:text-[#3d3530] transition-colors mb-5"
      >
        <ChevronLeft size={13} />
        Back
      </button>

      {/* What we're finding time for */}
      <div className="mb-6 rounded-xl bg-[#f6f2ec] px-4 py-3">
        <p className="text-sm text-[#3d3530] leading-snug">
          {items.map((item) => item.service.name).join(' + ')}
        </p>
        {totalMinutes > 0 && (
          <p className="flex items-center gap-1 text-[11px] text-[#a0948a] mt-1">
            <Clock size={10} />
            {formatDuration(totalMinutes * 60000)} total
          </p>
        )}
      </div>

      {/* Calendar */}
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a0948a] mb-4">Pick a date</p>
      <MiniCalendar
        selected={selectedDate}
        availableDates={availableDates}
        datesLoading={datesLoading}
        onSelect={onSelectDate}
        onMonthChange={onMonthChange}
      />

      {/* Time slots */}
      {selectedDate && (
        <div className="mt-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a0948a] mb-3">
            Available times — {formatDate(selectedDate)}
          </p>
          {slotsLoading ? (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-9 rounded-lg bg-[#f6f2ec] animate-pulse" />
              ))}
            </div>
          ) : slotsError ? (
            <p className="text-sm text-red-400 text-center py-4">Could not load times. Please try again.</p>
          ) : !slots || slots.length === 0 ? (
            <p className="text-sm text-[#a0948a] text-center py-4">
              {items.length > 1
                ? 'No opening long enough for all these services on this date.'
                : 'No availability on this date.'}
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {slots.map((slot) => {
                const isSelected = selectedTime === slot.time
                return (
                  <button
                    key={slot.startAt}
                    onClick={() => onSelectSlot(slot)}
                    className={`py-2.5 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-[#3d3530] text-white border-[#3d3530]'
                        : 'text-[#3d3530] border-[#e3e2de] hover:border-[#827064] hover:bg-[#fdf9f6]'
                    }`}
                  >
                    {slot.time}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      <button
        disabled={!canContinue}
        onClick={onContinue}
        className="mt-8 w-full py-3.5 bg-[#3d3530] text-white text-xs tracking-[0.15em] uppercase rounded-full disabled:opacity-35 disabled:cursor-not-allowed hover:enabled:bg-[#2a2320] active:enabled:scale-[0.98] transition-all"
      >
        Continue
      </button>
    </div>
  )
}
