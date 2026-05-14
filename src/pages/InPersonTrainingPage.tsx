import { useEffect, useState, useCallback } from 'react'
import ipHeadImg from '@/assets/in-person/ip-head.jpg'
import formatImg01 from '@/assets/in-person/format-img-01.jpg'
import formatImg02 from '@/assets/in-person/format-img-02.jpg'
import formatImg03 from '@/assets/in-person/format-img-03.jpg'
import '@/styles/HomePage.css'

const idealForItems = [
  'Beginners who are passionate about launching a successful brow career and want a comprehensive, step-by-step education that covers all the essentials from the ground up.',
  'Intermediate artists seeking to deepen their knowledge, refine their technique, and elevate the quality of their brow services to deliver truly impressive, professional results.',
  'Beauty professionals who are ready to confidently expand their service offerings by mastering specialized brow techniques that complement their existing skills & service menu!',
  'Anyone looking for a flexible, hybrid learning experience that combines self-paced online study with hands-on, personalized mentorship to accelerate skill development and career growth.',
]

const formatItems = [
  {
    img: formatImg01,
    alt: 'Complete Online Brow Course Modules',
    step: '01',
    title: 'Complete Online Brow Course Modules',
    paragraphs: [
      'Master every step of the brow artistry process through 5 Core Online Modules — covering Brow Lamination, Mapping, Tinting, and Waxing. Each module is packed with in-depth theory, specialized techniques, and step-by-step video demonstrations designed to help you understand, apply, and perfect your craft before you ever step into the studio.',
      "You'll receive instant access to the online training as soon as your deposit is submitted, giving you plenty of time to study, absorb, and build a strong foundation before your hands-on training day with Micah.",
    ],
  },
  {
    img: formatImg02,
    alt: 'Attend your In-Person Training Day',
    step: '02',
    title: 'Attend your In-Person Training Day',
    paragraphs: [
      "A full-day hands-on experience designed to refine your technique, boost confidence, and apply everything you've learned in the online course.",
      'Practice on two live models, complete skill-focused drills, and receive real-time feedback, mentorship, and final Q&A support to elevate your brow artistry.',
    ],
  },
  {
    img: formatImg03,
    alt: 'Post-Training Support',
    step: '03',
    title: 'Post-Training Support',
    paragraphs: [
      "Following your in-person training, you'll unlock 3 full months of personalized mentorship and support directly with Micah — helping you refine your craft, build confidence, and achieve results faster.",
      "This exclusive post-training access is a rare opportunity that most trainings don't provide — but it's exactly why MJP Beauty alumni students stand out!",
    ],
  },
]

export default function InPersonTrainingPage() {
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [hoveredFormat, setHoveredFormat] = useState<number | null>(null)

  const advance = useCallback(() => {
    setAnimating(true)
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % idealForItems.length)
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

  const anyHovered = hoveredFormat !== null

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
            <p className="text-[0.9rem] uppercase tracking-[0.28em] text-[#a0948a]">Ideal For</p>

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
                {idealForItems[activeIndex]}
              </p>
              <p className="mt-6 text-[0.72rem] uppercase tracking-[0.22em] text-[#a0948a] group-hover:text-[#827064] transition-colors duration-200">
                Click or wait for next →
              </p>
            </button>

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

      {/* ── How It Works Section ─────────────────────────────────────── */}
      <section className="bg-white">
        {/* Section header */}
        <div className="anim-fade-up pt-16 pb-10 px-6 md:px-8 text-center">
          <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#a0948a] mb-3">
            The Training Format
          </p>
          <h2 className="about-heading text-3xl sm:text-4xl md:text-[2.6rem] font-semibold text-[#3d3028] leading-tight">
            How it Works
          </h2>
          <div className="mt-8 flex items-center gap-4 max-w-xl mx-auto">
            <div className="flex-1 h-px bg-[#d6cec8]" />
            <p className="text-[0.72rem] uppercase tracking-[0.22em] text-[#a0948a] whitespace-nowrap">
              This in-person training format is as follows
            </p>
            <div className="flex-1 h-px bg-[#d6cec8]" />
          </div>
        </div>

        {/* Image strips */}
        <div
          className="flex w-full overflow-hidden"
          style={{ height: '680px' }}
          onMouseLeave={() => setHoveredFormat(null)}
        >
          {formatItems.map((item, i) => {
            const isHovered = hoveredFormat === i
            const flex = isHovered ? 2.6 : anyHovered ? 0.7 : 1

            return (
              <div
                key={i}
                onMouseEnter={() => setHoveredFormat(i)}
                className="relative overflow-hidden cursor-pointer"
                style={{
                  flex,
                  transition: 'flex 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: 'translateZ(0)',
                }}
              >
                <img
                  src={item.img}
                  alt={item.alt}
                  className="absolute inset-0 w-full h-full object-cover"
                />

                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(20,10,5,0.82) 0%, rgba(20,10,5,0.12) 55%, transparent 100%)',
                  }}
                />

                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(10,5,2,0.48) 0%, rgba(10,5,2,0.18) 60%, transparent 100%)',
                    opacity: isHovered ? 1 : 0,
                    transition: 'opacity 0.4s ease',
                  }}
                />

                {/* Step number */}
                <span
                  className="absolute bottom-6 left-6 font-semibold leading-none select-none"
                  style={{
                    fontSize: '4.5rem',
                    color: 'rgba(255,255,255,0.28)',
                    opacity: isHovered ? 0 : 1,
                    transition: 'opacity 0.25s ease',
                  }}
                >
                  {item.step}
                </span>

                {/* Text content */}
                <div
                  className="absolute inset-x-0 bottom-0 px-7 pb-8 flex flex-col gap-3"
                  style={{
                    opacity: isHovered ? 1 : 0,
                    transform: isHovered ? 'translateY(0)' : 'translateY(18px)',
                    transition: isHovered
                      ? 'opacity 0.4s ease 0.1s, transform 0.4s ease 0.1s'
                      : 'opacity 0.1s ease, transform 0.1s ease',
                    pointerEvents: isHovered ? 'auto' : 'none',
                  }}
                >
                  <span className="text-[2.8rem] font-semibold leading-none select-none text-white/20">
                    {item.step}
                  </span>
                  <h3 className="text-lg sm:text-xl font-semibold text-white leading-snug">
                    {item.title}
                  </h3>
                  {item.paragraphs.map((para, j) => (
                    <p key={j} className="text-white/80 text-base leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>

                {/* Collapsed label */}
                <div
                  className="absolute inset-x-0 bottom-6 px-5 text-center"
                  style={{
                    opacity: anyHovered ? 0 : 1,
                    transition: 'opacity 0.25s ease',
                  }}
                >
                  <p className="text-white/60 text-[0.65rem] uppercase tracking-[0.22em]">
                    hover to explore
                  </p>
                </div>
              </div>
            )
          })}
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
