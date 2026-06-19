import { ChevronLeft, Clock } from 'lucide-react'
import type { Service, PriceTier, Slot } from '../../../types/booking'
import { formatDate } from '../../../lib/utils'
import MiniCalendar from '../MiniCalendar'

interface DrawerStep2Props {
  selectedService: Service
  selectedTier: PriceTier | null
  selectedDate: string | null
  selectedTime: string | null
  slots: Slot[] | null
  slotsLoading: boolean
  slotsError: string | null
  availableDates: Set<string>
  datesLoading: boolean
  onSelectTier: (tier: PriceTier) => void
  onSelectDate: (date: string) => void
  onSelectSlot: (slot: Slot) => void
  onMonthChange: (year: number, month: number) => void
  onBack: () => void
  onContinue: () => void
}

export default function DrawerStep2({
  selectedService,
  selectedTier,
  selectedDate,
  selectedTime,
  slots,
  slotsLoading,
  slotsError,
  availableDates,
  datesLoading,
  onSelectTier,
  onSelectDate,
  onSelectSlot,
  onMonthChange,
  onBack,
  onContinue,
}: DrawerStep2Props) {
  const canContinue = !!selectedTier && !!selectedDate && !!selectedTime

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-xs text-[#827064] hover:text-[#3d3530] transition-colors mb-5"
      >
        <ChevronLeft size={13} />
        Back
      </button>

      <div className="mb-5">
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#a0948a] mb-0.5">{selectedService.tagline}</p>
        <h3 className="text-base font-semibold text-[#3d3530]">{selectedService.name}</h3>
      </div>

      {/* Tier options */}
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a0948a] mb-3">Choose an option</p>
      <div className="space-y-2 mb-6">
        {selectedService.tiers.map((tier) => {
          const isSelected = selectedTier?.label === tier.label
          return (
            <button
              key={tier.label}
              onClick={() => onSelectTier(tier)}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                isSelected
                  ? 'border-[#3d3530] bg-[#f6f2ec]'
                  : 'border-[#e3e2de] hover:border-[#c0b4ac] hover:bg-[#fdf9f6]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  isSelected ? 'border-[#3d3530]' : 'border-[#c0b4ac]'
                }`}
              >
                {isSelected && <div className="w-2 h-2 rounded-full bg-[#3d3530]" />}
              </div>
              <span className="flex-1 text-sm text-[#3d3530] leading-snug">{tier.label}</span>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-[#3d3530]">{tier.price}</p>
                {tier.duration && (
                  <p className="flex items-center gap-0.5 text-[10px] text-[#a0948a] justify-end">
                    <Clock size={9} />
                    {tier.duration}
                  </p>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <div className="border-t border-[#e3e2de] mb-6" />

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
      {selectedDate && selectedTier && (
        <div className="mt-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a0948a] mb-3">
            Available times — {formatDate(selectedDate)}
          </p>
          {slotsLoading ? (
            <p className="text-sm text-[#a0948a] text-center py-4">Checking availability…</p>
          ) : slotsError ? (
            <p className="text-sm text-red-400 text-center py-4">Could not load times. Please try again.</p>
          ) : !slots || slots.length === 0 ? (
            <p className="text-sm text-[#a0948a] text-center py-4">No availability on this date.</p>
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
