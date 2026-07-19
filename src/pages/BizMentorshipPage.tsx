import { useState } from 'react'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import ComingSoonModal from '@/components/ComingSoonModal'

const bizHeroImg = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_1600/v1784488781/biz-hero_one8ko.jpg'
const aboutMeImg = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_900/v1784488922/biz-about-me_lsza9g.jpg'

// TODO: swap `src` for the client's Cloudinary screenshot URLs once provided.
const resultScreenshots: { src: string | null; alt: string }[] = [
  { src: null, alt: 'Student result screenshot 1' },
  { src: null, alt: 'Student result screenshot 2' },
  { src: null, alt: 'Student result screenshot 3' },
]

const offerings = [
  {
    title: '90-Minute Intensive Strategy Call',
    description:
      "Perfect for the beauty artist who needs clarity, direction, and an actionable game plan — whether you're struggling to attract clients, unsure of your next move, or simply feel stuck.",
    items: [
      '90-minute private Zoom strategy call',
      'Pre-call questionnaire so we maximize our time together',
      'Personalized action plan tailored to your goals',
      'Call recording for future reference',
      'Recommended resources, tools, and next steps',
    ],
    eyebrow: 'Best for artists who want quick, expert guidance',
    cta: 'Book an Intensive Call',
  },
  {
    title: 'VIP Power Session',
    description:
      'A deeper dive for beauty entrepreneurs ready to tackle bigger goals with personalized strategy and support.',
    items: [
      '2 × 2-hour strategy sessions',
      'Personalized action plan',
      'Resources & templates',
      'Access to call recordings',
      '30 days of Voxer chat support',
      'Feedback on content, offers, launches, pricing, systems, and more',
    ],
    eyebrow: null,
    cta: 'Apply for a VIP Session!',
  },
  {
    title: '3-Month Business Mentorship',
    description:
      'For beauty artists who want ongoing guidance, accountability, and someone in their corner every step of the way. This is my highest level of support.',
    items: [
      '3-hour kickoff strategy session',
      '5 bi-weekly 60-minute coaching calls (6 sessions total)',
      'Personalized homework and action steps after every session',
      'Unlimited Voxer chat support for 3 months',
      'Feedback on content, offers, launches, pricing, systems, and more',
    ],
    eyebrow: null,
    cta: 'Apply for Mentorship',
  },
]

const coachingTracks = [
  {
    number: '01',
    title: 'The Fully Booked Artist',
    description:
      'For beauty artists ready to stop relying on slow seasons and inconsistent bookings.',
    items: [
      'Attracting dream clients',
      'Creating demand for your services',
      'Instagram strategy',
      'Content that converts',
      'Pricing with confidence',
      'Client experience',
      'Systems that save time',
      'Standing out in a saturated industry',
    ],
  },
  {
    number: '02',
    title: 'The Educator',
    description:
      "Ready to launch your own in-person training? I'll help you build an educational experience your students will rave about.",
    items: [
      'Course curriculum',
      'Student manuals',
      'Structuring your training day',
      'Pricing',
      'Student kits',
      'Launch strategy',
      'Filling your first training',
      'Creating an unforgettable student experience',
    ],
  },
  {
    number: '03',
    title: 'The Online Educator',
    description: 'Build an education business that reaches beyond your city.',
    items: [
      'Create your online course',
      'Structure your lessons',
      'Record engaging content',
      'Launch confidently',
      'Market your course',
      'Create a strong landing page',
      'Systems that continue selling',
    ],
  },
]

const foundationStats = [
  {
    label: '9 Years',
    description: 'Building and growing beauty businesses.',
  },
  {
    label: '450+',
    description: 'Students taught worldwide through online and in-person brow education.',
  },
  {
    label: 'Twice',
    description:
      'Built a fully booked business — first with lashes, then again after completely restarting with brows.',
  },
  {
    label: 'Coast to Coast',
    description: 'Artists fly across North America to attend my brow trainings.',
  },
  {
    label: 'First in Canada',
    description:
      "Created Canada's first All-In-One Online Brow Course — reaching the USA, Europe, and Asia.",
  },
]

