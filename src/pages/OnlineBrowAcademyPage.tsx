import { useEffect, useState, useCallback } from 'react'
import olHeadImg from '@/assets/online/ol-head.jpg'
import '@/styles/HomePage.css'

const youWillItems = [
  'Master the technique of knowing exactly when to remove the perm solution — no more relying on your timers. No more under- or over-processing of the brows. Just beautifully lifted, natural-looking lamination results every time.',
  'Say goodbye to patchy stains and harsh lines — and hello to clean, defined, and long-lasting results. Learn how to master natural-looking skin stains using one of the industry\'s top brow tints, so you can finally feel confident in your tinting every single time.',
  'Learn the exact business strategies, systems, and frameworks I used to grow my beauty business entirely on Instagram — so you can build a brand that\'s profitable, booked out, and built to last!',
  'Master a proven mapping method that transforms your brow results — so you can confidently map balanced, symmetrical brows tailored to each client\'s unique features (even the tricky, uneven ones)!',
  'Go beyond basic waxing techniques — gain the knowledge and skills to confidently wax brows while protecting your client\'s skin. Learn how to avoid skin lifting, understand ingredient interactions, and deliver flawless results every time that your clients love.',
  'Unlock the rare, expert details in brow artistry that will set you apart from your competition — educational insights you won\'t find anywhere else. This training focuses on the details to help you create a raving fan club of clients and a most importantly, a steady income!',
]

export default function OnlineBrowAcademyPage() {
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [animating, setAnimating] = useState(false)

  const advance = useCallback(() => {
    setAnimating(true)
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % youWillItems.length)
      setAnimating(false)
    }, 300)
  }, [])

  useEffect(() => {
    const id = setInterval(advance, 6000)
    return () => clearInterval(id)
  }, [advance])

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
          src={olHeadImg}
          alt="Online Brow Academy"
          className="hero-video object-cover"
        />
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="hero-eyebrow text-sm tracking-[0.25em] uppercase text-white/70 mb-4 font-light">
            MJP Beauty
          </p>
          <h1 className="hero-heading about-heading text-4xl sm:text-5xl md:text-6xl font-semibold text-white leading-tight max-w-3xl text-center">
            The All-Inclusive Online Brow Education
          </h1>
        </div>
      </section>

      {/* ── Description + You Will Section ──────────────────────────── */}
      <section className="bg-[#f6f2ec] py-20 px-6 md:px-8">
        <div className="mx-auto max-w-[1200px] grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">

          {/* Left — description */}
          <div className="anim-fade-left flex flex-col gap-6" style={{ transitionDelay: '0.1s' }}>
            <p className="text-[0.9rem] uppercase tracking-[0.28em] text-[#a0948a]">About the Training</p>
            <p className="text-[#3d3028] text-base sm:text-lg leading-relaxed font-semibold">
              Raising the Standards of Brow Education
            </p>
            <p className="text-[#3d3028] text-base sm:text-lg leading-relaxed">
              An Experience Unlike Anything You've Seen Before — ​Designed for Artists. Backed by Expertise. Built for Success.
            </p>
            <p className="text-[#3d3028] text-base sm:text-lg leading-relaxed">
              Unlock the MJP Beauty way of brows and gain insider access to specialized techniques in this all-inclusive online training. Packed with game-changing methods that removes the guesswork out of brow artistry and a training structure trusted by hundreds of Artists. This online course provides the most comprehensive education empowering you to deliver consistent, long-lasting, natural brow services that your clients will rave about.
            </p>
          </div>

          {/* Right — You Will carousel */}
          <div className="anim-fade-right flex flex-col gap-6" style={{ transitionDelay: '0.2s' }}>
            <p className="text-[0.9rem] uppercase tracking-[0.28em] text-[#a0948a]">You Will</p>

            <button
              onClick={advance}
              aria-label="Next item"
              className="group text-left w-full rounded-2xl border border-[#e3e2de] bg-white shadow-[0_8px_32px_rgba(130,112,100,0.10)] p-8 cursor-pointer hover:shadow-[0_12px_40px_rgba(130,112,100,0.16)] transition-shadow duration-300 flex flex-col"
              style={{ minHeight: '22rem' }}
            >
              <span className="inline-block mb-5 text-[2.5rem] font-semibold leading-none text-[#e3d9d0]">
                {String(activeIndex + 1).padStart(2, '0')}
              </span>
              <p
                style={{
                  opacity: animating ? 0 : 1,
                  transform: animating ? 'translateY(10px)' : 'translateY(0)',
                  transition: 'opacity 0.3s ease, transform 0.3s ease',
                }}
                className="flex-1 text-[#3d3028] text-base sm:text-lg leading-relaxed"
              >
                {youWillItems[activeIndex]}
              </p>
              <p className="mt-6 text-[0.72rem] uppercase tracking-[0.22em] text-[#a0948a] group-hover:text-[#827064] transition-colors duration-200">
                Click →
              </p>
            </button>

            <div className="flex gap-2.5">
              {youWillItems.map((_, i) => (
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
        <span className="back-to-top-label">BACK TO TOP</span>
      </button>
    </main>
  )
}
