import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronDown, X } from 'lucide-react'
import type { DrawerStep, PriceTier } from '../../../types/booking'
import { useSquareCard } from '../../../hooks/useSquareCard'

// ─── Countries ────────────────────────────────────────────────────────────────

interface Country {
  iso: string
  flag: string
  name: string
  dialCode: string
}

const COUNTRIES: Country[] = [
  { iso: 'CA', flag: '🇨🇦', name: 'Canada', dialCode: '+1' },
  { iso: 'US', flag: '🇺🇸', name: 'United States', dialCode: '+1' },
  { iso: 'PH', flag: '🇵🇭', name: 'Philippines', dialCode: '+63' },
  { iso: 'IN', flag: '🇮🇳', name: 'India', dialCode: '+91' },
  { iso: 'AF', flag: '🇦🇫', name: 'Afghanistan', dialCode: '+93' },
  { iso: 'AL', flag: '🇦🇱', name: 'Albania', dialCode: '+355' },
  { iso: 'DZ', flag: '🇩🇿', name: 'Algeria', dialCode: '+213' },
  { iso: 'AR', flag: '🇦🇷', name: 'Argentina', dialCode: '+54' },
  { iso: 'AM', flag: '🇦🇲', name: 'Armenia', dialCode: '+374' },
  { iso: 'AU', flag: '🇦🇺', name: 'Australia', dialCode: '+61' },
  { iso: 'AT', flag: '🇦🇹', name: 'Austria', dialCode: '+43' },
  { iso: 'AZ', flag: '🇦🇿', name: 'Azerbaijan', dialCode: '+994' },
  { iso: 'BH', flag: '🇧🇭', name: 'Bahrain', dialCode: '+973' },
  { iso: 'BD', flag: '🇧🇩', name: 'Bangladesh', dialCode: '+880' },
  { iso: 'BY', flag: '🇧🇾', name: 'Belarus', dialCode: '+375' },
  { iso: 'BE', flag: '🇧🇪', name: 'Belgium', dialCode: '+32' },
  { iso: 'BZ', flag: '🇧🇿', name: 'Belize', dialCode: '+501' },
  { iso: 'BO', flag: '🇧🇴', name: 'Bolivia', dialCode: '+591' },
  { iso: 'BA', flag: '🇧🇦', name: 'Bosnia & Herzegovina', dialCode: '+387' },
  { iso: 'BR', flag: '🇧🇷', name: 'Brazil', dialCode: '+55' },
  { iso: 'BN', flag: '🇧🇳', name: 'Brunei', dialCode: '+673' },
  { iso: 'BG', flag: '🇧🇬', name: 'Bulgaria', dialCode: '+359' },
  { iso: 'KH', flag: '🇰🇭', name: 'Cambodia', dialCode: '+855' },
  { iso: 'CM', flag: '🇨🇲', name: 'Cameroon', dialCode: '+237' },
  { iso: 'CL', flag: '🇨🇱', name: 'Chile', dialCode: '+56' },
  { iso: 'CN', flag: '🇨🇳', name: 'China', dialCode: '+86' },
  { iso: 'CO', flag: '🇨🇴', name: 'Colombia', dialCode: '+57' },
  { iso: 'CD', flag: '🇨🇩', name: 'Congo (DRC)', dialCode: '+243' },
  { iso: 'CR', flag: '🇨🇷', name: 'Costa Rica', dialCode: '+506' },
  { iso: 'HR', flag: '🇭🇷', name: 'Croatia', dialCode: '+385' },
  { iso: 'CU', flag: '🇨🇺', name: 'Cuba', dialCode: '+53' },
  { iso: 'CY', flag: '🇨🇾', name: 'Cyprus', dialCode: '+357' },
  { iso: 'CZ', flag: '🇨🇿', name: 'Czech Republic', dialCode: '+420' },
  { iso: 'DK', flag: '🇩🇰', name: 'Denmark', dialCode: '+45' },
  { iso: 'DO', flag: '🇩🇴', name: 'Dominican Republic', dialCode: '+1' },
  { iso: 'EC', flag: '🇪🇨', name: 'Ecuador', dialCode: '+593' },
  { iso: 'EG', flag: '🇪🇬', name: 'Egypt', dialCode: '+20' },
  { iso: 'SV', flag: '🇸🇻', name: 'El Salvador', dialCode: '+503' },
  { iso: 'EE', flag: '🇪🇪', name: 'Estonia', dialCode: '+372' },
  { iso: 'ET', flag: '🇪🇹', name: 'Ethiopia', dialCode: '+251' },
  { iso: 'FJ', flag: '🇫🇯', name: 'Fiji', dialCode: '+679' },
  { iso: 'FI', flag: '🇫🇮', name: 'Finland', dialCode: '+358' },
  { iso: 'FR', flag: '🇫🇷', name: 'France', dialCode: '+33' },
  { iso: 'GE', flag: '🇬🇪', name: 'Georgia', dialCode: '+995' },
  { iso: 'DE', flag: '🇩🇪', name: 'Germany', dialCode: '+49' },
  { iso: 'GH', flag: '🇬🇭', name: 'Ghana', dialCode: '+233' },
  { iso: 'GR', flag: '🇬🇷', name: 'Greece', dialCode: '+30' },
  { iso: 'GT', flag: '🇬🇹', name: 'Guatemala', dialCode: '+502' },
  { iso: 'HT', flag: '🇭🇹', name: 'Haiti', dialCode: '+509' },
  { iso: 'HN', flag: '🇭🇳', name: 'Honduras', dialCode: '+504' },
  { iso: 'HK', flag: '🇭🇰', name: 'Hong Kong', dialCode: '+852' },
  { iso: 'HU', flag: '🇭🇺', name: 'Hungary', dialCode: '+36' },
  { iso: 'IS', flag: '🇮🇸', name: 'Iceland', dialCode: '+354' },
  { iso: 'ID', flag: '🇮🇩', name: 'Indonesia', dialCode: '+62' },
  { iso: 'IR', flag: '🇮🇷', name: 'Iran', dialCode: '+98' },
  { iso: 'IQ', flag: '🇮🇶', name: 'Iraq', dialCode: '+964' },
  { iso: 'IE', flag: '🇮🇪', name: 'Ireland', dialCode: '+353' },
  { iso: 'IL', flag: '🇮🇱', name: 'Israel', dialCode: '+972' },
  { iso: 'IT', flag: '🇮🇹', name: 'Italy', dialCode: '+39' },
  { iso: 'JM', flag: '🇯🇲', name: 'Jamaica', dialCode: '+1' },
  { iso: 'JP', flag: '🇯🇵', name: 'Japan', dialCode: '+81' },
  { iso: 'JO', flag: '🇯🇴', name: 'Jordan', dialCode: '+962' },
  { iso: 'KZ', flag: '🇰🇿', name: 'Kazakhstan', dialCode: '+7' },
  { iso: 'KE', flag: '🇰🇪', name: 'Kenya', dialCode: '+254' },
  { iso: 'KR', flag: '🇰🇷', name: 'South Korea', dialCode: '+82' },
  { iso: 'KW', flag: '🇰🇼', name: 'Kuwait', dialCode: '+965' },
  { iso: 'KG', flag: '🇰🇬', name: 'Kyrgyzstan', dialCode: '+996' },
  { iso: 'LA', flag: '🇱🇦', name: 'Laos', dialCode: '+856' },
  { iso: 'LV', flag: '🇱🇻', name: 'Latvia', dialCode: '+371' },
  { iso: 'LB', flag: '🇱🇧', name: 'Lebanon', dialCode: '+961' },
  { iso: 'LY', flag: '🇱🇾', name: 'Libya', dialCode: '+218' },
  { iso: 'LT', flag: '🇱🇹', name: 'Lithuania', dialCode: '+370' },
  { iso: 'LU', flag: '🇱🇺', name: 'Luxembourg', dialCode: '+352' },
  { iso: 'MY', flag: '🇲🇾', name: 'Malaysia', dialCode: '+60' },
  { iso: 'MV', flag: '🇲🇻', name: 'Maldives', dialCode: '+960' },
  { iso: 'MT', flag: '🇲🇹', name: 'Malta', dialCode: '+356' },
  { iso: 'MX', flag: '🇲🇽', name: 'Mexico', dialCode: '+52' },
  { iso: 'MD', flag: '🇲🇩', name: 'Moldova', dialCode: '+373' },
  { iso: 'MC', flag: '🇲🇨', name: 'Monaco', dialCode: '+377' },
  { iso: 'MN', flag: '🇲🇳', name: 'Mongolia', dialCode: '+976' },
  { iso: 'ME', flag: '🇲🇪', name: 'Montenegro', dialCode: '+382' },
  { iso: 'MA', flag: '🇲🇦', name: 'Morocco', dialCode: '+212' },
  { iso: 'MZ', flag: '🇲🇿', name: 'Mozambique', dialCode: '+258' },
  { iso: 'MM', flag: '🇲🇲', name: 'Myanmar', dialCode: '+95' },
  { iso: 'NA', flag: '🇳🇦', name: 'Namibia', dialCode: '+264' },
  { iso: 'NP', flag: '🇳🇵', name: 'Nepal', dialCode: '+977' },
  { iso: 'NL', flag: '🇳🇱', name: 'Netherlands', dialCode: '+31' },
  { iso: 'NZ', flag: '🇳🇿', name: 'New Zealand', dialCode: '+64' },
  { iso: 'NI', flag: '🇳🇮', name: 'Nicaragua', dialCode: '+505' },
  { iso: 'NG', flag: '🇳🇬', name: 'Nigeria', dialCode: '+234' },
  { iso: 'NO', flag: '🇳🇴', name: 'Norway', dialCode: '+47' },
  { iso: 'OM', flag: '🇴🇲', name: 'Oman', dialCode: '+968' },
  { iso: 'PK', flag: '🇵🇰', name: 'Pakistan', dialCode: '+92' },
  { iso: 'PA', flag: '🇵🇦', name: 'Panama', dialCode: '+507' },
  { iso: 'PY', flag: '🇵🇾', name: 'Paraguay', dialCode: '+595' },
  { iso: 'PE', flag: '🇵🇪', name: 'Peru', dialCode: '+51' },
  { iso: 'PL', flag: '🇵🇱', name: 'Poland', dialCode: '+48' },
  { iso: 'PT', flag: '🇵🇹', name: 'Portugal', dialCode: '+351' },
  { iso: 'QA', flag: '🇶🇦', name: 'Qatar', dialCode: '+974' },
  { iso: 'RO', flag: '🇷🇴', name: 'Romania', dialCode: '+40' },
  { iso: 'RU', flag: '🇷🇺', name: 'Russia', dialCode: '+7' },
  { iso: 'RW', flag: '🇷🇼', name: 'Rwanda', dialCode: '+250' },
  { iso: 'SA', flag: '🇸🇦', name: 'Saudi Arabia', dialCode: '+966' },
  { iso: 'SN', flag: '🇸🇳', name: 'Senegal', dialCode: '+221' },
  { iso: 'RS', flag: '🇷🇸', name: 'Serbia', dialCode: '+381' },
  { iso: 'SG', flag: '🇸🇬', name: 'Singapore', dialCode: '+65' },
  { iso: 'SK', flag: '🇸🇰', name: 'Slovakia', dialCode: '+421' },
  { iso: 'SI', flag: '🇸🇮', name: 'Slovenia', dialCode: '+386' },
  { iso: 'ZA', flag: '🇿🇦', name: 'South Africa', dialCode: '+27' },
  { iso: 'ES', flag: '🇪🇸', name: 'Spain', dialCode: '+34' },
  { iso: 'LK', flag: '🇱🇰', name: 'Sri Lanka', dialCode: '+94' },
  { iso: 'SD', flag: '🇸🇩', name: 'Sudan', dialCode: '+249' },
  { iso: 'SE', flag: '🇸🇪', name: 'Sweden', dialCode: '+46' },
  { iso: 'CH', flag: '🇨🇭', name: 'Switzerland', dialCode: '+41' },
  { iso: 'SY', flag: '🇸🇾', name: 'Syria', dialCode: '+963' },
  { iso: 'TW', flag: '🇹🇼', name: 'Taiwan', dialCode: '+886' },
  { iso: 'TJ', flag: '🇹🇯', name: 'Tajikistan', dialCode: '+992' },
  { iso: 'TZ', flag: '🇹🇿', name: 'Tanzania', dialCode: '+255' },
  { iso: 'TH', flag: '🇹🇭', name: 'Thailand', dialCode: '+66' },
  { iso: 'TT', flag: '🇹🇹', name: 'Trinidad & Tobago', dialCode: '+1' },
  { iso: 'TN', flag: '🇹🇳', name: 'Tunisia', dialCode: '+216' },
  { iso: 'TR', flag: '🇹🇷', name: 'Turkey', dialCode: '+90' },
  { iso: 'TM', flag: '🇹🇲', name: 'Turkmenistan', dialCode: '+993' },
  { iso: 'UG', flag: '🇺🇬', name: 'Uganda', dialCode: '+256' },
  { iso: 'UA', flag: '🇺🇦', name: 'Ukraine', dialCode: '+380' },
  { iso: 'AE', flag: '🇦🇪', name: 'United Arab Emirates', dialCode: '+971' },
  { iso: 'GB', flag: '🇬🇧', name: 'United Kingdom', dialCode: '+44' },
  { iso: 'UY', flag: '🇺🇾', name: 'Uruguay', dialCode: '+598' },
  { iso: 'UZ', flag: '🇺🇿', name: 'Uzbekistan', dialCode: '+998' },
  { iso: 'VE', flag: '🇻🇪', name: 'Venezuela', dialCode: '+58' },
  { iso: 'VN', flag: '🇻🇳', name: 'Vietnam', dialCode: '+84' },
  { iso: 'YE', flag: '🇾🇪', name: 'Yemen', dialCode: '+967' },
  { iso: 'ZM', flag: '🇿🇲', name: 'Zambia', dialCode: '+260' },
  { iso: 'ZW', flag: '🇿🇼', name: 'Zimbabwe', dialCode: '+263' },
]

