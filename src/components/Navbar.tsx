import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import logoBlack from '@/assets/brand-kit/logo-black.png'

const mainLinks = [
  { label: 'Home', to: '/' },
  { label: 'In Person Training', to: '/in-person-training' },
  { label: 'Online Brow Courses', to: '/online-brow-courses' },
  { label: 'Freebies', to: '/freebies' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={[
        'sticky top-0 z-50 bg-brand-light border-b border-brand-border transition-shadow duration-300',
        scrolled ? 'shadow-[0_2px_16px_rgba(130,112,100,0.10)]' : '',
      ].join(' ')}
    >
      {/* Thin decorative top accent line */}
      <div className="h-[2px] bg-brand w-full" />

      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <NavLink to="/" className="shrink-0">
          <img src={logoBlack} alt="MJP Beauty" className="h-13 w-auto" />
        </NavLink>

        {/* Desktop — center links */}
        <div className="hidden lg:flex items-center gap-7 flex-1 justify-center">
          {mainLinks.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                [
                  'text-sm tracking-wide pb-0.5 transition-colors duration-200 whitespace-nowrap',
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
        </div>

        {/* Desktop — right actions */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <NavLink
            to="/book-appointment"
            className="px-5 py-2 text-sm tracking-wide rounded-full text-white bg-brand hover:opacity-90 transition-opacity duration-200 whitespace-nowrap"
          >
            Book an Appointment
          </NavLink>
          <NavLink
            to="/student-login"
            className="px-5 py-2 text-sm tracking-wide rounded-full text-brand border border-brand hover:bg-brand hover:text-white transition-colors duration-200 whitespace-nowrap"
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
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        className={[
          'lg:hidden overflow-hidden transition-all duration-300',
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
        ].join(' ')}
      >
        <div className="bg-brand-light border-t border-brand-border px-6 pb-6 pt-4 flex flex-col gap-1">
          {mainLinks.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
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
