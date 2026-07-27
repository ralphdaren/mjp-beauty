import { useCallback, useEffect, useState } from 'react'
import { CircleAlert, Mail } from 'lucide-react'
import SectionHeading from './SectionHeading'
import TrainingDatesCard from '../TrainingDatesCard'
import { OPTION_CARDS } from '@/data/training'
import type { TrainingDateGroup, TrainingOptionCard } from '@/types/training'

/** Flodesk form for students who want to hear about future training dates. */
const TRAINING_INQUIRIES_URL = 'https://mjpbeauty.myflodesk.com/traininginquiries'

type ChooseYourPathProps = {
  dateGroups: TrainingDateGroup[]
  datesLoading: boolean
  onViewAllDates: () => void
  onHowToEnroll: () => void
  onBookNow: (card: TrainingOptionCard) => void
}

/** "(gst included)" line with the payment-plan tooltip toggle. */
function GstNote({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <div className="relative mb-8 flex items-center gap-2">
      <span className="text-[0.75rem] text-[#a0948a] tracking-wide">(gst included)</span>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
        className="text-[#a0948a] hover:text-[#827064] transition-colors duration-200"
        aria-label="Interest-free payment plan info"
      >
        <CircleAlert size={12} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-56 bg-[#2a1a0e] text-white/90 text-[0.65rem] leading-relaxed tracking-wide px-3 py-2 rounded-lg shadow-lg z-20">
          Contact MJP Beauty for interest-free payment plan availability
        </div>
      )}
    </div>
  )
}

type OptionCardBodyProps = {
  card: TrainingOptionCard
  className: string
  titleClassName: string
  tooltipOpen: boolean
  onToggleTooltip: () => void
  onBookNow: () => void
  /** Desktop only: the collapsed card's body is inert until it is switched in. */
  disabled?: boolean
}

/** Copy, price and CTA — shared by the stacked mobile card and the expanding desktop card. */
function OptionCardBody({
  card,
  className,
  titleClassName,
  tooltipOpen,
  onToggleTooltip,
  onBookNow,
  disabled = false,
}: OptionCardBodyProps) {
  return (
    <div className={className}>
      <p className="text-[0.7rem] uppercase tracking-[0.28em] text-[#a0948a] mb-4">{card.label}</p>
      <h3 className={`about-heading font-semibold text-[#3d3028] leading-tight mb-6 ${titleClassName}`}>
        {card.title}
      </h3>
      <div className="mb-1">
        <span className="text-[3rem] font-semibold text-[#3d3028] leading-none">{card.price}</span>
        <span className="text-xl text-[#5a5047] ml-2">CAD</span>
      </div>
      <GstNote open={tooltipOpen} onToggle={onToggleTooltip} />
      <div className="h-px bg-[#e3e2de] mb-8 shrink-0" />
      <p className="text-[#5a5047] text-base leading-relaxed">{card.description}</p>
      <button
        onClick={onBookNow}
        disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        className="mt-10 w-full py-3.5 rounded-xl bg-[#3d3028] text-white text-[0.72rem] uppercase tracking-[0.2em] font-medium hover:bg-[#2a1a0e] transition-colors duration-200 disabled:pointer-events-none"
      >
        Book Now
      </button>
    </div>
  )
}

