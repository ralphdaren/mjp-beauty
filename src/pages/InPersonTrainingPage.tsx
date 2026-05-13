import { useEffect, useState } from 'react'
import ipHeadImg from '@/assets/in-person/ip-head.jpg'
import '@/styles/HomePage.css'

export default function InPersonTrainingPage() {
  const [showBackToTop, setShowBackToTop] = useState(false)

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
      {/* Landing Hero Section */}
      <section className="hero-section">
        {/* Background image */}
        <img
          src={ipHeadImg}
          alt="In-Person Training"
          className="hero-video object-cover"
        />

        {/* Dark overlay */}
        <div className="hero-overlay" />

        {/* Text content */}
        <div className="hero-content">
          <p className="hero-eyebrow text-sm tracking-[0.25em] uppercase text-white/70 mb-4 font-light">
            MJP Beauty
          </p>
          <h1 className="hero-heading about-heading text-4xl sm:text-5xl md:text-6xl font-semibold text-white leading-tight max-w-3xl">
            The Ultimate In-Person Training Experience
          </h1>
          <div className="hero-tagline mt-6 max-w-2xl flex flex-col gap-4 text-center">
            <p className="text-sm sm:text-base text-white/80 leading-relaxed tracking-wide font-light">
              This is Canada's first Hybrid-style Brow Training, combining the best of both worlds.
              Enrolled students receive full access to my comprehensive Online Brow Course to learn
              foundational theory and techniques at their own pace, followed by an in-person training
              day focused on hands-on practice and skill refinement.
            </p>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed tracking-wide font-light">
              Ready to build your skills, confidence, and freedom as your own boss?
            </p>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="hero-bottom-fade" />
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
