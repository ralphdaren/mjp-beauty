import { useState } from 'react'
import { ChevronLeft, ChevronRight, Play, Clock, ChevronDown, X, FileText, HelpCircle, Heart } from 'lucide-react'
import type { ReactNode } from 'react'

import browLamImg1 from '@/assets/booking/brow-lam/brow-lm-img-01.jpg'
import browLamImg2 from '@/assets/booking/brow-lam/brow-lm-img-02.jpg'
import browLamVid from '@/assets/booking/brow-lam/brow-lm-vid-01.mp4'
import browStImg1 from '@/assets/booking/brow-st/brow-st-img-01.jpg'
import browStImg2 from '@/assets/booking/brow-st/brow-st-img-02.jpg'
import browWtImg1 from '@/assets/booking/brow-wt/brow-wt-img-01.jpg'
import browWtImg2 from '@/assets/booking/brow-wt/brow-wt-img-02.jpg'
import browWtVid from '@/assets/booking/brow-wt/brow-wt-vid-01.mp4'
import keratinImg1 from '@/assets/booking/keratin-lt/keratin-lt-img-01.jpg'
import keratinImg2 from '@/assets/booking/keratin-lt/keratin-lt-img-02.jpg'

const BOOKING_URL_BASE =
  'https://book.squareup.com/appointments/c1bakh50mrxokq/location/LZ9HGYQ7385ST/services'

// ─── Types ───────────────────────────────────────────────────────────────────

interface PriceTier {
  label: string
  price: string
  note?: string
}

interface Service {
  id: string
  name: string
  tagline: string
  description: string
  duration: string
  tiers: PriceTier[]
  bookingUrl: string
  images: string[]
  video: string | null
}

// ─── Services data ────────────────────────────────────────────────────────────

