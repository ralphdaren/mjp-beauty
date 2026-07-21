import { useState, useEffect, useRef, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { COUNTRIES, type Country } from '../data/countries'
import { formatNANP, countryForPhone, localDigits } from '../lib/phone'

interface PhoneInputProps {
  /** Stored as dial code + digits, e.g. "+12045550134". */
  value: string
  onChange: (value: string) => void
  label?: string
  /** Fine print rendered under the field, e.g. the SMS consent notice. */
  children?: ReactNode
}

const labelCls = 'block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#a0948a] mb-1.5'

export default function PhoneInput({ value, onChange, label = 'Phone Number', children }: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(() => countryForPhone(value))
  const [localPhone, setLocalPhone] = useState<string>(() => {
    const digits = localDigits(value)
    return countryForPhone(value).dialCode === '+1' ? formatNANP(digits) : digits
  })
  const [countryOpen, setCountryOpen] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (countryOpen) searchRef.current?.focus()
  }, [countryOpen])

  function handleCountrySelect(c: Country) {
    const digits = localPhone.replace(/\D/g, '')
    setSelectedCountry(c)
    setLocalPhone(c.dialCode === '+1' ? formatNANP(digits) : digits)
    setCountryOpen(false)
    setCountrySearch('')
    onChange(c.dialCode + digits)
  }

  function handleLocalPhoneChange(v: string) {
    const digits = v.replace(/\D/g, '')
    setLocalPhone(selectedCountry.dialCode === '+1' ? formatNANP(digits) : v)
    onChange(selectedCountry.dialCode + digits)
  }

  const filteredCountries = countrySearch.trim()
    ? COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
        c.dialCode.includes(countrySearch)
      )
    : COUNTRIES

  return (
    <>
      {/* Country dropdown backdrop */}
      {countryOpen && (
        <div className="fixed inset-0 z-[5]" onClick={() => setCountryOpen(false)} aria-hidden />
      )}

      <label className={labelCls}>{label}</label>
      <div className="flex items-stretch relative z-[6] rounded-lg border border-[#e3e2de] bg-white focus-within:border-[#827064] transition-colors">
        {/* Country selector */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setCountryOpen(!countryOpen)}
            className="flex items-center gap-1.5 h-full px-3 border-r border-[#e3e2de] rounded-l-lg bg-white text-sm hover:bg-[#f6f2ec] transition-colors"
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
          maxLength={selectedCountry.dialCode === '+1' ? 14 : undefined}
          className="flex-1 min-w-0 px-3 py-2.5 rounded-r-lg text-sm text-[#3d3530] placeholder:text-[#c0b4ac] focus:outline-none bg-white transition-colors"
        />
      </div>
      {children}
    </>
  )
}
