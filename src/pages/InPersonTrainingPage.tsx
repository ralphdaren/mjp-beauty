import { useEffect, useState, useCallback } from 'react'
import ipHeadImg from '@/assets/in-person/ip-head.jpg'
import '@/styles/HomePage.css'

const idealForItems = [
  'Beginners who are passionate about launching a successful brow career and want a comprehensive, step-by-step education that covers all the essentials from the ground up.',
  'Intermediate artists seeking to deepen their knowledge, refine their technique, and elevate the quality of their brow services to deliver truly impressive, professional results.',
  'Beauty professionals who are ready to confidently expand their service offerings by mastering specialized brow techniques that complement their existing skills & service menu!',
  'Anyone looking for a flexible, hybrid learning experience that combines self-paced online study with hands-on, personalized mentorship to accelerate skill development and career growth.',
]

export default function InPersonTrainingPage() {
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [animating, setAnimating] = useState(false)

  const advance = useCallback(() => {
    setAnimating(true)
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % idealForItems.length)
      setAnimating(false)
    }, 300)
  }, [])

  // Auto-advance carousel
  useEffect(() => {
    const id = setInterval(advance, 6000)
    return () => clearInterval(id)
  }, [advance])

  // Scroll-triggered animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 }
    )
    document
      .querySelectorAll('.anim-fade-up, .anim-fade-left, .anim-fade-right')
      .forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // Back to top visibility
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 300)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <main>
      {/* ── Hero Section ────────────────────────────────────────────── */}
      <section className="hero-section">
        <img
          src={ipHeadImg}
          alt="In-Person Training"
          className="hero-video object-cover"
        />
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="hero-eyebrow text-sm tracking-[0.25em] uppercase text-white/70 mb-4 font-light">
            MJP Beauty
          </p>
          <h1 className="hero-heading about-heading text-4xl sm:text-5xl md:text-6xl font-semibold text-white leading-tight max-w-3xl text-center">
            The Ultimate In-Person Brow Training Experience
          </h1>
        </div>
      </section>

      {/* ── Description + Ideal For Section ─────────────────────────── */}
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
            <p className="text-[#5a5047] text-base sm:text-lg leading-relaxed font-medium">
              Ready to build your skills, confidence, and freedom as your own boss?
            </p>
          </div>

          {/* Right — Ideal For carousel */}
          <div className="anim-fade-right flex flex-col gap-6" style={{ transitionDelay: '0.2s' }}>
            <p className="text-[0.9rem] uppercase tracking-[0.28em] text-[#a0948a]">Ideal For</p>

            {/* Card */}
            <button
              onClick={advance}
              aria-label="Next ideal for"
              className="group text-left w-full rounded-2xl border border-[#e3e2de] bg-white shadow-[0_8px_32px_rgba(130,112,100,0.10)] p-8 cursor-pointer hover:shadow-[0_12px_40px_rgba(130,112,100,0.16)] transition-shadow duration-300"
            >
              {/* Number indicator */}
              <span className="inline-block mb-5 text-[2.5rem] font-semibold leading-none text-[#e3d9d0]">
                {String(activeIndex + 1).padStart(2, '0')}
              </span>

              {/* Text with fade transition */}
              <p
                style={{
                  opacity: animating ? 0 : 1,
                  transform: animating ? 'translateY(10px)' : 'translateY(0)',
                  transition: 'opacity 0.3s ease, transform 0.3s ease',
                  minHeight: '8rem',
                }}
                className="text-[#3d3028] text-base sm:text-lg leading-relaxed"
              >
                {idealForItems[activeIndex]}
              </p>

              {/* Hint */}
              <p className="mt-6 text-[0.72rem] uppercase tracking-[0.22em] text-[#a0948a] group-hover:text-[#827064] transition-colors duration-200">
                Click or wait for next →
              </p>
            </button>

            {/* Dot indicators */}
            <div className="flex gap-2.5">
              {idealForItems.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setAnimating(true)
                    setTimeout(() => {
                      setActiveIndex(i)
                      setAnimating(false)
                    }, 300)
                  }}
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

      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
        className={['back-to-top', showBackToTop ? 'back-to-top--visible' : ''].join(' ')}
      >
        <span className="back-to-top-arrow">↑</span>
        <span className="back-to-top-label">TOP</span>
      </button>
    </main>
  )
}
