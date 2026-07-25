import { ChevronLeft, Clock } from 'lucide-react'
import type { BookingItem } from '../../../types/booking'
import { formatDate } from '../../../lib/utils'
import { formatDuration } from '../../../lib/catalog'
import { basketTotals, formatMoney } from '../../../lib/pricing'

interface DrawerConfirmProps {
  items: BookingItem[]
  totalMinutes: number
  selectedDate: string
  selectedTime: string
  confirmLoading: boolean
  onBack: () => void
  onConfirm: () => void
}

export default function DrawerConfirm({
  items,
  totalMinutes,
  selectedDate,
  selectedTime,
  confirmLoading,
  onBack,
  onConfirm,
}: DrawerConfirmProps) {
  const { prefix, subtotal, tax, total } = basketTotals(items)

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
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a] mb-2">
            {items.length === 1 ? 'Service' : `${items.length} services`}
          </p>
          <ul className="space-y-2.5">
            {items.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#3d3530] leading-snug">{item.service.name}</p>
                  <p className="text-xs text-[#a0948a] leading-snug mt-0.5">{item.tier.label}</p>
                </div>
                <p className="text-sm text-[#3d3530] whitespace-nowrap">{item.tier.price}</p>
              </li>
            ))}
          </ul>
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
          {totalMinutes > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a] mb-0.5">Duration</p>
              <p className="flex items-center gap-1 text-sm text-[#3d3530]">
                <Clock size={11} className="text-[#a0948a]" />
                {formatDuration(totalMinutes * 60000)}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#f6f2ec] rounded-2xl p-5 mb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#a0948a] mb-3">Price Summary</p>

        <div className="flex items-center justify-between mb-1">
          <p className="text-sm text-[#3d3530]">Subtotal</p>
          <p className="text-sm text-[#3d3530]">{formatMoney(prefix, subtotal)}</p>
        </div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-[#3d3530]">Taxes</p>
          <p className="text-sm text-[#3d3530]">{formatMoney(prefix, tax)}</p>
        </div>

        <div className="border-t border-[#e3e2de] mb-3" />

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-[#3d3530]">Total</p>
          <p className="text-sm font-semibold text-[#3d3530]">{formatMoney(prefix, total)}</p>
        </div>

        <div className="border-t border-[#e3e2de] mb-3" />

        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-[#3d3530]">Due today</p>
          <p className="text-sm font-semibold text-[#3d3530]">{formatMoney(prefix, 0)}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#a0948a]">Due at appointment</p>
          <p className="text-xs text-[#a0948a]">{formatMoney(prefix, total)}</p>
        </div>
      </div>

      <p className="text-[11px] text-[#a0948a] leading-relaxed mb-6">
        Payment is collected at your appointment. Your card on file may be charged in the event of a late cancellation or no-show. Taxes shown are an estimate.
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
