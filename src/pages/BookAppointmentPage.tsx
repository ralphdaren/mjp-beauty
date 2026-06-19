import { useState, useRef, Fragment, useEffect } from 'react'
import { Play, Clock, ChevronDown, ChevronLeft, ChevronRight, X, FileText, HelpCircle, Heart, Check, CheckCircle2 } from 'lucide-react'
import type { ReactNode } from 'react'

import { useScrollAnimation } from '../hooks/useScrollAnimation'
import browLamImg1 from '@/assets/booking/brow-lam/brow-lm-img-01.jpg'
import browLamImg2 from '@/assets/booking/brow-lam/brow-lm-img-02.jpg'
const browLamVid = 'https://res.cloudinary.com/dr9nm40gf/video/upload/q_auto/f_auto/v1781343234/brow-lm-vid-01_isylz1.mp4'
import browStImg1 from '@/assets/booking/brow-st/brow-st-img-01.jpg'
import browStImg2 from '@/assets/booking/brow-st/brow-st-img-02.jpg'
import browWtImg1 from '@/assets/booking/brow-wt/brow-wt-img-01.jpg'
import browWtImg2 from '@/assets/booking/brow-wt/brow-wt-img-02.jpg'
const browWtVid = 'https://res.cloudinary.com/dr9nm40gf/video/upload/q_auto/f_auto/v1781343535/brow-wt-vid-01_jladew.mp4'
import keratinImg1 from '@/assets/booking/keratin-lt/keratin-lt-img-01.jpg'
import keratinImg2 from '@/assets/booking/keratin-lt/keratin-lt-img-02.jpg'

// ─── Types ───────────────────────────────────────────────────────────────────

interface PriceTier {
  label: string
  price: string
  duration?: string
  squareVariationName?: string
}

interface Slot {
  time: string
  startAt: string
  teamMemberId: string | null
}

interface Service {
  id: string
  name: string
  tagline: string
  description: string
  duration: string
  tiers: PriceTier[]
  images: string[]
  video: string | null
}

// ─── Services data ────────────────────────────────────────────────────────────

const SERVICES: Service[] = [
  {
    id: 'brow-lam',
    name: 'Brow Lamination',
    tagline: 'Lift • Define • Fluff',
    description:
      'The process of lifting the brow hairs to add fullness, symmetry, and definition. Softens the structure of the hairs allowing endless styling options from fluffy soap brows to clean and sleek. Lasts up to 6–8 weeks.',
    duration: '20 – 75 min',
    tiers: [
      { label: 'Signature Lamination Package (with Tint)', price: '$123.81', duration: '1 hr 15 min' },
      { label: 'Naked Brow Lamination (No Tint)', price: '$109.52', duration: '1 hr' },
      { label: 'Brow Lamination Only (No Shaping, No Tint)', price: '$80.95', duration: '45 min' },
      { label: 'Brow Lamination Maintenance (with Tint)', price: '$61.90', duration: '30 min' },
      { label: 'Brow Lamination Maintenance (No Tint)', price: '$47.62', duration: '20 min' },
    ],
    images: [browLamImg1, browLamImg2],
    video: browLamVid,
  },
  {
    id: 'brow-st',
    name: 'Brow Shape & Tint',
    tagline: 'Sculpted • Tinted • Polished',
    description:
      'A complete brow enhancement package — brow shaping, waxing, and tinting all in one. Brow tint lasts up to 1 week on the skin and 4+ weeks on the hairs for a defined, polished finish.',
    duration: '40 min+',
    tiers: [
      { label: 'Returning Client', price: '$61.90', duration: '30 min' },
      { label: 'New Client', price: '$66.67', duration: '30 min' },
    ],
    images: [browStImg1, browStImg2],
    video: null,
  },
  {
    id: 'brow-wt',
    name: 'Brow Shape & Wax',
    tagline: 'Clean • Shaped • Fresh',
    description:
      'Give your brows life again with a quick and easy brow shaping and waxing package. Includes the option of filling in the brows with a brow pencil and highlighting the brow bone to further accentuate your new brows.',
    duration: '20 min+',
    tiers: [
      { label: 'Returning Client', price: '$47.62', duration: '20 min', squareVariationName: 'Brow Shape & Wax (Returning Client)' },
      { label: 'New Client', price: '$52.38', duration: '30 min', squareVariationName: 'Brow Shape & Wax (New Client)' },
    ],
    images: [browWtImg1, browWtImg2],
    video: browWtVid,
  },
  {
    id: 'keratin-lt',
    name: 'Keratin Lash Lift',
    tagline: 'Lifted • Curled • Luminous',
    description:
      'Enhances and lifts your natural lashes making them appear longer, fuller, and freshly curled. Paired with a vitamin mask for deep nourishment. Lasts 6-8 weeks — the most low-maintenance service you can get.',
    duration: '45 min+',
    tiers: [
      { label: 'With Tint', price: '$104.76', duration: '1 hr' },
      { label: 'No Tint', price: '$95.24', duration: '45 min' },
    ],
    images: [keratinImg1, keratinImg2],
    video: null,
  },
]

// ─── FAQ data ─────────────────────────────────────────────────────────────────

