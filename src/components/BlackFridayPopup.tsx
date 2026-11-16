import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { cld, toSrcSet } from '@/lib/cloudinary'
import { BLACK_FRIDAY, hasBlackFridayStarted } from '@/data/promos'

const posterDesktop = cld(BLACK_FRIDAY.image, ',c_fill,g_auto,ar_2:3')
// Mobile: a landscape crop around the "BLACK FRIDAY 15% OFF" headline on the poster.
const posterMobile = (w: number) =>
  `https://res.cloudinary.com/dr9nm40gf/image/upload/c_crop,x_300,y_700,w_1200,h_800/f_auto,q_auto:good,w_${w}/${BLACK_FRIDAY.image}`

export default function BlackFridayPopup({ onClose }: { onClose: () => void }) {
  const [visible, setVisible] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const started = hasBlackFridayStarted()

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30)
    closeRef.current?.focus({ preventScroll: true })
    return () => clearTimeout(t)
  }, [])

  function dismiss() {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  })

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{
        backgroundColor: visible ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'blur(4px)' : 'blur(0px)',
        transition: 'background-color 0.3s ease, backdrop-filter 0.3s ease',
      }}
      onClick={dismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby="black-friday-title"
    >
      <div
        className="relative bg-white rounded-[1.5rem] sm:rounded-[2rem] overflow-y-auto overscroll-contain w-full max-w-[720px] max-h-[90dvh] shadow-2xl flex flex-col sm:flex-row"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          onClick={dismiss}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-[#5a5047] hover:text-[#827064] transition-all shadow-sm"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="sm:w-[45%] shrink-0 h-48 sm:h-auto overflow-hidden bg-[#f3f1ee]">
          <picture>
            <source media="(min-width: 640px)" srcSet={toSrcSet(posterDesktop, [330, 660, 990])} sizes="324px" />
            <img
              src={posterMobile(900)}
              srcSet={toSrcSet(posterMobile, [600, 900, 1200])}
              sizes="100vw"
              alt="Black Friday, 15% off all online brow courses, November 19 to 25"
              className="w-full h-full object-cover"
              decoding="async"
            />
          </picture>
        </div>

        <div className="flex flex-col justify-center px-6 py-7 sm:px-9 sm:py-10 flex-1">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#a0948a] mb-3">
            {started ? 'Black Friday sale is on' : 'Black Friday is coming early'}
          </p>
          <h2 id="black-friday-title" className="text-2xl font-semibold text-[#3d3530] leading-snug mb-4">
            15% off all online<br />brow courses
          </h2>

          <div className="rounded-xl bg-[#f7f4f1] px-4 py-3.5 mb-4">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#827064] mb-1">VIP bonus</p>
            <p className="text-xs text-[#5a5047] leading-relaxed">
              The first 3 students to sign up for the All-In-One Course VIP get a free 60-minute
              biz strategy call ($267 value).
            </p>
          </div>

          <p className="text-xs text-[#6b5f58] leading-relaxed mb-6">
            {started
              ? 'On now until November 25. Time to stand out and become the go-to brow artist in your city.'
              : 'Starts November 19 at 8 AM (Manitoba time) and runs until November 25. Set those alarms!'}
          </p>

          <a
            href={BLACK_FRIDAY.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className="w-full py-2.5 bg-[#827064] text-white text-xs text-center tracking-widest uppercase rounded-full hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Join the waitlist
          </a>

          <button
            onClick={dismiss}
            className="text-[11px] text-[#b0a49e] hover:text-[#827064] mt-4 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}
