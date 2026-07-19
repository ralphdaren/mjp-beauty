import { useEffect, useState, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CircleAlert, HelpCircle, BookOpen, ArrowRight, X } from 'lucide-react'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { useTrainingBookingState } from '@/hooks/useTrainingBookingState'
import BackToTop from '@/components/BackToTop'
import Accordion from '@/components/Accordion'
import TrainingDrawer from '@/components/training/TrainingDrawer'
import TrainingDatesCard from '@/components/training/TrainingDatesCard'
import TrainingDatesModal from '@/components/training/TrainingDatesModal'
import PerkFlipCard from '@/components/training/PerkFlipCard'
import { getTrainingDates } from '@/lib/training'
import type { TrainingOption, TrainingDateGroup } from '@/types/training'
const ipHeadImg = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_1600/v1783028022/ip-head_djhc92.jpg'
const browGuideImg = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_500/v1783028296/freebie-05_xqncqj.png'
const formatImg01 = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_800/v1783028008/format-img-01_oxprvi.jpg'
const formatImg02 = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_800/v1783028001/format-img-02_rb0b1z.jpg'
const formatImg03 = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_800/v1783028011/format-img-03_wixz0f.jpg'
const optImg01 = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_600/v1783028004/opt-img-01_yy8i3c.jpg'
const optImg02 = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_600/v1783028014/opt-img-02_pyljws.jpg'
const perk01Img = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_600/v1783027997/perk-01_g3rwy8.jpg'
const perk02Img = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_700/v1783028018/perk-02_qmp0qf.jpg'

const idealForItems = [
  'You are ready to turn your passion into a real career. You are a complete beginner who does not want to piece together free tutorials or settle for basic education—you want to build your brow business on the right foundation and feel confident working on paying clients from the start.',
  'You are tired of feeling like your brow work isn\'t reaching its full potential. You know you are capable of more, but you are craving advanced techniques, better customization, and the confidence to create results that keep clients coming back and referring everyone they know.',
  'You are already in the beauty industry and want to increase your income without starting over. Whether you are a lash artist, makeup artist, or esthetician, you are ready to add one of the industry\'s most requested services to your menu so you can attract more clients, increase your revenue, and grow a more profitable business.',
]

const formatItems = [
  {
    img: formatImg01,
    alt: 'Complete the Online Training',
    step: '01',
    title: 'Complete the Online Training',
    paragraphs: [
      'Receive instant access to MJP Beauty\'s All-In-One Online Brow Course as soon as your deposit is submitted. Master the foundations of Brow Lamination, Mapping, Hybrid Tinting, and Waxing through in-depth video lessons, theory, and step-by-step demonstrations before training day.',
      "By learning the theory beforehand, your in-person training is dedicated entirely to hands-on practice, personalized coaching, and refining your skills for real clients.",
    ],
  },
  {
    img: formatImg02,
    alt: 'Attend your In-Person Training Day',
    step: '02',
    title: 'Attend your In-Person Training Day',
    paragraphs: [
      "A full-day hands-on experience designed to refine your technique, boost confidence, and apply everything you've learned in the online course.",
      'Practice on two live models, complete skill-focused drills, and receive real-time feedback, mentorship, and final Q&A support to elevate your brow artistry.',
    ],
  },
  {
    img: formatImg03,
    alt: 'Post-Training Support',
    step: '03',
    title: 'Post-Training Support',
    paragraphs: [
      "Following your in-person training, you'll unlock 3 full months of personalized mentorship and support directly with Micah — helping you refine your craft, build confidence, and achieve results faster.",
      "This exclusive post-training access is a rare opportunity that most trainings don't provide — but it's exactly why MJP Beauty alumni students stand out!",
    ],
  },
]

const optionCards = [
  {
    id: 'group' as const,
    img: optImg02,
    alt: 'Small Group Training',
    label: 'Option 01',
    title: 'Small Group',
    price: '$1,575',
    shadowClass: 'shadow-[0_8px_32px_rgba(130,112,100,0.10)]',
    description:
      'Train in an intimate group setting with direct support from Micah and her training assistant. Perfect for Artists who want access to premium training, expert guidance while at a more affordable rate.',
  },
  {
    id: 'private' as const,
    img: optImg01,
    alt: 'Private 1-on-1 Training',
    label: 'Option 02',
    title: 'Private 1-on-1',
    price: '$1,925',
    shadowClass: 'shadow-[0_12px_40px_rgba(130,112,100,0.15)]',
    description:
      "Get Micah's undivided attention for a full day of personalized, 1-on-1 mentorship. With immediate feedback, you'll fast-track your skillset and correct form efficiently — perfect for Artists ready to level up.",
  },
]

const kitItems = [
  'THUYA PROLINE Brow Lamination Solutions (Step 1, 2 and 3)',
  'Brow Foam Cleanser',
  'Digital Timers (2)',
  'Disposables: Mini Brow Spoolies, Doe Foot Applicators, Interdental Brushes',
  'BROWCODE Tint (Light Brown & Dark Brown)',
  'BROWCODE 100ml Cream Developer',
  'Electric Tint Hand Mixer',
  'Water Pump Dispenser',
  'Brow Mapping Plastic Callipers',
  'Brow Mapping Golden Mean Callipers',
  'Alcohol & Water Pump Dispenser',
  'Tint Applicator Brush',
  'Practice Skin Pad for Waxing',
  'Waxing Sticks',
  'Standout Cosmetic Cling Film',
  'Standout Tweezer & Scissors Set',
  'Standout Crystal Ring Tint Mixing Dish',
  'Standout Black Mapping String',
  'Standout Pro Mapping Pencil (2)',
  'Concealer Brushes (2)',
]

// ─── Flip-card student perks ──────────────────────────────────────────────────

type PerkKey = 'cert' | 'discounts' | 'ebook' | 'masterclass'

const FLIP_PERKS: Record<PerkKey, {
  number: string
  title: string
  teaser?: string
  backTitle: string
  body: string
}> = {
  cert: {
    number: '02',
    title: 'Framed Certificate of Completion',
    backTitle: 'Your certification',
    body: 'Receive a professionally framed certificate to proudly display your achievement and showcase your certification to future clients.',
  },
  discounts: {
    number: '05',
    title: 'Exclusive student discount codes',
    backTitle: 'Ongoing student pricing',
    body: "Receive exclusive, ongoing student discounts with Standout Beauty, Beauty Distribution MD, and other leading beauty suppliers — helping you save on the professional products you'll use throughout your career.",
  },
  ebook: {
    number: '07',
    title: 'Glam Up Your Grid E-book',
    teaser: 'Complimentary — $88 value.',
    backTitle: 'Glam Up Your Grid',
    body: "Complimentary access to MJP Beauty's Glam Up Your Grid E-book: Instagram marketing strategies to grow your business. An $88 value, yours free with your in-person seat.",
  },
  masterclass: {
    number: '08',
    title: 'Mastering Brow Laminations Masterclass',
    teaser: 'Complimentary 30-minute masterclass.',
    backTitle: '10 Mistakes to Avoid',
    body: "Complimentary access to MJP Beauty's Mastering Brow Laminations: 10 Mistakes to Avoid Masterclass — a 30-minute masterclass breaking down the 10 things to avoid for long-lasting, natural brow laminations.",
  },
}

