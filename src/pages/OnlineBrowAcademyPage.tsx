import { useEffect, useLayoutEffect, useState, useCallback, useRef } from 'react'
import olHeadImg from '@/assets/online/ol-head.jpg'
import optImg01 from '@/assets/online/opt-img-01.jpg'
import optImg02 from '@/assets/online/opt-img-02.jpg'
import curriculumImg from '@/assets/online/curriculum-img.jpg'
import '@/styles/HomePage.css'

const youWillItems = [
  'Master the technique of knowing exactly when to remove the perm solution — no more relying on your timers. No more under- or over-processing of the brows. Just beautifully lifted, natural-looking lamination results every time.',
  'Say goodbye to patchy stains and harsh lines — and hello to clean, defined, and long-lasting results. Learn how to master natural-looking skin stains using one of the industry\'s top brow tints, so you can finally feel confident in your tinting every single time.',
  'Learn the exact business strategies, systems, and frameworks I used to grow my beauty business entirely on Instagram — so you can build a brand that\'s profitable, booked out, and built to last!',
  'Master a proven mapping method that transforms your brow results — so you can confidently map balanced, symmetrical brows tailored to each client\'s unique features (even the tricky, uneven ones)!',
  'Go beyond basic waxing techniques — gain the knowledge and skills to confidently wax brows while protecting your client\'s skin. Learn how to avoid skin lifting, understand ingredient interactions, and deliver flawless results every time that your clients love.',
  'Unlock the rare, expert details in brow artistry that will set you apart from your competition — educational insights you won\'t find anywhere else. This training focuses on the details to help you create a raving fan club of clients and a most importantly, a steady income!',
]

type CurriculumMod = { num: string; name: string }
type CurriculumPart =
  | { type: 'modules'; tab: string; tabSub: string; partLabel: string; title: string; modules: CurriculumMod[] }
  | { type: 'business'; tab: string; tabSub: string; partLabel: string; title: string; description: string; bullets: string[] }
  | { type: 'bonuses'; tab: string; tabSub: string; partLabel: string; title: string; items: { label: string; sub: string; bullets?: string[] }[] }

