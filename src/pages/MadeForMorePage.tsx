import { CalendarDays, MapPin } from 'lucide-react'
import MadeForMoreNavbar from '@/components/MadeForMoreNavbar'
import {
  MFM_EVENT,
  MFM_HERO_IMG,
  MFM_HERO_IMG_MOBILE,
  MFM_TICKETS_URL,
} from '@/data/madeForMore'

export default function MadeForMorePage() {
  return (
    <main>
      <MadeForMoreNavbar />

      {/* Full-bleed hero */}
      <section className="mfm-hero">
        <picture>
          {/* Must stay in lockstep with the painted-sky block in
              made-for-more.css — see the comment there. */}
          <source
            media="(max-aspect-ratio: 7/10) and (max-width: 1023px)"
            srcSet={MFM_HERO_IMG_MOBILE}
          />
          <img
            className="mfm-hero-img"
            src={MFM_HERO_IMG}
            alt="The three Made For More hosts in front of the Calgary skyline and Peace Bridge at dusk"
            fetchPriority="high"
            decoding="async"
          />
        </picture>
        <div className="mfm-hero-scrim" />

        {/* Bottom spacing lives in CSS — it has to clear .mfm-band, whose height
            is viewport-derived. See --mfm-band-h in made-for-more.css. */}
        <div className="mfm-hero-content relative z-10 flex min-h-[100svh] flex-col px-5 pt-24 sm:px-10 sm:pt-28 lg:px-16">

          {/* Title block — horizontally centred, held to the upper third so the
              three presenters in the artwork stay uncovered. */}
          <div className="mx-auto mb-12 max-w-5xl text-center">
            {/* Fluid + nowrap so the sentence holds one line from 320px up —
                below `sm` the tracking has to give way before the type does. */}
            <p className="hero-eyebrow font-sans whitespace-nowrap text-[clamp(0.44rem,2.6vw,0.72rem)] font-light uppercase leading-relaxed tracking-[0.1em] text-white/80 sm:tracking-[0.32em]">
              {MFM_EVENT.tagline}
            </p>
            {/* Fluid so the wordmark holds a single line at every width.
                Playfair capitals with a cursive "For" between them. */}
            <h1 className="mfm-wordmark hero-heading about-subheading mt-2 whitespace-nowrap text-[clamp(2.25rem,8.6vw,6rem)] leading-[1.05] tracking-[-0.01em] text-white sm:mt-3">
              MADE <em className="script-accent">for</em> MORE
            </h1>
            {/* Same treatment as the eyebrow, so the two rules stay balanced
                instead of one holding a line while the other wraps. */}
            <p className="hero-tagline font-sans mt-2 whitespace-nowrap text-[clamp(0.46rem,2.3vw,0.78rem)] font-light uppercase leading-relaxed tracking-[0.07em] text-white/80 sm:mt-3 sm:tracking-[0.2em]">
              By: {MFM_EVENT.presenters}
            </p>
          </div>

          {/* Glass details card — pinned to the bottom on mobile, bottom-right
              on desktop, clear of the presenters in the artwork. */}
          <aside className="mfm-card mfm-glass font-sans mx-auto mt-auto w-full max-w-md shrink-0 rounded-2xl p-6 sm:p-7 lg:absolute lg:right-16 lg:mt-0 lg:max-w-[23rem]">
            <ul className="flex flex-col gap-5">
              <li className="flex items-start gap-3">
                <CalendarDays size={16} className="mt-1 shrink-0 text-white/65" aria-hidden="true" />
                <div>
                  <p className="text-[0.95rem] leading-snug text-white">{MFM_EVENT.date}</p>
                  <p className="mt-0.5 text-sm text-white/65">{MFM_EVENT.time}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-1 shrink-0 text-white/65" aria-hidden="true" />
                <div>
                  <p className="text-[0.95rem] leading-snug text-white">{MFM_EVENT.venue}</p>
                  <p className="mt-0.5 text-sm text-white/65">{MFM_EVENT.address}</p>
                </div>
              </li>
            </ul>

            <a
              href={MFM_TICKETS_URL}
              className="mt-7 flex h-12 items-center justify-center rounded-full border border-white/45 text-[0.7rem] uppercase tracking-[0.2em] text-white hover:bg-white hover:text-[#3d3028] active:scale-[0.99] transition-all duration-200"
            >
              {MFM_EVENT.ticketCta}
            </a>
          </aside>

        </div>

        <MadeForMoreBand />
      </section>
    </main>
  )
}

/**
 * Dark brown rule across the foot of the hero. It doubles as the event's
 * one-line pitch and as cover for the artwork's bottom edge, where the three
 * cut-out figures don't line up cleanly. Phones scroll the sentence as a
 * marquee (same mechanic as the site's announcement bar) because it needs five
 * or six lines to wrap at that width; `sm` and up just centre it.
 */
function MadeForMoreBand() {
  return (
    <div className="mfm-band">
      <p className="mfm-band-static font-sans">{MFM_EVENT.intro}</p>

      <div className="mfm-band-marquee font-sans">
        {/* Screen readers get the sentence once; the marquee copies are decoration. */}
        <p className="sr-only">{MFM_EVENT.intro}</p>

        <div className="mfm-band-track" aria-hidden="true">
          {/* Two identical halves — the track scrolls -50% for a seamless loop. */}
          {Array.from({ length: 2 }).map((_, half) => (
            <span key={half}>{MFM_EVENT.intro}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
