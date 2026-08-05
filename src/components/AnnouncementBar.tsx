import { CalendarCheck, GraduationCap, Heart, MapPin, type LucideIcon } from 'lucide-react'

/**
 * Evergreen rotation — no promo required. Swap the whole array for a single
 * entry when there IS a sale on, then restore these when it ends.
 */
const MESSAGES: { icon: LucideIcon; text: string }[] = [
  { icon: MapPin, text: 'Brows, lashes & permanent makeup — 186 Provencher Blvd, St. Boniface' },
  { icon: CalendarCheck, text: 'Book online anytime — appointments open 24/7' },
  { icon: GraduationCap, text: 'Train with us — in-person & online brow education for artists' },
  { icon: Heart, text: 'Free brow guides & resources — no strings attached' },
]

function Message({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <span className="flex items-center gap-3 px-8 whitespace-nowrap">
      <Icon size={13} className="shrink-0 text-white/70" aria-hidden="true" />
      <span className="text-[0.72rem] sm:text-[0.78rem] tracking-[0.12em] text-white/90 font-light">
        {text}
      </span>
    </span>
  )
}

export default function AnnouncementBar() {
  return (
    <div className="announcement-bar bg-brand overflow-hidden py-2">
      {/* Screen readers get each message once; the marquee copies are hidden from them */}
      <p className="sr-only">{MESSAGES.map((m) => m.text).join('. ')}</p>

      <div className="announcement-track flex w-max" aria-hidden="true">
        {/* Two identical halves — the track scrolls -50% for a seamless loop */}
        {Array.from({ length: 2 }).map((_, half) => (
          <div key={half} className="flex shrink-0">
            {MESSAGES.map((m, i) => (
              <Message key={i} icon={m.icon} text={m.text} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