const curriculumParts: CurriculumPart[] = [
  {
    type: 'modules',
    tab: 'Part 1',
    tabSub: 'Brow Lamination Theory',
    partLabel: 'Part 1',
    title: 'Brow Lamination Theory',
    modules: [
      { num: 'Mod 01', name: 'Brow Lamination Theory' },
      { num: 'Mod 02', name: 'Health & Safety' },
      { num: 'Mod 03', name: 'Consultations & Consent Forms (Digital vs Printed)' },
      { num: 'Mod 04', name: 'Products & Tools (TGA vs Cysteamine-based Systems)' },
      { num: 'Mod 05', name: 'Equipment' },
      { num: 'Mod 06', name: 'Hygiene & Sanitation' },
      { num: 'Mod 07', name: 'Workstation Set-up' },
      { num: 'Mod 08', name: 'Aftercare & Three Aftercare Kit Options for your Clients' },
    ],
  },
  {
    type: 'modules',
    tab: 'Part 2',
    tabSub: 'Brow Lamination Process',
    partLabel: 'Part 2',
    title: 'Brow Lamination Process',
    modules: [
      { num: 'Mod 10', name: 'Step-by-Step Lami Service Overview' },
      { num: 'Mod 11', name: 'Brow Prep & Cleansing' },
      { num: 'Mod 12', name: 'Understanding Step 1 Perming Solution' },
      { num: 'Mod 13', name: 'Understanding Step 2 Nourishing Solution' },
      { num: 'Mod 14', name: 'Styling & Concealing' },
      { num: 'Mod 15', name: 'Step 3 Nourishing Agent' },
      { num: 'Mod 16', name: 'Troubleshooting Brow Lamination Problems (Over-processing VS Under-processing)' },
    ],
  },
  {
    type: 'modules',
    tab: 'Part 3',
    tabSub: 'Brow Mapping Fundamentals',
    partLabel: 'Part 3',
    title: 'Brow Mapping Fundamentals',
    modules: [
      { num: 'Mod 17', name: 'Intro to Brow Mapping' },
      { num: 'Mod 18', name: 'Brow Mapping Consultations' },
      { num: 'Mod 19', name: 'Tools & Essentials' },
      { num: 'Mod 20', name: 'Step-by-Step of Signature Mapping Technique' },
      { num: 'Mod 21', name: "Do's & Don'ts of Brow Mapping" },
      { num: 'Mod 22', name: 'Face Shapes & Brows' },
      { num: 'Mod 23', name: 'Troubleshooting Challenging & Asymmetrical Brows ("Hook brows", Triangle brows, "S-brows")' },
      { num: 'Mod 24', name: 'Achieving Custom Brow Shapes (Straight, Soft, Angled, Lifted Brows)' },
      { num: 'Mod 25', name: 'Bonus Mapping with Paste' },
    ],
  },
  {
    type: 'modules',
    tab: 'Part 4',
    tabSub: 'Brow Tinting Fundamentals',
    partLabel: 'Part 4',
    title: 'Brow Tinting Fundamentals',
    modules: [
      { num: 'Mod 26', name: 'Intro to Natural Brow Tinting Fundamentals' },
      { num: 'Mod 27', name: 'Health & Safety' },
      { num: 'Mod 28', name: 'Product Knowledge (using industry leading brand, Brow Code)' },
      { num: 'Mod 29', name: 'Tools & Equipment' },
      { num: 'Mod 30', name: 'Step-by-Step Tinting Technique' },
      { num: 'Bonus', name: 'Troubleshooting Brow Tinting Problems' },
    ],
  },
  {
    type: 'modules',
    tab: 'Part 5',
    tabSub: 'Brow Waxing Fundamentals',
    partLabel: 'Part 5',
    title: 'Brow Waxing Fundamentals',
    modules: [
      { num: 'Mod 32', name: 'Intro to Brow Waxing' },
      { num: 'Mod 33', name: 'Health & Safety — Contraindications & Understanding Skincare Ingredients' },
      { num: 'Mod 34', name: 'Waxing Product Knowledge' },
      { num: 'Mod 35', name: 'Waxing Product Tools' },
      { num: 'Mod 36', name: 'Step-by-Step Overview Strip Waxing Service' },
      { num: 'Mod 37', name: 'Waxing Application & Removal Technique' },
      { num: 'Mod 38', name: 'Tweezing Technique — tweeze, micro-trim & "debulking"' },
      { num: 'Mod 39', name: 'Troubleshooting Wax Application Problems' },
    ],
  },
  {
    type: 'business',
    tab: 'Business & Brows',
    tabSub: '',
    partLabel: '',
    title: 'Business & Brows',
    description:
      'Learn the exact systems and strategies I used to grow my beauty business organically through Instagram — the same ones that helped me become a recognized Brow Artist & Educator in my city and across the country. Inside this module, you\'ll dive into:',
    bullets: [
      'Pricing for Profit — Pricing strategies that actually make sense',
      'Curating a Loyal Clientele',
      'Marketing & Branding + access to my Social Media Ebook Glam Up Your Grid',
      'How to start and grow your Brow Business from the ground up',
      'How to capture IG-worthy content straight from your phone',
      'How & What to Upsell Retail Brow Products to Clients',
    ],
  },
  {
    type: 'bonuses',
    tab: 'Bonuses',
    tabSub: '',
    partLabel: '',
    title: 'Bonuses',
    items: [
      {
        label: 'Video Demonstrations',
        sub: '7 Model Demonstrations from Start to Finish',
        bullets: [
          '(2) Full Brow Lami Service on Sparse, Thin Brows',
          '(1) Full Brow Lami Service on Average, Normal Brows',
          '(1) Naked Brow Lami Service on Full Brows',
          '(1) Brow Lamination Maintenance Service',
          '(1) Brow Mapping on Non-laminated Brows',
          '(1) Brow Mapping on Laminated Brows',
          '(1) Brow Tinting Demo on Laminated Brows',
        ],
      },
      { label: '40+ Video Lectures', sub: 'Every module comes with a detailed video lesson and high-quality video tutorials to walk you through each technique step by step' },
      { label: '250+ pages Downloadable Training Manual', sub: '"Brow Artistry Blueprint"' },
      { label: '70+ pages Downloadable Social Media Ebook', sub: '"Glam Up Your Grid"' },
      { label: '"The Brow Lab" Chapter', sub: "Insider look into Brow Brands and Products I'm currently trialling, testing and loving" },
      { label: 'Access to Downloadable & Printable Consent Form Templates', sub: '' },
      { label: '"Natural Brow Checklist"', sub: '' },
      { label: 'Exclusive Student Discount Codes', sub: '' },
    ],
  },
]

