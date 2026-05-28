import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { X, Mail } from 'lucide-react'
import { SiFacebook, SiInstagram } from '@icons-pack/react-simple-icons'
import logoWhite from '@/assets/brand-kit/logo-white.png'

export default function Footer() {
  const [contactOpen, setContactOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const scrollToSection = (sectionId: string) => {
    if (location.pathname === '/') {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/', { state: { scrollTo: sectionId } })
    }
  }

  return (
    <>
      <footer className="bg-[#4E4740] text-white">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-14 grid gap-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="flex flex-col gap-5">
            <img src={logoWhite} alt="MJP Beauty" className="h-12 w-auto object-contain object-left" />
            <p className="text-sm leading-relaxed text-white/65 max-w-[210px]">
              Canada's leading brow artist &amp; educator. Elevating brows and building careers since 2017.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/profile.php?id=100076076732291"
                aria-label="Facebook"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-white/30 hover:border-white transition-colors duration-200"
              >
                <SiFacebook size={15} />
              </a>
              <a
                href="https://www.instagram.com/mjpbeauty"
                aria-label="Instagram"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-white/30 hover:border-white transition-colors duration-200"
              >
                <SiInstagram size={15} />
              </a>
            </div>
          </div>

          {/* Services */}
          <div className="flex flex-col gap-4">
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-white/45 font-medium">Services</p>
            <nav className="flex flex-col gap-3">
              {[
                'Brow Lamination',
                'Brow Shape & Tint',
                'Brow Shape & Wax',
                'Keratin Lash Lift',
              ].map(label => (
                <Link
                  key={label}
                  to="/book-appointment"
                  className="text-sm text-white/75 hover:text-white underline-offset-4 hover:underline transition-colors duration-200"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Training */}
          <div className="flex flex-col gap-4">
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-white/45 font-medium">Trainings</p>
            <nav className="flex flex-col gap-3">
              <Link to="/in-person-training" className="text-sm text-white/75 hover:text-white underline-offset-4 hover:underline transition-colors duration-200">
                In-Person Academy
              </Link>
              <Link to="/online-brow-courses" className="text-sm text-white/75 hover:text-white underline-offset-4 hover:underline transition-colors duration-200">
                Online Brow Academy
              </Link>
              <Link to="/online-modules" className="text-sm text-white/75 hover:text-white underline-offset-4 hover:underline transition-colors duration-200">
                Single Courses
              </Link>
              <Link to="/biz-mentorship" className="text-sm text-white/75 hover:text-white underline-offset-4 hover:underline transition-colors duration-200">
                BIZ Mentorship
              </Link>
              <Link to="/freebies" className="text-sm text-white/75 hover:text-white underline-offset-4 hover:underline transition-colors duration-200">
                Freebies
              </Link>
              <a
                href="https://mjpbeautyacademy.thinkific.com/users/sign_in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/75 hover:text-white underline-offset-4 hover:underline transition-colors duration-200"
              >
                Student Login
              </a>
            </nav>
          </div>

          {/* Company */}
          <div className="flex flex-col gap-4">
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-white/45 font-medium">Company</p>
            <nav className="flex flex-col gap-3">
              <button
                onClick={() => scrollToSection('about')}
                className="text-sm text-white/75 hover:text-white underline-offset-4 hover:underline transition-colors duration-200 text-left"
              >
                About Micah
              </button>
              <button
                onClick={() => setContactOpen(true)}
                className="text-sm text-white/75 hover:text-white underline-offset-4 hover:underline transition-colors duration-200 text-left"
              >
                Contact
              </button>
            </nav>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-xs text-white/35">© 2026 MJP Beauty. All rights reserved.</p>
            <nav className="flex gap-4">
              <Link to="/privacy" className="text-xs text-white/35 hover:text-white/70 transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-xs text-white/35 hover:text-white/70 transition-colors duration-200">
                Terms of Use
              </Link>
            </nav>
          </div>
        </div>
      </footer>

      {/* Contact Overlay */}
      {contactOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setContactOpen(false)}
        >
          <div
            className="relative bg-white rounded-[2rem] p-10 max-w-sm w-full mx-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setContactOpen(false)}
              className="absolute top-5 right-5 text-[#5a5047] hover:text-[#827064] transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-semibold text-[color:var(--foreground)] mb-1">Get in Touch</h3>
            <p className="text-sm text-[color:var(--muted-foreground)] mb-7">We'd love to hear from you.</p>
            <div className="flex flex-col gap-5">
              <a href="mailto:hello@mjpbeauty.ca" className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-full bg-[#f6f2ec] flex items-center justify-center shrink-0">
                  <Mail size={16} className="text-[#827064]" />
                </div>
                <span className="text-sm text-[color:var(--foreground)] group-hover:text-[#827064] transition-colors">
                  mjpbeauty@hotmail.com
                </span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