const FAQ_DATA = [
  {
    category: 'Brow Lamination',
    items: [
      {
        q: 'How does brow lamination work?',
        a: "Brow lamination is essentially a perm for your eyebrow hairs. It relaxes the hairs so they become more manageable and easily manipulated, lifting them to create the illusion of thicker, fuller and more defined brows. You can style them feathery and fluffy (soap brow look) or clean and sleek.",
      },
      {
        q: 'How long does brow lamination last?',
        a: 'The lifted effect lasts up to 6-8 weeks before it begins to relax back to its natural state. As you get brow lamination done more regularly, the effect can extend to 9-10 weeks.',
      },
      {
        q: 'Do I have to get the tint with it? How long does the tint last?',
        a: 'The tint is optional. It primarily stains the natural brow hairs and lasts a few days up to a week. It adds extra definition and shape to the brows for the meantime.',
      },
      {
        q: 'Who is brow lamination best suited for?',
        a: 'Those who have uneven brows, cowlicks, straight, and/or unruly brows; wish to have fuller looking brows; want to easily achieve that fluffy, feathery look; or lack shape and definition.',
      },
      {
        q: 'Who is it not suited for?',
        a: "Clients with Alopecia on their brows, large troublesome patches without hair growth, those who don't wish to add more fullness, or those with dry or damaged hairs. Not sure? Consult with Micah — she can assess your brows to see if you're the right fit.",
      },
      {
        q: 'Will my brows stay styled the way Micah sets them at the end of the appointment?',
        a: "No — daily styling is still required using a brow gel/soap and a brow oil to keep them nourished. However, styling is very minimal and easy. Micah also takes time at the end of the appointment to show you how to style your newly laminated brows.",
      },
      {
        q: 'How often can I get brow lamination done?',
        a: 'You must wait at least 8-12 weeks, or until your brows have returned to their natural state, to allow full recovery and avoid over-processing.',
      },
      {
        q: 'Can I get brow henna and brow lamination done in one appointment?',
        a: "No, you must wait at least 48 hours after brow lamination to get your brows henna'd to avoid any reactions. A new combined service is currently in development — stay tuned!",
      },
    ],
  },
  {
    category: 'Lash Lifts',
    items: [
      {
        q: 'How long do lash lifts last?',
        a: 'Results can last anywhere from 6-8 weeks depending on your natural lash growth cycle and how well aftercare is followed.',
      },
      {
        q: 'How often can I get a lash lift done?',
        a: 'You must wait a minimum of 8 weeks after your initial procedure before getting a new session.',
      },
      {
        q: 'How do I know if I should get the tint with my lash lift?',
        a: 'Totally up to personal preference. The tint adds extra definition for the first few days to a week and is especially a good choice for those with lighter or coloured lashes.',
      },
      {
        q: 'How do lash lifts differ from lash extensions?',
        a: 'A lash lift (1 hr) lifts your natural lashes for a more natural enhanced look. Lash extensions (1.5-3 hrs) apply synthetic lashes for a fuller look. Lash lifts are also much lower maintenance.',
      },
      {
        q: 'Does the lash lift procedure hurt?',
        a: 'Not at all. It is pain-free and non-invasive as long as your artist is properly trained and certified. Your eyes will be closed for approximately 30-45 minutes — use that time to relax and unwind.',
      },
      {
        q: 'Can a lash lift damage my natural lashes?',
        a: 'No, as long as the service is performed properly by a certified artist and you do not get them done too frequently. Wait at least 6 weeks between sessions.',
      },
      {
        q: 'Can I wear mascara and eye makeup after a lash lift?',
        a: 'After the 24-hour period of keeping your lashes dry, you can absolutely use mascara and any other eye makeup.',
      },
    ],
  },
]

// ─── Aftercare data ───────────────────────────────────────────────────────────

const AFTERCARE_DATA = [
  {
    category: 'Brow Lamination',
    items: [
      'Do not wet the brows for the first 24 hrs — avoid swimming, saunas, facial treatments, and sweating from workouts.',
      'Use the complimentary aftercare balm daily from the second night post-treatment. Push it upwards through the brows before bed, leave overnight, and rinse off in the morning.',
      'Brush your brow hairs up daily to keep the lifted effect strong — even before you go to bed.',
      'Do not apply makeup or undertake further facial/skin treatments for at least 24 hours after your service.',
      'Avoid prolonged exposure to direct sunlight or heat.',
      'Do not apply Retin-A, AHA, or exfoliate around the brow area for at least 72 hours before and after treatment.',
      'Avoid sleeping on your face or side during the first 24 hours to prevent awkward kinks in the brow hairs.',
      'No self-tanning products on/around the face one week prior and 48 hours after the lamination treatment.',
      'Tip: Use a brow gel to brush them upwards throughout the day to keep them in place.',
    ],
  },
  {
    category: 'Lash Lifts',
    items: [
      'Do not get your lashes wet for at least 24 hours — avoid hot showers, saunas, and sweating from workouts.',
      'Be mindful of how often you wash your lashes. Always pat them dry with a clean towel.',
      'Avoid sleeping on your face or side (especially the first 24 hours) to prevent awkward kinks.',
      'Brush your lashes upwards every day.',
      'Avoid rubbing your lashes.',
      'Use a professional lash serum to keep them nourished and healthy (e.g., Revive 7). Do not use castor oil on your lashes after a lash lift.',
    ],
  },
]

// ─── Helper ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
  })
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FlipTier({ tier }: { tier: PriceTier }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div
      style={{ perspective: '800px' }}
      className="cursor-pointer select-none"
      onClick={() => setFlipped((f) => !f)}
    >
      <div
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateX(180deg)' : 'rotateX(0deg)',
          transition: 'transform 0.4s ease',
          position: 'relative',
        }}
      >
        <div
          style={{ backfaceVisibility: 'hidden' }}
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#f6f2ec] hover:bg-[#ede8e0] transition-colors text-sm text-[#6b5f58] leading-snug"
        >
          <span className="flex-1 min-w-0">{tier.label}</span>
          <ChevronRight size={12} className="shrink-0 text-[#c0b4ac]" />
        </div>
        <div
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateX(180deg)',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          className="flex items-center justify-between gap-3 px-3 rounded-lg bg-[#f6f2ec] border border-[#a0948a]"
        >
          {tier.duration && (
            <div className="flex items-center gap-1.5 text-[#a0948a] text-xs">
              <Clock size={11} />
              <span>{tier.duration}</span>
            </div>
          )}
          <span className="font-semibold text-sm text-[#3d3530] ml-auto">{tier.price}</span>
        </div>
      </div>
    </div>
  )
}

