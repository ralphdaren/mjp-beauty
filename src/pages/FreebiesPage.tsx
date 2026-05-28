import { BookOpen, Download, FileText, Play, Shield } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// ─── Data ─────────────────────────────────────────────────────────────────────

interface Freebie {
  id: string
  type: string
  Icon: LucideIcon
  title: string
  description: string
  url: string
}

const FREEBIES: Freebie[] = [
  {
    id: 'brow-artistry-essentials',
    type: 'PDF Guide',
    Icon: BookOpen,
    title: 'Brow Artistry Essentials',
    description:
      "A downloadable PDF of my go-to brow products — the exact tools I use daily as a pro. This is the guide I wish I had when I started — it'll save you time, money, and a lot of trial and error.",
    url: 'https://mjpbeauty.myflodesk.com/browartistryessentials',
  },
  {
    id: 'waxing-contraindications',
    type: 'Reference Guide',
    Icon: Shield,
    title: 'Deep Diving into Waxing Contraindications',
    description:
      "A clear, easy-to-understand guide that breaks down who you should and shouldn't wax — and more importantly, why.",
    url: 'https://mjpbeauty.myflodesk.com/brow-waxing-contraindications',
  },
  {
    id: 'consent-form',
    type: 'Editable Template',
    Icon: FileText,
    title: 'Customizable Brow Lamination Consent Form',
    description:
      'An editable and printable client consent form designed to protect your business and elevate your professionalism. Includes all the key questions and disclaimers you need.',
    url: 'https://mjpbeauty.myflodesk.com/free-brow-lamination-consent-form-template',
  },
  {
    id: 'brow-concealing-demo',
    type: 'Free Tutorial',
    Icon: Play,
    title: 'Brow Concealing Demo',
    description:
      "Watch a free, mini tutorial on how I conceal my client's brows! This is a game-changing step that helps to top off the brows and give your clients stunning, carved, eye-catching brows!",
    url: 'https://mjpbeauty.myflodesk.com/browconcealingfreebie',
  },
]

// ─── Freebie card ─────────────────────────────────────────────────────────────

function FreebieCard({ freebie }: { freebie: Freebie }) {
  const { Icon, type, title, description, url } = freebie

  return (
    <div className="bg-white rounded-2xl border border-[#e3e2de] shadow-sm p-8 flex flex-col hover:shadow-lg transition-shadow duration-300">
      <div className="w-12 h-12 rounded-full bg-[#f6f2ec] flex items-center justify-center mb-5 shrink-0">
        <Icon size={20} className="text-[#827064]" />
      </div>

      <p className="text-[10px] tracking-[0.2em] uppercase text-[#a0948a] mb-2">{type}</p>
      <h3 className="text-[1.05rem] font-semibold text-[#3d3530] mb-3 leading-snug">{title}</h3>
      <p className="text-sm text-[#6b5f58] leading-relaxed flex-1 mb-6">{description}</p>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#827064] text-white text-sm tracking-wide rounded-full hover:opacity-90 active:scale-[0.98] transition-all"
      >
        <Download size={13} />
        Get it Free
      </a>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FreebiesPage() {
  return (
    <>
      {/* Hero */}
      <div className="bg-[#f6f2ec] border-b border-[#e3e2de] py-14 text-center px-6">
        <p className="text-[10px] tracking-[0.35em] uppercase text-[#a0948a] mb-3">MJP Beauty</p>
        <h1 className="text-3xl font-semibold text-[#3d3530] mb-3">Freebies for You</h1>
        <p className="text-sm text-[#6b5f58] max-w-md mx-auto leading-relaxed">
          Take the guesswork out of your services with these powerful, pro-level resources.
          Whether you're refining your technique or just starting out, these tools
          are designed to elevate your artistry and client care.
        </p>
      </div>

      {/* Cards */}
      <main className="bg-[#fefefe] py-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
          {FREEBIES.map((freebie) => (
            <FreebieCard key={freebie.id} freebie={freebie} />
          ))}
        </div>
      </main>
    </>
  )
}
