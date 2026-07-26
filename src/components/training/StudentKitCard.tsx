import { KIT_ITEMS, PERK_01_IMG } from '@/data/training'

type StudentKitCardProps = {
  open: boolean
  onOpen: () => void
  onClose: () => void
  className?: string
  /** Explicit height for stacked layouts where the grid cell has none. */
  height?: string
  /** Front-face teaser size — smaller in the dense desktop bento cell. */
  teaserClassName?: string
}

/**
 * Perk No.1 — flips from the kit photo to the full contents list. Same card is
 * rendered in the desktop bento grid and the stacked mobile grid.
 */
export default function StudentKitCard({
  open,
  onOpen,
  onClose,
  className = '',
  height,
  teaserClassName = 'text-[0.82rem]',
}: StudentKitCardProps) {
  return (
    <div className={className} style={{ perspective: '1200px', height }}>
      <div
        className="relative w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
          transform: open ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.65s cubic-bezier(0.4, 0.2, 0.2, 1)',
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden flex flex-col bg-white border border-[#e3e2de] shadow-[0_2px_16px_rgba(130,112,100,0.10)]"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="relative flex-1 min-h-0 overflow-hidden">
            <img
              src={PERK_01_IMG}
              alt="Premium Student Kit"
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="p-5 flex flex-col gap-1.5 flex-shrink-0">
            <span className="text-xs font-semibold leading-none select-none text-[#d4ccc4]">01</span>
            <h3 className="text-[#3d3028] text-[0.95rem] font-semibold leading-snug">Premium Student Kit</h3>
            <p className={`text-[#a0948a] leading-relaxed ${teaserClassName}`}>
              Pro tools and Micah's go-to products.
            </p>
            <button
              onClick={onOpen}
              className="mt-1 text-left text-[0.63rem] uppercase tracking-[0.2em] text-[#a0948a] hover:text-[#827064] transition-colors duration-200"
            >
              See what's inside →
            </button>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl flex flex-col overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            backgroundColor: '#2a1a0e',
          }}
        >
          <div className="p-5 flex flex-col h-full">
            <div className="flex items-start justify-between mb-3 flex-shrink-0">
              <div>
                <span className="text-xs font-semibold leading-none select-none text-white/20">01</span>
                <h3 className="text-white/90 text-sm font-semibold mt-1.5 leading-snug">What's in your kit</h3>
              </div>
              <button
                onClick={onClose}
                className="text-[0.6rem] uppercase tracking-[0.22em] text-white/35 hover:text-white/70 transition-colors duration-200 mt-0.5"
              >
                ← Back
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ul className="flex flex-col gap-2">
                {KIT_ITEMS.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-[#a0948a] flex-shrink-0 leading-relaxed text-[0.7rem]">—</span>
                    <span className="text-white/65 text-[0.72rem] leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-3 border-t border-white/10">
                <p className="text-[0.58rem] uppercase tracking-[0.22em] text-white/30 mb-1.5">Not included with your kit</p>
                <p className="text-white/40 text-[0.7rem] leading-relaxed">Soft Wax, Wax Pot, Post-Wax Oil &amp; Concealers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
