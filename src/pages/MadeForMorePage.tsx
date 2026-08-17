import { Fragment } from 'react'
import { CalendarDays, Check, MapPin } from 'lucide-react'
import MadeForMoreNavbar from '@/components/MadeForMoreNavbar'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import {
  MFM_EVENT,
  MFM_HERO_IMG,
  MFM_HERO_IMG_MOBILE,
  MFM_INTRO,
  MFM_INVITATION,
  MFM_PILLARS,
  MFM_QUALIFIER,
  MFM_TICKETS_URL,
} from '@/data/madeForMore'

export default function MadeForMorePage() {
  useScrollAnimation()

  return (
    <main>
      <MadeForMoreNavbar />

      {/* Full-bleed hero */}
      <section className="mfm-hero">
        <picture>
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

        <div className="mfm-hero-content relative z-10 flex min-h-[100svh] flex-col px-5 pt-24 sm:px-10 sm:pt-28 lg:px-16">

          <div className="mx-auto mb-12 max-w-5xl text-center">
            <p className="hero-eyebrow font-sans whitespace-nowrap text-[clamp(0.44rem,2.6vw,0.72rem)] font-light uppercase leading-relaxed tracking-[0.1em] text-white/80 sm:tracking-[0.32em]">
              {MFM_EVENT.tagline}
            </p>
            <h1 className="mfm-wordmark hero-heading about-subheading mt-2 whitespace-nowrap text-[clamp(2.25rem,8.6vw,6rem)] leading-[1.05] tracking-[-0.01em] text-white sm:mt-3">
              MADE <em className="script-accent">for</em> MORE
            </h1>
            <p className="hero-tagline font-sans mt-2 whitespace-nowrap text-[clamp(0.46rem,2.3vw,0.78rem)] font-light uppercase leading-relaxed tracking-[0.07em] text-white/80 sm:mt-3 sm:tracking-[0.2em]">
              By: {MFM_EVENT.presenters}
            </p>
          </div>

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

      <MadeForMoreIntro />

      <MadeForMoreInvitation />

      <MadeForMorePillars />

      <MadeForMoreQualifier />
    </main>
  )
}

function MadeForMoreIntro() {
  return (
    <section className="mfm-intro">
      <div className="mfm-intro-inner anim-fade-up">
        {MFM_INTRO.openers.map((line) => (
          <p key={line} className="about-subheading mfm-intro-opener">
            {line}
          </p>
        ))}

        <p className="about-subheading mfm-intro-transition">{MFM_INTRO.transition}</p>

        <p className="about-heading mfm-intro-question">{MFM_INTRO.question}</p>

        <p className="font-sans mfm-intro-body">{MFM_INTRO.body}</p>
      </div>

      <div className="mfm-intro-statement anim-fade-up">
        <p className="about-subheading">
          <span className="mfm-intro-statement-lead">{MFM_INTRO.statementLead}</span>{' '}
          {MFM_INTRO.statementRest}
        </p>
      </div>
    </section>
  )
}

function MadeForMoreInvitation() {
  const { hosts } = MFM_INVITATION
  const separatorFor = (i: number) =>
    i === hosts.length - 1 ? '' : i === hosts.length - 2 ? ', and ' : ', '

  return (
    <section className="mfm-invite">
      <div className="mfm-invite-inner anim-fade-up">
        <p className="font-sans mfm-eyebrow">{MFM_INVITATION.eyebrow}</p>

        <h2 className="about-subheading mfm-heading">
          {MFM_INVITATION.headingLead}
          <span className="mfm-heading-accent mfm-heading-accent-block">
            {MFM_INVITATION.headingAccent}
          </span>
        </h2>

        <p className="font-sans mfm-invite-body">{MFM_INVITATION.body}</p>

        <p className="font-sans mfm-invite-body">
          {MFM_INVITATION.hostsLead}{' '}
          {hosts.map((host, i) => (
            <Fragment key={host.name}>
              <strong>{host.name}</strong> of {host.brand}
              {separatorFor(i)}
            </Fragment>
          ))}{' '}
          {MFM_INVITATION.hostsTail}
        </p>
      </div>

      <div className="mfm-invite-closing anim-fade-up">
        {MFM_INVITATION.closingLines.map((line) => (
          <p key={line} className="about-subheading mfm-invite-closing-line">
            {line}
          </p>
        ))}

        <p className="about-subheading mfm-invite-closing-final">{MFM_INVITATION.closingFinal}</p>
      </div>
    </section>
  )
}

function MadeForMorePillars() {
  return (
    <section className="mfm-pillars">
      <div className="mfm-pillars-head anim-fade-up">
        <p className="font-sans mfm-eyebrow">{MFM_PILLARS.eyebrow}</p>

        <h2 className="about-subheading mfm-heading">
          {MFM_PILLARS.headingLead}{' '}
          <span className="mfm-heading-accent">{MFM_PILLARS.headingAccent}</span>
        </h2>
      </div>

      <div className="mfm-pillars-grid">
        {MFM_PILLARS.items.map((item) => (
          <article key={item.name} className="mfm-pillar anim-fade-up">
            <img
              className="mfm-pillar-photo"
              src={item.photo}
              alt={`${item.name} of ${item.brand}`}
              loading="lazy"
              decoding="async"
            />

            <p className="about-subheading mfm-pillar-number">{item.number}</p>
            <p className="font-sans mfm-pillar-topic">{item.topic}</p>
            <h3 className="about-subheading mfm-pillar-name">{item.name}</h3>
            <p className="about-subheading mfm-pillar-brand">{item.brand}</p>

            <p className="font-sans mfm-pillar-body">{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function MadeForMoreQualifier() {
  return (
    <section className="mfm-qualifier">
      <div className="mfm-qualifier-head anim-fade-up">
        <p className="font-sans mfm-eyebrow">{MFM_QUALIFIER.eyebrow}</p>

        <h2 className="about-subheading mfm-heading">{MFM_QUALIFIER.heading}</h2>
      </div>

      <ul className="mfm-qualifier-list anim-fade-up">
        {MFM_QUALIFIER.items.map((item) => (
          <li key={item} className="mfm-qualifier-item">
            <Check size={18} className="mfm-qualifier-check" aria-hidden="true" />
            <p className="font-sans mfm-qualifier-text">{item}</p>
          </li>
        ))}
      </ul>

      <p className="about-subheading mfm-qualifier-closing anim-fade-up">
        <span className="mfm-qualifier-closing-lead">{MFM_QUALIFIER.closingLead}</span>{' '}
        {MFM_QUALIFIER.closingRest}
      </p>
    </section>
  )
}

function MadeForMoreBand() {
  return (
    <div className="mfm-band">
      <p className="mfm-band-static font-sans">{MFM_EVENT.intro}</p>

      <div className="mfm-band-marquee font-sans">
        <p className="sr-only">{MFM_EVENT.intro}</p>

        <div className="mfm-band-track" aria-hidden="true">
          {Array.from({ length: 2 }).map((_, half) => (
            <span key={half}>{MFM_EVENT.intro}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
