import { useRef, useState, type KeyboardEvent } from 'react'
import SectionHeading from '../SectionHeading'
import { AftercarePanel, FaqPanel, PoliciesPanel } from './visitContent'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const PLACE_QUERY = '186+Provencher+Blvd,Winnipeg,MB+R2H+0G3'
const EMBED_URL = `https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${PLACE_QUERY}&zoom=14`
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${PLACE_QUERY}`

const HOURS = [
  { days: 'Tuesday to Friday', time: '10am to 6pm' },
  { days: 'Saturday', time: '9am to 4pm' },
  { days: 'Sunday and Monday', time: 'Closed' },
]

const TABS = [
  { id: 'policies', label: 'Booking policies', Panel: PoliciesPanel },
  { id: 'faq', label: 'FAQ', Panel: FaqPanel },
  { id: 'aftercare', label: 'Aftercare', Panel: AftercarePanel },
] as const

/** Section 3 of the booking page: the studio (map, address, hours) beside policies, FAQ and aftercare. */
export default function VisitSection() {
  const [active, setActive] = useState(0)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  function onTabKey(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const next = (active + (e.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length
    setActive(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <section aria-labelledby="visit-heading" className="bg-[#efe8df] border-t border-[#e3e2de] pt-16 pb-16 md:pt-[88px] md:pb-[104px]">
      <SectionHeading
        id="visit-heading"
        title="Before your visit"
        line="Where to find the studio, and what to know before and after your appointment."
      />

      <div className="max-w-[1140px] mx-auto px-4 md:px-12 grid grid-cols-1 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-12 md:gap-16 items-start">
        <div className="md:sticky md:top-28 text-[#3d3530]">
          <div className="aspect-[4/3] rounded overflow-hidden bg-[#e6ddd2] [filter:saturate(.55)_sepia(.12)]">
            <iframe
              src={EMBED_URL}
              className="w-full h-full border-0 block"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="MJP Beauty studio on the map"
            />
          </div>
          <h3 className="display-serif !font-light text-2xl mt-[22px]">186 Provencher Blvd</h3>
          <p className="text-sm text-[#6b5f58] mt-1">St. Boniface, Winnipeg, MB R2H 0G3</p>

          <dl className="mt-5 border-t border-[rgba(61,53,48,.13)] text-sm">
            {HOURS.map(({ days, time }) => (
              <div
                key={days}
                className={`flex justify-between py-[11px] border-b border-[rgba(61,53,48,.13)] ${
                  time === 'Closed' ? 'text-[#6b5f58]' : ''
                }`}
              >
                <dt>{days}</dt>
                <dd>{time}</dd>
              </div>
            ))}
          </dl>

          <a
            href={DIRECTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center min-h-12 px-6 mt-[22px] border border-[#3d3530] rounded-full text-[14.5px] font-medium hover:bg-[#3d3530] hover:text-white transition-colors duration-200"
          >
            Get directions
          </a>
          <p className="text-[13px] text-[#6b5f58] mt-3 leading-normal">Parking details are in your confirmation email.</p>
        </div>

        <div>
          <div role="tablist" aria-label="Booking information" className="flex border-b border-[rgba(61,53,48,.13)] overflow-x-auto">
            {TABS.map((tab, i) => (
              <button
                key={tab.id}
                ref={(el) => { tabRefs.current[i] = el }}
                type="button"
                role="tab"
                id={`visit-tab-${tab.id}`}
                aria-selected={active === i}
                aria-controls={`visit-panel-${tab.id}`}
                tabIndex={active === i ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={onTabKey}
                className={`min-h-[46px] px-1 mr-[22px] -mb-px border-b-2 text-[15px] whitespace-nowrap transition-colors duration-200 cursor-pointer rounded-t-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b07b5a] ${
                  active === i ? 'text-[#3d3530] border-[#3d3530]' : 'text-[#6b5f58] border-transparent hover:text-[#3d3530]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {TABS.map((tab, i) => (
            <div
              key={tab.id}
              role="tabpanel"
              id={`visit-panel-${tab.id}`}
              aria-labelledby={`visit-tab-${tab.id}`}
              hidden={active !== i}
            >
              <tab.Panel />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
