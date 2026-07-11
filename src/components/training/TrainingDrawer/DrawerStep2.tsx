import { ChevronLeft, Landmark, CreditCard } from 'lucide-react'
import type { DepositPaymentMethod } from '../../../types/training'

interface DrawerStep2Props {
  paymentMethod: DepositPaymentMethod | null
  onSelectPaymentMethod: (method: DepositPaymentMethod) => void
  onBack: () => void
  onContinue: () => void
}

const PAYMENT_METHODS: { id: DepositPaymentMethod; label: string; desc: string; Icon: typeof Landmark }[] = [
  { id: 'e-transfer', label: 'E-Transfer', desc: 'Pay via Interac e-Transfer', Icon: Landmark },
  { id: 'credit-card', label: 'Credit Card', desc: 'Pay securely by card', Icon: CreditCard },
]

export default function DrawerStep2({
  paymentMethod,
  onSelectPaymentMethod,
  onBack,
  onContinue,
}: DrawerStep2Props) {
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
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#a0948a] mb-0.5">Secure Your Spot</p>
        <h3 className="text-base font-semibold text-[#3d3530]">$500 CAD Deposit</h3>
      </div>

      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a0948a] mb-3">Choose a payment method</p>

      <div className="space-y-2 mb-6">
        {PAYMENT_METHODS.map(({ id, label, desc, Icon }) => {
          const isSelected = paymentMethod === id
          return (
            <button
              key={id}
              onClick={() => onSelectPaymentMethod(id)}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                isSelected
                  ? 'border-[#3d3530] bg-[#f6f2ec]'
                  : 'border-[#e3e2de] hover:border-[#c0b4ac] hover:bg-[#fdf9f6]'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  isSelected ? 'bg-[#3d3530] text-white' : 'bg-[#f0ece6] text-[#827064]'
                }`}
              >
                <Icon size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#3d3530]">{label}</p>
                <p className="text-xs text-[#a0948a]">{desc}</p>
              </div>
            </button>
          )
        })}
      </div>

      <button
        disabled={!paymentMethod}
        onClick={onContinue}
        className="w-full py-3.5 bg-[#3d3530] text-white text-xs tracking-[0.15em] uppercase rounded-full disabled:opacity-35 disabled:cursor-not-allowed hover:enabled:bg-[#2a2320] active:enabled:scale-[0.98] transition-all"
      >
        Continue
      </button>
    </div>
  )
}
