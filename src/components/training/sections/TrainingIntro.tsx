import { useCallback, useEffect, useState } from 'react'
import { IDEAL_FOR_ITEMS } from '@/data/training'

const FADE_MS = 300
const AUTOPLAY_MS = 6000

export default function TrainingIntro() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [animating, setAnimating] = useState(false)

  // Cross-fade out, swap the copy, fade back in.
  const goTo = useCallback((next: (prev: number) => number) => {
    setAnimating(true)
    setTimeout(() => {
      setActiveIndex(next)
      setAnimating(false)
    }, FADE_MS)
  }, [])

  const advance = useCallback(() => {
    goTo((prev) => (prev + 1) % IDEAL_FOR_ITEMS.length)
  }, [goTo])

  useEffect(() => {
    const id = setInterval(advance, AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [advance])

  return (
    <section className="bg-[#f6f2ec] py-20 px-6 md:px-8">
      <div className="mx-auto max-w-[1200px] grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">

        {/* Left — description */}
        <div className="anim-fade-left flex flex-col gap-6" style={{ transitionDelay: '0.1s' }}>
          <p className="text-[0.9rem] uppercase tracking-[0.28em] text-[#a0948a]">About the Training</p>
          <p className="text-[#3d3028] text-base sm:text-lg leading-relaxed">
            This is Canada's first Hybrid-style Brow Training, combining the best of both worlds.
            Enrolled students receive full access to my comprehensive Online Brow Course to learn
            foundational theory and techniques at their own pace, followed by an in-person training
            day focused on hands-on practice and skill refinement.
          </p>
          <p className="text-[#3d3028] text-base sm:text-lg leading-relaxed">
            This optimized training approach at MJP Beauty is recognized across Canada for producing
            outstanding student success rates!
          </p>
          <p className="text-[#5a5047] text-base sm:text-lg leading-relaxed font-medium">
            Ready to build your skills, confidence, and freedom as your own boss?
          </p>
        </div>

        {/* Right — Ideal For carousel */}
        <div className="anim-fade-right flex flex-col gap-6" style={{ transitionDelay: '0.2s' }}>
          <p className="text-[0.9rem] uppercase tracking-[0.28em] text-[#a0948a]">This is for you if ...</p>

          <button
            onClick={advance}
            aria-label="Next ideal for"
            className="group text-left w-full rounded-2xl border border-[#e3e2de] bg-white shadow-[0_8px_32px_rgba(130,112,100,0.10)] p-8 cursor-pointer hover:shadow-[0_12px_40px_rgba(130,112,100,0.16)] transition-shadow duration-300"
          >
            <span className="inline-block mb-5 text-[2.5rem] font-semibold leading-none text-[#e3d9d0]">
              {String(activeIndex + 1).padStart(2, '0')}
            </span>
            <p
              style={{
                opacity: animating ? 0 : 1,
                transform: animating ? 'translateY(10px)' : 'translateY(0)',
                transition: 'opacity 0.3s ease, transform 0.3s ease',
                minHeight: '8rem',
              }}
              className="text-[#3d3028] text-base sm:text-lg leading-relaxed"
            >
              {IDEAL_FOR_ITEMS[activeIndex]}
            </p>
            <p className="mt-6 text-[0.72rem] uppercase tracking-[0.22em] text-[#a0948a] group-hover:text-[#827064] transition-colors duration-200">
              Click →
            </p>
          </button>

          <div className="flex gap-2.5">
            {IDEAL_FOR_ITEMS.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(() => i)}
                aria-label={`Go to item ${i + 1}`}
                className={[
                  'h-1.5 rounded-full transition-all duration-300',
                  i === activeIndex
                    ? 'w-6 bg-[#827064]'
                    : 'w-1.5 bg-[#d4ccc4] hover:bg-[#a0948a]',
                ].join(' ')}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
