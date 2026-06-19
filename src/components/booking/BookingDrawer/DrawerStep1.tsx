import { ChevronRight } from 'lucide-react'
import type { Service } from '../../../types/booking'
import { SERVICES } from '../../../data/booking'

interface DrawerStep1Props {
  onSelectService: (service: Service) => void
}

export default function DrawerStep1({ onSelectService }: DrawerStep1Props) {
  return (
    <div>
      <p className="text-sm text-[#6b5f58] mb-5">Which service are you booking today?</p>
      <div className="space-y-3">
        {SERVICES.map((service) => (
          <button
            key={service.id}
            onClick={() => onSelectService(service)}
            className="w-full text-left flex items-center justify-between gap-4 p-4 rounded-xl border border-[#e3e2de] hover:border-[#a0948a] hover:bg-[#fdf9f6] transition-all group"
          >
            <div className="min-w-0">
              <p className="font-medium text-sm text-[#3d3530] mb-0.5">{service.name}</p>
              <p className="text-xs text-[#a0948a]">{service.tagline}</p>
            </div>
            <ChevronRight size={15} className="shrink-0 text-[#c0b4ac] group-hover:text-[#827064] transition-colors" />
          </button>
        ))}
      </div>
    </div>
  )
}
