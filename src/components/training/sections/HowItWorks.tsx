import { useState } from 'react'
import SectionHeading from './SectionHeading'
import { FORMAT_ITEMS } from '@/data/training'

const SCRIM =
  'linear-gradient(to top, rgba(20,10,5,0.82) 0%, rgba(20,10,5,0.12) 55%, transparent 100%)'

export default function HowItWorks() {
  const [hovered, setHovered] = useState<number | null>(null)
  const anyHovered = hovered !== null

  return (
    <section className="bg-white">
      <SectionHeading
        title="How it Works"
        caption="This in-person training format is as follows"
        className="pt-16 pb-10 px-6 md:px-8"
      />

      {/* Mobile: stacked cards, all content always visible (no hover) */}
      <div className="md:hidden flex flex-col">
        {FORMAT_ITEMS.map((item, i) => (
          <div key={i} className="relative w-full">
            <div className="relative h-64 overflow-hidden">
              <img
                src={item.img}
                alt={item.alt}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0" style={{ background: SCRIM }} />
              <div className="absolute inset-x-0 bottom-0 px-6 pb-5 flex items-end gap-3">
                <span className="text-[2.5rem] font-semibold leading-none select-none text-white/30">
                  {item.step}
                </span>
                <h3 className="text-lg font-semibold text-white leading-snug pb-1">
                  {item.title}
                </h3>
              </div>
            </div>
            <div className="bg-[#f6f2ec] px-6 py-7 flex flex-col gap-3">
              {item.paragraphs.map((para, j) => (
                <p key={j} className="text-[#5a5047] text-base leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: hover-to-expand image strips */}
      <div
        className="hidden md:flex w-full overflow-hidden"
        style={{ height: '680px' }}
        onMouseLeave={() => setHovered(null)}
      >
        {FORMAT_ITEMS.map((item, i) => {
          const isHovered = hovered === i

          return (
            <div
              key={i}
              onMouseEnter={() => setHovered(i)}
              className="relative overflow-hidden cursor-pointer"
              style={{
                flex: isHovered ? 2.6 : anyHovered ? 0.7 : 1,
                transition: 'flex 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: 'translateZ(0)',
              }}
            >
              <img
                src={item.img}
                alt={item.alt}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />

              <div className="absolute inset-0" style={{ background: SCRIM }} />

              {/* Extra darkening so the expanded copy stays legible */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to top, rgba(10,5,2,0.48) 0%, rgba(10,5,2,0.18) 60%, transparent 100%)',
                  opacity: isHovered ? 1 : 0,
                  transition: 'opacity 0.4s ease',
                }}
              />

              {/* Step number */}
              <span
                className="absolute bottom-6 left-6 font-semibold leading-none select-none"
                style={{
                  fontSize: '4.5rem',
                  color: 'rgba(255,255,255,0.28)',
                  opacity: isHovered ? 0 : 1,
                  transition: 'opacity 0.25s ease',
                }}
              >
                {item.step}
              </span>

              {/* Text content */}
              <div
                className="absolute inset-x-0 bottom-0 px-7 pb-8 flex flex-col gap-3"
                style={{
                  opacity: isHovered ? 1 : 0,
                  transform: isHovered ? 'translateY(0)' : 'translateY(18px)',
                  transition: isHovered
                    ? 'opacity 0.4s ease 0.1s, transform 0.4s ease 0.1s'
                    : 'opacity 0.1s ease, transform 0.1s ease',
                  pointerEvents: isHovered ? 'auto' : 'none',
                }}
              >
                <span className="text-[2.8rem] font-semibold leading-none select-none text-white/20">
                  {item.step}
                </span>
                <h3 className="text-lg sm:text-xl font-semibold text-white leading-snug">
                  {item.title}
                </h3>
                {item.paragraphs.map((para, j) => (
                  <p key={j} className="text-white/80 text-base leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>

              {/* Collapsed label */}
              <div
                className="absolute inset-x-0 bottom-6 px-5 text-center"
                style={{
                  opacity: anyHovered ? 0 : 1,
                  transition: 'opacity 0.25s ease',
                }}
              >
                <p className="text-white/60 text-[0.65rem] uppercase tracking-[0.22em]">
                  hover to explore
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