function ServiceRow({
  service,
  index,
  onVideoOpen,
  onBook,
}: {
  service: Service
  index: number
  onVideoOpen: (src: string) => void
  onBook: () => void
}) {
  const [imgIdx, setImgIdx] = useState(0)
  const prev = () => setImgIdx((i) => (i - 1 + service.images.length) % service.images.length)
  const next = () => setImgIdx((i) => (i + 1) % service.images.length)

  return (
    <div
      className="anim-fade-up flex flex-col md:flex-row md:items-center gap-6 md:gap-0 py-10 md:py-14"
      style={{ transitionDelay: `${index * 120}ms` }}
    >

      {/* Image carousel */}
      <div className="relative shrink-0 w-full aspect-[4/3] md:w-52 lg:w-60 md:aspect-[3/4] overflow-hidden rounded-xl bg-[#ede8e0] group/img">
        <div className="absolute inset-0">
          <div
            className="flex h-full transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${imgIdx * 100}%)` }}
          >
            {service.images.map((img, i) => (
              <div key={i} className="w-full h-full shrink-0">
                <img src={img} alt={`${service.name} ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/70 backdrop-blur-sm rounded-full flex items-center justify-center text-[#827064] opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-white"
          aria-label="Previous photo"
        >
          <ChevronLeft size={13} />
        </button>
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/70 backdrop-blur-sm rounded-full flex items-center justify-center text-[#827064] opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-white"
          aria-label="Next photo"
        >
          <ChevronRight size={13} />
        </button>

        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
          {service.images.map((_, i) => (
            <button
              key={i}
              onClick={() => setImgIdx(i)}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === imgIdx ? 'bg-white w-4' : 'bg-white/55 w-1.5'
              }`}
              aria-label={`Photo ${i + 1}`}
            />
          ))}
        </div>

        {service.video && (
          <button
            onClick={() => onVideoOpen(service.video!)}
            className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm text-[#827064] text-xs font-medium px-3 py-1.5 rounded-full hover:bg-white transition-colors shadow-sm whitespace-nowrap"
          >
            <Play size={10} fill="currentColor" />
            Watch
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 md:px-10 lg:px-14">
        <div className="flex items-center gap-3 mb-3 md:hidden">
          <span className="text-[#cdc1b9] text-2xl select-none">
            {String(index + 1).padStart(2, '0')}
          </span>
          <h3 className="text-xl font-semibold text-[#3d3530]">{service.name}</h3>
        </div>

        <p className="text-[10px] tracking-[0.25em] uppercase text-[#a0948a] mb-2">
          {service.tagline}
        </p>
        <h3 className="hidden md:block text-2xl font-semibold text-[#3d3530] mb-3 leading-snug">
          {service.name}
        </h3>
        <p className="text-sm text-[#6b5f58] leading-relaxed mb-5">
          {service.description}
        </p>

        <div className="space-y-2 max-w-md">
          {service.tiers.map((tier) => (
            <FlipTier key={tier.label} tier={tier} />
          ))}
        </div>

        <button
          onClick={onBook}
          className="md:hidden mt-6 block w-full py-3 bg-[#3d3530] text-white text-xs tracking-[0.15em] uppercase text-center rounded-full hover:bg-[#2a2320] active:scale-[0.98] transition-all"
        >
          Book Now
        </button>
      </div>

      {/* Desktop right column */}
      <div className="hidden md:flex md:self-stretch shrink-0 w-36 lg:w-44 flex-col items-center justify-between px-5">
        <span className="text-[#d0c4bc] text-4xl select-none">
          {String(index + 1).padStart(2, '0')}
        </span>
        <button
          onClick={onBook}
          className="block w-full py-3 bg-[#3d3530] text-white text-xs tracking-[0.15em] uppercase text-center rounded-full hover:bg-[#2a2320] active:scale-[0.98] transition-all"
        >
          Book Now
        </button>
      </div>
    </div>
  )
}

function VideoModal({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div className="relative max-w-xs w-full animate-in zoom-in-95 fade-in duration-200" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors"
          aria-label="Close video"
        >
          <X size={22} />
        </button>
        <video
          src={src}
          controls
          autoPlay
          playsInline
          className="w-full rounded-2xl shadow-2xl"
        />
      </div>
    </div>
  )
}

function Accordion({ q, a }: { q: string; a: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-[#e3e2de] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left flex items-start justify-between gap-4 py-4"
      >
        <span className="text-sm font-medium text-[#3d3530] leading-snug">{q}</span>
        <ChevronDown
          size={16}
          className={`mt-0.5 shrink-0 text-[#827064] transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-200 ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="text-sm text-[#6b5f58] leading-relaxed pb-4">{a}</div>
        </div>
      </div>
    </div>
  )
}

function BookingPoliciesContent() {
  return (
    <div className="max-w-2xl mx-auto">
      <p className="text-sm text-[#6b5f58] leading-relaxed mb-6">
        Please read the following policies and pre-appointment guidelines prior to making your
        appointment.
      </p>
      <Accordion
        q="How do I secure my appointment slot?"
        a={
          <div className="space-y-2">
            <p>If you book <strong className="text-[#3d3530] font-semibold">online</strong>, a credit card on file is required. It will only be charged 50% of the booked service if you fail to comply with the cancellation/late/no-show policies below.</p>
            <p>If you book <strong className="text-[#3d3530] font-semibold">directly through Micah</strong>, a 50% non-refundable deposit is required to secure your spot. Failure to meet the cancellation policy will result in forfeiture of that deposit.</p>
          </div>
        }
      />
      <Accordion
        q="What is the refund policy?"
        a={
          <div className="space-y-2">
            <p>Refunds are not offered — clients pay for Micah's time and products, which cannot be "returned."</p>
            <p>However, customer satisfaction is a priority. If you are unhappy with a service, please let Micah know so you can address your concerns and work out a solution together.</p>
          </div>
        }
      />
      <Accordion
        q="What is the cancellation policy?"
        a={<p>A <strong className="text-[#3d3530] font-semibold">48-hour (2-day) notice</strong> is required to reschedule or cancel. Failure to do so will result in a cancellation fee charged to your card on file.</p>}
      />
      <Accordion
        q="What happens if I'm late?"
        a={<p>A <strong className="text-[#3d3530] font-semibold">10-minute grace period</strong> is given to those running late. If you are more than 10 minutes late without communication, your appointment will be cancelled and a cancellation fee will be charged. If a last-minute emergency occurs, please communicate with Micah so you can work something out.</p>}
      />
      <Accordion
        q="What is the no-show policy?"
        a={<p><strong className="text-[#3d3530] font-semibold">No-shows are not tolerated at MJP Beauty.</strong> This will result in an automatic cancellation fee charged to your credit card on file.</p>}
      />
      <Accordion
        q="New client — what should I expect?"
        a={
          <ol className="list-decimal list-inside space-y-2">
            <li>Once your appointment request is accepted, you'll receive a confirmation email with all appointment details.</li>
            <li>Three days before your appointment, a confirmation text will be sent to confirm your presence.</li>
            <li>Review the pre-appointment guidelines to properly prepare for your visit.</li>
          </ol>
        }
      />
      <Accordion
        q="What payment methods are accepted?"
        a={
          <div className="space-y-2">
            <ul className="list-disc list-inside space-y-1">
              <li>Cash</li>
              <li>Debit or Credit</li>
              <li>Apple Pay / Google Pay</li>
              <li>E-Transfer (must be received prior to leaving the studio)</li>
            </ul>
            <p className="mt-2">Payments must be paid in full upon completion of the service.</p>
          </div>
        }
      />
      <Accordion
        q="Pre-appointment guidelines — Brow services"
        a={
          <ul className="list-disc list-inside space-y-2">
            <li>Arrive with <strong className="text-[#3d3530] font-semibold">clean brows</strong> — no makeup or products on/around the brows. Moisturizer is okay and recommended.</li>
            <li>For Brow Lamination, <strong className="text-[#3d3530] font-semibold">avoid trimming your brows at least 3 weeks prior</strong> — we want to work with as much hair as possible.</li>
            <li>Inform Micah if you are using Retinoids, acne medications, Vitamin A products, or any skin-thinning treatments. Stop usage at least <strong className="text-[#3d3530] font-semibold">2–3 weeks prior</strong> to your appointment.</li>
          </ul>
        }
      />
      <Accordion
        q="Pre-appointment guidelines — Lash Lift services"
        a={
          <ul className="list-disc list-inside space-y-2">
            <li>Do not arrive with any makeup, especially eye makeup (mascara, concealer, foundation, eyeliner, eyeshadow).</li>
            <li>Arrive with <strong className="text-[#3d3530] font-semibold">uncurled, freshly cleaned lashes</strong>.</li>
          </ul>
        }
      />
      <div className="mt-4 bg-[#f6f2ec] border border-[#e3e2de] rounded-xl p-4 text-sm text-[#6b5f58]">
        <strong className="text-[#827064]">Additional info:</strong> Please read the confirmation
        email after booking — it contains all details about the studio address and parking
        instructions.
      </div>
    </div>
  )
}

function FaqContent() {
  return (
    <div className="max-w-2xl mx-auto space-y-10">
      {FAQ_DATA.map((group) => (
        <div key={group.category}>
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#827064] mb-1 pb-2 border-b border-[#e3e2de]">
            {group.category}
          </h3>
          <div>
            {group.items.map((item) => (
              <Accordion key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function AftercareContent() {
  return (
    <div className="max-w-2xl mx-auto">
      {AFTERCARE_DATA.map((group) => (
        <Accordion
          key={group.category}
          q={group.category}
          a={
            <ul className="space-y-3">
              {group.items.map((item, i) => (
                <li key={i} className="flex gap-3 leading-relaxed">
                  <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-[#827064] shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          }
        />
      ))}
    </div>
  )
}

// ─── Info tabs ────────────────────────────────────────────────────────────────

const INFO_TABS = [
  { id: 'policies',  label: 'Booking Policies', Icon: FileText },
  { id: 'faq',       label: 'FAQ',              Icon: HelpCircle },
  { id: 'aftercare', label: 'Aftercare',        Icon: Heart },
] as const

type InfoTabId = (typeof INFO_TABS)[number]['id']

function InfoTabs() {
  const [active, setActive] = useState<InfoTabId>('policies')

  return (
    <section className="bg-[#f6f2ec] border-t border-[#e3e2de] py-16">
      <div className="max-w-4xl mx-auto px-6">

        <div className="anim-fade-up text-center mb-10">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#a0948a] mb-2">Good to Know</p>
          <h2 className="text-2xl font-semibold text-[#3d3530]">Policies & Aftercare</h2>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex gap-0 border-b border-[#d9d4cf] w-full max-w-lg">
            {INFO_TABS.map(({ id, label, Icon }) => {
              const isActive = active === id
              return (
                <button
                  key={id}
                  onClick={() => setActive(id)}
                  className={`group relative flex-1 flex flex-col items-center gap-1.5 py-3 px-2 transition-colors duration-200 ${
                    isActive ? 'text-[#6e5f55]' : 'text-[#a0948a] hover:text-[#6e5f55]'
                  }`}
                >
                  <Icon size={15} className="transition-colors duration-200" />
                  <span className="text-[11px] tracking-[0.1em] uppercase font-semibold whitespace-nowrap transition-colors duration-200">
                    {label}
                  </span>
                  <span
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-[#827064] rounded-full transition-all duration-300 ${
                      isActive ? 'w-3/4 opacity-100' : 'w-0 opacity-0'
                    }`}
                  />
                </button>
              )
            })}
          </div>
        </div>

        <div className="bg-white border border-[#e3e2de] rounded-2xl px-8 py-10 shadow-sm">
          <div key={active} className="tab-fade-in">
            {active === 'policies'  && <BookingPoliciesContent />}
            {active === 'faq'       && <FaqContent />}
            {active === 'aftercare' && <AftercareContent />}
          </div>
        </div>

      </div>
    </section>
  )
}

