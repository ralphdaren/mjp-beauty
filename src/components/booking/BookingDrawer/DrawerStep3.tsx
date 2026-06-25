import { ChevronLeft } from 'lucide-react'
import type { DrawerStep } from '../../../types/booking'
import { useSquareCard } from '../../../hooks/useSquareCard'

const inputCls = 'w-full px-3 py-2.5 rounded-lg border border-[#e3e2de] text-sm text-[#3d3530] placeholder:text-[#c0b4ac] focus:outline-none focus:border-[#827064] bg-white transition-colors'
const labelCls = 'block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#a0948a] mb-1.5'

interface DrawerStep3Props {
  step: DrawerStep
  open: boolean
  locationId: string | null
  firstName: string
  lastName: string
  email: string
  phone: string
  cardConsent: boolean
  policyConsent: boolean
  onFirstNameChange: (v: string) => void
  onLastNameChange: (v: string) => void
  onEmailChange: (v: string) => void
  onPhoneChange: (v: string) => void
  onCardConsentChange: (v: boolean) => void
  onPolicyConsentChange: (v: boolean) => void
  onBack: () => void
  onStep3Continue: (sourceId: string) => void
}

export default function DrawerStep3({
  step,
  open,
  locationId,
  firstName,
  lastName,
  email,
  phone,
  cardConsent,
  policyConsent,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPhoneChange,
  onCardConsentChange,
  onPolicyConsentChange,
  onBack,
  onStep3Continue,
}: DrawerStep3Props) {
  const { error: cardError, isLoading: step3Loading, tokenize } = useSquareCard({
    active: step === 3 && open,
    locationId,
    onSuccess: onStep3Continue,
  })

  const canContinue =
    firstName.trim() !== '' &&
    lastName.trim() !== '' &&
    email.trim().includes('@') &&
    phone.trim() !== '' &&
    cardConsent &&
    policyConsent

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-xs text-[#827064] hover:text-[#3d3530] transition-colors mb-5"
      >
        <ChevronLeft size={13} />
        Back
      </button>

      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a0948a] mb-4">Contact Information</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className={labelCls}>First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            placeholder="First Name"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            placeholder="Last Name"
            className={inputCls}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className={labelCls}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="example@gmail.com"
          className={inputCls}
        />
      </div>

      <div className="mb-6">
        <label className={labelCls}>Phone Number</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="+1 (204) 555-0000"
          className={inputCls}
        />
        <p className="text-[10px] text-[#a0948a] mt-2 leading-relaxed">
          By providing your phone number you acknowledge you will receive occasional informational messages, including automated messages, on your mobile device from this merchant. Text STOP to opt out at any time, and text HELP to get help. Message and data rates may apply.
        </p>
      </div>

      <div className="border-t border-[#e3e2de] mb-5" />

      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a0948a] mb-3">Card on File</p>

      {locationId ? (
        <div id="card-container" className="mb-3" />
      ) : (
        <div className="h-14 bg-[#f6f2ec] rounded-lg animate-pulse mb-3" />
      )}

      {cardError && <p className="text-xs text-red-500 mb-3">{cardError}</p>}

      <p className="text-[11px] text-[#a0948a] leading-relaxed mb-5">
        A credit or debit card is required to book and may be charged in the case of a late cancellation. Protected and encrypted by Square.
      </p>

      <div className="space-y-3 mb-7">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={cardConsent}
            onChange={(e) => onCardConsentChange(e.target.checked)}
            className="mt-0.5 shrink-0 accent-[#3d3530]"
          />
          <span className="text-xs text-[#6b5f58] leading-snug group-hover:text-[#3d3530] transition-colors">
            I authorize MJP Beauty to save this card on file for future purchases.
          </span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={policyConsent}
            onChange={(e) => onPolicyConsentChange(e.target.checked)}
            className="mt-0.5 shrink-0 accent-[#3d3530]"
          />
          <span className="text-xs text-[#6b5f58] leading-snug group-hover:text-[#3d3530] transition-colors">
            I have read and agreed to the cancellation policy of MJP Beauty.
          </span>
        </label>
      </div>

      <button
        disabled={!canContinue || step3Loading}
        onClick={tokenize}
        className="w-full py-3.5 bg-[#3d3530] text-white text-xs tracking-[0.15em] uppercase rounded-full disabled:opacity-35 disabled:cursor-not-allowed hover:enabled:bg-[#2a2320] active:enabled:scale-[0.98] transition-all"
      >
        {step3Loading ? 'Verifying card…' : 'Continue'}
      </button>
    </div>
  )
}