const onlineOptionCards = [
  {
    img: optImg01,
    alt: 'Independent Artist',
    label: 'Option 01',
    title: 'Independent Artist',
    price: '$649',
    subtitle: 'For motivated Artists who prefer self-guided learning',
    idealPrefix: 'Ideal for the Artist:',
    shadowClass: 'shadow-[0_8px_32px_rgba(130,112,100,0.10)]',
    bullets: [
      'Who is confident in their ability to learn and apply techniques without needing constant guidance',
      'Who is self-motivated, driven, and prefers learning on their own time and terms',
      'Looking for a budget-friendly training option without sacrificing quality, depth, or transformation',
      'Enjoys working through structured modules at their own rhythm, with the freedom to revisit content as needed',
      'Who is a seasoned Pro looking to elevate and refine the details of their craft',
      'Who feels empowered by working independently and enjoys the challenge of figuring things out through structured guidance',
    ],
  },
  {
    img: optImg02,
    alt: 'VIP Mentorship',
    label: 'Option 02',
    title: 'VIP Mentorship',
    price: '$849',
    subtitle: 'For artists who are motivated, independent learners but still want the security and guidance of expert mentorship.',
    idealPrefix: 'Ideal for the Artist who:',
    shadowClass: 'shadow-[0_12px_40px_rgba(130,112,100,0.15)]',
    bullets: [
      'Thrives with self-paced learning but still wants expert guidance',
      'Prefers to learn independently while having support when needed',
      'Values personalized and detailed post-training feedback (Student is entitled to up to 3 model submissions)',
      'Wants unlimited chat support for 6 months for questions, corrections, and technique reviews',
      'Is ready to elevate their skills with both learning freedom and mentorship',
    ],
  },
]