export default function BizMentorshipPage() {
  useScrollAnimation()
  const [comingSoonOpen, setComingSoonOpen] = useState(false)

  return (
    <main>
      {/* ── Hero Section ────────────────────────────────────────────── */}
      <section className="bg-[#f6f2ec]">
        <div className="grid lg:grid-cols-2 lg:min-h-[calc(100vh-5rem)]">

          {/* Left — copy */}
          <div className="order-2 lg:order-1 flex items-center px-6 py-16 sm:px-10 md:px-12 lg:py-24 xl:px-20">
            <div className="anim-fade-left w-full max-w-xl lg:ml-auto">
              <p className="text-[0.72rem] sm:text-[0.8rem] uppercase tracking-[0.28em] text-[#a0948a]">
                For beauty artists ready to grow
              </p>

              <h1 className="about-heading mt-6 text-[2rem] leading-[1.15] sm:text-[2.5rem] md:text-[3rem] lg:text-[3.25rem] font-semibold text-[#3d3028]">
                Helping beauty artists build businesses that go{' '}
                <span className="text-[#827064] italic">beyond the treatment room</span>
              </h1>

              <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#5a5047]">
                Whether your goal is to become fully booked, launch your own training, or build an
                online education business, I'm here to help you get there faster — with proven
                strategies built from real experience, not theory.
              </p>

              <button
                onClick={() => setComingSoonOpen(true)}
                className="mt-9 inline-flex items-center bg-[#827064] px-8 py-4 text-sm font-medium tracking-wide text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] cursor-pointer"
              >
                Apply for BIZ Coaching!
              </button>
            </div>
          </div>

          {/* Right — full-bleed image */}
          <div className="order-1 lg:order-2 relative h-[45vh] min-h-[320px] sm:h-[55vh] lg:h-auto">
            <img
              src={bizHeroImg}
              alt="BIZ Mentorship with Micah"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>

        </div>
      </section>

      {/* ── My Story Section ────────────────────────────────────────── */}
      <section className="bg-white py-20 px-6 md:px-8 lg:py-28">
        <div className="mx-auto max-w-[1200px] grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-20 items-start">

          {/* Left — sticky portrait */}
          <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:flex lg:items-center">
            <div className="anim-fade-left w-full overflow-hidden rounded-2xl shadow-[0_12px_40px_rgba(130,112,100,0.15)]">
              <img
                src={aboutMeImg}
                alt="Micah — MJP Beauty"
                className="w-full h-[420px] sm:h-[520px] lg:h-[600px] object-cover"
              />
            </div>
          </div>

          {/* Right — the story */}
          <div className="anim-fade-right flex flex-col" style={{ transitionDelay: '0.15s' }}>
            <p className="text-[0.72rem] sm:text-[0.8rem] uppercase tracking-[0.28em] text-[#a0948a]">
              My Story
            </p>

            <h2 className="about-heading mt-5 text-[1.75rem] sm:text-[2.25rem] md:text-[2.5rem] leading-[1.2] font-semibold text-[#3d3028]">
              I've Been Exactly Where You Are.
            </h2>

            <div className="mt-8 flex flex-col gap-6 text-base sm:text-lg leading-relaxed text-[#5a5047]">
              <p>Nine years ago, I was simply trying to build a clientele.</p>

              <p>
                I knew I loved the beauty industry, but I had no roadmap. No mentor. No one telling
                me what worked and what didn't. Everything — and I mean, everything — was trial and
                error.
              </p>

              <p>
                Eventually, I built a fully-booked clientele in lash extensions, seeing 30 clients a
                week... only to make one of the biggest decisions of my career.
              </p>

              <blockquote className="my-2 border-l-2 border-[#827064] pl-6 text-[1.35rem] sm:text-[1.6rem] leading-snug italic text-[#3d3028]">
                "I walked away from it all due to carpal tunnel pain."
              </blockquote>

              <p>I started over. From scratch. But this time, with brows.</p>

              <p>
                And guess what? Within one month, I was fully booked again — even in an industry we
                often call "saturated." Not because I had 5k followers. But because I understood
                something far more valuable.
              </p>

              <blockquote className="my-2 border-l-2 border-[#827064] pl-6 text-[1.35rem] sm:text-[1.6rem] leading-snug italic text-[#3d3028]">
                "How to actually create demand."
              </blockquote>

              <p>
                Today, I've spent the last 9 years building not just a beauty business — but an
                education business that continues to grow every year. I've taught over 450+ artists
                worldwide. Students now travel across North America to attend my trainings.
              </p>

              <p>
                I created one of Canada's most comprehensive in-person brow trainings — to the point
                where you can immediately tell when a student is trained by me. Then I spent two
                years creating Canada's first All-In-One Online Brow Course, so artists around the
                world could learn my techniques from anywhere.
              </p>

              <p>
                And now, I want to help other beauty artists build businesses that create freedom,
                flexibility, and long-term growth. Because no one should have to spend years
                figuring everything out alone.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ── Foundation Section ──────────────────────────────────────── */}
      <section className="bg-[#f6f2ec] py-20 px-6 md:px-8 lg:py-28">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="anim-fade-up text-[0.72rem] sm:text-[0.8rem] uppercase tracking-[0.28em] text-[#3d3028]">
            The Foundation Behind My Mentorship
          </h2>

          <div className="anim-fade-up mt-8 h-px w-full bg-[#3d3028]" />

          <dl className="mt-2">
            {foundationStats.map((stat, i) => (
              <div
                key={stat.label}
                className="anim-fade-up grid gap-2 border-b border-[#d9d2c8] py-8 sm:gap-8 sm:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] sm:py-10"
                style={{ transitionDelay: `${0.06 * i}s` }}
              >
                <dt className="about-heading text-[1.75rem] sm:text-[2.25rem] md:text-[2.5rem] leading-none font-semibold text-[#3d3028]">
                  {stat.label}
                </dt>
                <dd className="text-base sm:text-lg leading-relaxed text-[#5a5047] sm:pt-1.5">
                  {stat.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Coaching Format Section ─────────────────────────────────── */}
      <section className="bg-[#f6f2ec] py-20 px-6 md:px-8 lg:py-28">
        <div className="mx-auto max-w-[1200px]">

          {/* Intro */}
          <div className="anim-fade-up max-w-3xl">
            <p className="text-[0.72rem] sm:text-[0.8rem] uppercase tracking-[0.28em] text-[#a0948a]">
              Coaching Format Designed Around Your Goals
            </p>

            <h2 className="about-heading mt-6 text-[2rem] leading-[1.15] sm:text-[2.5rem] md:text-[3rem] font-semibold text-[#3d3028]">
              Every beauty artist is in a different season of business.
            </h2>

            <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#5a5047]">
              Whether you're trying to fill your books, become an educator, or create passive income
              — we'll build a strategy around where you are today. Here are the three proven methods
              and systems that I now get to teach.
            </p>
          </div>

          <div className="anim-fade-up mt-14 h-px w-full bg-[#d9d2c8] lg:mt-20" />

          {/* Three tracks */}
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-0">
            {coachingTracks.map((track, i) => (
              <div
                key={track.number}
                className="anim-fade-up pt-10 lg:px-10 lg:pt-14 lg:first:pl-0 lg:last:pr-0 lg:border-l lg:border-[#d9d2c8] lg:first:border-l-0"
                style={{ transitionDelay: `${0.08 * i}s` }}
              >
                <p className="about-heading text-sm text-[#a0948a]">{track.number}</p>

                <h3 className="about-heading mt-5 text-[1.5rem] sm:text-[1.75rem] leading-tight text-[#3d3028]">
                  {track.title}
                </h3>

                <p className="mt-5 text-base leading-relaxed text-[#5a5047]">
                  {track.description}
                </p>

                <ul className="mt-7 flex flex-col gap-2.5">
                  {track.items.map((item) => (
                    <li key={item} className="flex gap-3 text-base leading-relaxed text-[#3d3028]">
                      <span aria-hidden="true" className="text-[#c4a89a]">—</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Why Work With A Mentor Section ──────────────────────────── */}
      <section className="bg-[#fbf9f6] py-20 px-6 md:px-8 lg:py-28">
        <div className="anim-fade-up mx-auto max-w-3xl text-center">
          <p className="text-[0.72rem] sm:text-[0.8rem] uppercase tracking-[0.28em] text-[#a0948a]">
            Why Work With A Mentor?
          </p>

          <p className="about-heading mt-8 text-[1.5rem] sm:text-[1.875rem] md:text-[2.125rem] leading-snug text-[#3d3028]">
            You can absolutely build your business on your own. I did.
          </p>

          <div className="mt-8 flex flex-col gap-6 text-base sm:text-lg leading-relaxed text-[#5a5047]">
            <p>
              But it took years of second-guessing, trying strategies that didn't work, investing in
              the wrong things, learning everything the hard way.
            </p>

            <p>
              A mentor doesn't magically build your business for you. But they do shorten the path.
              They help you avoid costly mistakes. They see blind spots you can't. They help you
              move forward with clarity instead of constantly wondering if you're making the right
              decision.
            </p>

            <p>
              Sometimes the biggest breakthrough isn't learning something new. It's having someone
              who's already walked the path tell you...
            </p>
          </div>

          <blockquote className="about-heading mt-10 text-[1.5rem] sm:text-[1.875rem] md:text-[2.125rem] leading-snug text-[#827064]">
            "You're closer than you think."
          </blockquote>
        </div>
      </section>

      {/* ── Ways We Can Work Together Section ───────────────────────── */}
      <section className="bg-[#f6f2ec] py-20 px-6 md:px-8 lg:py-28">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="anim-fade-up text-[0.72rem] sm:text-[0.8rem] uppercase tracking-[0.28em] text-[#3d3028]">
            Ways We Can Work Together
          </h2>

          <div className="anim-fade-up mt-8 h-px w-full bg-[#3d3028]" />

          {offerings.map((offering, i) => (
            <div
              key={offering.title}
              className="anim-fade-up grid gap-8 border-b border-[#d9d2c8] py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)] lg:gap-20 lg:py-16"
              style={{ transitionDelay: `${0.06 * i}s` }}
            >
              {/* Left — details */}
              <div>
                <h3 className="about-heading text-[1.75rem] sm:text-[2.25rem] leading-tight text-[#3d3028]">
                  {offering.title}
                </h3>

                <p className="mt-5 text-base sm:text-lg leading-relaxed text-[#5a5047]">
                  {offering.description}
                </p>

                <ul className="mt-7 flex flex-col gap-2.5">
                  {offering.items.map((item) => (
                    <li key={item} className="flex gap-3 text-base leading-relaxed text-[#3d3028]">
                      <span aria-hidden="true" className="text-[#c4a89a]">—</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right — CTA */}
              <div className="lg:pt-3">
                {offering.eyebrow && (
                  <p className="mb-5 text-[0.72rem] uppercase tracking-[0.22em] leading-relaxed text-[#a0948a]">
                    {offering.eyebrow}
                  </p>
                )}

                <button
                  onClick={() => setComingSoonOpen(true)}
                  className="flex w-full items-center justify-center bg-[#3d3028] px-8 py-5 text-sm font-medium uppercase tracking-[0.18em] text-white transition-all duration-200 hover:opacity-90 active:scale-[0.99] cursor-pointer"
                >
                  {offering.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── The Results Section ─────────────────────────────────────── */}
      <section className="bg-[#fbf9f6] py-20 px-6 md:px-8 lg:py-28">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="anim-fade-up text-center text-[0.72rem] sm:text-[0.8rem] uppercase tracking-[0.28em] text-[#3d3028]">
            The Results Speak For Themselves
          </h2>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {resultScreenshots.map((shot, i) => (
              <div
                key={shot.alt}
                className="anim-fade-up aspect-square overflow-hidden"
                style={{ transitionDelay: `${0.08 * i}s` }}
              >
                {shot.src ? (
                  <img
                    src={shot.src}
                    alt={shot.alt}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center border border-dashed border-[#d9d2c8] bg-[#f6f2ec]">
                    <p className="text-[0.7rem] uppercase tracking-[0.22em] text-[#a0948a]">
                      Screenshot {i + 1}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing CTA Section ─────────────────────────────────────── */}
      <section className="bg-[#4E4740] py-24 px-6 md:px-8 lg:py-32">
        <div className="anim-fade-up mx-auto max-w-3xl text-center">
          <h2 className="about-heading text-[2rem] leading-[1.15] sm:text-[2.5rem] md:text-[3rem] font-semibold text-white">
            You Don't Need More Motivation.
            <span className="block text-[#d4b483]">You Need The Right Strategy.</span>
          </h2>

          <p className="mt-7 text-base sm:text-lg leading-relaxed text-white/75">
            You've spent enough time figuring it out alone. If you're tired of second-guessing every
            business decision, constantly wondering what to do next, and feeling like everyone else
            is moving ahead while you're stuck... let's change that.
          </p>

          <button
            onClick={() => setComingSoonOpen(true)}
            className="mt-10 inline-flex items-center justify-center bg-white px-10 py-5 text-sm font-medium uppercase tracking-[0.18em] text-[#3d3028] transition-all duration-200 hover:bg-white/90 active:scale-[0.99] cursor-pointer"
          >
            Apply for Beauty Biz Coaching
          </button>
        </div>

        <div className="mx-auto mt-24 h-px w-full max-w-[1200px] bg-white/15 lg:mt-32" />
      </section>

      {comingSoonOpen && <ComingSoonModal onClose={() => setComingSoonOpen(false)} />}
    </main>
  )
}
