import { useState } from 'react'
import { ChevronLeft, X } from 'lucide-react'
import type { DrawerStep, PriceTier } from '../../../types/booking'
import { useSquareCard } from '../../../hooks/useSquareCard'
import { TAX_RATE, parsePrice } from '../../../lib/pricing'
import { isValidPhone } from '../../../lib/phone'
import PhoneInput from '../../PhoneInput'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCancellationDeadline(startAt: string): string {
  const deadline = new Date(new Date(startAt).getTime() - 48 * 60 * 60 * 1000)
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Winnipeg',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(deadline)
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? ''
  return `${get('hour')}:${get('minute')} ${get('dayPeriod')} on ${get('weekday')}, ${get('month')} ${get('day')}`
}

function formatCancellationFee(price: string): string {
  const { amount } = parsePrice(price)
  if (isNaN(amount)) return ''
  const feeWithTax = amount * 0.5 * (1 + TAX_RATE)
  return `CA$${feeWithTax.toFixed(2)}`
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const inputCls = 'w-full px-3 py-2.5 rounded-lg border border-[#e3e2de] text-sm text-[#3d3530] placeholder:text-[#c0b4ac] focus:outline-none focus:border-[#827064] bg-white transition-colors'
const labelCls = 'block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#a0948a] mb-1.5'

// ─── Props ────────────────────────────────────────────────────────────────────

interface DrawerStep3Props {
  step: DrawerStep
  open: boolean
  locationId: string | null
  selectedStartAt: string | null
  selectedTier: PriceTier | null
  firstName: string
  lastName: string
  email: string
  phone: string
  cardConsent: boolean
  policyConsent: boolean
  honeypot: string
  onFirstNameChange: (v: string) => void
  onLastNameChange: (v: string) => void
  onEmailChange: (v: string) => void
  onPhoneChange: (v: string) => void
  onCardConsentChange: (v: boolean) => void
  onPolicyConsentChange: (v: boolean) => void
  onHoneypotChange: (v: string) => void
  onBack: () => void
  onStep3Continue: (sourceId: string) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DrawerStep3({
  step,
  open,
  locationId,
  selectedStartAt,
  selectedTier,
  firstName,
  lastName,
  email,
  phone,
  cardConsent,
  policyConsent,
  honeypot,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPhoneChange,
  onCardConsentChange,
  onPolicyConsentChange,
  onHoneypotChange,
  onBack,
  onStep3Continue,
}: DrawerStep3Props) {
  const { error: cardError, isLoading: step3Loading, tokenize } = useSquareCard({
    active: step === 3 && open,
    locationId,
    onSuccess: onStep3Continue,
  })

  // ── Policy modal ──
  const [policyOpen, setPolicyOpen] = useState(false)

  const canContinue =
    firstName.trim() !== '' &&
    lastName.trim() !== '' &&
    email.trim().includes('@') &&
    isValidPhone(phone) &&
    cardConsent &&
    policyConsent

  const deadline = selectedStartAt ? formatCancellationDeadline(selectedStartAt) : null
  const fee = selectedTier ? formatCancellationFee(selectedTier.price) : null

  return (
    <div>

      {/* Cancellation policy modal */}
      {policyOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setPolicyOpen(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-[400px] max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e3e2de] shrink-0">
              <h3 className="text-sm font-semibold text-[#3d3530]">Cancellation Policy</h3>
              <button
                onClick={() => setPolicyOpen(false)}
                className="p-1 rounded-full hover:bg-[#f0ece6] transition-colors"
                aria-label="Close policy"
              >
                <X size={16} className="text-[#827064]" />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4 text-xs text-[#6b5f58] leading-relaxed space-y-4">
              <p>We ask that you please reschedule or cancel at least 2 days before the beginning of your appointment or you may be charged a cancellation fee.</p>
              <p className="font-semibold text-[#3d3530] uppercase text-[10px] tracking-wide">Please Read Before You Proceed with Booking</p>
              <div>
                <p className="font-semibold text-[#3d3530] mb-1">BOOKING REQUEST CONFIRMATION</p>
                <p>Once you have booked your appointment online, a booking request confirmation email/text will be sent once your appointment slot has been reviewed and accepted by Micah.</p>
              </div>
              <div>
                <p className="font-semibold text-[#3d3530] mb-1">CONFIRMATION TEXTS</p>
                <p>Text/email reminders will be sent 2 days (48 hours) prior to your appointment time so that you can confirm your appointment. This ensures MJP Beauty that you will be present to your appointment. If you need to cancel/reschedule, this text will serve as your reminder to do so in order to meet the cancellation policy.</p>
              </div>
              <div>
                <p className="font-semibold text-[#3d3530] mb-1">CANCELLATION / RESCHEDULING POLICY</p>
                <p>If you need to cancel or reschedule, we ask that you please provide a 2-day (48hr) notice prior to your appointment date so that MJP Beauty may have enough time to properly fill that spot with another client. Failure to give sufficient notice will result in a 50% charge of the booked service.</p>
              </div>
              <div>
                <p className="font-semibold text-[#3d3530] mb-1">SAME DAY CANCELLATION (WITHIN 24 HOURS)</p>
                <p>Will be subject to a 100% FEE of the booked service! An invoice will be sent to pay the fee and is required to be paid before any upcoming future services.</p>
              </div>
              <div>
                <p className="font-semibold text-[#3d3530] mb-1">NO-SHOW POLICY</p>
                <p>No shows will not be tolerated and will be subject to the same cancellation fee charge stated above.</p>
              </div>
              <div>
                <p className="font-semibold text-[#3d3530] mb-1">LATE POLICY</p>
                <p>If you are running late, you will be given a 10-minute grace period. If you do not make it within your 10 minute window, your appointment will be cancelled and you will be subject to the 50% cancellation fee of the booked service.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={onBack}
        className="flex items-center gap-1 text-xs text-[#827064] hover:text-[#3d3530] transition-colors mb-5"
      >
        <ChevronLeft size={13} />
        Back
      </button>

      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a0948a] mb-4">Contact Information</p>

      {/* Honeypot — hidden from real users, bots that auto-fill every input trip it */}
      <div
        style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}
        aria-hidden="true"
      >
        <label htmlFor="website">Website</label>
        <input
          type="text"
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => onHoneypotChange(e.target.value)}
        />
      </div>

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
          placeholder="Email"
          className={inputCls}
        />
      </div>

      {/* Phone with country dropdown */}
      <div className="mb-6">
        <PhoneInput value={phone} onChange={onPhoneChange}>
          <p className="text-[10px] text-[#a0948a] mt-2 leading-relaxed">
            By providing your phone number you acknowledge you will receive occasional informational messages, including automated messages, on your mobile device from this merchant. Text STOP to opt out at any time, and text HELP to get help. Message and data rates may apply.
          </p>
        </PhoneInput>
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

      {/* Cancellation notice */}
      {deadline && fee && (
        <div className="bg-[#fdf8f3] border border-[#e8ddd4] rounded-xl px-4 py-3 mb-5">
          <p className="text-[11px] text-[#6b5f58] leading-relaxed">
            Please cancel or reschedule before <span className="font-medium text-[#3d3530]">{deadline}</span>. After that, you may be charged a cancellation fee of <span className="font-medium text-[#3d3530]">{fee}</span>.{' '}
            <button
              type="button"
              onClick={() => setPolicyOpen(true)}
              className="underline text-[#827064] hover:text-[#3d3530] transition-colors"
            >
              See full policy
            </button>
          </p>
        </div>
      )}

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
