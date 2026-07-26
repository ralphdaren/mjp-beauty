import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { BROW_GUIDE_IMG } from '@/data/training'

export default function BrowGuidePopup({ onClose }: { onClose: () => void }) {
  const [visible, setVisible] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Slight delay so the backdrop mounts before animating in
    const t = setTimeout(() => setVisible(true), 30)
    return () => clearTimeout(t)
  }, [])

  function dismiss() {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  function handleGetGuide() {
    dismiss()
    navigate('/freebies')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: visible ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'blur(4px)' : 'blur(0px)',
        transition: 'background-color 0.3s ease, backdrop-filter 0.3s ease',
      }}
      onClick={dismiss}
    >
      <div
        className="relative bg-white rounded-[1.5rem] sm:rounded-[2rem] overflow-y-auto overscroll-contain w-full max-w-[760px] max-h-[90dvh] shadow-2xl flex flex-col sm:flex-row"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-[#5a5047] hover:text-[#827064] transition-all shadow-sm"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Left — image */}
        <div className="sm:w-1/2 shrink-0 h-40 sm:h-auto sm:aspect-[940/788] overflow-hidden">
          <img
            src={BROW_GUIDE_IMG}
            alt="Brow Business Starter Guide"
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* Right — content */}
        <div className="flex flex-col justify-center px-6 py-7 sm:px-8 sm:py-10 flex-1">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#a0948a] mb-3">MJP Beauty</p>
          <h2 className="text-xl font-semibold text-[#3d3530] leading-snug mb-3">
            Free Guide —<br />Brow Business Starter Guide
          </h2>
          <p className="text-xs text-[#6b5f58] leading-relaxed mb-7">
            Not ready for training just yet? Grab this free guide where Micah breaks down exactly
            how to start and grow your brow business — without the fears, mistakes, and confusion
            most beginners face.
          </p>

          <button
            onClick={handleGetGuide}
            className="w-full py-2.5 bg-[#827064] text-white text-xs tracking-widest uppercase rounded-full hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Get the Free Guide
          </button>

          <p className="text-[10px] text-[#b0a49e] mt-4 text-center">Available now on our Freebies page.</p>
        </div>
      </div>
    </div>
  )
}
