import { useState } from 'react'
import { ChevronRight, Clock } from 'lucide-react'
import type { PriceTier } from '../../types/booking'

export default function FlipTier({ tier }: { tier: PriceTier }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div
      style={{ perspective: '800px' }}
      className="cursor-pointer select-none"
      onClick={() => setFlipped((f) => !f)}
    >
      <div
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateX(180deg)' : 'rotateX(0deg)',
          transition: 'transform 0.4s ease',
          position: 'relative',
        }}
      >
        {/* Front */}
        <div
          style={{ backfaceVisibility: 'hidden' }}
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#f6f2ec] hover:bg-[#ede8e0] transition-colors text-sm text-[#6b5f58] leading-snug"
        >
          <span className="flex-1 min-w-0">{tier.label}</span>
          <ChevronRight size={12} className="shrink-0 text-[#c0b4ac]" />
        </div>

        {/* Back */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateX(180deg)',
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
          }}
          className="flex items-center justify-between gap-3 px-3 rounded-lg bg-[#f6f2ec] border border-[#a0948a]"
        >
          {tier.duration && (
            <div className="flex items-center gap-1.5 text-[#a0948a] text-xs">
              <Clock size={11} />
              <span>{tier.duration}</span>
            </div>
          )}
          <span className="font-semibold text-sm text-[#3d3530] ml-auto">{tier.price}</span>
        </div>
      </div>
    </div>
  )
}