// ─── Training FAQ data ────────────────────────────────────────────────────────

const STUDENT_WORK = [
  { name: 'Micah',    handle: '@micahkeziah.beauty', url: 'https://www.instagram.com/micahkeziah.beauty/', note: 'Beginner, certified October 2023' },
  { name: 'Charis',   handle: '@enamouredby.ca',     url: 'https://www.instagram.com/enamouredby.cha/',    note: 'Beginner, certified July 2025' },
  { name: 'Jonalene', handle: '@jrg.aesthetics',     url: 'https://www.instagram.com/jrg.aesthetics/',     note: 'Beginner, certified February 2023' },
  { name: 'Eunice',   handle: '@bushystudio',        url: 'https://www.instagram.com/bushystudio/',        note: 'Beginner, certified November 2025' },
  { name: 'Miranda',  handle: '@mbartistryco',       url: 'https://www.instagram.com/mbartistryco/',       note: 'Intermediate, certified July 2025' },
  { name: 'Steph',    handle: '@softbrowedit',       url: 'https://www.instagram.com/softbrowedit/',       note: 'Intermediate, certified March 2026' },
  { name: 'Bianca',   handle: '@prettylashesbyb',    url: 'https://www.instagram.com/prettylashesbyb/',    note: 'Beginner, certified May 2026' },
]

