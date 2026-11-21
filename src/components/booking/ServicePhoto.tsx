import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { Play } from 'lucide-react'
import type { Service } from '../../types/booking'

/** How long each photo stays up before the next one fades in. */
const PHOTO_INTERVAL_MS = 4500
/** No auto-rotation for visitors who ask for reduced motion; thumbnails still work. */
const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

interface ServicePhotoProps {
  services: Service[]
  service: Service
  onVideoOpen: (src: string) => void
  /** Shape of the photo frame. Desktop panel is tall; the in-list phone version is short so prices stay close. */
  frameClassName?: string
  sizes?: string
}

/** Large photo of the open service, with thumbnails and a video button.
 *  Every service's images are stacked so switching service or photo crossfades. */
export default function ServicePhoto({
  services,
  service,
  onVideoOpen,
  frameClassName = 'aspect-[4/5]',
  sizes = '(min-width: 768px) 440px, 100vw',
}: ServicePhotoProps) {
  const [index, setIndex] = useState(0)
  // Back to the first photo when the open service changes (adjusted during render, not in an effect).
  const [seenId, setSeenId] = useState(service.id)
  if (service.id !== seenId) {
    setSeenId(service.id)
    setIndex(0)
  }

  // Pause while the visitor is hovering or has keyboard focus on the photo area.
  const [paused, setPaused] = useState(false)
  const count = service.images.length
  const autoplay = count > 1 && !reducedMotion()

  // One timeout per shown photo, so clicking a thumbnail restarts the countdown.
  useEffect(() => {
    if (!autoplay || paused) return
    const t = window.setTimeout(() => setIndex((i) => (i + 1) % count), PHOTO_INTERVAL_MS)
    return () => window.clearTimeout(t)
  }, [autoplay, paused, count, index, service.id])

  return (
    // Only a real mouse hover or keyboard focus pauses. A tap on a touch screen fires an emulated
    // hover with no matching leave (and focuses the button on Android), which would stop rotation for good.
    <div
      onPointerEnter={(e) => e.pointerType === 'mouse' && setPaused(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setPaused(false)}
      onFocus={(e) => e.target.matches(':focus-visible') && setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className={`relative ${frameClassName} rounded-[3px] overflow-hidden bg-[#e6ddd2]`}>
        {services.flatMap((s) =>
          s.images.map((img, i) => {
            const shown = s.id === service.id && i === index
            return (
              <img
                key={`${s.id}-${i}`}
                src={img.src}
                srcSet={img.srcSet}
                sizes={sizes}
                alt={shown ? `${s.name} by Micah` : ''}
                aria-hidden={!shown}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[900ms] ease-in-out motion-reduce:transition-none ${
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
                className={`relative w-12 h-12 rounded-md overflow-hidden border-[1.5px] transition-[opacity,border-color] duration-300 ease-out cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3d3530] ${
                  i === index ? 'opacity-100 border-[#3d3530]' : 'opacity-50 border-transparent hover:opacity-80'
                }`}
              >
                <img src={img.src} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                {/* Countdown bar. Hidden while paused; resuming restarts both it and the timer. */}
                {autoplay && !paused && i === index && (
                  <span
                    key={`${service.id}-${index}`}
                    aria-hidden
                    className="photo-progress absolute left-0 right-0 bottom-0 h-[3px] bg-white/90"
                    style={{ '--photo-interval': `${PHOTO_INTERVAL_MS}ms` } as CSSProperties}
                  />
                )}
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