export default function OnlineBrowAcademyPage() {
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [activeOption, setActiveOption] = useState(0)
  const [activePart, setActivePart] = useState(0)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 0 })

  useLayoutEffect(() => {
    const el = tabRefs.current[activePart]
    if (el) setIndicatorStyle({ top: el.offsetTop, height: el.offsetHeight })
  }, [activePart])

  const handleOptionSwitch = useCallback(() => {
    setActiveOption((prev) => 1 - prev)
  }, [])

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

      {/* ── Choose Your Path Section ─────────────────────────────────── */}
      <section className="bg-white py-20 px-6 md:px-8">
        {/* Section header */}
        <div className="anim-fade-up text-center mb-14">
          <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#a0948a] mb-3">
            Investment
          </p>
          <h2 className="about-heading text-3xl sm:text-4xl md:text-[2.6rem] font-semibold text-[#3d3028] leading-tight">
            Choose Your Path
          </h2>
          <div className="mt-8 flex items-center gap-4 max-w-2xl mx-auto">
            <div className="flex-1 h-px bg-[#d6cec8]" />
            <p className="text-[0.72rem] uppercase tracking-[0.22em] text-[#a0948a] text-center">
              Powerful ways to experience the game-changing brow education.
            </p>
            <div className="flex-1 h-px bg-[#d6cec8]" />
          </div>
        </div>

        {/* Option cards */}
        <div className="anim-fade-up mx-auto max-w-[1000px]">

          {/* ── Mobile stacked layout ── */}
          <div className="sm:hidden flex flex-col gap-6">
            {onlineOptionCards.map((card, i) => (
              <div
                key={i}
                className={`rounded-2xl border border-[#e3e2de] bg-white ${card.shadowClass} overflow-hidden flex flex-col`}
              >
                <div className="relative h-64 flex-shrink-0 overflow-hidden">
                  <img src={card.img} alt={card.alt} className="absolute inset-0 w-full h-full object-cover" />
                </div>
                <div className="p-8 flex flex-col">
                  <p className="text-[0.7rem] uppercase tracking-[0.28em] text-[#a0948a] mb-4">{card.label}</p>
                  <h3 className="about-heading text-2xl font-semibold text-[#3d3028] leading-tight mb-4">{card.title}</h3>
                  <div className="mb-1 flex items-baseline gap-1.5">
                    <span className="text-sm text-[#a0948a] font-medium">Reg.</span>
                    <span className="text-[3rem] font-semibold text-[#3d3028] leading-none">{card.price}</span>
                    <span className="text-xl text-[#5a5047] ml-1">CAD</span>
                  </div>
                  <p className="text-[#5a5047] text-sm leading-relaxed mb-6">{card.subtitle}</p>
                  <div className="h-px bg-[#e3e2de] mb-4" />
                  <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[#a0948a] mb-3">{card.idealPrefix}</p>
                  <ul className="flex flex-col gap-2">
                    {card.bullets.map((b, j) => (
                      <li key={j} className="flex items-start gap-2.5">
                        <span className="mt-[7px] w-1 h-1 rounded-full bg-[#a0948a] shrink-0" />
                        <span className="text-[#5a5047] text-sm leading-relaxed">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* ── Desktop animated layout ── */}
          <div className="hidden sm:block relative">

            {/* Ghost sizer — uses the longer card (index 0) to set container height */}
            <div
              className="invisible pointer-events-none flex flex-row"
              style={{ width: 'calc(80% - 10px)' }}
              aria-hidden="true"
            >
              <div className="w-[38%] flex-shrink-0" />
              <div className="flex-1 p-10 flex flex-col">
                <p className="text-[0.7rem] mb-4">{onlineOptionCards[0].label}</p>
                <h3 className="about-heading text-2xl sm:text-3xl mb-4">{onlineOptionCards[0].title}</h3>
                <div className="mb-1 flex items-baseline gap-1.5">
                  <span className="text-sm">Reg.</span>
                  <span className="text-[3rem] leading-none">{onlineOptionCards[0].price}</span>
                  <span className="text-xl ml-1">CAD</span>
                </div>
                <p className="text-sm leading-relaxed mb-6">{onlineOptionCards[0].subtitle}</p>
                <div className="h-px mb-4" />
                <p className="text-[0.68rem] mb-3">{onlineOptionCards[0].idealPrefix}</p>
                <ul className="flex flex-col gap-2">
                  {onlineOptionCards[0].bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-[7px] w-1 h-1 rounded-full shrink-0" />
                      <span className="text-sm leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Animated cards */}
            <div className="absolute inset-0 flex gap-5">
              {onlineOptionCards.map((card, i) => {
                const isActive = activeOption === i
                return (
                  <div
                    key={i}
                    className={`relative overflow-hidden rounded-2xl border border-[#e3e2de] bg-white ${card.shadowClass} transition-[flex-grow] duration-700 ease-in-out`}
                    style={{ flexGrow: isActive ? 4 : 1, flexShrink: 0, flexBasis: '0%' }}
                  >
                    {/* Full card content — visible when active */}
                    <div
                      className="absolute inset-0 flex flex-row"
                      style={{
                        opacity: isActive ? 1 : 0,
                        transition: isActive ? 'opacity 0.45s ease' : 'opacity 0.2s ease',
                      }}
                      aria-hidden={!isActive}
                    >
                      <div className="relative w-[38%] flex-shrink-0 overflow-hidden">
                        <img src={card.img} alt={card.alt} className="absolute inset-0 w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 p-10 flex flex-col">
                        <p className="text-[0.7rem] uppercase tracking-[0.28em] text-[#a0948a] mb-4">{card.label}</p>
                        <h3 className="about-heading text-2xl sm:text-3xl font-semibold text-[#3d3028] leading-tight mb-4">
                          {card.title}
                        </h3>
                        <div className="mb-1 flex items-baseline gap-1.5">
                          <span className="text-sm text-[#a0948a] font-medium">Reg.</span>
                          <span className="text-[3rem] font-semibold text-[#3d3028] leading-none">{card.price}</span>
                          <span className="text-xl text-[#5a5047] ml-1">CAD</span>
                        </div>
                        <p className="text-[#5a5047] text-sm leading-relaxed mb-6">{card.subtitle}</p>
                        <div className="h-px bg-[#e3e2de] mb-4" />
                        <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[#a0948a] mb-3">{card.idealPrefix}</p>
                        <ul className="flex flex-col gap-2">
                          {card.bullets.map((b, j) => (
                            <li key={j} className="flex items-start gap-2.5">
                              <span className="mt-[7px] w-1 h-1 rounded-full bg-[#a0948a] shrink-0" />
                              <span className="text-[#5a5047] text-sm leading-relaxed">{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Peek overlay — visible when inactive, clickable to switch */}
                    <button
                      className="absolute inset-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a0948a]"
                      style={{
                        opacity: isActive ? 0 : 1,
                        pointerEvents: isActive ? 'none' : 'auto',
                        transition: isActive ? 'opacity 0.2s ease' : 'opacity 0.5s ease 0.3s',
                      }}
                      onClick={handleOptionSwitch}
                      aria-label={`Switch to ${card.title}`}
                      tabIndex={isActive ? -1 : 0}
                    >
                      <img src={card.img} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-[#2a1a0e]/55 group-hover:bg-[#2a1a0e]/40 transition-colors duration-300" />
                      <div className="absolute inset-x-0 bottom-0 p-5">
                        <p className="text-[0.6rem] uppercase tracking-[0.22em] text-white/50 mb-1.5">{card.label}</p>
                        <p className="text-white font-semibold text-sm leading-tight mb-3">{card.title}</p>
                        <p className="text-[0.62rem] uppercase tracking-[0.18em] text-white/50 group-hover:text-white/80 transition-colors duration-300">
                          View →
                        </p>
                      </div>
                    </button>
                  </div>
                )
              })}
            </div>

          </div>
        </div>
      </section>

      {/* ── Curriculum Section ──────────────────────────────────── */}
      <section className="bg-[#f6f2ec] flex items-start">

        {/* Left: sticky image panel */}
        <div className="hidden lg:block w-[42%] flex-shrink-0 sticky top-0 h-screen overflow-hidden relative">
          <p className="absolute top-6 left-6 z-10 text-[0.58rem] uppercase tracking-[0.32em] text-white/80 font-light">
            MJP Beauty · Curriculum
          </p>
          <img
            src={curriculumImg}
            alt="MJP Beauty Curriculum"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#1a0e08]/20" />
          <div className="absolute bottom-10 left-6 z-10 backdrop-blur-md bg-white/15 border border-white/25 px-6 py-5">
            <p className="text-white font-semibold text-[1.35rem] leading-snug">
              39 modules.<br />Mapped out, in full.
            </p>
          </div>
        </div>

        {/* Right: curriculum content */}
        <div className="flex-1 py-14 px-8 lg:px-14 xl:px-16 min-h-screen">

          {/* Header */}
          <div className="mb-10 anim-fade-up">
            <p className="text-[0.72rem] uppercase tracking-[0.3em] text-[#a0948a] mb-4">
              What's Inside
            </p>
            <h2 className="about-heading leading-tight text-[#3d3028] mb-4" style={{ fontSize: 'clamp(1.9rem, 2.8vw, 2.7rem)' }}>
              An overview of everything<br />
              <span className="text-[#827064]">you'll master.</span>
            </h2>
            <p className="text-[#5a5047] text-sm sm:text-base leading-relaxed max-w-lg">
              No gatekeeping here — every module, mapped out so you know exactly what's covered.
            </p>
          </div>

          {/* Tabs + Module list */}
          <div className="flex gap-0 anim-fade-up" style={{ transitionDelay: '0.15s' }}>

            {/* Sidebar tabs */}
            <div className="relative flex flex-col pr-6 border-r border-[#d8d0c8] min-w-[160px] shrink-0">
              {/* Sliding active indicator */}
              <div
                className="absolute left-0 w-0.5 bg-[#b07b5a] transition-[top,height] duration-300 ease-in-out"
                style={{ top: indicatorStyle.top, height: indicatorStyle.height }}
              />
              {curriculumParts.map((part, i) => (
                <button
                  key={i}
                  ref={el => { tabRefs.current[i] = el }}
                  onClick={() => setActivePart(i)}
                  className="text-left py-2.5 pl-3 transition-all duration-200 flex flex-col gap-0.5"
                >
                  <span className={[
                    'text-[0.9rem] transition-colors duration-200',
                    activePart === i ? 'text-[#3d3028] font-medium' : 'text-[#a0948a] font-normal',
                  ].join(' ')}>
                    {part.tab}
                  </span>
                  {part.tabSub && (
                    <span className={[
                      'text-[0.67rem] transition-colors duration-200',
                      activePart === i ? 'text-[#827064]' : 'text-[#c4b8b0]',
                    ].join(' ')}>
                      {part.tabSub}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Module content */}
            <div className="flex-1 pl-8 min-w-0">
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[#827064] mb-1">
                {curriculumParts[activePart].partLabel}
              </p>
              <h3 className="text-xl sm:text-2xl font-semibold text-[#3d3028] mb-5">
                {curriculumParts[activePart].title}
              </h3>

              {/* Modules list */}
              {curriculumParts[activePart].type === 'modules' && (
                <div className="flex flex-col">
                  {curriculumParts[activePart].modules.map((mod, i) => (
                    <div key={i} className="flex items-start gap-5 py-3.5 border-b border-[#e3ddd8] last:border-b-0">
                      <span className="text-[0.67rem] font-medium text-[#827064] min-w-[52px] mt-0.5 shrink-0">{mod.num}</span>
                      <span className="text-[#3d3028] text-sm leading-relaxed">{mod.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Business & Brows */}
              {curriculumParts[activePart].type === 'business' && (
                <div>
                  <p className="text-[#5a5047] text-sm leading-relaxed mb-5">
                    {curriculumParts[activePart].description}
                  </p>
                  <div className="flex flex-col">
                    {curriculumParts[activePart].bullets.map((b, i) => (
                      <div key={i} className="flex items-start gap-3.5 py-3.5 border-b border-[#e3ddd8] last:border-b-0">
                        <span className="mt-[6px] w-1.5 h-1.5 rounded-full bg-[#b07b5a] shrink-0" />
                        <span className="text-[#3d3028] text-sm leading-relaxed">{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bonuses */}
              {curriculumParts[activePart].type === 'bonuses' && (
                <div className="flex flex-col">
                  {curriculumParts[activePart].items.map((item, i) => (
                    <div key={i} className="py-3.5 border-b border-[#e3ddd8] last:border-b-0">
                      <p className="text-[#3d3028] text-sm font-medium leading-snug">{item.label}</p>
                      {item.sub && (
                        <p className="text-[#827064] text-xs leading-relaxed mt-0.5">{item.sub}</p>
                      )}
                      {item.bullets && (
                        <ul className="mt-2 flex flex-col gap-1">
                          {item.bullets.map((b, j) => (
                            <li key={j} className="flex items-start gap-2.5">
                              <span className="mt-[5px] w-1 h-1 rounded-full bg-[#b07b5a] shrink-0" />
                              <span className="text-[#5a5047] text-xs leading-relaxed">{b}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
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