const TRAINING_FAQ = [
  {
    q: 'What does the in-person training day timeline look like?',
    a: (
      <p>
        While the schedule may vary slightly for group or private training, the day typically
        includes a welcome and theory Q&amp;A, hands-on practice drills (mapping and waxing),
        lunch, <strong className="text-[#3d3530] font-semibold">Model #1</strong> (shape, tint
        &amp; wax), <strong className="text-[#3d3530] font-semibold">Model #2</strong> (lamination,
        shape, tint &amp; wax), followed by a final Q&amp;A, closing remarks, and certificate
        presentation.
      </p>
    ),
  },
  {
    q: 'Where are the trainings held?',
    a: (
      <div className="space-y-2">
        <p>
          All Winnipeg-based trainings are conducted at{' '}
          <strong className="text-[#3d3530] font-semibold">Standout Beauty Salon &amp; Academy</strong>,
          located at 186 Provencher Boulevard, Winnipeg, Manitoba.
        </p>
        <p>
          Additionally, Micah holds annual training sessions in Vancouver, providing opportunities
          for students in that region to attend in person. Micah travels to Vancouver once a year
          to hold trainings as well.
        </p>
      </div>
    ),
  },
  {
    q: 'Who organizes the models?',
    a: (
      <div className="space-y-3">
        <p>
          The student will have the opportunity to learn on two models to optimize the training
          experience:
        </p>
        <ul className="space-y-1">
          <li className="flex gap-3">
            <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-[#827064] shrink-0" />
            <span><strong className="text-[#3d3530] font-semibold">Model #1:</strong> Brow Shape, Tint and Wax model</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-[#827064] shrink-0" />
            <span><strong className="text-[#3d3530] font-semibold">Model #2:</strong> Brow Lamination, Shape, Tint and Wax model</span>
          </li>
        </ul>
        <p>
          Students are responsible for sourcing their own models for the in-person training day.
          Upon receiving the training deposit, Micah will send a confirmation email containing
          detailed guidance on selecting suitable model candidates. All models must be approved by
          Micah through submission of a photo showing their natural brows.
        </p>
        <p>For students traveling from out of town, Micah can provide models upon request.</p>
      </div>
    ),
  },
  {
    q: 'When will I gain access to the online modules?',
    a: (
      <p>
        Access to the online training portion of the course will be sent to the student immediately
        once the initial deposit is received. It is the student's responsibility to complete the
        modules prior to their training day. If a student cancels within the one-month cancellation
        period, the student will lose their access to the online course immediately.
      </p>
    ),
  },
  {
    q: 'What are the payment options?',
    a: (
      <ol className="list-decimal list-inside space-y-1.5">
        <li>E-transfer</li>
        <li>Credit Card <span className="text-[#a0948a]">(subject to a processing fee)</span></li>
        <li>Payment Plan</li>
      </ol>
    ),
  },
  {
    q: 'How does the payment plan work?',
    a: (
      <div className="space-y-3">
        <p>
          Once the initial{' '}
          <strong className="text-[#3d3530] font-semibold">$500 non-refundable deposit</strong>{' '}
          has been received, the student has complete control on how they choose to make small
          incremental payments to pay off the remaining balance, under three conditions:
        </p>
        <ol className="list-decimal list-inside space-y-1.5">
          <li>Each payment submitted must be a minimum of <strong className="text-[#3d3530] font-semibold">$300</strong></li>
          <li>The remaining balance must be fully paid <strong className="text-[#3d3530] font-semibold">two weeks prior</strong> to the training date</li>
          <li>Can be paid via <strong className="text-[#3d3530] font-semibold">e-transfer or credit card</strong></li>
        </ol>
        <p>If this option interests you, please mention this in your submission.</p>
      </div>
    ),
  },
  {
    q: 'How does the post-training mentorship work?',
    a: (
      <p>
        You have unlimited access to trainer Micah over the following{' '}
        <strong className="text-[#3d3530] font-semibold">3 months post-training</strong> to ask
        any questions regarding brows! You can also submit up to{' '}
        <strong className="text-[#3d3530] font-semibold">3 model transformations</strong> which
        Micah will take the time to analyze, review, and send back personalized and detailed
        feedback. This is meant for you to study and analyze so that you can continually improve
        with each client! All in all, this post-training mentorship is meant to fast-track your
        career as a Brow Artist — an opportunity that not many trainings offer.
      </p>
    ),
  },
  {
    q: "I'm just starting out — Is this training suited for me?",
    a: (
      <p>
        Absolutely! This training was designed with beginners in mind. You'll learn everything from
        the fundamentals of brow artistry to advanced techniques, plus receive bonus business
        modules to help you confidently launch and grow your brow business from the very beginning.
      </p>
    ),
  },
  {
    q: 'Do you teach introduction to business and social media?',
    a: (
      <p>
        Yes! Along with mastering brows the MJP Beauty way, you'll receive access to bonus business
        modules inside the Online Training Portal. I cover topics like pricing for profit,
        attracting your dream clients, setting up your Instagram for success, content strategy, and
        more — so you can confidently build a profitable brow business after training. You'll also
        receive complimentary access to my social media ebook,{' '}
        <em className="text-[#3d3530]">Glam Up Your Grid</em>, where I share all of the strategies
        I used to attract my dream clientele on Instagram!
      </p>
    ),
  },
  {
    q: 'Do you travel for private or group trainings?',
    a: (
      <p>
        Yes! Due to high demand, Micah travels to Vancouver once a year to host small-group
        trainings. Join{' '}
        <Link to="/freebies" className="underline underline-offset-2 text-[#3d3530] hover:text-[#827064] transition-colors duration-200">
          this email list
        </Link>{' '}
        to be the first to hear about upcoming training dates, registration, and availability.
      </p>
    ),
  },
  {
    q: "Where can I find Some of your students' work?",
    a: (
      <ul className="space-y-2.5">
        {STUDENT_WORK.map((student) => (
          <li key={student.handle} className="flex gap-3">
            <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-[#827064] shrink-0" />
            <span>
              <strong className="text-[#3d3530] font-semibold">{student.name}</strong>{' '}
              {student.url ? (
                <a
                  href={student.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 text-[#3d3530] hover:text-[#827064] transition-colors duration-200"
                >
                  {student.handle}
                </a>
              ) : (
                <span className="text-[#3d3530]">{student.handle}</span>
              )}{' '}
              <span className="text-[#a0948a]">({student.note})</span>
            </span>
          </li>
        ))}
      </ul>
    ),
  },
]


const ENROLL_STEPS = [
  'Choose and decide based on our availability by clicking the “View All Available Dates” button to show our training calendar.',
  'Choose your preferred training style by clicking the “Book Now” button.',
  'Follow the prompt to submit your $500 non-refundable deposit.',
  'Wait for your confirmation and welcome e-mail from MJP Beauty.',
  'Begin your journey and gain immediate access to the online training!',
]

function HowToEnrollContent() {
  return (
    <ol className="max-w-2xl mx-auto flex flex-col gap-5">
      {ENROLL_STEPS.map((step, i) => (
        <li key={i} className="flex gap-4 items-start">
          <span className="shrink-0 mt-0.5 w-7 h-7 rounded-full bg-[#f6f2ec] border border-[#e3e2de] flex items-center justify-center text-[11px] font-semibold text-[#827064]">
            {i + 1}
          </span>
          <p className="text-sm text-[#6b5f58] leading-relaxed pt-1">{step}</p>
        </li>
      ))}
    </ol>
  )
}

function TrainingFaqContent() {
  return (
    <div className="max-w-2xl mx-auto">
      {TRAINING_FAQ.map((item) => (
        <Accordion key={item.q} q={item.q} a={item.a} />
      ))}
    </div>
  )
}

// ─── Info tabs ────────────────────────────────────────────────────────────────

const TRAINING_INFO_TABS = [
  { id: 'enroll', label: 'How to Enroll', Icon: BookOpen },
  { id: 'faq',    label: 'FAQ',           Icon: HelpCircle },
] as const

type TrainingTabId = (typeof TRAINING_INFO_TABS)[number]['id']

function TrainingInfoTabs({
  sectionRef,
  active,
  onChange,
}: {
  sectionRef: React.RefObject<HTMLElement | null>
  active: TrainingTabId
  onChange: (id: TrainingTabId) => void
}) {
  return (
    <section ref={sectionRef} className="bg-[#f6f2ec] border-t border-[#e3e2de] py-16">
      <div className="max-w-4xl mx-auto px-6">

        {/* Section heading */}
        <div className="text-center mb-10">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#a0948a] mb-2">Good to Know</p>
          <h2 className="text-2xl font-semibold text-[#3d3530]">Training Information</h2>
        </div>

        {/* Tab navigator */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-0 border-b border-[#d9d4cf] w-full max-w-lg">
            {TRAINING_INFO_TABS.map(({ id, label, Icon }) => {
              const isActive = active === id
              return (
                <button
                  key={id}
                  onClick={() => onChange(id)}
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

        {/* Content panel */}
        <div className="bg-white border border-[#e3e2de] rounded-2xl px-8 py-10 shadow-sm">
          <div key={active} className="tab-fade-in">
            {active === 'enroll' && <HowToEnrollContent />}
            {active === 'faq'    && <TrainingFaqContent />}
          </div>
        </div>

      </div>
    </section>
  )
}

// ─── Brow business starter guide popup ────────────────────────────────────────

function BrowGuidePopup({ onClose }: { onClose: () => void }) {
  const [visible, setVisible] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Slight delay so the backdrop mounts before animating in
    const t = setTimeout(() => setVisible(true), 30)
    return () => clearTimeout(t)
  }, [])

  function dismiss() {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  function handleGetGuide() {
    dismiss()
    navigate('/freebies')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{
        backgroundColor: visible ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'blur(4px)' : 'blur(0px)',
        transition: 'background-color 0.3s ease, backdrop-filter 0.3s ease',
      }}
      onClick={dismiss}
    >
      <div
        className="relative bg-white rounded-[2rem] overflow-hidden w-full max-w-[760px] shadow-2xl flex flex-col sm:flex-row"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-[#5a5047] hover:text-[#827064] transition-all shadow-sm"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Left — image */}
        <div className="sm:w-1/2 shrink-0 aspect-[940/788] overflow-hidden">
          <img
            src={browGuideImg}
            alt="Brow Business Starter Guide"
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* Right — content */}
        <div className="flex flex-col justify-center px-8 py-10 flex-1">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#a0948a] mb-3">MJP Beauty</p>
          <h2 className="text-xl font-semibold text-[#3d3530] leading-snug mb-3">
            Free Guide —<br />Brow Business Starter Guide
          </h2>
          <p className="text-xs text-[#6b5f58] leading-relaxed mb-7">
            Not ready for training just yet? Grab this free guide where Micah breaks down exactly
            how to start and grow your brow business — without the fears, mistakes, and confusion
            most beginners face.
          </p>

          <button
            onClick={handleGetGuide}
            className="w-full py-2.5 bg-[#827064] text-white text-xs tracking-widest uppercase rounded-full hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Get the Free Guide
          </button>

          <p className="text-[10px] text-[#b0a49e] mt-4 text-center">Available now on our Freebies page.</p>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const GUIDE_POPUP_SESSION_KEY = 'mjp-training-guide-popup-dismissed'

export default function InPersonTrainingPage() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [hoveredFormat, setHoveredFormat] = useState<number | null>(null)
  const [activeOption, setActiveOption] = useState(0)
  const [tooltipCard, setTooltipCard] = useState<number | null>(null)
  const [kitOpen, setKitOpen] = useState(false)
  const [openPerk, setOpenPerk] = useState<PerkKey | null>(null)
  const [trainingDateGroups, setTrainingDateGroups] = useState<TrainingDateGroup[]>(
    optionCards.map((card) => ({ id: card.id, title: card.title, dates: [] }))
  )
  const [allDatesLoading, setAllDatesLoading] = useState(true)
  const [datesModalOpen, setDatesModalOpen] = useState(false)
  const [showGuidePopup, setShowGuidePopup] = useState(false)
  const [infoTab, setInfoTab] = useState<TrainingTabId>('enroll')
  const infoTabsRef = useRef<HTMLElement>(null)
  useScrollAnimation()
  const training = useTrainingBookingState()

  useEffect(() => {
    if (sessionStorage.getItem(GUIDE_POPUP_SESSION_KEY)) return

    function handleScroll() {
      const scrolled = window.scrollY + window.innerHeight
      const total = document.documentElement.scrollHeight
      if (scrolled / total >= 0.72) {
        setShowGuidePopup(true)
        window.removeEventListener('scroll', handleScroll)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function handleCloseGuidePopup() {
    setShowGuidePopup(false)
    sessionStorage.setItem(GUIDE_POPUP_SESSION_KEY, '1')
  }

  useEffect(() => {
    let cancelled = false
    Promise.all(optionCards.map((card) => getTrainingDates(card.id))).then((results) => {
      if (cancelled) return
      setTrainingDateGroups(
        optionCards.map((card, i) => ({
          id: card.id,
          title: card.title,
          dates: results[i],
        }))
      )
      setAllDatesLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const handleHowToEnroll = useCallback(() => {
    setInfoTab('enroll')
    infoTabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const handleOptionSwitch = useCallback(() => {
    setActiveOption((prev) => 1 - prev)
  }, [])

  const handleBookNow = useCallback((card: (typeof optionCards)[number]) => {
    const option: TrainingOption = {
      id: card.id,
      title: card.title,
      price: card.price,
    }
    training.openDrawer(option)
  }, [training])

  const advance = useCallback(() => {
    setAnimating(true)
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % idealForItems.length)
      setAnimating(false)
    }, 300)
  }, [])

  useEffect(() => {
    const id = setInterval(advance, 6000)
    return () => clearInterval(id)
  }, [advance])

  useEffect(() => {
    if (tooltipCard === null) return
    const handler = () => setTooltipCard(null)
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [tooltipCard])

  const anyHovered = hoveredFormat !== null

  return (
    <main>
      {/* ── Hero Section ────────────────────────────────────────────── */}
      <section className="hero-section">
        <img
          src={ipHeadImg}
          alt="In-Person Training"
          className="hero-video object-cover"
        />
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="hero-eyebrow text-sm tracking-[0.25em] uppercase text-white/70 mb-4 font-light">
            MJP Beauty
          </p>
          <h1 className="hero-heading about-heading text-4xl sm:text-5xl md:text-6xl font-semibold text-white leading-tight max-w-3xl text-center">
            An Elevated In-Person Brow Training Experience
          </h1>
          <p className="hero-tagline mt-5 text-base sm:text-lg text-white/75 max-w-xl tracking-[0.08em] font-light leading-relaxed">
            With Canada's Leading Brow Educator
          </p>
        </div>
      </section>

      {/* ── Description + Ideal For Section ─────────────────────────── */}
      <section className="bg-[#f6f2ec] py-20 px-6 md:px-8">
        <div className="mx-auto max-w-[1200px] grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">

          {/* Left — description */}
          <div className="anim-fade-left flex flex-col gap-6" style={{ transitionDelay: '0.1s' }}>
            <p className="text-[0.9rem] uppercase tracking-[0.28em] text-[#a0948a]">About the Training</p>
            <p className="text-[#3d3028] text-base sm:text-lg leading-relaxed">
              This is Canada's first Hybrid-style Brow Training, combining the best of both worlds.
              Enrolled students receive full access to my comprehensive Online Brow Course to learn
              foundational theory and techniques at their own pace, followed by an in-person training
              day focused on hands-on practice and skill refinement.
            </p>
            <p className="text-[#3d3028] text-base sm:text-lg leading-relaxed">
              This optimized training approach at MJP Beauty is recognized across Canada for producing
              outstanding student success rates!
            </p>
            <p className="text-[#5a5047] text-base sm:text-lg leading-relaxed font-medium">
              Ready to build your skills, confidence, and freedom as your own boss?
            </p>
          </div>

          {/* Right — Ideal For carousel */}
          <div className="anim-fade-right flex flex-col gap-6" style={{ transitionDelay: '0.2s' }}>
            <p className="text-[0.9rem] uppercase tracking-[0.28em] text-[#a0948a]">This is for you if ...</p>

            <button
              onClick={advance}
              aria-label="Next ideal for"
              className="group text-left w-full rounded-2xl border border-[#e3e2de] bg-white shadow-[0_8px_32px_rgba(130,112,100,0.10)] p-8 cursor-pointer hover:shadow-[0_12px_40px_rgba(130,112,100,0.16)] transition-shadow duration-300"
            >
              <span className="inline-block mb-5 text-[2.5rem] font-semibold leading-none text-[#e3d9d0]">
                {String(activeIndex + 1).padStart(2, '0')}
              </span>
              <p
                style={{
                  opacity: animating ? 0 : 1,
                  transform: animating ? 'translateY(10px)' : 'translateY(0)',
                  transition: 'opacity 0.3s ease, transform 0.3s ease',
                  minHeight: '8rem',
                }}
                className="text-[#3d3028] text-base sm:text-lg leading-relaxed"
              >
                {idealForItems[activeIndex]}
              </p>
              <p className="mt-6 text-[0.72rem] uppercase tracking-[0.22em] text-[#a0948a] group-hover:text-[#827064] transition-colors duration-200">
                Click →
              </p>
            </button>

            <div className="flex gap-2.5">
              {idealForItems.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setAnimating(true)
                    setTimeout(() => {
                      setActiveIndex(i)
                      setAnimating(false)
                    }, 300)
                  }}
                  aria-label={`Go to item ${i + 1}`}
                  className={[
                    'h-1.5 rounded-full transition-all duration-300',
                    i === activeIndex
                      ? 'w-6 bg-[#827064]'
                      : 'w-1.5 bg-[#d4ccc4] hover:bg-[#a0948a]',
                  ].join(' ')}
                />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── How It Works Section ─────────────────────────────────────── */}
      <section className="bg-white">
        {/* Section header */}
        <div className="anim-fade-up pt-16 pb-10 px-6 md:px-8 text-center">
          <h2 className="about-heading text-3xl sm:text-4xl md:text-[2.6rem] font-semibold text-[#3d3028] leading-tight">
            How it Works
          </h2>
          <div className="mt-8 flex items-center gap-4 max-w-xl mx-auto">
            <div className="flex-1 h-px bg-[#d6cec8]" />
            <p className="text-[0.72rem] uppercase tracking-[0.22em] text-[#a0948a] whitespace-nowrap">
              This in-person training format is as follows
            </p>
            <div className="flex-1 h-px bg-[#d6cec8]" />
          </div>
        </div>

        {/* Mobile: stacked cards, all content always visible (no hover) */}
        <div className="md:hidden flex flex-col">
          {formatItems.map((item, i) => (
            <div key={i} className="relative w-full">
              <div className="relative h-64 overflow-hidden">
                <img
                  src={item.img}
                  alt={item.alt}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(20,10,5,0.82) 0%, rgba(20,10,5,0.12) 55%, transparent 100%)',
                  }}
                />
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
          onMouseLeave={() => setHoveredFormat(null)}
        >
          {formatItems.map((item, i) => {
            const isHovered = hoveredFormat === i
            const flex = isHovered ? 2.6 : anyHovered ? 0.7 : 1

            return (
              <div
                key={i}
                onMouseEnter={() => setHoveredFormat(i)}
                className="relative overflow-hidden cursor-pointer"
                style={{
                  flex,
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

                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(20,10,5,0.82) 0%, rgba(20,10,5,0.12) 55%, transparent 100%)',
                  }}
                />

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

      {/* ── Choose Your Path Section ─────────────────────────────────── */}
      <section className="bg-[#f6f2ec] py-20 px-6 md:px-8">
        {/* Section header */}
        <div className="anim-fade-up text-center mb-14">
          <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#a0948a] mb-3">
            Investment
          </p>
          <h2 className="about-heading text-3xl sm:text-4xl md:text-[2.6rem] font-semibold text-[#3d3028] leading-tight">
            Choose Your Path
          </h2>
          <div className="mt-8 flex items-center gap-4 max-w-xl mx-auto">
            <div className="flex-1 h-px bg-[#d6cec8]" />
            <p className="text-[0.72rem] uppercase tracking-[0.22em] text-[#a0948a] whitespace-nowrap">
              Select the training style that best suits you
            </p>
            <div className="flex-1 h-px bg-[#d6cec8]" />
          </div>
        </div>

        {/* Option cards */}
        <div className="anim-fade-up mx-auto max-w-[1300px]">
          <div className="sm:hidden flex flex-col gap-6">
            {optionCards.map((card, i) => (
              <div
                key={i}
                className={`rounded-2xl border border-[#e3e2de] bg-white ${card.shadowClass} overflow-hidden flex flex-col`}
                style={undefined}
              >
                <div className="relative h-64 flex-shrink-0 overflow-hidden">
                  <img src={card.img} alt={card.alt} className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
                </div>
                <div className="p-8 flex flex-col">
                  <p className="text-[0.7rem] uppercase tracking-[0.28em] text-[#a0948a] mb-4">{card.label}</p>
                  <h3 className="about-heading text-2xl font-semibold text-[#3d3028] leading-tight mb-6">{card.title}</h3>
                  <div className="mb-1">
                    <span className="text-[3rem] font-semibold text-[#3d3028] leading-none">{card.price}</span>
                    <span className="text-xl text-[#5a5047] ml-2">CAD</span>
                  </div>
                  <div className="relative mb-8 flex items-center gap-2">
                    <span className="text-[0.75rem] text-[#a0948a] tracking-wide">(gst included)</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setTooltipCard((prev) => (prev === i ? null : i)) }}
                      className="text-[#a0948a] hover:text-[#827064] transition-colors duration-200"
                      aria-label="Interest-free payment plan info"
                    >
                      <CircleAlert size={12} />
                    </button>
                    {tooltipCard === i && (
                      <div className="absolute top-full left-0 mt-1.5 w-56 bg-[#2a1a0e] text-white/90 text-[0.65rem] leading-relaxed tracking-wide px-3 py-2 rounded-lg shadow-lg z-20">
                        Contact MJP Beauty for interest-free payment plan availability
                      </div>
                    )}
                  </div>
                  <div className="h-px bg-[#e3e2de] mb-8" />
                  <p className="text-[#5a5047] text-base leading-relaxed">{card.description}</p>
                  <button
                    onClick={() => handleBookNow(card)}
                    className="mt-10 w-full py-3.5 rounded-xl bg-[#3d3028] text-white text-[0.72rem] uppercase tracking-[0.2em] font-medium hover:bg-[#2a1a0e] transition-colors duration-200"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}

            <TrainingDatesCard
              groups={trainingDateGroups}
              loading={allDatesLoading}
              onViewAll={() => setDatesModalOpen(true)}
              onHowToEnroll={handleHowToEnroll}
            />
          </div>

          <div className="hidden sm:flex gap-8 items-stretch">
          <div className="flex-[7] min-w-0 relative">
            <div
              className="invisible pointer-events-none flex flex-row"
              style={{ width: 'calc(80% - 16px)' }}
              aria-hidden="true"
            >
              <div className="w-[38%] flex-shrink-0" />
              <div className="flex-1 p-10 flex flex-col">
                <p className="text-[0.7rem] mb-4">{optionCards[1].label}</p>
                <h3 className="about-heading text-2xl sm:text-3xl mb-6">{optionCards[1].title}</h3>
                <div className="mb-1">
                  <span className="text-[3rem] leading-none">{optionCards[1].price}</span>
                  <span className="text-xl ml-2">CAD</span>
                </div>
                <p className="text-[0.75rem] mb-8">(gst included)</p>
                <div className="h-px mb-8" />
                <p className="text-base leading-relaxed">{optionCards[1].description}</p>
                <div className="mt-10 w-full py-3.5" aria-hidden="true" />
              </div>
            </div>

            <div className="absolute inset-0 flex gap-5">
              {optionCards.map((card, i) => {
                const isActive = activeOption === i
                return (
                  <div
                    key={i}
                    className={`relative overflow-hidden rounded-2xl border border-[#e3e2de] bg-white ${card.shadowClass} transition-[flex-grow] duration-700 ease-in-out`}
                    style={{ flexGrow: isActive ? 4 : 1, flexShrink: 0, flexBasis: '0%' }}
                  >
                    {/* Full card content — visible when active */}
                    <div
                      className="absolute inset-0 flex flex-row"
                      style={{
                        opacity: isActive ? 1 : 0,
                        transition: isActive ? 'opacity 0.45s ease' : 'opacity 0.2s ease',
                      }}
                      aria-hidden={!isActive}
                    >
                      <div className="relative w-[38%] flex-shrink-0 overflow-hidden">
                        <img src={card.img} alt={card.alt} className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
                      </div>
                      <div className="flex-1 p-10 flex flex-col">
                        <p className="text-[0.7rem] uppercase tracking-[0.28em] text-[#a0948a] mb-4">{card.label}</p>
                        <h3 className="about-heading text-2xl sm:text-3xl font-semibold text-[#3d3028] leading-tight mb-6">
                          {card.title}
                        </h3>
                        <div className="mb-1">
                          <span className="text-[3rem] font-semibold text-[#3d3028] leading-none">{card.price}</span>
                          <span className="text-xl text-[#5a5047] ml-2">CAD</span>
                        </div>
                        <div className="relative mb-8 flex items-center gap-2">
                    <span className="text-[0.75rem] text-[#a0948a] tracking-wide">(gst included)</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setTooltipCard((prev) => (prev === i ? null : i)) }}
                      className="text-[#a0948a] hover:text-[#827064] transition-colors duration-200"
                      aria-label="Interest-free payment plan info"
                    >
                      <CircleAlert size={12} />
                    </button>
                    {tooltipCard === i && (
                      <div className="absolute top-full left-0 mt-1.5 w-56 bg-[#2a1a0e] text-white/90 text-[0.65rem] leading-relaxed tracking-wide px-3 py-2 rounded-lg shadow-lg z-20">
                        Contact MJP Beauty for interest-free payment plan availability
                      </div>
                    )}
                  </div>
                        <div className="h-px bg-[#e3e2de] mb-8 shrink-0" />
                        <p className="text-[#5a5047] text-base leading-relaxed">{card.description}</p>
                        <button
                          onClick={() => handleBookNow(card)}
                          disabled={!isActive}
                          tabIndex={isActive ? 0 : -1}
                          className="mt-10 w-full py-3.5 rounded-xl bg-[#3d3028] text-white text-[0.72rem] uppercase tracking-[0.2em] font-medium hover:bg-[#2a1a0e] transition-colors duration-200 disabled:pointer-events-none"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>

                    {/* Peek overlay — visible when inactive, clickable to switch */}
                    <button
                      className="absolute inset-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a0948a]"
                      style={{
                        opacity: isActive ? 0 : 1,
                        pointerEvents: isActive ? 'none' : 'auto',
                        transition: isActive ? 'opacity 0.2s ease' : 'opacity 0.5s ease 0.3s',
                      }}
                      onClick={handleOptionSwitch}
                      aria-label={`Switch to ${card.title}`}
                      tabIndex={isActive ? -1 : 0}
                    >
                      <img src={card.img} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
                      <div className="absolute inset-0 bg-[#2a1a0e]/55 group-hover:bg-[#2a1a0e]/40 transition-colors duration-300" />
                      <div className="absolute inset-x-0 bottom-0 p-5">
                        <p className="text-[0.6rem] uppercase tracking-[0.22em] text-white/50 mb-1.5">{card.label}</p>
                        <p className="text-white font-semibold text-sm leading-tight mb-3">{card.title}</p>
                        <p className="text-[0.62rem] uppercase tracking-[0.18em] text-white/50 group-hover:text-white/80 transition-colors duration-300">
                          View →
                        </p>
                      </div>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex-[3] min-w-[300px] flex">
            <TrainingDatesCard
              groups={trainingDateGroups}
              loading={allDatesLoading}
              onViewAll={() => setDatesModalOpen(true)}
              onHowToEnroll={handleHowToEnroll}
            />
          </div>
          </div>
        </div>

        {/* Payment info */}
        <div
          className="anim-fade-up mx-auto max-w-[1300px] mt-8"
          style={{ transitionDelay: '0.3s' }}
        >
          {/* Two-column: Deposit | Balance */}
          <div className="grid grid-cols-2 gap-5 sm:gap-10 justify-items-center">

            <div className="text-center sm:text-left">
              <p className="text-[#3d3028] text-base sm:text-lg font-semibold leading-snug mb-1.5">$500 Deposit</p>
              <p className="text-[#5a5047] text-[0.8rem] sm:text-sm leading-relaxed">
                To secure your spot &amp; gain instant access to online modules
              </p>
            </div>

            <div className="text-center sm:text-left">
              <p className="text-[#3d3028] text-base sm:text-lg font-semibold leading-snug mb-1.5">Remaining Balance</p>
              <p className="text-[#5a5047] text-[0.8rem] sm:text-sm leading-relaxed">
                Must be submitted two weeks before your training day
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── Student Perks Section ────────────────────────────────── */}
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

        <div
          className="anim-fade-up mx-auto max-w-[1200px] hidden md:grid grid-cols-12 gap-3"
          style={{ gridTemplateRows: '220px 220px 240px 240px' }}
        >
          {/* No.6 - Featured: Post-training mentorship */}
          <div
            className="col-start-1 col-span-6 row-start-1 row-span-2 rounded-2xl p-7 flex flex-col justify-between"
            style={{ backgroundColor: '#2a1a0e' }}
          >
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold leading-none select-none text-white/20">06</span>
              <span className="text-[0.6rem] uppercase tracking-[0.26em] text-white/25">Featured</span>
            </div>
            <div>
              <h3 className="about-heading text-[2.2rem] lg:text-[2.6rem] font-semibold text-white leading-tight mb-4">
                Post-training mentorship.
              </h3>
              <p className="text-white/50 text-sm leading-relaxed max-w-md">
                Your learning doesn't end when training day is over. Enjoy 3 months of unlimited
                chat support, and the opportunity to submit models for in-depth feedback — so you
                continue growing with expert guidance every step of the way.
              </p>
            </div>
          </div>

          {/* No.1 - Premium Student Kit */}
          <div
            className="col-start-7 col-span-3 row-start-1 row-span-2"
            style={{ perspective: '1200px' }}
          >
            <div
              className="relative w-full h-full"
              style={{
                transformStyle: 'preserve-3d',
                transform: kitOpen ? 'rotateY(180deg)' : 'rotateY(0deg)',
                transition: 'transform 0.65s cubic-bezier(0.4, 0.2, 0.2, 1)',
              }}
            >
              {/* Front */}
              <div
                className="absolute inset-0 rounded-2xl overflow-hidden flex flex-col bg-white border border-[#e3e2de] shadow-[0_2px_16px_rgba(130,112,100,0.10)]"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="relative flex-1 min-h-0 overflow-hidden">
                  <img
                    src={perk01Img}
                    alt="Premium Student Kit"
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="p-5 flex flex-col gap-1.5 flex-shrink-0">
                  <span className="text-xs font-semibold leading-none select-none text-[#d4ccc4]">01</span>
                  <h3 className="text-[#3d3028] text-[0.95rem] font-semibold leading-snug">Premium Student Kit</h3>
                  <p className="text-[#a0948a] text-[0.82rem] leading-relaxed">Pro tools and Micah's go-to products.</p>
                  <button
                    onClick={() => setKitOpen(true)}
                    className="mt-1 text-left text-[0.63rem] uppercase tracking-[0.2em] text-[#a0948a] hover:text-[#827064] transition-colors duration-200"
                  >
                    See what's inside →
                  </button>
                </div>
              </div>

              {/* Back */}
              <div
                className="absolute inset-0 rounded-2xl flex flex-col overflow-hidden"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  backgroundColor: '#2a1a0e',
                }}
              >
                <div className="p-5 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3 flex-shrink-0">
                    <div>
                      <span className="text-xs font-semibold leading-none select-none text-white/20">01</span>
                      <h3 className="text-white/90 text-sm font-semibold mt-1.5 leading-snug">What's in your kit</h3>
                    </div>
                    <button
                      onClick={() => setKitOpen(false)}
                      className="text-[0.6rem] uppercase tracking-[0.22em] text-white/35 hover:text-white/70 transition-colors duration-200 mt-0.5"
                    >
                      ← Back
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <ul className="flex flex-col gap-2">
                      {kitItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#a0948a] flex-shrink-0 leading-relaxed text-[0.7rem]">—</span>
                          <span className="text-white/65 text-[0.72rem] leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 pt-3 border-t border-white/10">
                      <p className="text-[0.58rem] uppercase tracking-[0.22em] text-white/30 mb-1.5">Not included with your kit</p>
                      <p className="text-white/40 text-[0.7rem] leading-relaxed">Soft Wax, Wax Pot, Post-Wax Oil &amp; Concealers</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* No.2 - Framed Certificate of Completion */}
          <PerkFlipCard
            {...FLIP_PERKS.cert}
            className="col-start-10 col-span-3 row-start-1"
            frontBg="#ede5dc"
            numberColor="text-[#c4b0a4]"
            open={openPerk === 'cert'}
            onOpen={() => setOpenPerk('cert')}
            onClose={() => setOpenPerk(null)}
          />

          {/* No.3 - 1 Year Online Theory Access */}
          <Link
            to="/online-brow-courses#curriculum"
            className="col-start-10 col-span-3 row-start-2 rounded-2xl p-5 flex flex-col justify-between hover:opacity-80 transition-opacity duration-200"
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

          {/* No.4 - Lunch & snacks by Micah */}
          <div className="col-start-1 col-span-3 row-start-3 rounded-2xl p-5 flex flex-col justify-between bg-white border border-[#e3e2de] shadow-[0_2px_16px_rgba(130,112,100,0.10)]">
            <span className="text-xs font-semibold leading-none select-none text-[#d4ccc4]">04</span>
            <h3 className="text-[#3d3028] text-[0.95rem] font-semibold leading-snug">
              Lunch &amp; snacks by Micah
            </h3>
          </div>

          {/* No.5 — Exclusive student discount codes */}
          <PerkFlipCard
            {...FLIP_PERKS.discounts}
            className="col-start-4 col-span-4 row-start-3"
            frontBg="#e8ddd3"
            numberColor="text-[#c4b0a4]"
            titleClassName="text-base"
            open={openPerk === 'discounts'}
            onOpen={() => setOpenPerk('discounts')}
            onClose={() => setOpenPerk(null)}
          />

          {/* No.7 — Glam Up Your Grid e-book */}
          <PerkFlipCard
            {...FLIP_PERKS.ebook}
            className="col-start-8 col-span-5 row-start-3"
            frontBg="#ede5dc"
            numberColor="text-[#c4b0a4]"
            titleClassName="text-base"
            open={openPerk === 'ebook'}
            onOpen={() => setOpenPerk('ebook')}
            onClose={() => setOpenPerk(null)}
          />

          {/* No.8 — Brow lamination masterclass */}
          <PerkFlipCard
            {...FLIP_PERKS.masterclass}
            className="col-start-1 col-span-5 row-start-4"
            frontClassName="border border-[#e3e2de] shadow-[0_2px_16px_rgba(130,112,100,0.10)]"
            frontBg="#ffffff"
            numberColor="text-[#d4ccc4]"
            titleClassName="text-base"
            open={openPerk === 'masterclass'}
            onOpen={() => setOpenPerk('masterclass')}
            onClose={() => setOpenPerk(null)}
          />

          {/* perk-02 — Group photo */}
          <div className="col-start-6 col-span-7 row-start-4 rounded-2xl overflow-hidden relative">
            <img
              src={perk02Img}
              alt="MJP Beauty in-person students"
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        {/* ── Mobile / tablet stacked grid ───────────── */}
        <div className="mx-auto max-w-[1200px] grid md:hidden grid-cols-2 gap-3">
          {/* Featured */}
          <div
            className="col-span-2 rounded-2xl p-7 flex flex-col justify-between min-h-[280px]"
            style={{ backgroundColor: '#2a1a0e' }}
          >
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold leading-none select-none text-white/20">06</span>
              <span className="text-[0.6rem] uppercase tracking-[0.26em] text-white/25">Featured</span>
            </div>
            <div>
              <h3 className="about-heading text-2xl sm:text-3xl font-semibold text-white leading-tight mb-3">
                Post-training mentorship.
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Your learning doesn't end when training day is over. Enjoy 3 months of unlimited
                chat support, and the opportunity to submit models for in-depth feedback — so you
                continue growing with expert guidance every step of the way.
              </p>
            </div>
          </div>

          {/* perk-01 */}
          <div
            className="col-span-2 sm:col-span-1"
            style={{ perspective: '1200px', height: '360px' }}
          >
            <div
              className="relative w-full h-full"
              style={{
                transformStyle: 'preserve-3d',
                transform: kitOpen ? 'rotateY(180deg)' : 'rotateY(0deg)',
                transition: 'transform 0.65s cubic-bezier(0.4, 0.2, 0.2, 1)',
              }}
            >
              {/* Front */}
              <div
                className="absolute inset-0 rounded-2xl overflow-hidden flex flex-col bg-white border border-[#e3e2de] shadow-[0_2px_16px_rgba(130,112,100,0.10)]"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="relative flex-1 min-h-0 overflow-hidden">
                  <img
                    src={perk01Img}
                    alt="Premium Student Kit"
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="p-5 flex flex-col gap-1.5 flex-shrink-0">
                  <span className="text-xs font-semibold leading-none select-none text-[#d4ccc4]">01</span>
                  <h3 className="text-[#3d3028] text-[0.95rem] font-semibold leading-snug">Premium Student Kit</h3>
                  <p className="text-[#a0948a] text-sm leading-relaxed">Pro tools and Micah's go-to products.</p>
                  <button
                    onClick={() => setKitOpen(true)}
                    className="mt-1 text-left text-[0.63rem] uppercase tracking-[0.2em] text-[#a0948a] hover:text-[#827064] transition-colors duration-200"
                  >
                    See what's inside →
                  </button>
                </div>
              </div>

              {/* Back */}
              <div
                className="absolute inset-0 rounded-2xl flex flex-col overflow-hidden"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  backgroundColor: '#2a1a0e',
                }}
              >
                <div className="p-5 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3 flex-shrink-0">
                    <div>
                      <span className="text-xs font-semibold leading-none select-none text-white/20">01</span>
                      <h3 className="text-white/90 text-sm font-semibold mt-1.5 leading-snug">What's in your kit</h3>
                    </div>
                    <button
                      onClick={() => setKitOpen(false)}
                      className="text-[0.6rem] uppercase tracking-[0.22em] text-white/35 hover:text-white/70 transition-colors duration-200 mt-0.5"
                    >
                      ← Back
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <ul className="flex flex-col gap-2">
                      {kitItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#a0948a] flex-shrink-0 leading-relaxed text-[0.7rem]">—</span>
                          <span className="text-white/65 text-[0.72rem] leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 pt-3 border-t border-white/10">
                      <p className="text-[0.58rem] uppercase tracking-[0.22em] text-white/30 mb-1.5">Not included with your kit</p>
                      <p className="text-white/40 text-[0.7rem] leading-relaxed">Soft Wax, Wax Pot, Post-Wax Oil &amp; Concealers</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* No.2 */}
          <PerkFlipCard
            {...FLIP_PERKS.cert}
            height="190px"
            frontBg="#ede5dc"
            numberColor="text-[#c4b0a4]"
            open={openPerk === 'cert'}
            onOpen={() => setOpenPerk('cert')}
            onClose={() => setOpenPerk(null)}
          />

          {/* No.3 */}
          <Link
            to="/online-brow-courses#curriculum"
            className="rounded-2xl p-5 flex flex-col justify-between min-h-[150px] hover:opacity-80 transition-opacity duration-200"
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

          {/* No.4 */}
          <div className="rounded-2xl p-5 flex flex-col justify-between min-h-[150px] bg-white border border-[#e3e2de] shadow-[0_2px_16px_rgba(130,112,100,0.10)]">
            <span className="text-xs font-semibold leading-none select-none text-[#d4ccc4]">04</span>
            <h3 className="text-[#3d3028] text-[0.95rem] font-semibold leading-snug">
              Lunch &amp; snacks by Micah
            </h3>
          </div>

          {/* No.5 */}
          <PerkFlipCard
            {...FLIP_PERKS.discounts}
            height="190px"
            frontBg="#e8ddd3"
            numberColor="text-[#c4b0a4]"
            open={openPerk === 'discounts'}
            onOpen={() => setOpenPerk('discounts')}
            onClose={() => setOpenPerk(null)}
          />

          {/* No.7 */}
          <PerkFlipCard
            {...FLIP_PERKS.ebook}
            className="col-span-2 sm:col-span-1"
            height="190px"
            frontBg="#ede5dc"
            numberColor="text-[#c4b0a4]"
            open={openPerk === 'ebook'}
            onOpen={() => setOpenPerk('ebook')}
            onClose={() => setOpenPerk(null)}
          />

          {/* No.8 */}
          <PerkFlipCard
            {...FLIP_PERKS.masterclass}
            className="col-span-2 sm:col-span-1"
            height="190px"
            frontBg="#ffffff"
            frontClassName="border border-[#e3e2de] shadow-[0_2px_16px_rgba(130,112,100,0.10)]"
            numberColor="text-[#d4ccc4]"
            open={openPerk === 'masterclass'}
            onOpen={() => setOpenPerk('masterclass')}
            onClose={() => setOpenPerk(null)}
          />

          {/* perk-02 */}
          <div className="col-span-2 rounded-2xl overflow-hidden relative h-[220px]">
            <img
              src={perk02Img}
              alt="MJP Beauty in-person students"
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

      </section>

      {/* ── Info Tabs ────────────────────────────────────────────── */}
      <TrainingInfoTabs sectionRef={infoTabsRef} active={infoTab} onChange={setInfoTab} />

      <BackToTop />

      <TrainingDrawer
        open={training.drawerOpen}
        onClose={training.closeDrawer}
        step={training.step}
        selectedOption={training.selectedOption}
        trainingDates={training.trainingDates}
        datesLoading={training.datesLoading}
        selectedDate={training.selectedDate}
        onSelectDate={training.handleSelectDate}
        paymentMethod={training.paymentMethod}
        onSelectPaymentMethod={training.handleSelectPaymentMethod}
        details={training.details}
        onUpdateDetails={training.handleUpdateDetails}
        honeypot={training.honeypot}
        onHoneypotChange={training.setHoneypot}
        submitting={training.submitting}
        submitError={training.submitError}
        submitted={training.submitted}
        onSubmit={training.handleSubmit}
        onBack={training.handleBack}
        onContinue={training.handleContinue}
      />

      {datesModalOpen && (
        <TrainingDatesModal
          groups={trainingDateGroups}
          loading={allDatesLoading}
          onClose={() => setDatesModalOpen(false)}
        />
      )}

      {showGuidePopup && <BrowGuidePopup onClose={handleCloseGuidePopup} />}
    </main>
  )
}
