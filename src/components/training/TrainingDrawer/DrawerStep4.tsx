import { ChevronLeft, Clock } from 'lucide-react'
import type { TrainingDate } from '../../../lib/training'
import type { TrainingOption, DepositPaymentMethod } from '../../../types/training'
import type { TrainingDetails } from '../../../hooks/useTrainingBookingState'
import { formatDate } from '../../../lib/utils'

interface DrawerStep4Props {
  selectedOption: TrainingOption
  selectedDate: TrainingDate | null
  paymentMethod: DepositPaymentMethod | null
  details: TrainingDetails
  submitting: boolean
  submitError: string
  onBack: () => void
  onSubmit: () => void
}

const PAYMENT_LABELS: Record<DepositPaymentMethod, string> = {
  'e-transfer': 'E-Transfer',
  'credit-card': 'Credit Card',
}

export default function DrawerStep4({
  selectedOption,
  selectedDate,
  paymentMethod,
  details,
  submitting,
  submitError,
  onBack,
  onSubmit,
}: DrawerStep4Props) {
  const fullName = `${details.firstName} ${details.lastName}`.trim()

  return (
    <div>
      <button
        onClick={onBack}
        disabled={submitting}
        className="flex items-center gap-1 text-xs text-[#827064] hover:text-[#3d3530] transition-colors mb-5 disabled:opacity-40"
      >
        <ChevronLeft size={13} />
        Back
      </button>

      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a0948a] mb-4">Confirm Your Reservation</p>

      <div className="bg-[#f6f2ec] rounded-2xl p-5 text-left space-y-4 mb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a] mb-0.5">Training</p>
          <p className="text-sm font-medium text-[#3d3530]">{selectedOption.title} — {selectedOption.price} CAD</p>
        </div>
        <div className="border-t border-[#e3e2de]" />
        <div className="flex gap-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a] mb-0.5">Date</p>
            <p className="text-sm text-[#3d3530]">{selectedDate ? formatDate(selectedDate.date) : ''}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a] mb-0.5">Location</p>
            <p className="text-sm text-[#3d3530]">{selectedDate?.location}</p>
          </div>
        </div>
        <div className="border-t border-[#e3e2de]" />
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a] mb-0.5">Name</p>
          <p className="text-sm text-[#3d3530]">{fullName}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a] mb-0.5">Email</p>
          <p className="text-sm text-[#3d3530] break-all">{details.email}</p>
        </div>
        <div className="border-t border-[#e3e2de]" />
        <div className="flex justify-between items-baseline">
          <span className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a]">Deposit</span>
          <span className="text-sm font-semibold text-[#3d3530]">
            $500 CAD via {paymentMethod ? PAYMENT_LABELS[paymentMethod] : ''}
          </span>
        </div>
      </div>

      {/* Hold notice */}
      <div className="flex items-start gap-2.5 bg-[#fdf8f3] border border-[#e8ddd4] rounded-xl px-4 py-3 mb-5">
        <Clock size={15} className="text-[#a58a72] shrink-0 mt-0.5" />
        <p className="text-[11px] text-[#6b5f58] leading-relaxed">
          We'll hold your spot for <span className="font-medium text-[#3d3530]">48 hours</span>. Micah will reach out with your invoice and deposit instructions to lock it in. If the deposit isn't received in time, the spot is released.
        </p>
      </div>

      {submitError && <p className="text-xs text-red-500 mb-3 text-center">{submitError}</p>}

      <button
        disabled={submitting}
        onClick={onSubmit}
        className="w-full py-3.5 bg-[#3d3530] text-white text-xs tracking-[0.15em] uppercase rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-[#2a2320] active:enabled:scale-[0.98] transition-all"
      >
        {submitting ? 'Reserving your spot…' : 'Reserve My Spot'}
      </button>
    </div>
  )
}
