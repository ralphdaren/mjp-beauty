import { ChevronLeft } from 'lucide-react'
import type { Service, PriceTier } from '../../../types/booking'
import { formatDate } from '../../../lib/utils'

interface DrawerStep4Props {
  selectedService: Service
  selectedTier: PriceTier
  selectedDate: string
  selectedTime: string
  confirmLoading: boolean
  onBack: () => void
  onConfirm: () => void
}

export default function DrawerStep4({
  selectedService,
  selectedTier,
  selectedDate,
  selectedTime,
  confirmLoading,
  onBack,
  onConfirm,
}: DrawerStep4Props) {
  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-xs text-[#827064] hover:text-[#3d3530] transition-colors mb-5"
      >
        <ChevronLeft size={13} />
        Back
      </button>

      <p className="text-sm font-medium text-[#3d3530] mb-5">Review your appointment</p>

      <div className="bg-[#f6f2ec] rounded-2xl p-5 space-y-4 mb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a] mb-0.5">Service</p>
          <p className="text-sm font-medium text-[#3d3530]">{selectedService.name}</p>
        </div>
        <div className="border-t border-[#e3e2de]" />
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a] mb-0.5">Option</p>
          <p className="text-sm text-[#3d3530] leading-snug">{selectedTier.label}</p>
        </div>
        <div className="border-t border-[#e3e2de]" />
        <div className="flex gap-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a] mb-0.5">Date</p>
            <p className="text-sm text-[#3d3530]">{formatDate(selectedDate)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a] mb-0.5">Time</p>
            <p className="text-sm text-[#3d3530]">{selectedTime}</p>
          </div>
        </div>
        <div className="border-t border-[#e3e2de]" />
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a]">Price</p>
          <p className="text-base font-semibold text-[#3d3530]">{selectedTier.price}</p>
        </div>
      </div>

      <p className="text-[11px] text-[#a0948a] leading-relaxed mb-6">
        Payment is collected at your appointment. Your card on file may be charged in the event of a late cancellation or no-show.
      </p>

      <button
        onClick={onConfirm}
        disabled={confirmLoading}
        className="w-full py-3.5 bg-[#3d3530] text-white text-xs tracking-[0.15em] uppercase rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-[#2a2320] active:enabled:scale-[0.98] transition-all"
      >
        {confirmLoading ? 'Booking…' : 'Book Appointment'}
      </button>
    </div>
  )
}
