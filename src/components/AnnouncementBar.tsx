import { CalendarCheck, GraduationCap, type LucideIcon } from 'lucide-react'

const MESSAGES: { icon: LucideIcon; text: string }[] = [
  { icon: GraduationCap, text: 'Brow training for 2027 is now open' },
  { icon: CalendarCheck, text: 'Now booking appointments for November' },
]

const REPEATS_PER_HALF = 3

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
      <p className="sr-only">{MESSAGES.map((m) => m.text).join('. ')}</p>

      <div className="announcement-track flex w-max" aria-hidden="true">
        {Array.from({ length: 2 }).map((_, half) => (
          <div key={half} className="flex shrink-0">
            {Array.from({ length: REPEATS_PER_HALF }).flatMap((_, r) =>
              MESSAGES.map((m, i) => <Message key={`${r}-${i}`} icon={m.icon} text={m.text} />),
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
