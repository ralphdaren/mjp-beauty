import { ChevronLeft, ChevronDown } from 'lucide-react'
import type { TrainingDetails } from '../../../hooks/useTrainingBookingState'
import { isValidPhone } from '../../../lib/phone'
import { PROVINCES } from '../../../data/provinces'
import PhoneInput from '../../PhoneInput'

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
// Padding spelled out rather than reusing inputCls — the native select arrow is
// replaced by a positioned ChevronDown, so the right side needs room for it.
const selectCls =
  'w-full pl-3 pr-9 py-2.5 rounded-lg border border-[#e3e2de] text-sm focus:outline-none focus:border-[#827064] bg-white transition-colors appearance-none cursor-pointer'

export default function DrawerStep3({
  details,
  onUpdateDetails,
  honeypot,
  onHoneypotChange,
  onBack,
  onContinue,
}: DrawerStep3Props) {
  const canContinue =
    details.firstName.trim() !== '' &&
    details.email.trim().includes('@') &&
    isValidPhone(details.phone) &&
    details.city.trim() !== '' &&
    details.province !== ''

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

      <div className="mb-4">
        <PhoneInput value={details.phone} onChange={(phone) => onUpdateDetails({ phone })} />
      </div>

      {/* Location — lets Micah see which students are local to the training city */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div>
          <label className={labelCls}>City</label>
          <input
            type="text"
            value={details.city}
            onChange={(e) => onUpdateDetails({ city: e.target.value })}
            placeholder="Winnipeg"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Province</label>
          <div className="relative">
            <select
              value={details.province}
              onChange={(e) => onUpdateDetails({ province: e.target.value })}
              className={`${selectCls} ${details.province === '' ? 'text-[#c0b4ac]' : 'text-[#3d3530]'}`}
            >
              <option value="" disabled>
                Select
              </option>
              {PROVINCES.map((p) => (
                <option key={p.code} value={p.code} className="text-[#3d3530]">
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={13}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0948a] pointer-events-none"
            />
          </div>
        </div>
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
