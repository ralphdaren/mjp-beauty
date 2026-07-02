import { useState, useEffect, useRef } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown, ChevronLeft, ChevronRight, ArrowRight, User, CalendarCheck, ShoppingCart } from 'lucide-react'
import logoBrown from '@/assets/brand-kit/logo-brown.png'

const optImg01 = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_500/v1783027940/opt-img-01_ufhoau.jpg'
import { getCollectionProducts } from '@/lib/shopify'
import type { ShopifyProduct } from '@/lib/shopify'

const COLLECTION_HANDLE = import.meta.env.VITE_SHOPIFY_COLLECTION_MODULES as string | undefined
const ITEMS_PER_SLIDE = 2

const regularLinks = [
  { label: 'Home', to: '/', end: true },
  { label: 'In-Person Academy', to: '/in-person-training', end: false },
]

const featuredCourse = {
  img: optImg01,
  imgLabel: 'All-inclusive Course',
  title: 'All-In-One Online Course',
  description: 'Everything you need to launch on your own — from technique to business.',
  to: '/online-brow-courses',
}

const singleModules = [
  { num: '01', name: 'Watch & Learn: Advanced Brow Demo Vault', to: '/online-modules/watch-learn-advanced-brow-demo-vault' },
  { num: '02', name: 'Brow Mapping Fundamentals', to: '/online-modules/brow-mapping-fundamentals' },
  { num: '03', name: 'Brow Tinting Fundamentals', to: '/online-modules/brow-tinting-fundamentals' },
  { num: '04', name: 'Strip Waxing Online Brow Course', to: '/online-modules/strip-waxing-online-brow-course' },
  { num: '05', name: 'Mastering Brow Lamination: 10 Mistakes to Leave Behind', to: '/online-modules/mastering-brow-lamination-10-mistakes-to-leave-behind' },
  { num: '06', name: "Glam Up Your Grid: A Brow Artist's Social Media Guide", to: '/online-modules/glam-up-your-grid-a-brow-artists-social-media-guide' },
]

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'text-base tracking-wide pb-0.5 transition-colors duration-200 whitespace-nowrap',
    'border-b-[1.5px]',
    isActive
      ? 'text-brand border-brand'
      : 'text-[#5a5047] border-transparent hover:text-brand hover:border-brand',
  ].join(' ')

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [isAcademyOpen, setIsAcademyOpen] = useState(false)
  const [shopifyProducts, setShopifyProducts] = useState<ShopifyProduct[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const productsFetched = useRef(false)
  const prevScrollY = useRef(0)
  const headerRef = useRef<HTMLElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const isAnimatingRef = useRef(false)

  const goToSlide = (next: number, dir: -1 | 1) => {
    const target = ((next % totalSlides) + totalSlides) % totalSlides
    if (target === currentSlide || isAnimatingRef.current) return
    isAnimatingRef.current = true
    const el = gridRef.current
    if (!el) { setCurrentSlide(target); isAnimatingRef.current = false; return }

    el.style.transition = 'transform 280ms ease, opacity 280ms ease'
    el.style.transform = `translateX(${dir * -40}px)`
    el.style.opacity = '0'

    setTimeout(() => {
      setCurrentSlide(target)
      el.style.transition = 'none'
      el.style.transform = `translateX(${dir * 40}px)`
      el.style.opacity = '0'
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.style.transition = 'transform 280ms ease, opacity 280ms ease'
        el.style.transform = 'translateX(0)'
        el.style.opacity = '1'
        isAnimatingRef.current = false
      }))
    }, 280)
  }
  const location = useLocation()

  const isOnAcademyPage = location.pathname === '/online-brow-courses'

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      setScrolled(currentY > 8)
      if (currentY > 80) {
        const goingDown = currentY > prevScrollY.current
        setIsHidden(goingDown)
        if (goingDown) setIsAcademyOpen(false)
      } else {
        setIsHidden(false)
      }
      prevScrollY.current = currentY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!isAcademyOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setIsAcademyOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isAcademyOpen])

  useEffect(() => {
    setIsAcademyOpen(false)
    setCurrentSlide(0)
  }, [location.pathname])

  useEffect(() => {
    if (!isAcademyOpen || productsFetched.current || !COLLECTION_HANDLE) return
    productsFetched.current = true
    getCollectionProducts(COLLECTION_HANDLE, 10).then(setShopifyProducts).catch(() => {})
  }, [isAcademyOpen])

  useEffect(() => {
    if (!isAcademyOpen) setCurrentSlide(0)
  }, [isAcademyOpen])

  const enrichedModules = singleModules.map(mod => {
    const handle = mod.to.split('/').pop() ?? ''
    const shopify = shopifyProducts.find(p => p.handle === handle)
    return { ...mod, image: shopify?.featuredImage ?? null }
  })

  const totalSlides = Math.ceil(enrichedModules.length / ITEMS_PER_SLIDE)
  const visibleModules = enrichedModules.slice(
    currentSlide * ITEMS_PER_SLIDE,
    (currentSlide + 1) * ITEMS_PER_SLIDE,
  )

  return (
    <header
      ref={headerRef}
      style={{
        transform: isHidden ? 'translateY(-100%)' : 'translateY(0)',
        transition: 'transform 400ms ease-in-out, box-shadow 400ms ease-in-out',
      }}
      className={[
        'sticky top-0 z-50 bg-brand-light border-b border-brand-border',
        scrolled ? 'shadow-[0_2px_16px_rgba(130,112,100,0.10)]' : '',
      ].join(' ')}
    >
      {/* Thin decorative top accent line */}
      <div className="h-[2px] bg-brand w-full" />

      <nav className="max-w-[1800px] mx-auto px-16">

        {/* ── Mobile header bar ─────────────────────────────────────────── */}
        <div className="lg:hidden h-16 flex items-center justify-between">
          <NavLink to="/" className="shrink-0">
            <img src={logoBrown} alt="MJP Beauty" className="h-12 w-auto" />
          </NavLink>
          <button
            className="p-2 text-brand rounded-md"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* ── Desktop layout ────────────────────────────────────────────── */}
        <div className="hidden lg:flex items-center justify-between py-5">

          {/* Left: Logo | divider | Nav links */}
          <div className="flex items-center gap-8">
            <NavLink to="/" className="shrink-0">
              <img src={logoBrown} alt="MJP Beauty" className="h-14 w-auto" />
            </NavLink>

            <div className="w-px h-8 bg-brand-border" aria-hidden="true" />

            <div className="flex items-center gap-8">
              {regularLinks.map(({ label, to, end }) => (
                <NavLink key={to} to={to} end={end} className={navLinkClass}>
                  {label}
                </NavLink>
              ))}

              {/* Online Brow Academy — dropdown trigger */}
              <button
                onClick={() => setIsAcademyOpen((prev) => !prev)}
                aria-expanded={isAcademyOpen}
                aria-haspopup="true"
                className={[
                  'flex items-center gap-1.5 text-base tracking-wide pb-0.5 transition-colors duration-200 whitespace-nowrap',
                  'border-b-[1.5px]',
                  isAcademyOpen || isOnAcademyPage
                    ? 'text-brand border-brand'
                    : 'text-[#5a5047] border-transparent hover:text-brand hover:border-brand',
                ].join(' ')}
              >
                Online Brow Academy
                <ChevronDown
                  size={14}
                  className={`mt-px transition-transform duration-300 ${isAcademyOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <NavLink to="/freebies" className={navLinkClass}>
                Freebies
              </NavLink>

              <NavLink to="/biz-mentorship" className={navLinkClass}>
                BIZ Mentorship
              </NavLink>
            </div>
          </div>

          {/* Right: Student Login | Cart | Book */}
          <div className="flex items-center gap-8">
            <div className="relative group">
              <a
                href="https://mjpbeautyacademy.thinkific.com/users/sign_in"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Student Login"
                className="flex items-center justify-center p-2 -m-2 text-brand hover:opacity-70 transition-opacity duration-200"
              >
                <User size={22} />
              </a>
              <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 rounded-md bg-[#3d3530] text-white text-xs whitespace-nowrap opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200">
                Student Login
              </span>
            </div>

            <div className="relative group">
              <a
                href="#"
                aria-label="Cart"
                className="flex items-center justify-center p-2 -m-2 text-brand hover:opacity-70 transition-opacity duration-200"
              >
                <ShoppingCart size={22} />
              </a>
              <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 rounded-md bg-[#3d3530] text-white text-xs whitespace-nowrap opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200">
                Cart
              </span>
            </div>

            <NavLink
              to="/book-appointment"
              aria-label="Book an Appointment"
              className="flex items-center gap-1.5 h-11 pl-4 pr-5 rounded-full bg-brand text-white hover:opacity-90 transition-opacity duration-200"
            >
              <CalendarCheck size={20} />
              <span className="text-sm tracking-wide font-medium">Book</span>
            </NavLink>
          </div>

        </div>
      </nav>

      {/* ── Desktop Academy Dropdown Panel (absolute — overlays page) ── */}
      <div
        className="hidden lg:block absolute left-0 w-full"
        style={{
          top: '100%',
          height: '68vh',
          opacity: isAcademyOpen ? 1 : 0,
          transform: isAcademyOpen ? 'translateY(0)' : 'translateY(-10px)',
          pointerEvents: isAcademyOpen ? 'auto' : 'none',
          transition: 'opacity 450ms ease-in-out, transform 450ms ease-in-out',
        }}
      >
        <div className="h-full bg-brand-light border-t border-brand-border shadow-[0_16px_48px_rgba(130,112,100,0.13)] overflow-hidden">
          <div className="max-w-7xl mx-auto px-8 pt-10 pb-8 h-full flex flex-col">
            <div className="flex-1 grid grid-cols-[5fr_7fr] gap-14 min-h-0">

              {/* Left: Featured course card */}
              <div className="h-full min-h-0">
                <NavLink
                  to={featuredCourse.to}
                  onClick={() => setIsAcademyOpen(false)}
                  style={{
                    opacity: isAcademyOpen ? 1 : 0,
                    transform: isAcademyOpen ? 'translateY(0)' : 'translateY(14px)',
                    transition: isAcademyOpen
                      ? 'opacity 380ms ease 450ms, transform 380ms ease 450ms, box-shadow 300ms ease'
                      : 'opacity 150ms ease 0ms, transform 150ms ease 0ms, box-shadow 300ms ease',
                  }}
                  className="group border border-brand-border bg-white flex flex-col overflow-hidden rounded-2xl hover:shadow-[0_8px_32px_rgba(130,112,100,0.18)] h-full"
                >
                  {/* Image — 58% of card height */}
                  <div className="relative overflow-hidden flex-[0_0_58%] min-h-0">
                    <img
                      src={featuredCourse.img}
                      alt={featuredCourse.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                    />
                    <p className="absolute top-3 left-4 text-[0.6rem] tracking-[0.22em] uppercase text-white/80 font-light">
                      {featuredCourse.imgLabel}
                    </p>
                  </div>
                  {/* Content */}
                  <div className="p-6 flex flex-col gap-3 flex-1 min-h-0">
                    <h3 className="font-semibold text-[#3d3028] text-base leading-snug">{featuredCourse.title}</h3>
                    <p className="text-[#5a5047] text-sm leading-relaxed flex-1">{featuredCourse.description}</p>
                    <p className="text-[0.62rem] tracking-[0.22em] uppercase text-[#a0948a] flex items-center gap-1.5 group-hover:text-brand transition-colors duration-200">
                      EXPLORE <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform duration-200" />
                    </p>
                  </div>
                </NavLink>
              </div>

              {/* Right: Single modules carousel */}
              <div className="flex flex-col min-h-0 h-full">
                <p
                  style={{
                    opacity: isAcademyOpen ? 1 : 0,
                    transform: isAcademyOpen ? 'translateY(0)' : 'translateY(10px)',
                    transition: isAcademyOpen
                      ? 'opacity 360ms ease 450ms, transform 360ms ease 450ms'
                      : 'opacity 150ms ease 0ms, transform 150ms ease 0ms',
                  }}
                  className="text-[0.65rem] tracking-[0.3em] uppercase text-[#3d3028] mb-4 flex-none font-medium"
                >
                  Single Courses
                </p>

                {/* Cards */}
                <div className="flex-1 min-h-0 flex flex-col pr-10">
                  <div ref={gridRef} className="grid grid-cols-2 gap-4 flex-1 min-h-0">
                    {visibleModules.map((mod, i) => {
                      const delay = isAcademyOpen ? 460 + i * 75 : 0
                      return (
                        <Link
                          key={mod.num}
                          to={mod.to}
                          onClick={() => setIsAcademyOpen(false)}
                          style={{
                            opacity: isAcademyOpen ? 1 : 0,
                            transform: isAcademyOpen ? 'translateY(0)' : 'translateY(10px)',
                            transition: isAcademyOpen
                              ? `opacity 480ms ease ${delay}ms, transform 480ms ease ${delay}ms`
                              : 'opacity 150ms ease 0ms, transform 150ms ease 0ms',
                          }}
                          className="group flex flex-col min-h-0"
                        >
                          <div className="rounded-xl overflow-hidden bg-[#f6f2ec] aspect-square mb-2.5 flex-none">
                            {mod.image ? (
                              <img
                                src={mod.image.url}
                                alt={mod.image.altText || mod.name}
                                className="w-full h-full object-contain group-hover:scale-[1.04] transition-transform duration-500"
                                loading="lazy"
                                decoding="async"
                              />
                            ) : (
                              <div className="w-full h-full" />
                            )}
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-[0.6rem] text-[#c4b8b0] font-light shrink-0">{mod.num}</span>
                            <span className="text-[0.8rem] text-[#3d3028] leading-snug group-hover:text-brand transition-colors duration-200">
                              {mod.name}
                            </span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>

                </div>

                {/* Bottom bar: arrows + dots on left, text + CTA on right */}
                <div
                  style={{
                    opacity: isAcademyOpen ? 1 : 0,
                    transform: isAcademyOpen ? 'translateY(0)' : 'translateY(8px)',
                    transition: isAcademyOpen
                      ? 'opacity 350ms ease 720ms, transform 350ms ease 720ms'
                      : 'opacity 150ms ease 0ms, transform 150ms ease 0ms',
                  }}
                  className="mt-4 flex-none flex items-center justify-between gap-4"
                >
                  {/* Left: arrow buttons + dot nav */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => goToSlide(currentSlide - 1, 1)}
                      aria-label="Previous slide"
                      className="w-7 h-7 rounded-full border border-brand-border flex items-center justify-center text-[#5a5047] hover:border-brand hover:text-brand transition-colors duration-200"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: totalSlides }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => goToSlide(i, i > currentSlide ? -1 : 1)}
                          aria-label={`Slide ${i + 1}`}
                          className={`rounded-full transition-all duration-300 ${
                            i === currentSlide
                              ? 'w-5 h-1.5 bg-brand'
                              : 'w-1.5 h-1.5 bg-[#c4b8b0] hover:bg-brand/60'
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => goToSlide(currentSlide + 1, -1)}
                      aria-label="Next slide"
                      className="w-7 h-7 rounded-full border border-brand-border flex items-center justify-center text-[#5a5047] hover:border-brand hover:text-brand transition-colors duration-200"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  {/* Right: Browse CTA */}
                  <NavLink
                    to="/online-modules"
                    onClick={() => setIsAcademyOpen(false)}
                    className="shrink-0 flex items-center gap-1.5 px-4 py-2 text-[0.75rem] tracking-[0.12em] uppercase rounded-full border border-brand text-brand hover:bg-brand hover:text-white transition-colors duration-200"
                  >
                    Browse Courses <ArrowRight size={12} />
                  </NavLink>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile drawer ────────────────────────────────────────────── */}
      <div
        className={[
          'lg:hidden overflow-hidden transition-all duration-300',
          isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0',
        ].join(' ')}
      >
        <div className="bg-brand-light border-t border-brand-border px-6 pb-6 pt-4 flex flex-col gap-1">
          {[
            { label: 'Home', to: '/', end: true },
            { label: 'In-Person Academy', to: '/in-person-training', end: false },
            { label: 'Online Brow Academy', to: '/online-brow-courses', end: false },
            { label: 'Freebies', to: '/freebies', end: false },
            { label: 'BIZ Mentorship', to: '/biz-mentorship', end: false },
          ].map(({ label, to, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                [
                  'text-sm tracking-wide py-3 border-b border-brand-border transition-colors duration-200',
                  isActive ? 'text-brand font-medium' : 'text-[#5a5047] hover:text-brand',
                ].join(' ')
              }
            >
              {label}
            </NavLink>
          ))}
          <div className="flex flex-col gap-3 mt-4">
            <NavLink
              to="/book-appointment"
              onClick={() => setIsOpen(false)}
              className="px-5 py-2.5 text-sm tracking-wide rounded-full text-white bg-brand text-center hover:opacity-90 transition-opacity duration-200"
            >
              Book an Appointment
            </NavLink>
            <a
              href="https://mjpbeautyacademy.thinkific.com/users/sign_in"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="px-5 py-2.5 text-sm tracking-wide rounded-full text-brand border border-brand text-center hover:bg-brand hover:text-white transition-colors duration-200"
            >
              Student Login
            </a>
            <a
              href="#"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm tracking-wide rounded-full text-brand border border-brand text-center hover:bg-brand hover:text-white transition-colors duration-200"
            >
              <ShoppingCart size={16} />
              Cart
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
