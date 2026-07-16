import { ChevronLeft } from 'lucide-react'
import type { TrainingDetails } from '../../../hooks/useTrainingBookingState'

interface DrawerStep3Props {
  details: TrainingDetails
  onUpdateDetails: (patch: Partial<TrainingDetails>) => void
  honeypot: string
  onHoneypotChange: (v: string) => void
  onBack: () => void
  onContinue: () => void
}

const inputCls =
  'w-full px-3 py-2.5 rounded-lg border border-[#e3e2de] text-sm text-[#3d3530] placeholder:text-[#c0b4ac] focus:outline-none focus:border-[#827064] bg-white transition-colors'
const labelCls = 'block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#a0948a] mb-1.5'

export default function DrawerStep3({
  details,
  onUpdateDetails,
  honeypot,
  onHoneypotChange,
  onBack,
  onContinue,
}: DrawerStep3Props) {
  const canContinue = details.firstName.trim() !== '' && details.email.trim().includes('@')

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-xs text-[#827064] hover:text-[#3d3530] transition-colors mb-5"
      >
        <ChevronLeft size={13} />
        Back
      </button>

      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a0948a] mb-4">Your Details</p>

      {/* Honeypot — hidden from real users; bots that auto-fill every input trip it */}
      <div
        style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}
        aria-hidden="true"
      >
        <label htmlFor="training-website">Website</label>
        <input
          type="text"
          id="training-website"
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
            value={details.firstName}
            onChange={(e) => onUpdateDetails({ firstName: e.target.value })}
            placeholder="First Name"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Last Name</label>
          <input
            type="text"
            value={details.lastName}
            onChange={(e) => onUpdateDetails({ lastName: e.target.value })}
            placeholder="Last Name"
            className={inputCls}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className={labelCls}>Email</label>
        <input
          type="email"
          value={details.email}
          onChange={(e) => onUpdateDetails({ email: e.target.value })}
          placeholder="Email"
          className={inputCls}
        />
      </div>

      <div className="mb-6">
        <label className={labelCls}>
          Phone <span className="text-[#c0b4ac] normal-case tracking-normal">(optional)</span>
        </label>
        <input
          type="tel"
          value={details.phone}
          onChange={(e) => onUpdateDetails({ phone: e.target.value })}
          placeholder="Phone Number"
          className={inputCls}
        />
      </div>

      <button
        disabled={!canContinue}
        onClick={onContinue}
        className="w-full py-3.5 bg-[#3d3530] text-white text-xs tracking-[0.15em] uppercase rounded-full disabled:opacity-35 disabled:cursor-not-allowed hover:enabled:bg-[#2a2320] active:enabled:scale-[0.98] transition-all"
      >
        Continue
      </button>
    </div>
  )
}
