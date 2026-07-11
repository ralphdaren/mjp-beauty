import { Loader2 } from 'lucide-react'
import type { TrainingDate } from '../../../lib/shopify'
import type { TrainingOption } from '../../../types/training'
import { formatDate } from '../../../lib/utils'

interface DrawerStep1Props {
  selectedOption: TrainingOption
  trainingDates: TrainingDate[]
  datesLoading: boolean
  selectedDate: TrainingDate | null
  onSelectDate: (date: TrainingDate) => void
  onContinue: () => void
}

export default function DrawerStep1({
  selectedOption,
  trainingDates,
  datesLoading,
  selectedDate,
  onSelectDate,
  onContinue,
}: DrawerStep1Props) {
  return (
    <div>
      <div className="mb-5">
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#a0948a] mb-0.5">{selectedOption.price} CAD</p>
        <h3 className="text-base font-semibold text-[#3d3530]">{selectedOption.title}</h3>
      </div>

      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a0948a] mb-3">Choose a training date</p>

      {datesLoading ? (
        <div className="flex items-center justify-center py-12 text-[#a0948a]">
          <Loader2 size={20} className="animate-spin" />
        </div>
      ) : trainingDates.length === 0 ? (
        <p className="text-sm text-[#a0948a] text-center py-8">No upcoming dates available. Please check back soon.</p>
      ) : (
        <div className="space-y-2 mb-6">
          {trainingDates.map((date) => {
            const isSelected = selectedDate?.id === date.id
            const isFull = date.spotsRemaining <= 0
            return (
              <button
                key={date.id}
                disabled={isFull}
                onClick={() => onSelectDate(date)}
                className={`w-full text-left flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-[#3d3530] bg-[#f6f2ec]'
                    : 'border-[#e3e2de] hover:border-[#c0b4ac] hover:bg-[#fdf9f6]'
                } ${isFull ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#3d3530]">{formatDate(date.date)}</p>
                  <p className="text-xs text-[#a0948a]">{date.location}</p>
                </div>
                <span className={`text-[10px] uppercase tracking-[0.12em] shrink-0 ${isFull ? 'text-red-400' : 'text-[#827064]'}`}>
                  {isFull ? 'Full' : `${date.spotsRemaining} spots left`}
                </span>
              </button>
            )
          })}
        </div>
      )}

      <button
        disabled={!selectedDate}
        onClick={onContinue}
        className="w-full py-3.5 bg-[#3d3530] text-white text-xs tracking-[0.15em] uppercase rounded-full disabled:opacity-35 disabled:cursor-not-allowed hover:enabled:bg-[#2a2320] active:enabled:scale-[0.98] transition-all"
      >
        Continue
      </button>
    </div>
  )
}
