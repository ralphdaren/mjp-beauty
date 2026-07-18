import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'
const freebie01 = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_500/v1783028294/freebie-01_kevhzi.png'
const freebie02 = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_500/v1783028295/freebie-02_ehtixa.png'
const freebie03 = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_500/v1783028295/freebie-03_kgj6h2.png'
const freebie04 = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_500/v1783028295/freebie-04_zowfvz.png'
const freebie05 = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_500/v1783028296/freebie-05_xqncqj.png'
const freebieCard = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_500/v1783028296/freebie-card_cmpmgd.jpg'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

const NEWSLETTER_URL = 'https://mjpbeauty.myflodesk.com/insider-subscribers'

// ─── Data ─────────────────────────────────────────────────────────────────────

interface Freebie {
  id: string
  type: string
  image: string
  title: string
  description: string
  url: string
}

const FREEBIES: Freebie[] = [
  {
    id: 'brow-artistry-essentials',
    type: 'PDF Guide',
    image: freebie01,
    title: 'Brow Artistry Essentials',
    description:
      "A guide of my go-to brow products — the exact tools I use daily as a pro. This is the guide I wish I had when I started — it'll save you time, money, and a lot of trial and error.",
    url: 'https://mjpbeauty.myflodesk.com/browartistryessentials',
  },
  {
    id: 'waxing-contraindications',
    type: 'Reference Guide',
    image: freebie02,
    title: 'Deep Diving into Waxing Contraindications',
    description:
      "A clear, easy-to-understand guide that breaks down who you should and shouldn't wax — and more importantly, why.",
    url: 'https://mjpbeauty.myflodesk.com/brow-waxing-contraindications',
  },
  {
    id: 'consent-form',
    type: 'Editable Template',
    image: freebie03,
    title: 'Customizable Brow Lamination Consent Form',
    description:
      'An editable client consent form designed to protect your business and elevate your professionalism. Includes all the key questions and disclaimers you need.',
    url: 'https://mjpbeauty.myflodesk.com/free-brow-lamination-consent-form-template',
  },
  {
    id: 'brow-concealing-demo',
    type: 'Free Tutorial',
    image: freebie04,
    title: 'Brow Concealing Demo',
    description:
      "Watch a free, mini tutorial on how I conceal my client's brows! This is a game-changing step that helps to top off the brows and give your clients stunning, carved, eye-catching brows!",
    url: 'https://mjpbeauty.myflodesk.com/browconcealingfreebie',
  },
  {
    id: 'brow-business-starter-guide',
    type: 'PDF Guide',
    image: freebie05,
    title: 'Brow Business Starter Guide',
    description: 'Micah breaks down exactly how to start and grow your brow business — without the fears, mistakes, and confusion most beginners face.',
    url: 'https://mjpbeauty.myflodesk.com/browbusinesstarterguide',
  },
]

// ─── Newsletter popup ──────────────────────────────────────────────────────────

function NewsletterPopup({ onClose }: { onClose: () => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Slight delay so the backdrop mounts before animating in
    const t = setTimeout(() => setVisible(true), 30)
    return () => clearTimeout(t)
  }, [])

  function dismiss() {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  function handleSignUp() {
    window.open(NEWSLETTER_URL, '_blank', 'noopener,noreferrer')
    dismiss()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{
        backgroundColor: visible ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'blur(4px)' : 'blur(0px)',
        transition: 'background-color 0.3s ease, backdrop-filter 0.3s ease',
      }}
      onClick={dismiss}
    >
      <div
        className="relative bg-white rounded-[2rem] overflow-hidden w-full max-w-[680px] shadow-2xl flex flex-col sm:flex-row"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-[#5a5047] hover:text-[#827064] transition-all shadow-sm"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Left — image */}
        <div className="sm:w-[42%] shrink-0 aspect-[3/4] sm:aspect-auto overflow-hidden">
          <img
            src={freebieCard}
            alt="Freebies"
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* Right — content */}
        <div className="flex flex-col justify-center px-8 py-10 flex-1">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#a0948a] mb-3">MJP Beauty</p>
          <h2 className="text-xl font-semibold text-[#3d3530] leading-snug mb-3">
            Stay in the Know —<br />Never Miss a Freebie!
          </h2>
          <p className="text-xs text-[#6b5f58] leading-relaxed mb-7">
            Sign up to get exclusive access to new freebies and special offers — straight to your inbox.
          </p>

          <button
            onClick={handleSignUp}
            className="w-full py-2.5 bg-[#827064] text-white text-xs tracking-widest uppercase rounded-full hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Sign Me Up
          </button>

          <p className="text-[10px] text-[#b0a49e] mt-4 text-center">No spam, ever. Unsubscribe anytime.</p>
        </div>
      </div>
    </div>
  )
}

// ─── Freebie card ─────────────────────────────────────────────────────────────

function FreebieCard({ freebie, index }: { freebie: Freebie; index: number }) {
  const { image, type, title, description, url } = freebie

  return (
    <div
      className="anim-fade-up bg-white rounded-2xl border border-[#e3e2de] shadow-sm overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300"
      style={{ transitionDelay: `${index * 0.1}s` }}
    >
      <div className="w-full aspect-[940/788] overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
      </div>

      <div className="p-5 flex flex-col flex-1">
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#a0948a] mb-2">{type}</p>
        <h3 className="text-sm font-semibold text-[#3d3530] mb-2 leading-snug min-h-[2.5rem]">{title}</h3>
        <p className="text-xs text-[#6b5f58] leading-relaxed flex-1 mb-4">{description}</p>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2 bg-[#827064] text-white text-xs tracking-wide rounded-full hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <Download size={13} />
          Get it Free
        </a>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const SESSION_KEY = 'mjp-freebies-popup-dismissed'

export default function FreebiesPage() {
  useScrollAnimation()
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return

    function handleScroll() {
      const scrolled = window.scrollY + window.innerHeight
      const total = document.documentElement.scrollHeight
      if (scrolled / total >= 0.72) {
        setShowPopup(true)
        window.removeEventListener('scroll', handleScroll)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function handleClose() {
    setShowPopup(false)
    sessionStorage.setItem(SESSION_KEY, '1')
  }

  return (
    <>
      {/* Hero */}
      <div className="bg-[#f6f2ec] border-b border-[#e3e2de] py-14 text-center px-6">
        <p className="hero-eyebrow text-[10px] tracking-[0.35em] uppercase text-[#a0948a] mb-3">MJP Beauty</p>
        <h1 className="hero-heading text-3xl font-semibold text-[#3d3530] mb-3">Freebies for You</h1>
        <p className="hero-tagline text-sm text-[#6b5f58] max-w-md mx-auto leading-relaxed">
          Free educational resources for Artists ready to refine their skills, start and
          grow their business, and continue learning.
        </p>
      </div>

      {/* Cards */}
      <main className="bg-[#fefefe] py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-5">
          {FREEBIES.map((freebie, index) => (
            <FreebieCard key={freebie.id} freebie={freebie} index={index} />
          ))}
        </div>
      </main>

      {showPopup && <NewsletterPopup onClose={handleClose} />}
    </>
  )
}
