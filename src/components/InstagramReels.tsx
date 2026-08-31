import { useState, useRef, useEffect } from 'react'
import { SiInstagram } from '@icons-pack/react-simple-icons'
import { Volume2, VolumeX } from 'lucide-react'

const BASE = 'https://res.cloudinary.com/dr9nm40gf/video/upload'
const srcFor = (id: string) => `${BASE}/q_auto:eco,f_auto,w_600,c_limit/${id}.mp4`
const posterFor = (id: string) => `${BASE}/so_0,w_400,c_limit/${id}.jpg`
const CW = 300   // center width
const CH = 545   // center height
const S1 = 275   // ±1 square side
const S2 = 220   // ±2 square side
const GAP = 12   // visible space between adjacent cards

function getDims(vw: number) {
  const cw = Math.min(CW, Math.round(vw * 0.6))
  const k = cw / CW
  const ch = Math.round(CH * k)
  const s1 = Math.round(S1 * k)
  const s2 = Math.round(S2 * k)
  const gap = Math.max(8, Math.round(GAP * k))
  const x1 = cw / 2 + gap + s1 / 2
  const x2 = x1 + s1 / 2 + gap + s2 / 2
  return { cw, ch, s1, s2, x1, x2, park: x2 + s2 }
}

function getDiff(i: number, active: number, n: number): number {
  const raw = ((i - active) % n + n) % n
  return raw > n / 2 ? raw - n : raw
}

function getSlot(diff: number, d: ReturnType<typeof getDims>) {
  switch (diff) {
    case -2: return { x: -d.x2, w: d.s2, h: d.s2, opacity: 0.5,  z: 1 }
    case -1: return { x: -d.x1, w: d.s1, h: d.s1, opacity: 0.82, z: 2 }
    case  0: return { x:    0,  w: d.cw, h: d.ch, opacity: 1,    z: 3 }
    case  1: return { x:  d.x1, w: d.s1, h: d.s1, opacity: 0.82, z: 2 }
    case  2: return { x:  d.x2, w: d.s2, h: d.s2, opacity: 0.5,  z: 1 }
    default: return { x: diff < 0 ? -d.park : d.park, w: d.s2, h: d.s2, opacity: 0, z: -1 }
  }
}

export default function InstagramReels({ reels }: { reels: string[] }) {
  const N = reels.length
  const [active, setActive] = useState(0)
  const [inView, setInView] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set())
  const [vw, setVw] = useState(() => (typeof window === 'undefined' ? 1280 : window.innerWidth))
  const sectionRef = useRef<HTMLElement | null>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>(new Array(N).fill(null))
  const activeRef = useRef(0)

  const dims = getDims(vw)

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const markLoaded = (centre: number) =>
    setLoaded(prev => {
      const next = new Set(prev)
      for (let d = -1; d <= 1; d++) next.add(((centre + d) % N + N) % N)
      return next.size === prev.size ? prev : next
    })

  const goTo = (i: number) => {
    activeRef.current = i
    setActive(i)
    markLoaded(i)
  }

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          markLoaded(activeRef.current)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return
      if (i === active) {
        v.play().catch(() => {})
      } else {
        v.pause()
      }
    })
  }, [active, inView, loaded])

  const step = (dir: 1 | -1) => goTo((active + dir + N) % N)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const swiped = useRef(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    swiped.current = false
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current
    touchStart.current = null
    if (!start) return
    const dx = e.changedTouches[0].clientX - start.x
    const dy = e.changedTouches[0].clientY - start.y
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      swiped.current = true
      step(dx < 0 ? 1 : -1)
    }
  }

  return (
    <section ref={sectionRef} className="bg-[#fefefe] py-20 border-t border-[#e3e2de] overflow-hidden">
      {/* Carousel */}
      <div
        className="relative"
        style={{ height: dims.ch + 60, touchAction: 'pan-y' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {reels.map((id, i) => {
            const diff = getDiff(i, active, N)
            const abs  = Math.abs(diff)
            const visible = abs <= 2
            const s = getSlot(diff, dims)

            return (
              <div
                key={i}
                className="absolute rounded-2xl overflow-hidden"
                style={{
                  width:    s.w,
                  height:   s.h,
                  transform: `translateX(${s.x}px)`,
                  opacity:  s.opacity,
                  zIndex:   s.z,
                  cursor:   abs > 0 && visible ? 'pointer' : 'default',
                  pointerEvents: visible ? 'auto' : 'none',
                  transition: [
                    'width 520ms cubic-bezier(0.4,0,0.2,1)',
                    'height 520ms cubic-bezier(0.4,0,0.2,1)',
                    'transform 520ms cubic-bezier(0.4,0,0.2,1)',
                    'opacity 520ms cubic-bezier(0.4,0,0.2,1)',
                  ].join(', '),
                  willChange: 'width, height, transform, opacity',
                }}
                onClick={() => {
                  if (swiped.current) return
                  if (abs > 0 && visible) goTo(i)
                }}
              >
                {inView ? (
                  <video
                    ref={el => { videoRefs.current[i] = el }}
                    src={loaded.has(i) ? srcFor(id) : undefined}
                    poster={posterFor(id)}
                    loop
                    muted={isMuted || i !== active}
                    playsInline
                    preload={diff === 0 ? 'auto' : 'metadata'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#ece7e0]" />
                )}
                {abs > 0 && visible && (
                  <div className="absolute inset-0 bg-[#1a1410]/35" />
                )}
              </div>
            )
          })}
        </div>
        <button
          onClick={() => setIsMuted(m => !m)}
          aria-label={isMuted ? 'Unmute reel' : 'Mute reel'}
          aria-pressed={!isMuted}
          className="absolute z-10 grid place-items-center w-9 h-9 rounded-full bg-[#1a1410]/55 text-white backdrop-blur-sm hover:bg-[#1a1410]/75 transition-colors duration-300"
          style={{ top: 42, left: '50%', transform: `translateX(${dims.cw / 2 - 46}px)` }}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-5">
        {reels.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to reel ${i + 1}`}
            className="rounded-full transition-all duration-300"
            style={{
              width:  i === active ? 20 : 6,
              height: 6,
              background: i === active ? '#827064' : '#d9d4cf',
            }}
          />
        ))}
      </div>

      {/* CTA */}
      <div className="text-center mt-10">
        <a
          href="https://www.instagram.com/mjpbeauty"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-3 border border-[#3d3530] text-[#3d3530] text-sm tracking-[0.1em] uppercase font-medium rounded-full hover:bg-[#3d3530] hover:text-white transition-colors duration-300"
        >
          <SiInstagram size={14} />
          Follow on Instagram
        </a>
      </div>
    </section>
  )
}
