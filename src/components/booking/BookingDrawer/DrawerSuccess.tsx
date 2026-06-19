import { CheckCircle2 } from 'lucide-react'
import type { Service, PriceTier } from '../../../types/booking'
import { formatDate } from '../../../lib/utils'

interface DrawerSuccessProps {
  selectedService: Service | null
  selectedTier: PriceTier | null
  selectedDate: string | null
  selectedTime: string | null
  onClose: () => void
}

export default function DrawerSuccess({
  selectedService,
  selectedTier,
  selectedDate,
  selectedTime,
  onClose,
}: DrawerSuccessProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 text-center overflow-y-auto">
      <div className="w-16 h-16 bg-[#f0f7f2] rounded-full flex items-center justify-center mb-5">
        <CheckCircle2 size={32} className="text-[#4a9d6f]" />
      </div>
      <h2 className="text-xl font-semibold text-[#3d3530] mb-2">You're all booked!</h2>
      <p className="text-sm text-[#6b5f58] leading-relaxed mb-8">
        Your appointment request has been received. Check your email and phone — you'll receive a confirmation with all your appointment details shortly.
      </p>

      <div className="bg-[#f6f2ec] rounded-2xl p-5 w-full text-left space-y-4 mb-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a] mb-0.5">Service</p>
          <p className="text-sm font-medium text-[#3d3530]">{selectedService?.name}</p>
        </div>
        <div className="border-t border-[#e3e2de]" />
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a] mb-0.5">Option</p>
          <p className="text-sm text-[#3d3530] leading-snug">{selectedTier?.label}</p>
        </div>
        <div className="border-t border-[#e3e2de]" />
        <div className="flex gap-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a] mb-0.5">Date</p>
            <p className="text-sm text-[#3d3530]">{selectedDate ? formatDate(selectedDate) : ''}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a] mb-0.5">Time</p>
            <p className="text-sm text-[#3d3530]">{selectedTime}</p>
          </div>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full py-3.5 bg-[#3d3530] text-white text-xs tracking-[0.15em] uppercase rounded-full hover:bg-[#2a2320] active:scale-[0.98] transition-all"
      >
        Done
      </button>
    </div>
  )
}
