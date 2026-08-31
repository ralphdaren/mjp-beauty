import { Fragment } from 'react'
import { CalendarDays, Check, MapPin } from 'lucide-react'
import MadeForMoreNavbar from '@/components/MadeForMoreNavbar'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import {
  MFM_CTA,
  MFM_EVENT,
  MFM_HERO_HOSTS,
  MFM_HERO_PORTRAITS,
  MFM_HERO_PORTRAITS_RATIO,
  MFM_INTRO,
  MFM_INVITATION,
  MFM_PILLARS,
  MFM_QUALIFIER,
  ticketsHref,
} from '@/data/madeForMore'

export default function MadeForMorePage() {
  useScrollAnimation()

  return (
    <main>
      <MadeForMoreNavbar />

      <section className="mfm-hero">
        <div className="mfm-hero-grid">
          <div className="mfm-hero-copy">
            <p className="hero-eyebrow font-sans mfm-hero-eyebrow">{MFM_EVENT.eyebrow}</p>

            <span className="hero-eyebrow mfm-hero-rule" aria-hidden="true" />

            <h1 className="hero-heading font-sans mfm-hero-title">
              made for <em>more.</em>
            </h1>

            <span className="hero-tagline mfm-hero-rule" aria-hidden="true" />

            <p className="hero-tagline font-sans mfm-hero-sub">{MFM_EVENT.tagline}</p>
          </div>

          <div className="mfm-hero-media">
            <div className="mfm-hero-figure" style={{ aspectRatio: MFM_HERO_PORTRAITS_RATIO }}>
              <img
                className="mfm-hero-portraits"
                src={MFM_HERO_PORTRAITS.src}
                srcSet={MFM_HERO_PORTRAITS.srcSet}
                sizes={MFM_HERO_PORTRAITS.sizes}
                alt="Micah of MJP Beauty, Mia of Standout Beauty, and Nicole of Miss NC"
                fetchPriority="high"
                decoding="async"
              />

              {MFM_HERO_HOSTS.map((host) => (
                <p key={host.key} className={`font-sans mfm-host-tag mfm-host-tag--${host.key}`}>
                  <span className="mfm-host-name">{host.name}</span>
                  <span className="mfm-host-brand">{host.brand}</span>
                </p>
              ))}
            </div>
          </div>
        </div>

        <MadeForMoreBand />
      </section>

      <MadeForMoreIntro />

      <MadeForMoreInvitation />

      <MadeForMorePillars />

      <MadeForMoreQualifier />

      <MadeForMoreClosing />
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

function MadeForMoreClosing() {
  return (
    <section className="mfm-closing">
      <div className="mfm-closing-inner anim-fade-up">
        <h2 className="about-subheading mfm-closing-heading">
          {MFM_CTA.headingLead} {MFM_CTA.headingTail}{' '}
          <em className="mfm-closing-accent">{MFM_CTA.headingAccent}</em>.
        </h2>

        <div className="mfm-closing-lines">
          {MFM_CTA.lines.map((line) => (
            <p key={line} className="about-subheading mfm-closing-line">
              {line}
            </p>
          ))}
        </div>

        <hr className="mfm-closing-rule" />

        <p className="font-sans mfm-eyebrow mfm-closing-eyebrow">{MFM_CTA.eyebrow}</p>

        <p className="about-subheading mfm-closing-where">
          {MFM_EVENT.date} · {MFM_CTA.where}
        </p>

        <p className="font-sans mfm-closing-details">
          {MFM_EVENT.time} · {MFM_EVENT.addressFull}
        </p>

        <a href={ticketsHref()} className="font-sans mfm-closing-btn">
          {MFM_CTA.cta}
        </a>

        <p className="about-subheading mfm-closing-note">{MFM_CTA.note}</p>
      </div>
    </section>
  )
}

function MadeForMoreBand() {
  return (
    <div className="mfm-band">
      <div className="mfm-band-cell">
        <CalendarDays className="mfm-band-icon" aria-hidden="true" />
        <p className="font-sans mfm-band-text">
          <span className="mfm-band-line">{MFM_EVENT.date}</span>
          <span className="mfm-band-line mfm-band-line-sub">{MFM_EVENT.time}</span>
        </p>
      </div>

      <div className="mfm-band-cell">
        <MapPin className="mfm-band-icon" aria-hidden="true" />
        <p className="font-sans mfm-band-text">
          <span className="mfm-band-line">{MFM_EVENT.city}</span>
          <span className="mfm-band-line mfm-band-line-sub">{MFM_EVENT.country}</span>
        </p>
      </div>

      <div className="mfm-band-cell mfm-band-cell-wide">
        <p className="font-sans mfm-band-text">
          <span className="mfm-band-line">{MFM_EVENT.earlyBird}</span>
          <span className="mfm-band-line mfm-band-line-sub">{MFM_EVENT.earlyBirdNote}</span>
        </p>
      </div>
    </div>
  )
}
