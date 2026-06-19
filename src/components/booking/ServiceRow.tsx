import { useState } from 'react'
import { Play, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Service } from '../../types/booking'
import FlipTier from './FlipTier'

interface ServiceRowProps {
  service: Service
  index: number
  onVideoOpen: (src: string) => void
  onBook: () => void
}

export default function ServiceRow({ service, index, onVideoOpen, onBook }: ServiceRowProps) {
  const [imgIdx, setImgIdx] = useState(0)
  const prev = () => setImgIdx((i) => (i - 1 + service.images.length) % service.images.length)
  const next = () => setImgIdx((i) => (i + 1) % service.images.length)

  return (
    <div
      className="anim-fade-up flex flex-col md:flex-row md:items-center gap-6 md:gap-0 py-10 md:py-14"
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      {/* Image carousel */}
      <div className="relative shrink-0 w-full aspect-[4/3] md:w-52 lg:w-60 md:aspect-[3/4] overflow-hidden rounded-xl bg-[#ede8e0] group/img">
        <div className="absolute inset-0">
          <div
            className="flex h-full transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${imgIdx * 100}%)` }}
          >
            {service.images.map((img, i) => (
              <div key={i} className="w-full h-full shrink-0">
                <img src={img} alt={`${service.name} ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/70 backdrop-blur-sm rounded-full flex items-center justify-center text-[#827064] opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-white"
          aria-label="Previous photo"
        >
          <ChevronLeft size={13} />
        </button>
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/70 backdrop-blur-sm rounded-full flex items-center justify-center text-[#827064] opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-white"
          aria-label="Next photo"
        >
          <ChevronRight size={13} />
        </button>

        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
          {service.images.map((_, i) => (
            <button
              key={i}
              onClick={() => setImgIdx(i)}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === imgIdx ? 'bg-white w-4' : 'bg-white/55 w-1.5'
              }`}
              aria-label={`Photo ${i + 1}`}
            />
          ))}
        </div>

        {service.video && (
          <button
            onClick={() => onVideoOpen(service.video!)}
            className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm text-[#827064] text-xs font-medium px-3 py-1.5 rounded-full hover:bg-white transition-colors shadow-sm whitespace-nowrap"
          >
            <Play size={10} fill="currentColor" />
            Watch
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 md:px-10 lg:px-14">
        <div className="flex items-center gap-3 mb-3 md:hidden">
          <span className="text-[#cdc1b9] text-2xl select-none">
            {String(index + 1).padStart(2, '0')}
          </span>
          <h3 className="text-xl font-semibold text-[#3d3530]">{service.name}</h3>
        </div>

        <p className="text-[10px] tracking-[0.25em] uppercase text-[#a0948a] mb-2">{service.tagline}</p>
        <h3 className="hidden md:block text-2xl font-semibold text-[#3d3530] mb-3 leading-snug">
          {service.name}
        </h3>
        <p className="text-sm text-[#6b5f58] leading-relaxed mb-5">{service.description}</p>

        <div className="space-y-2 max-w-md">
          {service.tiers.map((tier) => (
            <FlipTier key={tier.label} tier={tier} />
          ))}
        </div>

        <button
          onClick={onBook}
          className="md:hidden mt-6 block w-full py-3 bg-[#3d3530] text-white text-xs tracking-[0.15em] uppercase text-center rounded-full hover:bg-[#2a2320] active:scale-[0.98] transition-all"
        >
          Book Now
        </button>
      </div>

      {/* Desktop right column */}
      <div className="hidden md:flex md:self-stretch shrink-0 w-36 lg:w-44 flex-col items-center justify-between px-5">
        <span className="text-[#d0c4bc] text-4xl select-none">
          {String(index + 1).padStart(2, '0')}
        </span>
        <button
          onClick={onBook}
          className="block w-full py-3 bg-[#3d3530] text-white text-xs tracking-[0.15em] uppercase text-center rounded-full hover:bg-[#2a2320] active:scale-[0.98] transition-all"
        >
          Book Now
        </button>
      </div>
    </div>
  )
}
