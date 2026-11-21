import type { PriceTier, Service } from '../../types/booking'
import { summaryLine } from '../../lib/serviceMenu'

interface SummaryBarProps {
  picked: { service: Service; tier: PriceTier } | null
  onBook: () => void
  hidden: boolean
}

/** Bar pinned to the bottom of the services section, showing the current pick and the button into the booking drawer. */
export default function SummaryBar({ picked, onBook, hidden }: SummaryBarProps) {
  if (hidden) return null

  return (
    <div className="sticky bottom-0 z-10 bg-[rgba(239,232,223,.94)] backdrop-blur-md border-t border-[rgba(61,53,48,.13)]">
      <div className="max-w-[1140px] mx-auto px-4 md:px-12 py-2.5 md:py-4 flex flex-col md:flex-row md:items-center gap-2 md:gap-7">
        <div className="md:flex-1 min-w-0" aria-live="polite">
          <p className="text-sm md:text-[14.5px] text-[#4a403a] md:text-[#3d3530] line-clamp-2 md:line-clamp-1">
            {picked ? summaryLine(picked.service, picked.tier) : 'Choose an option to continue'}
          </p>
          <p className="hidden md:block text-[13.5px] text-[#6b5f58] mt-0.5">
            {picked
              ? `${picked.tier.duration ? `${picked.tier.duration} with Micah.` : 'With Micah.'}`
              : 'All appointments are with Micah'}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 md:gap-7">
          <div className="flex flex-col md:flex-row md:items-baseline md:gap-2 leading-tight">
            {picked && (
              <>
                <span className="font-semibold text-lg md:text-xl text-[#3d3530]">{picked.tier.price}</span>
                <span className="text-xs text-[#6b5f58] whitespace-nowrap">before tax</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onBook}
            disabled={!picked}
            className="min-h-12 md:min-h-[52px] px-5 md:px-[30px] rounded-full bg-[#3d3530] text-white text-[15px] font-medium whitespace-nowrap transition-opacity duration-200 hover:opacity-90 disabled:opacity-35 disabled:cursor-default cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3d3530]"
          >
            Choose a date and time
          </button>
        </div>
      </div>
    </div>
  )
}
