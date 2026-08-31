import { ChevronLeft, Clock } from 'lucide-react'
import type { Service, PriceTier } from '../../../types/booking'

interface DrawerOptionsProps {
  service: Service
  selectedTier: PriceTier | null
  isEditing: boolean
  onSelectTier: (tier: PriceTier) => void
  onBack: () => void
  onAdd: () => void
}

export default function DrawerOptions({
  service,
  selectedTier,
  isEditing,
  onSelectTier,
  onBack,
  onAdd,
}: DrawerOptionsProps) {
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
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#a0948a] mb-0.5">{service.tagline}</p>
        <h3 className="text-base font-semibold text-[#3d3530]">{service.name}</h3>
      </div>

      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a0948a] mb-3">Choose an option</p>
      <div className="space-y-2">
        {service.tiers.map((tier) => {
          const isSelected = selectedTier?.label === tier.label
          return (
            <button
              key={tier.label}
              onClick={() => onSelectTier(tier)}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                isSelected
                  ? 'border-[#3d3530] bg-[#f6f2ec]'
                  : 'border-[#e3e2de] hover:border-[#c0b4ac] hover:bg-[#fdf9f6]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  isSelected ? 'border-[#3d3530]' : 'border-[#c0b4ac]'
                }`}
              >
                {isSelected && <div className="w-2 h-2 rounded-full bg-[#3d3530]" />}
              </div>
              <span className="flex-1 text-sm text-[#3d3530] leading-snug">{tier.label}</span>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-[#3d3530]">{tier.price}</p>
                {tier.duration && (
                  <p className="flex items-center gap-0.5 text-[10px] text-[#a0948a] justify-end">
                    <Clock size={9} />
                    {tier.duration}
                  </p>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <button
        disabled={!selectedTier}
        onClick={onAdd}
        className="mt-8 w-full py-3.5 bg-[#3d3530] text-white text-xs tracking-[0.15em] uppercase rounded-full disabled:opacity-35 disabled:cursor-not-allowed hover:enabled:bg-[#2a2320] active:enabled:scale-[0.98] transition-all"
      >
        {isEditing ? 'Save changes' : 'Add to appointment'}
      </button>
    </div>
  )
}
