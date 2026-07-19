import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface ComingSoonModalProps {
  onClose: () => void
}

export default function ComingSoonModal({ onClose }: ComingSoonModalProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  })

  function dismiss() {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{
        backgroundColor: visible ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'blur(4px)' : 'blur(0px)',
        transition: 'background-color 0.3s ease, backdrop-filter 0.3s ease',
      }}
      onClick={dismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby="coming-soon-title"
    >
      <div
        className="relative bg-white rounded-[2rem] overflow-hidden w-full max-w-[440px] shadow-2xl"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-[#5a5047] hover:text-[#827064] transition-all shadow-sm"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="px-8 py-12 text-center">
          <p className="text-[0.72rem] uppercase tracking-[0.28em] text-[#a0948a]">
            Coming Soon
          </p>

          <h2
            id="coming-soon-title"
            className="about-heading mt-5 text-[1.75rem] leading-tight font-semibold text-[#3d3028]"
          >
            BIZ Coaching is almost here.
          </h2>

          <p className="mt-4 text-base leading-relaxed text-[#5a5047]">
            Applications aren't open just yet — check back soon to book your session.
          </p>

          <button
            onClick={dismiss}
            className="mt-8 inline-flex items-center justify-center bg-[#3d3028] px-8 py-4 text-sm font-medium uppercase tracking-[0.18em] text-white transition-all duration-200 hover:opacity-90 active:scale-[0.99]"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
