import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Service } from '../../../types/booking'

interface DrawerServicesProps {
  services: Service[]
  /** How many services are already in the appointment — 0 on a fresh booking. */
  bookedCount: number
  onSelectService: (service: Service) => void
  onBack: () => void
}

export default function DrawerServices({
  services,
  bookedCount,
  onSelectService,
  onBack,
}: DrawerServicesProps) {
  return (
    <div>
      {bookedCount > 0 && (
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-[#827064] hover:text-[#3d3530] transition-colors mb-5"
        >
          <ChevronLeft size={13} />
          Back to appointment
        </button>
      )}

      <p className="text-sm text-[#6b5f58] mb-5">
        {bookedCount > 0
          ? 'Which service would you like to add?'
          : 'Which service are you booking today?'}
      </p>
      <div className="space-y-3">
        {services.map((service) => (
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
