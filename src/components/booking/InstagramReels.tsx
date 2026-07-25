import { useState, useRef, useEffect } from 'react'
import { SiInstagram } from '@icons-pack/react-simple-icons'

const REELS = [
  'https://res.cloudinary.com/dr9nm40gf/video/upload/q_auto/f_auto/v1782541924/reel-01_hkcyzp.mp4',
  'https://res.cloudinary.com/dr9nm40gf/video/upload/q_auto/f_auto/v1782542116/reel-08_ww5dyh.mp4',
  'https://res.cloudinary.com/dr9nm40gf/video/upload/q_auto/f_auto/v1782542089/reel-05_eefxyq.mp4',
  'https://res.cloudinary.com/dr9nm40gf/video/upload/q_auto/f_auto/v1782542140/reel-06_jh8q0f.mp4',
  'https://res.cloudinary.com/dr9nm40gf/video/upload/q_auto/f_auto/v1782542105/reel-07_p7kqwg.mp4',
  'https://res.cloudinary.com/dr9nm40gf/video/upload/q_auto/f_auto/v1782542048/reel-03_qm8qzc.mp4',
  'https://res.cloudinary.com/dr9nm40gf/video/upload/q_auto/f_auto/v1782542075/reel-04_f692i6.mp4',
  'https://res.cloudinary.com/dr9nm40gf/video/upload/q_auto/f_auto/v1782541936/reel-02_z3kxis.mp4',
]

const N = REELS.length

// Cloudinary renders a still from the video itself, so the queued side cards
// have something to show before their <video> has decoded a frame.
const posterFor = (url: string) =>
  url.replace('/video/upload/', '/video/upload/so_0,w_400/').replace(/\.mp4$/, '.jpg')

// Center card: tall portrait rectangle
// Side ±1: square matching center width
// Side ±2: smaller square (partially clipped at viewport edge)
const CW = 300   // center width
const CH = 545   // center height
const S1 = 275   // ±1 square side
const S2 = 220   // ±2 square side
const GAP = 12   // visible space between adjacent cards

// A 300px center card on a phone pushes the side cards almost entirely
// off-screen, leaving only a sliver at each edge. Below that, scale the whole
// layout down together so the neighbours still read as videos.
function getDims(vw: number) {
  const cw = Math.min(CW, Math.round(vw * 0.6))
  const k = cw / CW
  const ch = Math.round(CH * k)
  const s1 = Math.round(S1 * k)
  const s2 = Math.round(S2 * k)
  const gap = Math.max(8, Math.round(GAP * k))
  // x = translateX from the container's horizontal centre (card-centre to card-centre)
  const x1 = cw / 2 + gap + s1 / 2
  const x2 = x1 + s1 / 2 + gap + s2 / 2
  return { cw, ch, s1, s2, x1, x2, park: x2 + s2 }
}

function getDiff(i: number, active: number): number {
  const raw = ((i - active) % N + N) % N
  return raw > N / 2 ? raw - N : raw
}

function getSlot(diff: number, d: ReturnType<typeof getDims>) {
  switch (diff) {
    case -2: return { x: -d.x2, w: d.s2, h: d.s2, opacity: 0.5,  z: 1 }
    case -1: return { x: -d.x1, w: d.s1, h: d.s1, opacity: 0.82, z: 2 }
    case  0: return { x:    0,  w: d.cw, h: d.ch, opacity: 1,    z: 3 }
    case  1: return { x:  d.x1, w: d.s1, h: d.s1, opacity: 0.82, z: 2 }
    case  2: return { x:  d.x2, w: d.s2, h: d.s2, opacity: 0.5,  z: 1 }
    // park off-screen at the same square size so they slide in naturally
    default: return { x: diff < 0 ? -d.park : d.park, w: d.s2, h: d.s2, opacity: 0, z: -1 }
  }
}

export default function InstagramReels() {
  const [active, setActive] = useState(0)
  const [inView, setInView] = useState(false)
  const [vw, setVw] = useState(() => (typeof window === 'undefined' ? 1280 : window.innerWidth))
  const sectionRef = useRef<HTMLElement | null>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>(new Array(N).fill(null))

  const dims = getDims(vw)

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
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
  }, [active, inView])

  const step = (dir: 1 | -1) => setActive(i => (i + dir + N) % N)

  // Track the finger so a horizontal drag advances the carousel. Nothing is
  // preventDefault-ed, so a mostly-vertical drag still scrolls the page.
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
          {REELS.map((url, i) => {
            const diff = getDiff(i, active)
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
                  // A swipe ends with a click on whichever card was under the
                  // finger; ignore it so the swipe target wins.
                  if (swiped.current) return
                  if (abs > 0 && visible) setActive(i)
                }}
              >
                {inView ? (
                  <video
                    ref={el => { videoRefs.current[i] = el }}
                    src={url}
                    poster={posterFor(url)}
                    loop
                    muted
                    playsInline
                    preload="metadata"
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
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-5">
        {REELS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
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