export default function ChooseYourPath({
  dateGroups,
  datesLoading,
  onViewAllDates,
  onHowToEnroll,
  onBookNow,
}: ChooseYourPathProps) {
  const [activeOption, setActiveOption] = useState(0)
  const [tooltipCard, setTooltipCard] = useState<number | null>(null)

  const toggleTooltip = useCallback((i: number) => {
    setTooltipCard((prev) => (prev === i ? null : i))
  }, [])

  const switchOption = useCallback(() => {
    setActiveOption((prev) => 1 - prev)
  }, [])

  // Any click outside the tooltip trigger dismisses it.
  useEffect(() => {
    if (tooltipCard === null) return
    const handler = () => setTooltipCard(null)
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [tooltipCard])

  const datesCard = (
    <TrainingDatesCard
      groups={dateGroups}
      loading={datesLoading}
      onViewAll={onViewAllDates}
      onHowToEnroll={onHowToEnroll}
    />
  )

  return (
    <section className="bg-[#f6f2ec] py-20 px-6 md:px-8">
      <SectionHeading
        eyebrow="Investment"
        title="Choose Your Path"
        caption="Select the training style that best suits you"
        className="mb-14"
      />

      <div className="anim-fade-up mx-auto max-w-[1300px]">
        {/* Mobile: both options stacked */}
        <div className="sm:hidden flex flex-col gap-6">
          {OPTION_CARDS.map((card, i) => (
            <div
              key={card.id}
              className={`rounded-2xl border border-[#e3e2de] bg-white ${card.shadowClass} overflow-hidden flex flex-col`}
            >
              <div className="relative h-64 flex-shrink-0 overflow-hidden">
                <img src={card.img} alt={card.alt} className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
              </div>
              <OptionCardBody
                card={card}
                className="p-8 flex flex-col"
                titleClassName="text-2xl"
                tooltipOpen={tooltipCard === i}
                onToggleTooltip={() => toggleTooltip(i)}
                onBookNow={() => onBookNow(card)}
              />
            </div>
          ))}

          {datesCard}
        </div>

        {/* Desktop: the selected option expands, the other collapses to a peek */}
        <div className="hidden sm:flex gap-8 items-stretch">
          <div className="flex-[7] min-w-0 relative">
            {/* Invisible clone of the widest card — reserves the row's height. */}
            <div
              className="invisible pointer-events-none flex flex-row"
              style={{ width: 'calc(80% - 16px)' }}
              aria-hidden="true"
            >
              <div className="w-[38%] flex-shrink-0" />
              <div className="flex-1 p-10 flex flex-col">
                <p className="text-[0.7rem] mb-4">{OPTION_CARDS[1].label}</p>
                <h3 className="about-heading text-2xl sm:text-3xl mb-6">{OPTION_CARDS[1].title}</h3>
                <div className="mb-1">
                  <span className="text-[3rem] leading-none">{OPTION_CARDS[1].price}</span>
                  <span className="text-xl ml-2">CAD</span>
                </div>
                <p className="text-[0.75rem] mb-8">(gst included)</p>
                <div className="h-px mb-8" />
                <p className="text-base leading-relaxed">{OPTION_CARDS[1].description}</p>
                <div className="mt-10 w-full py-3.5" aria-hidden="true" />
              </div>
            </div>

            <div className="absolute inset-0 flex gap-5">
              {OPTION_CARDS.map((card, i) => {
                const isActive = activeOption === i
                return (
                  <div
                    key={card.id}
                    className={`relative overflow-hidden rounded-2xl border border-[#e3e2de] bg-white ${card.shadowClass} transition-[flex-grow] duration-700 ease-in-out`}
                    style={{ flexGrow: isActive ? 4 : 1, flexShrink: 0, flexBasis: '0%' }}
                  >
                    {/* Full card content — visible when active */}
                    <div
                      className="absolute inset-0 flex flex-row"
                      style={{
                        opacity: isActive ? 1 : 0,
                        transition: isActive ? 'opacity 0.45s ease' : 'opacity 0.2s ease',
                      }}
                      aria-hidden={!isActive}
                    >
                      <div className="relative w-[38%] flex-shrink-0 overflow-hidden">
                        <img src={card.img} alt={card.alt} className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
                      </div>
                      <OptionCardBody
                        card={card}
                        className="flex-1 p-10 flex flex-col"
                        titleClassName="text-2xl sm:text-3xl"
                        tooltipOpen={tooltipCard === i}
                        onToggleTooltip={() => toggleTooltip(i)}
                        onBookNow={() => onBookNow(card)}
                        disabled={!isActive}
                      />
                    </div>

                    {/* Peek overlay — visible when inactive, clickable to switch */}
                    <button
                      className="absolute inset-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a0948a]"
                      style={{
                        opacity: isActive ? 0 : 1,
                        pointerEvents: isActive ? 'none' : 'auto',
                        transition: isActive ? 'opacity 0.2s ease' : 'opacity 0.5s ease 0.3s',
                      }}
                      onClick={switchOption}
                      aria-label={`Switch to ${card.title}`}
                      tabIndex={isActive ? -1 : 0}
                    >
                      <img src={card.img} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
                      <div className="absolute inset-0 bg-[#2a1a0e]/55 group-hover:bg-[#2a1a0e]/40 transition-colors duration-300" />
                      <div className="absolute inset-x-0 bottom-0 p-5">
                        <p className="text-[0.6rem] uppercase tracking-[0.22em] text-white/50 mb-1.5">{card.label}</p>
                        <p className="text-white font-semibold text-sm leading-tight mb-3">{card.title}</p>
                        <p className="text-[0.62rem] uppercase tracking-[0.18em] text-white/50 group-hover:text-white/80 transition-colors duration-300">
                          View →
                        </p>
                      </div>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex-[3] min-w-[300px] flex">
            {datesCard}
          </div>
        </div>
      </div>

      {/* Payment info */}
      <div className="anim-fade-up mx-auto max-w-[1300px] mt-8" style={{ transitionDelay: '0.3s' }}>
        <div className="grid grid-cols-2 gap-5 sm:gap-10 justify-items-center">

          <div className="text-center sm:text-left">
            <p className="text-[#3d3028] text-base sm:text-lg font-semibold leading-snug mb-1.5">$500 Deposit</p>
            <p className="text-[#5a5047] text-[0.8rem] sm:text-sm leading-relaxed">
              To secure your spot &amp; gain instant access to online modules
            </p>
          </div>

          <div className="text-center sm:text-left">
            <p className="text-[#3d3028] text-base sm:text-lg font-semibold leading-snug mb-1.5">Remaining Balance</p>
            <p className="text-[#5a5047] text-[0.8rem] sm:text-sm leading-relaxed">
              Must be submitted two weeks before your training day
            </p>
          </div>

        </div>
      </div>

      {/* Dates don't work? — capture the lead for future sessions */}
      <div className="anim-fade-up mx-auto max-w-[1300px] mt-10" style={{ transitionDelay: '0.4s' }}>
        <div className="rounded-2xl border border-[#e3e2de] bg-white/70 px-7 py-7 sm:px-9 sm:py-6 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
          <span className="hidden sm:flex w-11 h-11 shrink-0 items-center justify-center rounded-full bg-[#f6f2ec] text-[#827064]">
            <Mail size={18} />
          </span>

          <div className="flex-1 text-center sm:text-left">
            <p className="text-[#3d3028] text-base sm:text-lg font-semibold leading-snug mb-1.5">
              None of these dates work for you?
            </p>
            <p className="text-[#5a5047] text-[0.8rem] sm:text-sm leading-relaxed">
              Join the list and I&apos;ll reach out as soon as new training dates open up.
            </p>
          </div>

          <a
            href={TRAINING_INQUIRIES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto shrink-0 text-center py-3.5 sm:py-3 px-8 rounded-xl border border-[#3d3028] text-[#3d3028] text-[0.7rem] uppercase tracking-[0.18em] font-medium hover:bg-[#3d3028] hover:text-white transition-colors duration-200"
          >
            Keep Me Posted
          </a>
        </div>
      </div>
    </section>
  )
}