// ─── Mini calendar ────────────────────────────────────────────────────────────

function MiniCalendar({
  selected,
  availableDates,
  datesLoading,
  onSelect,
  onMonthChange,
}: {
  selected: string | null
  availableDates: Set<string>
  datesLoading: boolean
  onSelect: (date: string) => void
  onMonthChange: (year: number, month: number) => void
}) {
  const todayDate = new Date()
  todayDate.setHours(0, 0, 0, 0)

  const [viewYear, setViewYear] = useState(todayDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(todayDate.getMonth())

  const firstDay = new Date(viewYear, viewMonth, 1)
  const lastDate = new Date(viewYear, viewMonth + 1, 0).getDate()
  const startDow = firstDay.getDay()

  const monthLabel = firstDay.toLocaleString('en-US', { month: 'long', year: 'numeric' })

  function toKey(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
  const todayKey = toKey(todayDate)

  function prevMonth() {
    const newYear = viewMonth === 0 ? viewYear - 1 : viewYear
    const newMonth = viewMonth === 0 ? 11 : viewMonth - 1
    setViewYear(newYear)
    setViewMonth(newMonth)
    onMonthChange(newYear, newMonth)
  }
  function nextMonth() {
    const newYear = viewMonth === 11 ? viewYear + 1 : viewYear
    const newMonth = viewMonth === 11 ? 0 : viewMonth + 1
    setViewYear(newYear)
    setViewMonth(newMonth)
    onMonthChange(newYear, newMonth)
  }

  const cells: Array<{ date: Date; key: string } | null> = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= lastDate; d++) {
    const date = new Date(viewYear, viewMonth, d)
    cells.push({ date, key: toKey(date) })
  }

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="p-1 rounded-md hover:bg-[#f0ece6] text-[#827064] transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-xs font-semibold text-[#3d3530]">{monthLabel}</span>
        <button
          onClick={nextMonth}
          className="p-1 rounded-md hover:bg-[#f0ece6] text-[#827064] transition-colors"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center text-[10px] text-[#a0948a] font-medium py-0.5">{d}</div>
        ))}
      </div>

      <div className={`grid grid-cols-7 gap-y-0.5 transition-opacity duration-200 ${datesLoading ? 'opacity-40' : 'opacity-100'}`}>
        {cells.map((cell, i) => {
          if (!cell) return <div key={`e-${i}`} />
          const { date, key } = cell
          const isPast = date < todayDate
          const isAvailable = !isPast && availableDates.has(key)
          const isSelected = selected === key
          const isToday = key === todayKey

          return (
            <button
              key={key}
              disabled={!isAvailable}
              onClick={() => onSelect(key)}
              className={[
                'mx-auto flex items-center justify-center w-7 h-7 rounded-full text-xs transition-all duration-150',
                isSelected
                  ? 'bg-[#3d3530] text-white font-semibold'
                  : isAvailable
                  ? 'text-[#3d3530] hover:bg-[#ede8e0] cursor-pointer'
                  : 'text-[#d0c4bc] cursor-not-allowed',
                isToday && !isSelected ? 'ring-1 ring-[#827064]' : '',
              ].join(' ')}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Booking drawer ───────────────────────────────────────────────────────────

const DRAWER_STEPS = ['Service', 'Date & Options', 'Your Details', 'Confirm'] as const

type DrawerStep = 1 | 2 | 3 | 4

interface BookingDrawerProps {
  open: boolean
  onClose: () => void
  step: DrawerStep
  selectedService: Service | null
  selectedTier: PriceTier | null
  selectedDate: string | null
  selectedTime: string | null
  slots: Slot[] | null
  slotsLoading: boolean
  slotsError: string | null
  availableDates: Set<string>
  datesLoading: boolean
  confirmLoading: boolean
  bookingSuccess: boolean
  // Customer form
  firstName: string
  lastName: string
  email: string
  phone: string
  cardConsent: boolean
  policyConsent: boolean
  locationId: string | null
  // Handlers
  onSelectService: (s: Service) => void
  onSelectTier: (t: PriceTier) => void
  onSelectDate: (d: string) => void
  onSelectSlot: (slot: Slot) => void
  onMonthChange: (year: number, month: number) => void
  onBack: () => void
  onContinue: () => void
  onConfirm: () => void
  onStep3Continue: (sourceId: string) => void
  onFirstNameChange: (v: string) => void
  onLastNameChange: (v: string) => void
  onEmailChange: (v: string) => void
  onPhoneChange: (v: string) => void
  onCardConsentChange: (v: boolean) => void
  onPolicyConsentChange: (v: boolean) => void
}

function BookingDrawer({
  open,
  onClose,
  step,
  selectedService,
  selectedTier,
  selectedDate,
  selectedTime,
  slots,
  slotsLoading,
  slotsError,
  availableDates,
  datesLoading,
  confirmLoading,
  bookingSuccess,
  firstName,
  lastName,
  email,
  phone,
  cardConsent,
  policyConsent,
  locationId,
  onSelectService,
  onSelectTier,
  onSelectDate,
  onSelectSlot,
  onMonthChange,
  onBack,
  onContinue,
  onConfirm,
  onStep3Continue,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPhoneChange,
  onCardConsentChange,
  onPolicyConsentChange,
}: BookingDrawerProps) {
  const cardRef = useRef<any>(null)
  const [step3Loading, setStep3Loading] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Initialize / destroy Square card form when step 3 is shown
  useEffect(() => {
    if (step !== 3 || !open || !locationId) {
      if (cardRef.current) {
        cardRef.current.destroy().catch(() => {})
        cardRef.current = null
      }
      return
    }

    const sq = (window as any).Square
    if (!sq) {
      setCardError('Payment system failed to load. Please refresh the page.')
      return
    }

    let cancelled = false
    setCardError(null)

    async function init() {
      try {
        const payments = sq.payments(import.meta.env.VITE_SQUARE_APP_ID, locationId)
        if (cancelled) return
        const card = await payments.card({
          style: {
            '.input-container': { borderColor: '#e3e2de', borderRadius: '8px' },
            '.input-container.is-focus': { borderColor: '#827064' },
            '.input-container.is-error': { borderColor: '#ef4444' },
            input: { color: '#3d3530', fontSize: '14px' },
            'input::placeholder': { color: '#c0b4ac' },
          },
        })
        if (cancelled) { card.destroy(); return }
        await card.attach('#card-container')
        cardRef.current = card
      } catch {
        if (!cancelled) setCardError('Failed to load card form. Please try again.')
      }
    }

    init()

    return () => {
      cancelled = true
      if (cardRef.current) {
        cardRef.current.destroy().catch(() => {})
        cardRef.current = null
      }
    }
  }, [step, open, locationId])

  async function handleCardContinue() {
    if (!cardRef.current) return
    setStep3Loading(true)
    setCardError(null)
    try {
      const result = await cardRef.current.tokenize()
      if (result.status === 'OK') {
        onStep3Continue(result.token as string)
      } else {
        setCardError(result.errors?.[0]?.message ?? 'Card verification failed. Please check your details.')
      }
    } catch (err) {
      setCardError(String(err))
    } finally {
      setStep3Loading(false)
    }
  }

  const canContinueStep2 = !!selectedTier && !!selectedDate && !!selectedTime

  const canContinueStep3 = (
    firstName.trim() !== '' &&
    lastName.trim() !== '' &&
    email.trim().includes('@') &&
    phone.trim() !== '' &&
    cardConsent &&
    policyConsent
  )

  const inputCls = 'w-full px-3 py-2.5 rounded-lg border border-[#e3e2de] text-sm text-[#3d3530] placeholder:text-[#c0b4ac] focus:outline-none focus:border-[#827064] bg-white transition-colors'
  const labelCls = 'block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#a0948a] mb-1.5'

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`fixed left-0 top-0 z-50 h-full w-full max-w-[420px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {bookingSuccess ? (
          /* ── Success screen ── */
          <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 text-center overflow-y-auto">
            <div className="w-16 h-16 bg-[#f0f7f2] rounded-full flex items-center justify-center mb-5">
              <CheckCircle2 size={32} className="text-[#4a9d6f]" />
            </div>
            <h2 className="text-xl font-semibold text-[#3d3530] mb-2">You're all booked!</h2>
            <p className="text-sm text-[#6b5f58] leading-relaxed mb-8">
              Your appointment request has been received. Check your email and phone — you'll receive a confirmation with all your appointment details shortly.
            </p>

            <div className="bg-[#f6f2ec] rounded-2xl p-5 w-full text-left space-y-4 mb-8">
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a] mb-0.5">Service</p>
                <p className="text-sm font-medium text-[#3d3530]">{selectedService?.name}</p>
              </div>
              <div className="border-t border-[#e3e2de]" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a] mb-0.5">Option</p>
                <p className="text-sm text-[#3d3530] leading-snug">{selectedTier?.label}</p>
              </div>
              <div className="border-t border-[#e3e2de]" />
              <div className="flex gap-8">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a] mb-0.5">Date</p>
                  <p className="text-sm text-[#3d3530]">{selectedDate ? formatDate(selectedDate) : ''}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a] mb-0.5">Time</p>
                  <p className="text-sm text-[#3d3530]">{selectedTime}</p>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 bg-[#3d3530] text-white text-xs tracking-[0.15em] uppercase rounded-full hover:bg-[#2a2320] active:scale-[0.98] transition-all"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#e3e2de] shrink-0">
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#a0948a]">MJP Beauty</p>
                <h2 className="text-lg font-semibold text-[#3d3530]">Book an Appointment</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-[#f0ece6] text-[#827064] transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Step indicator */}
            <div className="px-6 pt-5 pb-4 shrink-0">
              <div className="flex items-start">
                {DRAWER_STEPS.map((label, idx) => {
                  const stepNum = (idx + 1) as DrawerStep
                  const isComplete = step > stepNum
                  const isCurrent = step === stepNum
                  return (
                    <Fragment key={label}>
                      <div className="flex flex-col items-center gap-1.5">
                        <div className={`relative w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ease-in-out ${
                          isComplete
                            ? 'bg-[#3d3530] text-white scale-100'
                            : isCurrent
                            ? 'bg-[#827064] text-white scale-110 ring-[3px] ring-[#827064]/25'
                            : 'bg-[#e3e2de] text-[#a0948a] scale-100'
                        }`}>
                          <span className={`absolute transition-all duration-300 ease-in-out ${
                            isComplete ? 'opacity-0 scale-50' : 'opacity-100 scale-100'
                          }`}>
                            {stepNum}
                          </span>
                          <span className={`absolute transition-all duration-300 ease-in-out ${
                            isComplete ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                          }`}>
                            <Check size={11} />
                          </span>
                        </div>
                        <span className={`text-[10px] text-center leading-tight whitespace-nowrap transition-all duration-300 ${
                          isCurrent ? 'text-[#3d3530] font-medium' : 'text-[#a0948a]'
                        }`}>
                          {label}
                        </span>
                      </div>
                      {idx < DRAWER_STEPS.length - 1 && (
                        <div className="flex-1 mt-3.5 mx-1 h-px bg-[#e3e2de] relative overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-[#3d3530] transition-all duration-500 ease-out"
                            style={{ width: step > stepNum ? '100%' : '0%' }}
                          />
                        </div>
                      )}
                    </Fragment>
                  )
                })}
              </div>
            </div>

            {/* Scrollable step content */}
            <div className="flex-1 overflow-y-auto px-6 pb-8">

              {/* ── Step 1: Service selection ── */}
              {step === 1 && (
                <div>
                  <p className="text-sm text-[#6b5f58] mb-5">Which service are you booking today?</p>
                  <div className="space-y-3">
                    {SERVICES.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => onSelectService(service)}
                        className="w-full text-left flex items-center justify-between gap-4 p-4 rounded-xl border border-[#e3e2de] hover:border-[#a0948a] hover:bg-[#fdf9f6] transition-all group"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-[#3d3530] mb-0.5">{service.name}</p>
                          <p className="text-xs text-[#a0948a]">{service.tagline}</p>
                        </div>
                        <ChevronRight size={15} className="shrink-0 text-[#c0b4ac] group-hover:text-[#827064] transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Step 2: Options + calendar ── */}
              {step === 2 && selectedService && (
                <div>
                  <button
                    onClick={onBack}
                    className="flex items-center gap-1 text-xs text-[#827064] hover:text-[#3d3530] transition-colors mb-5"
                  >
                    <ChevronLeft size={13} />
                    Back
                  </button>

                  <div className="mb-5">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-[#a0948a] mb-0.5">{selectedService.tagline}</p>
                    <h3 className="text-base font-semibold text-[#3d3530]">{selectedService.name}</h3>
                  </div>

                  {/* Tier options */}
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a0948a] mb-3">Choose an option</p>
                  <div className="space-y-2 mb-6">
                    {selectedService.tiers.map((tier) => {
                      const isSelected = selectedTier?.label === tier.label
                      return (
                        <button
                          key={tier.label}
                          onClick={() => onSelectTier(tier)}
                          className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                            isSelected
                              ? 'border-[#3d3530] bg-[#f6f2ec]'
                              : 'border-[#e3e2de] hover:border-[#c0b4ac] hover:bg-[#fdf9f6]'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? 'border-[#3d3530]' : 'border-[#c0b4ac]'
                          }`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-[#3d3530]" />}
                          </div>
                          <span className="flex-1 text-sm text-[#3d3530] leading-snug">{tier.label}</span>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-semibold text-[#3d3530]">{tier.price}</p>
                            {tier.duration && (
                              <p className="flex items-center gap-0.5 text-[10px] text-[#a0948a] justify-end">
                                <Clock size={9} />
                                {tier.duration}
                              </p>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  <div className="border-t border-[#e3e2de] mb-6" />

                  {/* Calendar */}
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a0948a] mb-4">Pick a date</p>
                  <MiniCalendar
                    selected={selectedDate}
                    availableDates={availableDates}
                    datesLoading={datesLoading}
                    onSelect={onSelectDate}
                    onMonthChange={onMonthChange}
                  />

                  {/* Time slots */}
                  {selectedDate && selectedTier && (
                    <div className="mt-6">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a0948a] mb-3">
                        Available times — {formatDate(selectedDate)}
                      </p>
                      {slotsLoading ? (
                        <p className="text-sm text-[#a0948a] text-center py-4">Checking availability…</p>
                      ) : slotsError ? (
                        <p className="text-sm text-red-400 text-center py-4">Could not load times. Please try again.</p>
                      ) : !slots || slots.length === 0 ? (
                        <p className="text-sm text-[#a0948a] text-center py-4">No availability on this date.</p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {slots.map((slot) => {
                            const isSelected = selectedTime === slot.time
                            return (
                              <button
                                key={slot.startAt}
                                onClick={() => onSelectSlot(slot)}
                                className={`py-2.5 rounded-lg text-xs font-medium border transition-all ${
                                  isSelected
                                    ? 'bg-[#3d3530] text-white border-[#3d3530]'
                                    : 'text-[#3d3530] border-[#e3e2de] hover:border-[#827064] hover:bg-[#fdf9f6]'
                                }`}
                              >
                                {slot.time}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    disabled={!canContinueStep2}
                    onClick={onContinue}
                    className="mt-8 w-full py-3.5 bg-[#3d3530] text-white text-xs tracking-[0.15em] uppercase rounded-full disabled:opacity-35 disabled:cursor-not-allowed hover:enabled:bg-[#2a2320] active:enabled:scale-[0.98] transition-all"
                  >
                    Continue
                  </button>
                </div>
              )}

              {/* ── Step 3: Customer details + card on file ── */}
              {step === 3 && (
                <div>
                  <button
                    onClick={onBack}
                    className="flex items-center gap-1 text-xs text-[#827064] hover:text-[#3d3530] transition-colors mb-5"
                  >
                    <ChevronLeft size={13} />
                    Back
                  </button>

                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a0948a] mb-4">Contact Information</p>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className={labelCls}>First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={e => onFirstNameChange(e.target.value)}
                        placeholder="Jane"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={e => onLastNameChange(e.target.value)}
                        placeholder="Doe"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className={labelCls}>Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => onEmailChange(e.target.value)}
                      placeholder="jane@example.com"
                      className={inputCls}
                    />
                  </div>

                  <div className="mb-6">
                    <label className={labelCls}>Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => onPhoneChange(e.target.value)}
                      placeholder="+1 (204) 555-0000"
                      className={inputCls}
                    />
                    <p className="text-[10px] text-[#a0948a] mt-2 leading-relaxed">
                      By providing your phone number you acknowledge you will receive occasional informational messages, including automated messages, on your mobile device from this merchant. Text STOP to opt out at any time, and text HELP to get help. Message and data rates may apply.
                    </p>
                  </div>

                  <div className="border-t border-[#e3e2de] mb-5" />

                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a0948a] mb-3">Card on File</p>

                  {locationId ? (
                    <div id="card-container" className="mb-3" />
                  ) : (
                    <div className="h-14 bg-[#f6f2ec] rounded-lg animate-pulse mb-3" />
                  )}

                  {cardError && (
                    <p className="text-xs text-red-500 mb-3">{cardError}</p>
                  )}

                  <p className="text-[11px] text-[#a0948a] leading-relaxed mb-5">
                    A credit or debit card is required to book and may be charged in the case of a late cancellation. Protected and encrypted by Square.
                  </p>

                  <div className="space-y-3 mb-7">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={cardConsent}
                        onChange={e => onCardConsentChange(e.target.checked)}
                        className="mt-0.5 shrink-0 accent-[#3d3530]"
                      />
                      <span className="text-xs text-[#6b5f58] leading-snug group-hover:text-[#3d3530] transition-colors">
                        I authorize MJP Beauty to save this card on file for future purchases.
                      </span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={policyConsent}
                        onChange={e => onPolicyConsentChange(e.target.checked)}
                        className="mt-0.5 shrink-0 accent-[#3d3530]"
                      />
                      <span className="text-xs text-[#6b5f58] leading-snug group-hover:text-[#3d3530] transition-colors">
                        I have read and agreed to the cancellation policy of MJP Beauty.
                      </span>
                    </label>
                  </div>

                  <button
                    disabled={!canContinueStep3 || step3Loading}
                    onClick={handleCardContinue}
                    className="w-full py-3.5 bg-[#3d3530] text-white text-xs tracking-[0.15em] uppercase rounded-full disabled:opacity-35 disabled:cursor-not-allowed hover:enabled:bg-[#2a2320] active:enabled:scale-[0.98] transition-all"
                  >
                    {step3Loading ? 'Verifying card…' : 'Continue'}
                  </button>
                </div>
              )}

              {/* ── Step 4: Confirm ── */}
              {step === 4 && selectedService && selectedTier && selectedDate && selectedTime && (
                <div>
                  <button
                    onClick={onBack}
                    className="flex items-center gap-1 text-xs text-[#827064] hover:text-[#3d3530] transition-colors mb-5"
                  >
                    <ChevronLeft size={13} />
                    Back
                  </button>

                  <p className="text-sm font-medium text-[#3d3530] mb-5">Review your appointment</p>

                  <div className="bg-[#f6f2ec] rounded-2xl p-5 space-y-4 mb-5">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a] mb-0.5">Service</p>
                      <p className="text-sm font-medium text-[#3d3530]">{selectedService.name}</p>
                    </div>
                    <div className="border-t border-[#e3e2de]" />
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a] mb-0.5">Option</p>
                      <p className="text-sm text-[#3d3530] leading-snug">{selectedTier.label}</p>
                    </div>
                    <div className="border-t border-[#e3e2de]" />
                    <div className="flex gap-8">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a] mb-0.5">Date</p>
                        <p className="text-sm text-[#3d3530]">{formatDate(selectedDate)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a] mb-0.5">Time</p>
                        <p className="text-sm text-[#3d3530]">{selectedTime}</p>
                      </div>
                    </div>
                    <div className="border-t border-[#e3e2de]" />
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a]">Price</p>
                      <p className="text-base font-semibold text-[#3d3530]">{selectedTier.price}</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#a0948a] leading-relaxed mb-6">
                    Payment is collected at your appointment. Your card on file may be charged in the event of a late cancellation or no-show.
                  </p>

                  <button
                    onClick={onConfirm}
                    disabled={confirmLoading}
                    className="w-full py-3.5 bg-[#3d3530] text-white text-xs tracking-[0.15em] uppercase rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-[#2a2320] active:enabled:scale-[0.98] transition-all"
                  >
                    {confirmLoading ? 'Booking…' : 'Book Appointment'}
                  </button>
                </div>
              )}

            </div>
          </>
        )}
      </div>
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BookAppointmentPage() {
  useScrollAnimation()
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [step, setStep] = useState<DrawerStep>(1)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedTier, setSelectedTier] = useState<PriceTier | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedStartAt, setSelectedStartAt] = useState<string | null>(null)
  const [selectedTeamMemberId, setSelectedTeamMemberId] = useState<string | null>(null)
  const [slots, setSlots] = useState<Slot[] | null>(null)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsError, setSlotsError] = useState<string | null>(null)
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set())
  const [datesLoading, setDatesLoading] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  // Square SDK location ID (fetched once on mount)
  const [locationId, setLocationId] = useState<string | null>(null)
  // Customer form
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [cardConsent, setCardConsent] = useState(false)
  const [policyConsent, setPolicyConsent] = useState(false)
  const [cardSourceId, setCardSourceId] = useState<string | null>(null)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  // Fetch Square location ID for the Web Payments SDK
  useEffect(() => {
    fetch('/api/locations/id')
      .then(r => r.json())
      .then(d => setLocationId(d.locationId ?? null))
      .catch(() => {})
  }, [])

  function fetchAvailableDates(tier: PriceTier, year: number, month: number) {
    const label = encodeURIComponent(tier.squareVariationName ?? tier.label)
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
    setDatesLoading(true)
    fetch(`/api/bookings/available-dates?tierLabel=${label}&month=${monthStr}`)
      .then(r => r.json())
      .then(data => setAvailableDates(new Set<string>(data.dates ?? [])))
      .catch(() => setAvailableDates(new Set()))
      .finally(() => setDatesLoading(false))
  }

  useEffect(() => {
    if (!selectedTier) { setAvailableDates(new Set()); return }
    const now = new Date()
    fetchAvailableDates(selectedTier, now.getFullYear(), now.getMonth())
  }, [selectedTier?.label])

  useEffect(() => {
    if (!selectedTier || !selectedDate) { setSlots(null); return }
    setSlotsLoading(true)
    setSlotsError(null)
    const label = encodeURIComponent(selectedTier.squareVariationName ?? selectedTier.label)
    fetch(`/api/bookings/availability?tierLabel=${label}&date=${selectedDate}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setSlotsError(data.error)
        else setSlots(data.slots ?? [])
      })
      .catch(err => setSlotsError(String(err)))
      .finally(() => setSlotsLoading(false))
  }, [selectedTier?.label, selectedDate])

  function handleStep3Continue(sourceId: string) {
    setCardSourceId(sourceId)
    setStep(4)
  }

  async function handleConfirm() {
    if (!selectedService || !selectedTier || !selectedStartAt || !cardSourceId) return
    setConfirmLoading(true)
    try {
      // 1. Create or find Square customer
      const customerRes = await fetch('/api/customers/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, phone }),
      })
      const customerData = await customerRes.json()
      if (!customerRes.ok) throw new Error(customerData.error ?? 'Failed to create customer')
      const customerId: string = customerData.customerId

      // 2. Save card on file
      const cardRes = await fetch('/api/customers/save-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, sourceId: cardSourceId }),
      })
      const cardData = await cardRes.json()
      if (!cardRes.ok) throw new Error(cardData.error ?? 'Failed to save card')

      // 3. Create booking with customer attached (triggers Square's SMS/email notifications)
      const squareTierLabel = selectedTier.squareVariationName ?? selectedTier.label
      const bookingRes = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tierLabel: squareTierLabel,
          startAt: selectedStartAt,
          teamMemberId: selectedTeamMemberId,
          customerId,
        }),
      })
      const bookingData = await bookingRes.json()
      if (!bookingRes.ok) throw new Error(bookingData.error ?? 'Booking failed')

      setBookingSuccess(true)
    } catch (err) {
      alert(String(err))
    } finally {
      setConfirmLoading(false)
    }
  }

  function openDrawer() {
    setStep(1)
    setSelectedService(null)
    setSelectedTier(null)
    setSelectedDate(null)
    setSelectedTime(null)
    setSelectedStartAt(null)
    setSelectedTeamMemberId(null)
    setSlots(null)
    setSlotsError(null)
    setFirstName('')
    setLastName('')
    setEmail('')
    setPhone('')
    setCardConsent(false)
    setPolicyConsent(false)
    setCardSourceId(null)
    setBookingSuccess(false)
    setDrawerOpen(true)
  }

  function closeDrawer() {
    setDrawerOpen(false)
  }

  return (
    <>
      {/* Page hero */}
      <div className="bg-[#f6f2ec] border-b border-[#e3e2de] py-14 text-center px-6">
        <p className="hero-eyebrow text-[10px] tracking-[0.35em] uppercase text-[#a0948a] mb-3">MJP Beauty</p>
        <h1 className="hero-heading text-3xl font-semibold text-[#3d3530] mb-3">Our Services</h1>
        <p className="hero-tagline text-sm text-[#6b5f58] max-w-md mx-auto leading-relaxed">
          Choose your treatment below and book your appointment. All services are performed by
          Micah — a certified brow and lash artist.
        </p>
      </div>

      {/* Services list */}
      <main className="bg-[#fefefe] py-4 px-6 md:px-10 lg:px-16">
        <div className="max-w-5xl mx-auto divide-y divide-[#e3e2de]">
          {SERVICES.map((service, index) => (
            <ServiceRow
              key={service.id}
              service={service}
              index={index}
              onVideoOpen={setVideoSrc}
              onBook={openDrawer}
            />
          ))}
        </div>
      </main>

      {/* Info tabs */}
      <InfoTabs />

      {/* Video modal */}
      {videoSrc && <VideoModal src={videoSrc} onClose={() => setVideoSrc(null)} />}

      {/* Booking drawer */}
      <BookingDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        step={step}
        selectedService={selectedService}
        selectedTier={selectedTier}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        slots={slots}
        slotsLoading={slotsLoading}
        slotsError={slotsError}
        availableDates={availableDates}
        datesLoading={datesLoading}
        confirmLoading={confirmLoading}
        bookingSuccess={bookingSuccess}
        firstName={firstName}
        lastName={lastName}
        email={email}
        phone={phone}
        cardConsent={cardConsent}
        policyConsent={policyConsent}
        locationId={locationId}
        onSelectService={(s) => {
          setSelectedService(s)
          setSelectedTier(null)
          setSelectedDate(null)
          setSelectedTime(null)
          setSelectedStartAt(null)
          setSelectedTeamMemberId(null)
          setSlots(null)
          setStep(2)
        }}
        onSelectTier={(t) => {
          setSelectedTier(t)
          setSelectedTime(null)
          setSelectedStartAt(null)
          setSelectedTeamMemberId(null)
        }}
        onSelectDate={(d) => {
          setSelectedDate(d)
          setSelectedTime(null)
          setSelectedStartAt(null)
          setSelectedTeamMemberId(null)
        }}
        onSelectSlot={(slot) => {
          setSelectedTime(slot.time)
          setSelectedStartAt(slot.startAt)
          setSelectedTeamMemberId(slot.teamMemberId)
        }}
        onMonthChange={(year, month) => {
          if (selectedTier) fetchAvailableDates(selectedTier, year, month)
        }}
        onBack={() => {
          setStep((s) => {
            const prev = Math.max(1, s - 1) as DrawerStep
            if (s === 4) setCardSourceId(null)
            return prev
          })
        }}
        onContinue={() => setStep((s) => Math.min(4, s + 1) as DrawerStep)}
        onConfirm={handleConfirm}
        onStep3Continue={handleStep3Continue}
        onFirstNameChange={setFirstName}
        onLastNameChange={setLastName}
        onEmailChange={setEmail}
        onPhoneChange={setPhone}
        onCardConsentChange={setCardConsent}
        onPolicyConsentChange={setPolicyConsent}
      />
    </>
  )
}
