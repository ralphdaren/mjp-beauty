import { useState, useRef, useEffect } from 'react'
import { SiInstagram } from '@icons-pack/react-simple-icons'

const REELS = [
  'https://res.cloudinary.com/dr9nm40gf/video/upload/v1782541924/reel-01_hkcyzp.mp4',
  'https://res.cloudinary.com/dr9nm40gf/video/upload/v1782542116/reel-08_ww5dyh.mp4',
  'https://res.cloudinary.com/dr9nm40gf/video/upload/v1782542089/reel-05_eefxyq.mp4',
  'https://res.cloudinary.com/dr9nm40gf/video/upload/v1782542140/reel-06_jh8q0f.mp4',
  'https://res.cloudinary.com/dr9nm40gf/video/upload/v1782542105/reel-07_p7kqwg.mp4',
  'https://res.cloudinary.com/dr9nm40gf/video/upload/v1782542048/reel-03_qm8qzc.mp4',
  'https://res.cloudinary.com/dr9nm40gf/video/upload/v1782542075/reel-04_f692i6.mp4',
  'https://res.cloudinary.com/dr9nm40gf/video/upload/v1782541936/reel-02_z3kxis.mp4',
]

const N = REELS.length
const CARD_W = 235
const CARD_H = 440

function getDiff(i: number, active: number): number {
  const raw = ((i - active) % N + N) % N
  return raw > N / 2 ? raw - N : raw
}

function getSlotConfig(diff: number) {
  switch (diff) {
    case -2: return { x: -496, scale: 0.65, opacity: 0.45, z: 1 }
    case -1: return { x: -263, scale: 0.82, opacity: 0.8,  z: 2 }
    case  0: return { x:    0, scale: 1.00, opacity: 1.00, z: 3 }
    case  1: return { x:  263, scale: 0.82, opacity: 0.8,  z: 2 }
    case  2: return { x:  496, scale: 0.65, opacity: 0.45, z: 1 }
    default: return { x: diff < 0 ? -720 : 720, scale: 0.55, opacity: 0, z: -1 }
  }
}

export default function InstagramReels() {
  const [active, setActive] = useState(0)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>(new Array(N).fill(null))

  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return
      if (i === active) {
        v.play().catch(() => {})
      } else {
        v.pause()
      }
    })
  }, [active])

  return (
    <section className="bg-[#fefefe] py-20 border-t border-[#e3e2de] overflow-hidden">
      {/* Header */}
      <div className="anim-fade-up text-center mb-14 px-6">
        <p className="text-[10px] tracking-[0.35em] uppercase text-[#a0948a] mb-2">MJP Beauty</p>
        <h2 className="text-3xl font-semibold text-[#3d3530] mb-3">As seen on Instagram</h2>
        <p className="text-sm text-[#6b5f58] max-w-md mx-auto leading-relaxed">
          Real transformations from the studio chair — pulled straight from our feed.
        </p>
      </div>

      {/* Carousel */}
      <div className="relative" style={{ height: CARD_H + 60 }}>
        <div className="absolute inset-0 flex items-center justify-center">
          {REELS.map((url, i) => {
            const diff = getDiff(i, active)
            const abs = Math.abs(diff)
            const visible = abs <= 2
            const cfg = getSlotConfig(diff)

            return (
              <div
                key={i}
                className="absolute rounded-2xl overflow-hidden"
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  transform: `translateX(${cfg.x}px) scale(${cfg.scale})`,
                  opacity: cfg.opacity,
                  zIndex: cfg.z,
                  cursor: abs > 0 && visible ? 'pointer' : 'default',
                  pointerEvents: visible ? 'auto' : 'none',
                  transition: 'transform 520ms cubic-bezier(0.4,0,0.2,1), opacity 520ms cubic-bezier(0.4,0,0.2,1)',
                  willChange: 'transform, opacity',
                }}
                onClick={() => abs > 0 && visible && setActive(i)}
              >
                <video
                  ref={el => { videoRefs.current[i] = el }}
                  src={url}
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover"
                />
                {/* Overlay dims and blocks interaction on non-active cards */}
                {abs > 0 && visible && (
                  <div
                    className="absolute inset-0 bg-[#1a1410]/40"
                    style={{ transition: 'opacity 520ms cubic-bezier(0.4,0,0.2,1)' }}
                  />
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
            className="transition-all duration-300 rounded-full"
            style={{
              width: i === active ? 20 : 6,
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