const SERVICES: Service[] = [
  {
    id: 'brow-lam',
    name: 'Brow Lamination',
    tagline: 'Lift · Define · Fluff',
    description:
      'The process of lifting the brow hairs to add fullness, symmetry, and definition. Softens the structure of the hairs allowing endless styling options — from fluffy soap brows to clean and sleek. Lasts up to 6–8 weeks.',
    duration: '45 min+',
    tiers: [
      { label: 'Lamination Only', price: '$85' },
      { label: 'Naked Brow Lamination (No Tint)', price: '$115', note: '$100 in Jan' },
      { label: 'Full Package', price: '$130', note: '$115 in Jan' },
      { label: 'Maintenance Appointment', price: '$65' },
    ],
    bookingUrl: `${BOOKING_URL_BASE}/YC5WXRVSX5IZ3UW7DYKPZZEE`,
    images: [browLamImg1, browLamImg2],
    video: browLamVid,
  },
  {
    id: 'brow-st',
    name: 'Brow Shape & Tint',
    tagline: 'Sculpted · Tinted · Polished',
    description:
      'A complete brow enhancement package — brow shaping, waxing, and tinting all in one. Brow tint lasts up to 1 week on the skin and 4+ weeks on the hairs for a defined, polished finish.',
    duration: '40 min+',
    tiers: [{ label: 'Shape & Tint Package', price: '$65' }],
    bookingUrl: BOOKING_URL_BASE,
    images: [browStImg1, browStImg2],
    video: null,
  },
  {
    id: 'brow-wt',
    name: 'Brow Shape & Wax',
    tagline: 'Clean · Shaped · Fresh',
    description:
      'Give your brows life again with a quick and easy brow shaping and waxing package. Includes the option of filling in the brows with a brow pencil and highlighting the brow bone to further accentuate your new brows.',
    duration: '20 min+',
    tiers: [{ label: 'Shape & Wax Package', price: '$50' }],
    bookingUrl: BOOKING_URL_BASE,
    images: [browWtImg1, browWtImg2],
    video: browWtVid,
  },
  {
    id: 'keratin-lt',
    name: 'Keratin Lash Lift',
    tagline: 'Lifted · Curled · Luminous',
    description:
      'Enhances and lifts your natural lashes making them appear longer, fuller, and freshly curled. Paired with a vitamin mask for deep nourishment. Lasts 6-8 weeks — the most low-maintenance service you can get.',
    duration: '45 min+',
    tiers: [
      { label: 'With Tint', price: '$110' },
      { label: 'Without Tint', price: '$100' },
    ],
    bookingUrl: `${BOOKING_URL_BASE}/BVWO65BJPHOOPXK4ZMMVRXC3`,
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function ServiceCard({
  service,
  onVideoOpen,
}: {
  service: Service
  onVideoOpen: (src: string) => void
}) {
  const [imgIdx, setImgIdx] = useState(0)

  const prev = () =>
    setImgIdx((i) => (i - 1 + service.images.length) % service.images.length)
  const next = () =>
    setImgIdx((i) => (i + 1) % service.images.length)

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#e3e2de] shadow-sm group hover:shadow-lg transition-shadow duration-300 flex flex-col">
      {/* Image gallery */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#f6f2ec] shrink-0">
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

        {/* Nav arrows — visible on hover */}
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/70 backdrop-blur-sm rounded-full flex items-center justify-center text-[#827064] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          aria-label="Previous photo"
        >
          <ChevronLeft size={15} />
        </button>
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/70 backdrop-blur-sm rounded-full flex items-center justify-center text-[#827064] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          aria-label="Next photo"
        >
          <ChevronRight size={15} />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
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

        {/* Watch video button */}
        {service.video && (
          <button
            onClick={() => onVideoOpen(service.video!)}
            className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm text-[#827064] text-xs font-medium px-3 py-1.5 rounded-full hover:bg-white transition-colors shadow-sm"
          >
            <Play size={11} fill="currentColor" />
            Watch
          </button>
        )}
      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1">
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#a0948a] mb-1">
          {service.tagline}
        </p>
        <h3 className="text-[1.05rem] font-semibold text-[#3d3530] mb-2">{service.name}</h3>
        <p className="text-sm text-[#6b5f58] leading-relaxed mb-4 flex-1">{service.description}</p>

        <div className="inline-flex items-center gap-1.5 text-xs text-[#827064] bg-[#f6f2ec] px-3 py-1 rounded-full mb-3">
          <Clock size={11} />
          {service.duration}
        </div>

        <div className="space-y-1.5 mb-4">
          {service.tiers.map((tier) => (
            <div key={tier.label} className="flex items-center justify-between text-xs">
              <span className="text-[#6b5f58]">{tier.label}</span>
              <div className="text-right">
                <span className="font-semibold text-[#3d3530]">{tier.price}</span>
                {tier.note && (
                  <span className="ml-1.5 text-[10px] text-[#a0948a]">({tier.note})</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <a
          href={service.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-2.5 bg-[#827064] text-white text-sm tracking-wide rounded-full text-center hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Book Now
        </a>
      </div>
    </div>
  )
}

function VideoModal({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-xs w-full" onClick={(e) => e.stopPropagation()}>
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

        {/* Section heading */}
        <div className="text-center mb-10">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#a0948a] mb-2">Good to Know</p>
          <h2 className="text-2xl font-semibold text-[#3d3530]">Policies & Aftercare</h2>
        </div>

        {/* Tab navigator */}
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
                  <Icon
                    size={15}
                    className="transition-colors duration-200"
                  />
                  <span className="text-[11px] tracking-[0.1em] uppercase font-semibold whitespace-nowrap transition-colors duration-200">
                    {label}
                  </span>

                  {/* Active underline */}
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

        {/* Content panel */}
        <div className="bg-white/70 backdrop-blur-sm border border-[#e3e2de] rounded-2xl px-8 py-10 shadow-sm">
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BookAppointmentPage() {
  const [videoSrc, setVideoSrc] = useState<string | null>(null)

  return (
    <>
      {/* Page hero */}
      <div className="bg-[#f6f2ec] border-b border-[#e3e2de] py-14 text-center px-6">
        <p className="text-[10px] tracking-[0.35em] uppercase text-[#a0948a] mb-3">MJP Beauty</p>
        <h1 className="text-3xl font-semibold text-[#3d3530] mb-3">Our Services</h1>
        <p className="text-sm text-[#6b5f58] max-w-md mx-auto leading-relaxed">
          Choose your treatment below and book your appointment. All services are performed by
          Micah — a certified brow and lash artist.
        </p>
      </div>

      {/* Services grid */}
      <main className="bg-[#fefefe] py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service) => (
            <ServiceCard key={service.id} service={service} onVideoOpen={setVideoSrc} />
          ))}
        </div>
      </main>

      {/* Info tabs */}
      <InfoTabs />

      {/* Video modal */}
      {videoSrc && <VideoModal src={videoSrc} onClose={() => setVideoSrc(null)} />}
    </>
  )
}
