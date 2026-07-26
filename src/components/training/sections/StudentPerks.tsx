import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import PerkFlipCard from '../PerkFlipCard'
import StudentKitCard from '../StudentKitCard'
import { FLIP_PERKS, PERK_02_IMG } from '@/data/training'
import type { PerkKey } from '@/types/training'

/** No.6 — the featured mentorship tile. */
function MentorshipCard({
  className,
  headingClassName,
  bodyClassName = '',
}: {
  className: string
  headingClassName: string
  bodyClassName?: string
}) {
  return (
    <div className={`rounded-2xl p-7 flex flex-col justify-between ${className}`} style={{ backgroundColor: '#2a1a0e' }}>
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold leading-none select-none text-white/20">06</span>
        <span className="text-[0.6rem] uppercase tracking-[0.26em] text-white/25">Featured</span>
      </div>
      <div>
        <h3 className={`about-heading font-semibold text-white leading-tight ${headingClassName}`}>
          Post-training mentorship.
        </h3>
        <p className={`text-white/50 text-sm leading-relaxed ${bodyClassName}`}>
          Your learning doesn't end when training day is over. Enjoy 3 months of unlimited
          chat support, and the opportunity to submit models for in-depth feedback — so you
          continue growing with expert guidance every step of the way.
        </p>
      </div>
    </div>
  )
}

/** No.3 — links through to the online course curriculum. */
function TheoryAccessCard({ className }: { className: string }) {
  return (
    <Link
      to="/online-brow-courses#curriculum"
      className={`rounded-2xl p-5 flex flex-col justify-between hover:opacity-80 transition-opacity duration-200 ${className}`}
      style={{ backgroundColor: '#ede5dc' }}
    >
      <span className="text-xs font-semibold leading-none select-none text-[#c4b0a4]">03</span>
      <div className="flex flex-col gap-2">
        <h3 className="text-[#3d3028] text-[0.95rem] font-semibold leading-snug">
          1 Year Online Theory Access
        </h3>
        <p className="text-[0.68rem] tracking-[0.14em] uppercase text-[#a0948a] flex items-center gap-1">
          View curriculum <ArrowRight size={10} />
        </p>
      </div>
    </Link>
  )
}

/** No.4 */
function LunchCard({ className }: { className: string }) {
  return (
    <div className={`rounded-2xl p-5 flex flex-col justify-between bg-white border border-[#e3e2de] shadow-[0_2px_16px_rgba(130,112,100,0.10)] ${className}`}>
      <span className="text-xs font-semibold leading-none select-none text-[#d4ccc4]">04</span>
      <h3 className="text-[#3d3028] text-[0.95rem] font-semibold leading-snug">
        Lunch &amp; snacks by Micah
      </h3>
    </div>
  )
}

function GroupPhoto({ className }: { className: string }) {
  return (
    <div className={`rounded-2xl overflow-hidden relative ${className}`}>
      <img
        src={PERK_02_IMG}
        alt="MJP Beauty in-person students"
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
        decoding="async"
      />
    </div>
  )
}

