import { Sparkles } from 'lucide-react'

const PROMO_CODE = 'ANNIVERSARY20'

function Message() {
  return (
    <span className="flex items-center gap-3 px-8 whitespace-nowrap">
      <Sparkles size={13} className="shrink-0 text-white/70" aria-hidden="true" />
      <span className="text-[0.72rem] sm:text-[0.78rem] tracking-[0.12em] text-white/90 font-light">
        1 Year Anniversary Sale of our Online Brow Academy! Use promo code{' '}
        <span className="font-medium tracking-[0.16em] text-white">{PROMO_CODE}</span>{' '}
        on any of our online courses!
      </span>
    </span>
  )
}

export default function AnnouncementBar() {
  return (
    <div className="announcement-bar bg-brand overflow-hidden py-2">
      {/* Screen readers get the message once; the marquee copies are hidden from them */}
      <p className="sr-only">
        1 Year Anniversary Sale of our Online Brow Academy! Use promo code {PROMO_CODE} on any of our
        online courses!
      </p>

      <div className="announcement-track flex w-max" aria-hidden="true">
        {/* Two identical halves — the track scrolls -50% for a seamless loop */}
        {Array.from({ length: 2 }).map((_, half) => (
          <div key={half} className="flex shrink-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <Message key={i} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
