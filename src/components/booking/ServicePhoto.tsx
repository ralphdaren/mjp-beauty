import { useState } from 'react'
import { Play } from 'lucide-react'
import type { Service } from '../../types/booking'

interface ServicePhotoProps {
  services: Service[]
  service: Service
  onVideoOpen: (src: string) => void
}

/** Large photo of the open service, with thumbnails and a video button.
 *  Every service's images are stacked so switching service or photo crossfades. */
export default function ServicePhoto({ services, service, onVideoOpen }: ServicePhotoProps) {
  const [index, setIndex] = useState(0)
  // Back to the first photo when the open service changes (adjusted during render, not in an effect).
  const [seenId, setSeenId] = useState(service.id)
  if (service.id !== seenId) {
    setSeenId(service.id)
    setIndex(0)
  }

  return (
    <div>
      <div className="relative aspect-[4/5] rounded-[3px] overflow-hidden bg-[#e6ddd2]">
        {services.flatMap((s) =>
          s.images.map((img, i) => {
            const shown = s.id === service.id && i === index
            return (
              <img
                key={`${s.id}-${i}`}
                src={img.src}
                srcSet={img.srcSet}
                sizes="(min-width: 768px) 440px, 100vw"
                alt={shown ? `${s.name} by Micah` : ''}
                aria-hidden={!shown}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-out motion-reduce:transition-none ${
                  shown ? 'opacity-100' : 'opacity-0'
                }`}
                loading={shown ? 'eager' : 'lazy'}
                decoding="async"
              />
            )
          }),
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex gap-2">
          {service.images.length > 1 &&
            service.images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Photo ${i + 1} of ${service.images.length}`}
                aria-pressed={i === index}
                className={`w-11 h-11 rounded-full overflow-hidden border-[1.5px] transition-opacity duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3d3530] ${
                  i === index ? 'opacity-100 border-[#3d3530]' : 'opacity-50 border-transparent hover:opacity-80'
                }`}
              >
                <img src={img.src} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
              </button>
            ))}
        </div>

        {service.video && (
          <button
            type="button"
            onClick={() => onVideoOpen(service.video!)}
            className="inline-flex items-center gap-2 min-h-11 px-4 rounded-full border border-[rgba(61,53,48,.2)] text-sm text-[#3d3530] hover:bg-white/60 transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3d3530]"
          >
            <Play size={10} fill="currentColor" />
            Watch Micah work
          </button>
        )}
      </div>
    </div>
  )
}
