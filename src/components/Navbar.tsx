import { useState, useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown, ArrowRight } from 'lucide-react'
import logoBlack from '@/assets/brand-kit/logo-black.png'
import optImg01 from '@/assets/online/opt-img-01.jpg'
import optImg02 from '@/assets/online/opt-img-02.jpg'

const regularLinks = [
  { label: 'Home', to: '/', end: true },
  { label: 'In-Person Academy', to: '/in-person-training', end: false },
]

const featuredCourses = [
  {
    img: optImg01,
    imgLabel: 'All-inclusive Course',
    title: 'Independent Artist',
    description: 'Everything you need to launch your own brow studio — from technique to business.',
    to: '/online-brow-courses',
  },
  {
    img: optImg02,
    imgLabel: 'All-inclusive Course',
    title: 'VIP Mentorship',
    description: 'Personalised guidance, portfolio reviews and direct mentorship from Micah.',
    to: '/online-brow-courses',
  },
]

const singleModules = [
  { num: '01', name: 'Watch & Learn: Advanced Brow Demo Vault', href: 'https://mjpbeautyacademy.thinkific.com/courses/advanced-brow-demo-vault-watch-and-learn' },
  { num: '02', name: 'Brow Mapping Fundamentals', href: 'https://mjpbeautyacademy.thinkific.com/courses/browmappingfundamentals' },
  { num: '03', name: 'Brow Tinting Fundamentals', href: 'https://mjpbeautyacademy.thinkific.com/courses/browtintingfundamentals' },
  { num: '04', name: 'Strip Waxing Online Brow Course', href: 'https://mjpbeautyacademy.thinkific.com/courses/stripwaxingonlinecourse' },
  { num: '05', name: 'Mastering Brow Lamination: 10 Mistakes to Leave Behind', href: 'https://mjpbeautyacademy.thinkific.com/courses/browlaminationmistakes' },
  { num: '06', name: "Glam Up Your Grid: A Brow Artist's Social Media Guide", href: 'https://mjpbeautyacademy.thinkific.com/products/digital_downloads/Glam-Up-Your-Grid-Social-Media-Ebook' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [isAcademyOpen, setIsAcademyOpen] = useState(false)
  const prevScrollY = useRef(0)
  const headerRef = useRef<HTMLElement>(null)
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
  }, [location.pathname])

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

      <nav className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between gap-8">
        {/* Logo */}
        <NavLink to="/" className="shrink-0">
          <img src={logoBlack} alt="MJP Beauty" className="h-16 w-auto" />
        </NavLink>

        {/* Desktop — center links */}
        <div className="hidden lg:flex items-center gap-9 flex-1 justify-center">
          {regularLinks.map(({ label, to, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  'text-base tracking-wide pb-0.5 transition-colors duration-200 whitespace-nowrap',
                  'border-b-[1.5px]',
                  isActive
                    ? 'text-brand border-brand font-medium'
                    : 'text-[#5a5047] border-transparent hover:text-brand hover:border-brand',
                ].join(' ')
              }
            >
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
                ? 'text-brand border-brand font-medium'
                : 'text-[#5a5047] border-transparent hover:text-brand hover:border-brand',
            ].join(' ')}
          >
            Online Brow Academy
            <ChevronDown
              size={14}
              className={`mt-px transition-transform duration-300 ${isAcademyOpen ? 'rotate-180' : ''}`}
            />
          </button>

          <NavLink
            to="/freebies"
            className={({ isActive }) =>
              [
                'text-base tracking-wide pb-0.5 transition-colors duration-200 whitespace-nowrap',
                'border-b-[1.5px]',
                isActive
                  ? 'text-brand border-brand font-medium'
                  : 'text-[#5a5047] border-transparent hover:text-brand hover:border-brand',
              ].join(' ')
            }
          >
            Freebies
          </NavLink>
        </div>

        {/* Desktop — right actions */}
        <div className="hidden lg:flex items-center gap-4 shrink-0">
          <NavLink
            to="/book-appointment"
            className="px-6 py-2.5 text-base tracking-wide rounded-full text-white bg-brand hover:opacity-90 transition-opacity duration-200 whitespace-nowrap"
          >
            Book an Appointment
          </NavLink>
          <NavLink
            to="/student-login"
            className="px-6 py-2.5 text-base tracking-wide rounded-full text-brand border border-brand hover:bg-brand hover:text-white transition-colors duration-200 whitespace-nowrap"
          >
            Student Login
          </NavLink>
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden p-2 text-brand rounded-md"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
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

              {/* Left: Featured course cards */}
              <div className="grid grid-cols-2 gap-5 h-full min-h-0">
                {featuredCourses.map((course, i) => {
                  const delay = isAcademyOpen ? 450 + i * 80 : 0
                  return (
                    <NavLink
                      key={course.title}
                      to={course.to}
                      onClick={() => setIsAcademyOpen(false)}
                      style={{
                        opacity: isAcademyOpen ? 1 : 0,
                        transform: isAcademyOpen ? 'translateY(0)' : 'translateY(14px)',
                        transition: isAcademyOpen
                          ? `opacity 380ms ease ${delay}ms, transform 380ms ease ${delay}ms, box-shadow 300ms ease`
                          : 'opacity 150ms ease 0ms, transform 150ms ease 0ms, box-shadow 300ms ease',
                      }}
                      className="group border border-brand-border bg-white flex flex-col overflow-hidden rounded-2xl hover:shadow-[0_8px_32px_rgba(130,112,100,0.18)]"
                    >
                      {/* Image — 58% of card height */}
                      <div className="relative overflow-hidden flex-[0_0_58%] min-h-0">
                        <img
                          src={course.img}
                          alt={course.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                        />
                        <p className="absolute top-3 left-4 text-[0.6rem] tracking-[0.22em] uppercase text-white/80 font-light">
                          {course.imgLabel}
                        </p>
                      </div>
                      {/* Content */}
                      <div className="p-6 flex flex-col gap-3 flex-1 min-h-0">
                        <h3 className="font-semibold text-[#3d3028] text-base leading-snug">{course.title}</h3>
                        <p className="text-[#5a5047] text-sm leading-relaxed flex-1">{course.description}</p>
                        <p className="text-[0.62rem] tracking-[0.22em] uppercase text-[#a0948a] flex items-center gap-1.5 group-hover:text-brand transition-colors duration-200">
                          EXPLORE <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform duration-200" />
                        </p>
                      </div>
                    </NavLink>
                  )
                })}
              </div>

              {/* Right: Single modules */}
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
                  Single Modules
                </p>

                <div className="flex flex-col flex-1 min-h-0">
                  {singleModules.map((mod, i) => {
                    const delay = isAcademyOpen ? 460 + i * 75 : 0
                    return (
                      <a
                        key={mod.num}
                        href={mod.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsAcademyOpen(false)}
                        style={{
                          opacity: isAcademyOpen ? 1 : 0,
                          transform: isAcademyOpen ? 'translateY(0)' : 'translateY(8px)',
                          transition: isAcademyOpen
                            ? `opacity 480ms ease ${delay}ms, transform 480ms ease ${delay}ms`
                            : 'opacity 150ms ease 0ms, transform 150ms ease 0ms',
                        }}
                        className="group flex items-center gap-5 flex-1 border-b border-brand-border last:border-b-0 transition-all duration-200"
                      >
                        <span className="text-sm text-[#c4b8b0] min-w-[28px] shrink-0 font-light group-hover:text-brand transition-colors duration-200">{mod.num}</span>
                        <span className="text-base text-[#3d3028] flex-1 leading-snug group-hover:text-brand group-hover:translate-x-1.5 transition-all duration-200 ease-out">
                          {mod.name}
                        </span>
                        <ArrowRight
                          size={14}
                          className="text-transparent shrink-0 -translate-x-2 opacity-0 group-hover:text-brand group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-200 ease-out"
                        />
                      </a>
                    )
                  })}
                </div>

                <p
                  style={{
                    opacity: isAcademyOpen ? 1 : 0,
                    transform: isAcademyOpen ? 'translateY(0)' : 'translateY(8px)',
                    transition: isAcademyOpen
                      ? 'opacity 350ms ease 720ms, transform 350ms ease 720ms'
                      : 'opacity 150ms ease 0ms, transform 150ms ease 0ms',
                  }}
                  className="text-[0.82rem] text-[#a0948a] mt-4 flex-none leading-relaxed"
                >
                  Purchase any module individually of your choice.
                </p>
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
            <NavLink
              to="/student-login"
              onClick={() => setIsOpen(false)}
              className="px-5 py-2.5 text-sm tracking-wide rounded-full text-brand border border-brand text-center hover:bg-brand hover:text-white transition-colors duration-200"
            >
              Student Login
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  )
}