export default function StudentPerks() {
  const [kitOpen, setKitOpen] = useState(false)
  const [openPerk, setOpenPerk] = useState<PerkKey | null>(null)

  /** Only one perk may be flipped at a time. */
  const flipProps = (key: PerkKey) => ({
    ...FLIP_PERKS[key],
    open: openPerk === key,
    onOpen: () => setOpenPerk(key),
    onClose: () => setOpenPerk(null),
  })

  return (
    <section className="bg-white py-20 px-6 md:px-8">

      {/* Section header */}
      <div className="anim-fade-up mx-auto max-w-[1200px] mb-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#a0948a] mb-4">
              Student Perks
            </p>
            <h2 className="about-heading text-3xl sm:text-4xl md:text-[2.8rem] font-semibold text-[#3d3028] leading-tight">
              Reserved only for<br className="hidden sm:block" /> our in-person students.
            </h2>
          </div>
          <p className="text-sm text-[#a0948a] italic sm:text-right sm:max-w-[190px] leading-relaxed sm:pb-1">
            Eight exclusive benefits with every in-person seat.
          </p>
        </div>
      </div>

      {/* ── Desktop bento grid ─────────────────────── */}
      <div
        className="anim-fade-up mx-auto max-w-[1200px] hidden md:grid grid-cols-12 gap-3"
        style={{ gridTemplateRows: '220px 220px 240px 240px' }}
      >
        <MentorshipCard
          className="col-start-1 col-span-6 row-start-1 row-span-2"
          headingClassName="text-[2.2rem] lg:text-[2.6rem] mb-4"
          bodyClassName="max-w-md"
        />

        <StudentKitCard
          className="col-start-7 col-span-3 row-start-1 row-span-2"
          open={kitOpen}
          onOpen={() => setKitOpen(true)}
          onClose={() => setKitOpen(false)}
        />

        <PerkFlipCard
          {...flipProps('cert')}
          className="col-start-10 col-span-3 row-start-1"
          frontBg="#ede5dc"
          numberColor="text-[#c4b0a4]"
        />

        <TheoryAccessCard className="col-start-10 col-span-3 row-start-2" />

        <LunchCard className="col-start-1 col-span-3 row-start-3" />

        <PerkFlipCard
          {...flipProps('discounts')}
          className="col-start-4 col-span-4 row-start-3"
          frontBg="#e8ddd3"
          numberColor="text-[#c4b0a4]"
          titleClassName="text-base"
        />

        <PerkFlipCard
          {...flipProps('ebook')}
          className="col-start-8 col-span-5 row-start-3"
          frontBg="#ede5dc"
          numberColor="text-[#c4b0a4]"
          titleClassName="text-base"
        />

        <PerkFlipCard
          {...flipProps('masterclass')}
          className="col-start-1 col-span-5 row-start-4"
          frontClassName="border border-[#e3e2de] shadow-[0_2px_16px_rgba(130,112,100,0.10)]"
          frontBg="#ffffff"
          numberColor="text-[#d4ccc4]"
          titleClassName="text-base"
        />

        <GroupPhoto className="col-start-6 col-span-7 row-start-4" />
      </div>

      {/* ── Mobile / tablet stacked grid ───────────── */}
      <div className="mx-auto max-w-[1200px] grid md:hidden grid-cols-2 gap-3">
        <MentorshipCard
          className="col-span-2 min-h-[280px]"
          headingClassName="text-2xl sm:text-3xl mb-3"
        />

        <StudentKitCard
          className="col-span-2 sm:col-span-1"
          height="360px"
          teaserClassName="text-sm"
          open={kitOpen}
          onOpen={() => setKitOpen(true)}
          onClose={() => setKitOpen(false)}
        />

        <PerkFlipCard
          {...flipProps('cert')}
          height="190px"
          frontBg="#ede5dc"
          numberColor="text-[#c4b0a4]"
        />

        <TheoryAccessCard className="min-h-[150px]" />

        <LunchCard className="min-h-[150px]" />

        <PerkFlipCard
          {...flipProps('discounts')}
          height="190px"
          frontBg="#e8ddd3"
          numberColor="text-[#c4b0a4]"
        />

        <PerkFlipCard
          {...flipProps('ebook')}
          className="col-span-2 sm:col-span-1"
          height="190px"
          frontBg="#ede5dc"
          numberColor="text-[#c4b0a4]"
        />

        <PerkFlipCard
          {...flipProps('masterclass')}
          className="col-span-2 sm:col-span-1"
          height="190px"
          frontBg="#ffffff"
          frontClassName="border border-[#e3e2de] shadow-[0_2px_16px_rgba(130,112,100,0.10)]"
          numberColor="text-[#d4ccc4]"
        />

        <GroupPhoto className="col-span-2 h-[220px]" />
      </div>

    </section>
  )
}