const CANADA = COUNTRIES.find(c => c.iso === 'CA')!

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
  const num = parseFloat(price.replace(/[^0-9.]/g, ''))
  if (isNaN(num)) return ''
  return `CA$${(num * 0.5).toFixed(2)}`
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
  onFirstNameChange: (v: string) => void
  onLastNameChange: (v: string) => void
  onEmailChange: (v: string) => void
  onPhoneChange: (v: string) => void
  onCardConsentChange: (v: boolean) => void
  onPolicyConsentChange: (v: boolean) => void
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

  // ── Phone state ──
  const [selectedCountry, setSelectedCountry] = useState<Country>(() => {
    if (!phone) return CANADA
    return COUNTRIES.find(c => phone.startsWith(c.dialCode)) ?? CANADA
  })
  const [localPhone, setLocalPhone] = useState<string>(() => {
    if (!phone) return ''
    const match = COUNTRIES.find(c => phone.startsWith(c.dialCode))
    return match ? phone.slice(match.dialCode.length) : phone
  })
  const [countryOpen, setCountryOpen] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (countryOpen) searchRef.current?.focus()
  }, [countryOpen])

  // ── Policy modal ──
  const [policyOpen, setPolicyOpen] = useState(false)

  // ── Handlers ──
  function handleCountrySelect(c: Country) {
    setSelectedCountry(c)
    setCountryOpen(false)
    setCountrySearch('')
    onPhoneChange(c.dialCode + localPhone.replace(/\D/g, ''))
  }

  function handleLocalPhoneChange(v: string) {
    setLocalPhone(v)
    onPhoneChange(selectedCountry.dialCode + v.replace(/\D/g, ''))
  }

  const filteredCountries = countrySearch.trim()
    ? COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
        c.dialCode.includes(countrySearch)
      )
    : COUNTRIES

  const canContinue =
    firstName.trim() !== '' &&
    lastName.trim() !== '' &&
    email.trim().includes('@') &&
    localPhone.replace(/\D/g, '').length >= 7 &&
    cardConsent &&
    policyConsent

  const deadline = selectedStartAt ? formatCancellationDeadline(selectedStartAt) : null
  const fee = selectedTier ? formatCancellationFee(selectedTier.price) : null

  return (
    <div>
      {/* Country dropdown backdrop */}
      {countryOpen && (
        <div className="fixed inset-0 z-[5]" onClick={() => setCountryOpen(false)} aria-hidden />
      )}

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
        <label className={labelCls}>Phone Number</label>
        <div className="flex relative z-[6]">
          {/* Country selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setCountryOpen(!countryOpen)}
              className="flex items-center gap-1.5 px-3 py-2.5 border border-r-0 border-[#e3e2de] rounded-l-lg bg-white text-sm hover:bg-[#f6f2ec] transition-colors shrink-0"
            >
              <span className="text-base leading-none">{selectedCountry.flag}</span>
              <span className="text-[#3d3530] text-xs font-medium">{selectedCountry.dialCode}</span>
              <ChevronDown size={11} className="text-[#a0948a]" />
            </button>

            {countryOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-[#e3e2de] rounded-xl shadow-lg overflow-hidden">
                <div className="p-2 border-b border-[#e3e2de]">
                  <input
                    ref={searchRef}
                    type="text"
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    placeholder="Search country..."
                    className="w-full px-2.5 py-1.5 text-xs border border-[#e3e2de] rounded-lg focus:outline-none focus:border-[#827064]"
                  />
                </div>
                <div className="overflow-y-auto max-h-48">
                  {filteredCountries.length === 0 ? (
                    <p className="px-3 py-4 text-xs text-[#a0948a] text-center">No results</p>
                  ) : (
                    filteredCountries.map(c => (
                      <button
                        key={c.iso}
                        type="button"
                        onClick={() => handleCountrySelect(c)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-[#f6f2ec] transition-colors ${
                          selectedCountry.iso === c.iso ? 'bg-[#f0ece6]' : ''
                        }`}
                      >
                        <span className="text-base leading-none">{c.flag}</span>
                        <span className="flex-1 text-xs text-[#3d3530] truncate">{c.name}</span>
                        <span className="text-[10px] text-[#a0948a] shrink-0">{c.dialCode}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Local number input */}
          <input
            type="tel"
            value={localPhone}
            onChange={(e) => handleLocalPhoneChange(e.target.value)}
            placeholder="Phone Number"
            className="flex-1 px-3 py-2.5 border border-[#e3e2de] rounded-r-lg text-sm text-[#3d3530] placeholder:text-[#c0b4ac] focus:outline-none focus:border-[#827064] bg-white transition-colors"
          />
        </div>
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
