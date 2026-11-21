import { useLayoutEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import type { PriceTier, Service } from '../../types/booking'
import {
  type Selection,
  fromPrice,
  initialOpenId,
  resolveSelection,
  tierKey,
} from '../../lib/serviceMenu'
import ServicePhoto from './ServicePhoto'
import SummaryBar from './SummaryBar'

interface ServiceMenuProps {
  services: Service[]
  onBook: (service: Service, tier: PriceTier) => void
  onVideoOpen: (src: string) => void
  hideBar: boolean
}

/** Section 1 of the booking page: service accordion with every price visible, a large photo, and the summary bar. */
export default function ServiceMenu({ services, onBook, onVideoOpen, hideBar }: ServiceMenuProps) {
  const { hash } = useLocation()
  const [openId, setOpenId] = useState(() => initialOpenId(services, hash))
  const [selection, setSelection] = useState<Selection | null>(null)

  // Footer and search links (#keratin-lt) open that service, also when already on the page.
  // Adjusted during render (not in an effect) so the right service is open on the same paint.
  const [seenHash, setSeenHash] = useState(hash)
  if (hash !== seenHash) {
    setSeenHash(hash)
    if (hash) setOpenId(initialOpenId(services, hash))
  }

  // Keep a tapped header where it was on screen: the panel above it collapses instantly,
  // so we scroll by however far the header moved.
  const anchor = useRef<{ id: string; top: number } | null>(null)
  useLayoutEffect(() => {
    const a = anchor.current
    anchor.current = null
    if (!a) return
    const el = document.getElementById(a.id)
    if (el) window.scrollBy(0, el.getBoundingClientRect().top - a.top)
  }, [openId])

  function openFromHeader(id: string) {
    const el = document.getElementById(id)
    if (el) anchor.current = { id, top: el.getBoundingClientRect().top }
    setOpenId(id)
  }

  const openService = services.find((s) => s.id === openId) ?? services[0]
  const picked = resolveSelection(services, selection)

  return (
    <section aria-labelledby="book-heading" className="bg-[#efe8df] text-[#3d3530]">
      <div className="max-w-[1140px] mx-auto px-4 md:px-12 pt-14 pb-8 md:pt-[72px] md:pb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-4 md:gap-12">
        <h1 id="book-heading" className="display-serif !font-semibold text-[clamp(34px,4vw,52px)] leading-[1.05] tracking-[-0.01em]">
          Book your next appointment
        </h1>
        <p className="text-[15px] leading-[1.6] text-[#6b5f58] max-w-[300px] md:pb-2.5">
          Choose a service and option. You'll pick your date and time on the next step.
        </p>
      </div>

      <div className="max-w-[1140px] mx-auto px-4 md:px-12 pb-14 md:pb-20 grid grid-cols-1 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-0 md:gap-16 items-start">
        <div>
          {services.map((service) => {
            const open = service.id === openService?.id
            const from = fromPrice(service)
            return (
              <div
                key={service.id}
                id={service.id}
                className="scroll-mt-28 border-t border-[rgba(61,53,48,.13)] last:border-b"
              >
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={`${service.id}-panel`}
                  onClick={() => openFromHeader(service.id)}
                  className="group w-full flex items-baseline justify-between gap-6 py-[22px] md:pt-5 md:pb-[18px] text-left cursor-pointer rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3d3530]"
                >
                  <span
                    className={`display-serif text-[clamp(24px,2.3vw,30px)] leading-[1.15] transition-opacity duration-300 motion-reduce:transition-none ${
                      open ? 'opacity-100' : 'opacity-60 group-hover:opacity-80'
                    }`}
                  >
                    {service.name}
                  </span>
                  {from && (
                    <span className="text-[13px] text-[#6b5f58] whitespace-nowrap">
                      from <span className="font-semibold text-[15px] text-[#3d3530] ml-1">{from}</span>
                    </span>
                  )}
                </button>

                <div
                  id={`${service.id}-panel`}
                  className={`grid ${
                    open
                      ? 'grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out motion-reduce:transition-none'
                      : 'grid-rows-[0fr]'
                  }`}
                  inert={!open}
                >
                  <div className="overflow-hidden">
                    <div className="pb-[30px]">
                      {/* Phones: the same rotating photos as the desktop panel, inside the open service.
                          Mounted only while open so closed services don't run timers or load images. */}
                      {open && service.images.length > 0 && (
                        <div className="md:hidden mb-[18px]">
                          <ServicePhoto
                            services={[service]}
                            service={service}
                            onVideoOpen={onVideoOpen}
                            frameClassName="aspect-[16/10]"
                            sizes="100vw"
                          />
                        </div>
                      )}
                      <p className="text-[14.5px] leading-[1.65] text-[#4a403a] max-w-[52ch] mb-5">{service.description}</p>

                      <div role="radiogroup" aria-label={`${service.name} options`}>
                        {service.tiers.map((tier, j) => {
                          const checked =
                            picked?.service.id === service.id && tierKey(picked.tier) === tierKey(tier)
                          return (
                            <button
                              key={tierKey(tier)}
                              type="button"
                              role="radio"
                              aria-checked={checked}
                              onClick={() => setSelection({ serviceId: service.id, tierKey: tierKey(tier) })}
                              style={{ animationDelay: `${j * 45}ms` }}
                              className={`${open ? 'menu-row-rise' : ''} w-full grid grid-cols-[20px_1fr_auto] md:grid-cols-[22px_1fr_auto_auto] grid-rows-[auto_auto] md:grid-rows-1 items-center gap-x-3.5 md:gap-x-4 gap-y-0.5 min-h-[50px] px-2.5 py-3 md:px-3.5 md:py-0 rounded-[10px] text-left transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#3d3530] ${
                                checked ? 'bg-[#fefefe]' : 'hover:bg-white/50'
                              }`}
                            >
                              <span
                                className={`row-span-2 md:row-span-1 w-[18px] h-[18px] rounded-full border-[1.5px] grid place-items-center ${
                                  checked ? 'border-[#b07b5a]' : 'border-[rgba(61,53,48,.35)]'
                                }`}
                              >
                                <span
                                  className={`w-2 h-2 rounded-full bg-[#b07b5a] transition-transform duration-200 ${
                                    checked ? 'scale-100' : 'scale-0'
                                  }`}
                                />
                              </span>
                              <span className="text-[14.5px] leading-[1.35]">{tier.label}</span>
                              <span className="col-start-2 row-start-2 md:col-start-auto md:row-start-auto text-[13px] text-[#6b5f58] whitespace-nowrap">
                                {tier.duration}
                              </span>
                              <span className="col-start-3 row-start-1 row-span-2 md:col-start-auto md:row-start-auto md:row-span-1 font-semibold text-base min-w-[80px] text-right">
                                {tier.price}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {openService && (
          <aside className="hidden md:block sticky top-28">
            <ServicePhoto services={services} service={openService} onVideoOpen={onVideoOpen} />
          </aside>
        )}
      </div>

      <SummaryBar
        picked={picked}
        hidden={hideBar}
        onBook={() => picked && onBook(picked.service, picked.tier)}
      />
    </section>
  )
}
