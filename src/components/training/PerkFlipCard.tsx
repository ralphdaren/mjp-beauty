type PerkFlipCardProps = {
  number: string
  title: string
  /** Optional short line shown under the title on the front face. */
  teaser?: string
  /** Heading on the flipped face. */
  backTitle: string
  body: string
  /** Front face background — matches the surrounding bento palette. */
  frontBg: string
  numberColor: string
  ctaLabel?: string
  open: boolean
  onOpen: () => void
  onClose: () => void
  className?: string
  /** Extra classes on the front face (borders, shadows). */
  frontClassName?: string
  /** Explicit height for stacked layouts where the grid cell has none. */
  height?: string
  titleClassName?: string
}

export default function PerkFlipCard({
  number,
  title,
  teaser,
  backTitle,
  body,
  frontBg,
  numberColor,
  ctaLabel = 'Learn more →',
  open,
  onOpen,
  onClose,
  className = '',
  frontClassName = '',
  height,
  titleClassName = 'text-[0.95rem]',
}: PerkFlipCardProps) {
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
        <button
          type="button"
          onClick={onOpen}
          className={`absolute inset-0 rounded-2xl p-5 flex flex-col justify-between text-left ${frontClassName}`}
          style={{ backfaceVisibility: 'hidden', backgroundColor: frontBg }}
        >
          <span className={`text-xs font-semibold leading-none select-none ${numberColor}`}>{number}</span>
          <div className="flex flex-col gap-1.5">
            <h3 className={`text-[#3d3028] font-semibold leading-snug ${titleClassName}`}>{title}</h3>
            {teaser && <p className="text-[#a0948a] text-[0.82rem] leading-relaxed">{teaser}</p>}
            <span className="mt-1 text-[0.63rem] uppercase tracking-[0.2em] text-[#a0948a]">
              {ctaLabel}
            </span>
          </div>
        </button>

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
                <span className="text-xs font-semibold leading-none select-none text-white/20">{number}</span>
                <h3 className="text-white/90 text-sm font-semibold mt-1.5 leading-snug">{backTitle}</h3>
              </div>
              <button
                onClick={onClose}
                className="text-[0.6rem] uppercase tracking-[0.22em] text-white/35 hover:text-white/70 transition-colors duration-200 mt-0.5"
              >
                ← Back
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <p className="text-white/65 text-[0.78rem] leading-relaxed">{body}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
