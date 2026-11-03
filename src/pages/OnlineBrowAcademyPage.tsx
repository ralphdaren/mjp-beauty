import { Fragment, useEffect, useLayoutEffect, useMemo, useState, useCallback, useRef } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Check, HelpCircle, Minus } from 'lucide-react'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import BackToTop from '@/components/BackToTop'
import Accordion from '@/components/Accordion'
import CourseReviewsSection from '@/components/CourseReviewsSection'
import type { ReviewOption } from '@/components/CourseReviewsSection'
import InstagramReels from '@/components/InstagramReels'
import { getProductByHandle, createCheckoutUrl, formatPrice } from '@/lib/shopify'
import type { ShopifyProduct } from '@/lib/shopify'
import { cld, toSrcSet } from '@/lib/cloudinary'
const olHeadImg         = cld('v1783027948/ol-head_xivqpl.jpg', ',c_limit')
const olHeadPortraitImg = cld('v1783027948/ol-head_xivqpl.jpg', ',c_fill,g_center,ar_9:16')
const curriculumImg = cld('v1783027938/curriculum-img_frtvcf.jpg', ',c_limit')

const REELS = [
  'v1785127684/ol-reel-01_e1wqcz',
  'v1785127685/ol-reel-02_sq7wyq',
  'v1785127679/ol-reel-03_svndl5',
  'v1785127684/ol-reel-04_rz1rzg',
  'v1785127688/ol-reel-05_adnomw',
  'v1785127676/ol-reel-06_vt1bc7',
  'v1785127677/ol-reel-07_fowhyb',
  'v1785127686/ol-reel-08_tppgqd',
]

const youWillItems = [
  'Master the technique of knowing exactly when to remove the perm solution — no more relying on your timers. No more under- or over-processing of the brows. Just beautifully lifted, natural-looking lamination results every time.',
  'Say goodbye to patchy stains and harsh lines — and hello to clean, defined, and long-lasting results. Learn how to master natural-looking skin stains using one of the industry\'s top brow tints, so you can finally feel confident in your tinting every single time.',
  'Learn the exact business strategies, systems, and frameworks I used to grow my beauty business entirely on Instagram — so you can build a brand that\'s profitable, booked out, and built to last!',
  'Master a proven mapping method that transforms your brow results — so you can confidently map balanced, symmetrical brows tailored to each client\'s unique features (even the tricky, uneven ones)!',
  'Go beyond basic waxing techniques — gain the knowledge and skills to confidently wax brows while protecting your client\'s skin. Learn how to avoid skin lifting, understand ingredient interactions, and deliver flawless results every time that your clients love.',
  'Unlock the rare, expert details in brow artistry that will set you apart from your competition — educational insights you won\'t find anywhere else. This training focuses on the details to help you create a raving fan club of clients and a most importantly, a steady income!',
]

type CurriculumMod = { num: string; name: string }
type CurriculumPart =
  | { type: 'modules'; tab: string; tabSub: string; partLabel: string; title: string; modules: CurriculumMod[] }
  | { type: 'business'; tab: string; tabSub: string; partLabel: string; title: string; description: string; bullets: string[] }
  | { type: 'bonuses'; tab: string; tabSub: string; partLabel: string; title: string; items: { label: string; sub: string; bullets?: string[] }[] }

const curriculumParts: CurriculumPart[] = [
  {
    type: 'modules',
    tab: 'Part 1',
    tabSub: 'Brow Lamination Theory',
    partLabel: 'Part 1',
    title: 'Brow Lamination Theory',
    modules: [
      { num: 'Mod 01', name: 'Brow Lamination Theory' },
      { num: 'Mod 02', name: 'Health & Safety' },
      { num: 'Mod 03', name: 'Consultations & Consent Forms (Digital vs Printed)' },
      { num: 'Mod 04', name: 'Products & Tools (TGA vs Cysteamine-based Systems)' },
      { num: 'Mod 05', name: 'Equipment' },
      { num: 'Mod 06', name: 'Hygiene & Sanitation' },
      { num: 'Mod 07', name: 'Workstation Set-up' },
      { num: 'Mod 08', name: 'Aftercare & Three Aftercare Kit Options for your Clients' },
    ],
  },
  {
    type: 'modules',
    tab: 'Part 2',
    tabSub: 'Brow Lamination Process',
    partLabel: 'Part 2',
    title: 'Brow Lamination Process',
    modules: [
      { num: 'Mod 10', name: 'Step-by-Step Lami Service Overview' },
      { num: 'Mod 11', name: 'Brow Prep & Cleansing' },
      { num: 'Mod 12', name: 'Understanding Step 1 Perming Solution' },
      { num: 'Mod 13', name: 'Understanding Step 2 Nourishing Solution' },
      { num: 'Mod 14', name: 'Styling & Concealing' },
      { num: 'Mod 15', name: 'Step 3 Nourishing Agent' },
      { num: 'Mod 16', name: 'Troubleshooting Brow Lamination Problems (Over-processing VS Under-processing)' },
    ],
  },
  {
    type: 'modules',
    tab: 'Part 3',
    tabSub: 'Brow Mapping Fundamentals',
    partLabel: 'Part 3',
    title: 'Brow Mapping Fundamentals',
    modules: [
      { num: 'Mod 17', name: 'Intro to Brow Mapping' },
      { num: 'Mod 18', name: 'Brow Mapping Consultations' },
      { num: 'Mod 19', name: 'Tools & Essentials' },
      { num: 'Mod 20', name: 'Step-by-Step of Signature Mapping Technique' },
      { num: 'Mod 21', name: "Do's & Don'ts of Brow Mapping" },
      { num: 'Mod 22', name: 'Face Shapes & Brows' },
      { num: 'Mod 23', name: 'Troubleshooting Challenging & Asymmetrical Brows ("Hook brows", Triangle brows, "S-brows")' },
      { num: 'Mod 24', name: 'Achieving Custom Brow Shapes (Straight, Soft, Angled, Lifted Brows)' },
      { num: 'Mod 25', name: 'Bonus Mapping with Paste' },
    ],
  },
  {
    type: 'modules',
    tab: 'Part 4',
    tabSub: 'Brow Tinting Fundamentals',
    partLabel: 'Part 4',
    title: 'Brow Tinting Fundamentals',
    modules: [
      { num: 'Mod 26', name: 'Intro to Natural Brow Tinting Fundamentals' },
      { num: 'Mod 27', name: 'Health & Safety' },
      { num: 'Mod 28', name: 'Product Knowledge (using industry leading brand, Brow Code)' },
      { num: 'Mod 29', name: 'Tools & Equipment' },
      { num: 'Mod 30', name: 'Step-by-Step Tinting Technique' },
      { num: 'Bonus', name: 'Troubleshooting Brow Tinting Problems' },
    ],
  },
  {
    type: 'modules',
    tab: 'Part 5',
    tabSub: 'Brow Waxing Fundamentals',
    partLabel: 'Part 5',
    title: 'Brow Waxing Fundamentals',
    modules: [
      { num: 'Mod 32', name: 'Intro to Brow Waxing' },
      { num: 'Mod 33', name: 'Health & Safety — Contraindications & Understanding Skincare Ingredients' },
      { num: 'Mod 34', name: 'Waxing Product Knowledge' },
      { num: 'Mod 35', name: 'Waxing Product Tools' },
      { num: 'Mod 36', name: 'Step-by-Step Overview Strip Waxing Service' },
      { num: 'Mod 37', name: 'Waxing Application & Removal Technique' },
      { num: 'Mod 38', name: 'Tweezing Technique — tweeze, micro-trim & "debulking"' },
      { num: 'Mod 39', name: 'Troubleshooting Wax Application Problems' },
    ],
  },
  {
    type: 'business',
    tab: 'Business & Brows',
    tabSub: '',
    partLabel: '',
    title: 'Business & Brows',
    description:
      'Learn the exact systems and strategies I used to grow my beauty business organically through Instagram — the same ones that helped me become a recognized Brow Artist & Educator in my city and across the country. Inside this module, you\'ll dive into:',
    bullets: [
      'Pricing for Profit — Pricing strategies that actually make sense',
      'Curating a Loyal Clientele',
      'Marketing & Branding + access to my Social Media Ebook Glam Up Your Grid',
      'How to start and grow your Brow Business from the ground up',
      'How to capture IG-worthy content straight from your phone',
      'How & What to Upsell Retail Brow Products to Clients',
    ],
  },
  {
    type: 'bonuses',
    tab: 'Bonuses',
    tabSub: '',
    partLabel: '',
    title: 'Bonuses',
    items: [
      {
        label: 'Video Demonstrations',
        sub: '7 Model Demonstrations from Start to Finish',
        bullets: [
          '(2) Full Brow Lami Service on Sparse, Thin Brows',
          '(1) Full Brow Lami Service on Average, Normal Brows',
          '(1) Naked Brow Lami Service on Full Brows',
          '(1) Brow Lamination Maintenance Service',
          '(1) Brow Mapping on Non-laminated Brows',
          '(1) Brow Mapping on Laminated Brows',
          '(1) Brow Tinting Demo on Laminated Brows',
        ],
      },
      { label: '40+ Video Lectures', sub: 'Every module comes with a detailed video lesson and high-quality video tutorials to walk you through each technique step by step' },
      { label: '250+ pages Downloadable Training Manual', sub: '"Brow Artistry Blueprint"' },
      { label: '70+ pages Downloadable Social Media Ebook', sub: '"Glam Up Your Grid"' },
      { label: '"The Brow Lab" Chapter', sub: "Insider look into Brow Brands and Products I'm currently trialling, testing and loving" },
      { label: 'Access to Downloadable & Printable Consent Form Templates', sub: '' },
      { label: '"Natural Brow Checklist"', sub: '' },
      { label: 'Exclusive Student Discount Codes', sub: '' },
    ],
  },
]

// Fallback names while Shopify loads; order matches VITE_SHOPIFY_HANDLE_MOD_01..06
const singleModuleData = [
  { name: 'Watch & Learn: Advanced Brow Demo Vault' },
  { name: 'Brow Mapping Fundamentals' },
  { name: 'Brow Tinting Fundamentals' },
  { name: 'Strip Waxing Online Brow Course' },
  { name: 'Mastering Brow Lamination: 10 Mistakes to Leave Behind' },
  { name: 'Glam Up Your Grid: A Brow Artist\'s Social Media Guide' },
]

// Shopify CDN resizes on the fly via the `width` query param
const SHOP_WIDTHS = [300, 450, 600]
const shopifyImg = (url: string, w: number) => `${url}${url.includes('?') ? '&' : '?'}width=${w}`

// ─── Path comparison data ─────────────────────────────────────────────────────

// VIP-only rows; no Shopify product backs these, so the price is set here
const VIP_EXTRAS = [
  { name: '3-Month Online Brow Mentorship', price: '$1,199' },
  { name: '6 Months of Unlimited Chat Support', price: null },
]

// Order matches VITE_SHOPIFY_HANDLE_INDEPENDENT, VITE_SHOPIFY_HANDLE_VIP
const PATH_PLANS = [
  {
    label: 'Option 01',
    title: 'Independent Artist',
    fallbackPrice: '$649',
    value: null, // live course total
    subtitle: 'For motivated Artists who prefer self-guided learning',
    bullets: [
      'Is confident learning and applying techniques independently',
      'Is self-motivated and driven, learns on their own terms',
      'Wants budget-friendly training without sacrificing quality or depth',
      'Enjoys structured modules at their own pace, with freedom to revisit content',
      'Is a seasoned pro looking to refine the details of their craft',
    ],
  },
  {
    label: 'Option 02',
    title: 'VIP Mentorship',
    fallbackPrice: '$849',
    value: '$1,848',
    subtitle: 'For artists who are independent learners but still want the guidance of expert mentorship',
    bullets: [
      'Thrives with self-paced learning but values expert guidance',
      'Prefers independent learning with support when needed',
      'Values personalized post-training feedback (up to 3 model submissions)',
      'Wants 6 months of unlimited chat support for questions, corrections, and technique reviews',
      'Is ready to elevate their skills with both freedom and mentorship',
    ],
  },
]

// ─── Online FAQ data ──────────────────────────────────────────────────────────

const ONLINE_FAQ: { q: string; a: ReactNode }[] = [
  {
    q: 'Is it beginner-friendly?',
    a: (
      <p>
        Absolutely! This training is designed and proven for all skill levels — from total beginners to growing artists looking
        to refine their brow techniques or add new services to their menu. This training was built to act as if Micah is right there right
        beside you through it all! I highly recommend beginner levels to opt for the VIP Mentorship package if you want to achieve real,
        fast-tracked results.
      </p>
    ),
  },
  {
    q: 'What supplies do I need to start?',
    a: (
      <p>
        Currently MJP beauty is working on a Kit Collab with Standout Beauty in hopes to have it available for you guys to purchase soon.
        As of right now, you'll get access to a full product list inside the course plus MJP Beauty's Brow Artistry Essentials Guide which
        will give you direct purchase links to the products! In addition, Micah has exclusive student discount codes available and will also
        walk you through how to use each product, so you can feel confident before working on clients.
      </p>
    ),
  },
  {
    q: 'Do I need to be certified already to take this course?',
    a: (
      <p>
        No prior certification is required — this course provides full theory, step-by-step
        techniques, and live demos to help you build a strong foundation from the ground up.
        However, it's your responsibility to check the regulations in your specific state or
        province regarding performing brow services on clients.
      </p>
    ),
  },
  {
    q: 'Will I receive a certificate after completing the course?',
    a: (
      <p>
        Yes! Once you've completed all of the modules and passed the quizzes, simply e-mail MJP Beauty
        and you'll receive a Certificate of Completion directly from Micah which you can proudly
        display and use to elevate your business.
      </p>
    ),
  },
  {
    q: 'How long do I have access to the course?',
    a: (
      <p>
        While many online trainings offer unlimited access, research shows that too much time leads
        to low completion rates. This course is designed with accountability in mind — a 6-month
        window encourages focus, consistency, and real progress.
      </p>
    ),
  },
  {
    q: 'What if I need extra support while taking the course?',
    a: (
      <p>
        Consider the VIP Mentorship option for $849 CAD which allows you to have direct mentorship
        and guidance from your Educator, Micah. You will have up to 3 model submissions to receive
        detailed and personalized feedback, along with 6 months of unlimited chat support. Designed
        to fast-track your results as a student!
      </p>
    ),
  },
  {
    q: 'Is there a way for me to extend my online course access?',
    a: (
      <p>
        Yes! Once you complete the training, you can leave a review and as a perk, Micah will extend
        your training access for another 6 months!
      </p>
    )
  },
  {
    q: 'Do I have to enroll in the full All-In-One Course, or can I learn specific techniques?',
    a: (
      <p>
        Absolutely! We know every artist is at a different stage in their journey, which is why we've
        created individual mini online courses like our Brow Mapping Fundamentals and Brow Tinting Fundamentals.
        These are the same in-depth chapters pulled directly from the All-In-One Brow Course, so you can focus
        on the specific skills you want to improve. The only difference is that students who opt for these individual
        courses don't receive access to the full library of demo models included in the complete training
        unless you sign up for our Brow Demo Vault portal.
      </p>
    )
  }
]


function OnlineFaqSection() {
  return (
    <section className="bg-[#f6f2ec] py-16">
      <div className="max-w-4xl mx-auto px-6">

        {/* Section heading */}
        <div className="text-center mb-10">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#a0948a] mb-2">Your Burning Questions</p>
          <h2 className="text-2xl font-semibold text-[#3d3530]">Frequently Asked Questions</h2>
        </div>

        {/* Tab navigator */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-0 border-b border-[#d9d4cf] w-full max-w-lg">
            <div className="group relative flex-1 flex flex-col items-center gap-1.5 py-3 px-2 text-[#6e5f55]">
              <HelpCircle size={15} />
              <span className="text-[11px] tracking-[0.1em] uppercase font-semibold whitespace-nowrap">FAQ</span>
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-3/4 bg-[#827064] rounded-full" />
            </div>
          </div>
        </div>

        {/* Content panel */}
        <div className="bg-white border border-[#e3e2de] rounded-2xl px-8 py-10 shadow-sm">
          <div className="max-w-2xl mx-auto">
            {ONLINE_FAQ.map((item) => (
              <Accordion key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

export default function OnlineBrowAcademyPage() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [activePart, setActivePart] = useState(0)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 0 })
  const [shopifyProducts, setShopifyProducts] = useState<(ShopifyProduct | null)[]>([null, null])
  const [moduleProducts, setModuleProducts] = useState<(ShopifyProduct | null)[]>(Array(6).fill(null))
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) return
    const el = document.getElementById(location.hash.slice(1))
    if (!el) return
    const timer = setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
    return () => clearTimeout(timer)
  }, [location.hash])
  const [enrolling, setEnrolling] = useState<string | null>(null)

  useLayoutEffect(() => {
    const el = tabRefs.current[activePart]
    if (!el) return
    // Re-measure on resize: the tabs switch between a horizontal row (mobile) and the sidebar (md+)
    const update = () => setIndicatorStyle({ top: el.offsetTop, height: el.offsetHeight })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [activePart])

  const handleEnroll = useCallback(async (product: ShopifyProduct | null) => {
    if (!product?.variantId) return
    setEnrolling(product.id)
    try {
      const url = await createCheckoutUrl(product.variantId)
      if (url) window.location.href = url
    } finally {
      setEnrolling(null)
    }
  }, [])

  const coursesTotal = useMemo(() => (
    moduleProducts.every(Boolean)
      ? moduleProducts.reduce((sum, p) => sum + parseFloat(p!.price), 0)
      : null
  ), [moduleProducts])

  const pathPrice = (p: number) =>
    shopifyProducts[p] ? formatPrice(shopifyProducts[p]!.price) : PATH_PLANS[p].fallbackPrice
  // Independent's value is the live course total; VIP's is fixed
  const pathValue = (p: number) =>
    PATH_PLANS[p].value ?? (coursesTotal !== null ? `$${coursesTotal.toLocaleString('en-CA')}` : null)

  useEffect(() => {
    const handles = [
      import.meta.env.VITE_SHOPIFY_HANDLE_INDEPENDENT,
      import.meta.env.VITE_SHOPIFY_HANDLE_VIP,
    ]
    Promise.all(handles.map((h: string) => h ? getProductByHandle(h) : Promise.resolve(null)))
      .then(setShopifyProducts)
      .catch(() => {})
  }, [])

  const reviewOptions = useMemo<ReviewOption[]>(() => [
    {
      label: 'Independent Artist',
      handle: import.meta.env.VITE_SHOPIFY_HANDLE_INDEPENDENT as string,
      productId: shopifyProducts[0]?.id ?? null,
    },
    {
      label: 'VIP Mentorship',
      handle: import.meta.env.VITE_SHOPIFY_HANDLE_VIP as string,
      productId: shopifyProducts[1]?.id ?? null,
    },
  ], [shopifyProducts])

  useEffect(() => {
    const handles = [
      import.meta.env.VITE_SHOPIFY_HANDLE_MOD_01,
      import.meta.env.VITE_SHOPIFY_HANDLE_MOD_02,
      import.meta.env.VITE_SHOPIFY_HANDLE_MOD_03,
      import.meta.env.VITE_SHOPIFY_HANDLE_MOD_04,
      import.meta.env.VITE_SHOPIFY_HANDLE_MOD_05,
      import.meta.env.VITE_SHOPIFY_HANDLE_MOD_06,
    ]
    Promise.all(handles.map((h: string) => h ? getProductByHandle(h) : Promise.resolve(null)))
      .then(setModuleProducts)
      .catch(() => {})
  }, [])

  const advance = useCallback(() => {
    setAnimating(true)
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % youWillItems.length)
      setAnimating(false)
    }, 300)
  }, [])

  useEffect(() => {
    const id = setInterval(advance, 6000)
    return () => clearInterval(id)
  }, [advance])

  useScrollAnimation()

  return (
    <main>
      {/* ── Hero Section ────────────────────────────────────────────── */}
      <section className="hero-section">
        <picture>
          {/* Original is only 1920x1280, so the portrait crop tops out at 720px */}
          <source media="(orientation: portrait)" srcSet={toSrcSet(olHeadPortraitImg, [480, 720])} sizes="100vw" />
          {/* object-cover on a 3:2 image: rendered width is the larger of 100vw and 150vh */}
          <img
            src={olHeadImg(1600)}
            srcSet={toSrcSet(olHeadImg, [1200, 1600, 1920])}
            sizes="max(100vw, 150vh)"
            alt="Online Brow Academy"
            className="hero-video object-cover"
            fetchPriority="high"
          />
        </picture>
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="hero-eyebrow text-sm tracking-[0.25em] uppercase text-white/70 mb-4 font-light">
            MJP Beauty
          </p>
          <h1 className="hero-heading about-heading text-4xl sm:text-5xl md:text-6xl font-semibold text-white leading-tight max-w-3xl text-center">
            Raising the Standards of Online Brow Education
          </h1>
          <p className="hero-tagline mt-5 text-base sm:text-lg text-white/75 max-w-xl tracking-[0.08em] font-light leading-relaxed">
            An Experience Unlike Anything You've Seen Before — Designed for Artists. Backed by Expertise. Built for Success.
          </p>
        </div>
      </section>

      {/* ── Description + You Will Section ──────────────────────────── */}
      <section className="bg-[#f6f2ec] py-20 px-6 md:px-8">
        <div className="mx-auto max-w-[1200px] grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">

          {/* Left — description */}
          <div className="anim-fade-left flex flex-col gap-6" style={{ transitionDelay: '0.1s' }}>
            <p className="text-[0.9rem] uppercase tracking-[0.28em] text-[#a0948a]">About the Training</p>
            <p className="text-[#3d3028] text-base sm:text-lg leading-relaxed">
              Unlock the MJP Beauty way of brows and gain insider access to specialized techniques in this all-inclusive online training. Packed with game-changing methods that removes the guesswork out of brow artistry and a training structure trusted by hundreds of Artists worldwide. This online course provides the most comprehensive education empowering you to deliver consistent, long-lasting, natural brow services that your clients will rave about.
            </p>
          </div>

          {/* Right — You Will carousel */}
          <div className="anim-fade-right flex flex-col gap-6" style={{ transitionDelay: '0.2s' }}>
            <p className="text-[0.9rem] uppercase tracking-[0.28em] text-[#a0948a]">You Will</p>

            <button
              onClick={advance}
              aria-label="Next item"
              className="group text-left w-full rounded-2xl border border-[#e3e2de] bg-white shadow-[0_8px_32px_rgba(130,112,100,0.10)] p-8 cursor-pointer hover:shadow-[0_12px_40px_rgba(130,112,100,0.16)] transition-shadow duration-300 flex flex-col"
              style={{ minHeight: '22rem' }}
            >
              <span className="inline-block mb-5 text-[2.5rem] font-semibold leading-none text-[#e3d9d0]">
                {String(activeIndex + 1).padStart(2, '0')}
              </span>
              <p
                style={{
                  opacity: animating ? 0 : 1,
                  transform: animating ? 'translateY(10px)' : 'translateY(0)',
                  transition: 'opacity 0.3s ease, transform 0.3s ease',
                }}
                className="flex-1 text-[#3d3028] text-base sm:text-lg leading-relaxed"
              >
                {youWillItems[activeIndex]}
              </p>
              <p className="mt-6 text-[0.72rem] uppercase tracking-[0.22em] text-[#a0948a] group-hover:text-[#827064] transition-colors duration-200">
                Click →
              </p>
            </button>

            <div className="flex gap-2.5">
              {youWillItems.map((_, i) => (
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

      {/* ── Choose Your Path Section ─────────────────────────────────── */}
      <section className="bg-white py-20 px-6 md:px-8">
        {/* Section header */}
        <div className="anim-fade-up text-center mb-14">
          <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#a0948a] mb-3">
            Investment
          </p>
          <h2 className="about-heading text-3xl sm:text-4xl md:text-[2.6rem] font-semibold text-[#3d3028] leading-tight">
            Choose Your Path
          </h2>
          <div className="mt-8 flex items-center gap-4 max-w-2xl mx-auto">
            <div className="flex-1 h-px bg-[#d6cec8]" />
            <p className="text-[0.72rem] uppercase tracking-[0.22em] text-[#a0948a] text-center">
              Powerful ways to experience the game-changing brow education.
            </p>
            <div className="flex-1 h-px bg-[#d6cec8]" />
          </div>
        </div>

        {/* Course grid */}
        <div className="anim-fade-up mx-auto max-w-[1300px]">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-[#e3e2de]" />
            <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#a0948a] text-center">
              The curriculum · Included in both paths, or buy any course on its own
            </p>
            <div className="flex-1 h-px bg-[#e3e2de]" />
          </div>
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-10 md:gap-x-5">
            {singleModuleData.map((mod, i) => {
              const product = moduleProducts[i]
              const image = product?.featuredImage
              const detailPath = product ? `/online-modules/${product.handle}` : '/online-modules'
              return (
                <li key={i} className="flex flex-col">
                  <Link to={detailPath} className="group block">
                    <div className="aspect-square overflow-hidden rounded-xl bg-[#f6f2ec]">
                      {image && (
                        <img
                          src={shopifyImg(image.url, 600)}
                          srcSet={SHOP_WIDTHS.map((w) => `${shopifyImg(image.url, w)} ${w}w`).join(', ')}
                          sizes="(min-width: 1024px) 200px, (min-width: 768px) 33vw, 50vw"
                          alt={image.altText || product!.title}
                          className="h-full w-full object-cover transition-opacity duration-200 group-hover:opacity-90"
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                    </div>
                    <h3 className="mt-4 text-sm font-medium leading-snug text-[#3d3028] group-hover:underline underline-offset-4 decoration-[#d6cec8]">
                      {product?.title ?? mod.name}
                    </h3>
                  </Link>
                  <div className="mt-auto pt-4">
                    <div className="h-px bg-[#e3e2de] mb-3" />
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-xl font-semibold text-[#3d3028] leading-none">
                        {product ? formatPrice(product.price) : <span className="inline-block h-5 w-12 rounded bg-[#f6f2ec] animate-pulse align-middle" />}
                      </span>
                      <button
                        onClick={() => handleEnroll(product)}
                        disabled={!product || enrolling === product.id}
                        className="text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#3d3028] border-b border-[#3d3028] pb-0.5 hover:text-[#827064] hover:border-[#827064] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        aria-label={`Buy ${product?.title ?? mod.name}`}
                      >
                        {product && enrolling === product.id ? 'Processing…' : 'Buy course'}
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>

          {/* Live total, shown once every price has loaded */}
          {coursesTotal !== null && (
            <p className="about-heading mt-14 text-center text-lg sm:text-xl text-[#5a5047]">
              On their own, the 6 courses add up to{' '}
              <span className="font-semibold text-[#3d3028]">${coursesTotal.toLocaleString('en-CA')}</span>.
              Get them all in a path below and save.
            </p>
          )}

          {/* ── Path comparison ── */}
          <div className="mt-16 md:mt-20">

            {/* Table (md+) */}
            <div className="hidden md:grid grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,1fr)] rounded-2xl border border-[#e3e2de] overflow-hidden shadow-[0_8px_32px_rgba(130,112,100,0.10)]">

              {/* Header row */}
              <div className="px-8 lg:px-10 pt-10 pb-8 flex flex-col justify-end border-b border-[#e3e2de]">
                <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#a0948a] mb-3">What's included</p>
                <h3 className="about-heading text-2xl lg:text-[1.9rem] font-semibold text-[#3d3028] leading-tight">
                  One curriculum.<br />Two ways to learn it.
                </h3>
              </div>
              {PATH_PLANS.map((plan, p) => {
                const vip = p === 1
                return (
                  <div
                    key={plan.title}
                    className={vip
                      ? 'px-8 lg:px-10 pt-10 pb-8 bg-[#2a1a0e] border-b border-white/10'
                      : 'px-8 lg:px-10 pt-10 pb-8 border-l border-b border-[#e3e2de]'}
                  >
                    <p className={`text-[0.68rem] uppercase tracking-[0.28em] mb-4 ${vip ? 'text-[#c9bcb1]' : 'text-[#a0948a]'}`}>{plan.label}</p>
                    <h3 className={`about-heading text-2xl lg:text-[1.9rem] font-semibold leading-tight mb-3 ${vip ? 'text-[#f6f2ec]' : 'text-[#3d3028]'}`}>{plan.title}</h3>
                    <p className={`text-sm leading-relaxed mb-6 ${vip ? 'text-[#f6f2ec]/75' : 'text-[#5a5047]'}`}>{plan.subtitle}</p>
                    {pathValue(p) && (
                      <p className={`text-sm line-through mb-1 ${vip ? 'text-[#f6f2ec]/45' : 'text-[#a0948a]'}`}>Value {pathValue(p)}</p>
                    )}
                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-[2.75rem] font-semibold leading-none ${vip ? 'text-[#f6f2ec]' : 'text-[#3d3028]'}`}>{pathPrice(p)}</span>
                      <span className={`text-sm ml-1 ${vip ? 'text-[#f6f2ec]/70' : 'text-[#5a5047]'}`}>CAD</span>
                    </div>
                  </div>
                )
              })}

              {/* Course rows */}
              {singleModuleData.map((mod, i) => (
                <Fragment key={i}>
                  <div className="px-8 lg:px-10 py-4 flex items-center justify-between gap-4 border-b border-[#e3e2de]">
                    <span className="text-sm text-[#3d3028]">{moduleProducts[i]?.title ?? mod.name}</span>
                    <span className="text-sm text-[#a0948a] shrink-0">{moduleProducts[i] ? formatPrice(moduleProducts[i]!.price) : ''}</span>
                  </div>
                  <div className="flex items-center justify-center border-l border-b border-[#e3e2de]">
                    <Check size={16} strokeWidth={1.75} className="text-[#827064]" aria-label="Included" />
                  </div>
                  <div className="flex items-center justify-center bg-[#2a1a0e] border-b border-white/10">
                    <Check size={16} strokeWidth={1.75} className="text-[#f6f2ec]" aria-label="Included" />
                  </div>
                </Fragment>
              ))}

              {/* VIP-only rows */}
              {VIP_EXTRAS.map((extra) => (
                <Fragment key={extra.name}>
                  <div className="px-8 lg:px-10 py-4 flex items-center justify-between gap-4 bg-[#f6f2ec] border-b border-[#e3e2de]">
                    <span className="text-sm font-semibold text-[#3d3028]">{extra.name}</span>
                    {extra.price && <span className="text-sm text-[#827064] shrink-0">{extra.price}</span>}
                  </div>
                  <div className="flex items-center justify-center border-l border-b border-[#e3e2de]">
                    <Minus size={14} strokeWidth={1.5} className="text-[#a0948a]" aria-label="Not included" />
                  </div>
                  <div className="flex items-center justify-center bg-[#3d3028] border-b border-white/10">
                    <Check size={16} strokeWidth={1.75} className="text-[#f6f2ec]" aria-label="Included" />
                  </div>
                </Fragment>
              ))}

              {/* Ideal-for row + enroll */}
              <div className="px-8 lg:px-10 py-8">
                <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#a0948a]">Ideal for the artist who</p>
              </div>
              {PATH_PLANS.map((plan, p) => {
                const vip = p === 1
                const product = shopifyProducts[p]
                return (
                  <div
                    key={plan.title}
                    className={vip ? 'px-8 lg:px-10 py-8 bg-[#2a1a0e] flex flex-col' : 'px-8 lg:px-10 py-8 border-l border-[#e3e2de] flex flex-col'}
                  >
                    <ul className="flex flex-col gap-3 mb-8">
                      {plan.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2.5">
                          <span className={`mt-[8px] w-1 h-1 rounded-full shrink-0 ${vip ? 'bg-[#c9bcb1]' : 'bg-[#a0948a]'}`} />
                          <span className={`text-sm leading-relaxed ${vip ? 'text-[#f6f2ec]/80' : 'text-[#5a5047]'}`}>{b}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleEnroll(product)}
                      disabled={!product || enrolling === product.id}
                      className={`mt-auto w-full py-3.5 rounded-xl text-[0.72rem] uppercase tracking-[0.2em] font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${vip
                        ? 'bg-[#f6f2ec] text-[#2a1a0e] hover:bg-white'
                        : 'bg-[#3d3028] text-white hover:bg-[#2a1a0e]'}`}
                    >
                      {product && enrolling === product.id ? 'Processing…' : 'Enroll Now'}
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Stacked cards (below md) */}
            <div className="md:hidden flex flex-col gap-6">
              {PATH_PLANS.map((plan, p) => {
                const vip = p === 1
                const product = shopifyProducts[p]
                const rows = [
                  ...singleModuleData.map((mod, i) => ({ name: moduleProducts[i]?.title ?? mod.name, included: true, extra: false })),
                  ...VIP_EXTRAS.map((extra) => ({ name: extra.name, included: vip, extra: true })),
                ]
                return (
                  <div
                    key={plan.title}
                    className={vip
                      ? 'rounded-2xl bg-[#2a1a0e] p-7 shadow-[0_12px_40px_rgba(42,26,14,0.25)]'
                      : 'rounded-2xl border border-[#e3e2de] bg-white p-7 shadow-[0_8px_32px_rgba(130,112,100,0.10)]'}
                  >
                    <p className={`text-[0.68rem] uppercase tracking-[0.28em] mb-3 ${vip ? 'text-[#c9bcb1]' : 'text-[#a0948a]'}`}>{plan.label}</p>
                    <h3 className={`about-heading text-2xl font-semibold leading-tight mb-3 ${vip ? 'text-[#f6f2ec]' : 'text-[#3d3028]'}`}>{plan.title}</h3>
                    <p className={`text-sm leading-relaxed mb-5 ${vip ? 'text-[#f6f2ec]/75' : 'text-[#5a5047]'}`}>{plan.subtitle}</p>
                    {pathValue(p) && (
                      <p className={`text-sm line-through mb-1 ${vip ? 'text-[#f6f2ec]/45' : 'text-[#a0948a]'}`}>Value {pathValue(p)}</p>
                    )}
                    <div className="flex items-baseline gap-1.5 mb-6">
                      <span className={`text-[2.5rem] font-semibold leading-none ${vip ? 'text-[#f6f2ec]' : 'text-[#3d3028]'}`}>{pathPrice(p)}</span>
                      <span className={`text-sm ml-1 ${vip ? 'text-[#f6f2ec]/70' : 'text-[#5a5047]'}`}>CAD</span>
                    </div>

                    <ul className={`border-t ${vip ? 'border-white/10' : 'border-[#e3e2de]'}`}>
                      {rows.map((row) => (
                        <li
                          key={row.name}
                          className={`flex items-center gap-3 py-3 border-b text-sm ${vip ? 'border-white/10' : 'border-[#e3e2de]'} ${
                            row.included
                              ? vip ? 'text-[#f6f2ec]' : 'text-[#3d3028]'
                              : 'text-[#a0948a] line-through decoration-[#d6cec8]'
                          } ${row.extra && row.included ? 'font-semibold' : ''}`}
                        >
                          {row.included
                            ? <Check size={15} strokeWidth={1.75} className={`shrink-0 ${vip ? 'text-[#f6f2ec]' : 'text-[#827064]'}`} aria-label="Included" />
                            : <Minus size={13} strokeWidth={1.5} className="shrink-0 text-[#a0948a]" aria-label="Not included" />}
                          {row.name}
                        </li>
                      ))}
                    </ul>

                    <p className={`mt-6 mb-3 text-[0.68rem] uppercase tracking-[0.22em] ${vip ? 'text-[#c9bcb1]' : 'text-[#a0948a]'}`}>Ideal for the artist who</p>
                    <ul className="flex flex-col gap-2.5">
                      {plan.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2.5">
                          <span className={`mt-[8px] w-1 h-1 rounded-full shrink-0 ${vip ? 'bg-[#c9bcb1]' : 'bg-[#a0948a]'}`} />
                          <span className={`text-sm leading-relaxed ${vip ? 'text-[#f6f2ec]/80' : 'text-[#5a5047]'}`}>{b}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleEnroll(product)}
                      disabled={!product || enrolling === product.id}
                      className={`mt-7 w-full py-3.5 rounded-xl text-[0.72rem] uppercase tracking-[0.2em] font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${vip
                        ? 'bg-[#f6f2ec] text-[#2a1a0e] hover:bg-white'
                        : 'bg-[#3d3028] text-white hover:bg-[#2a1a0e]'}`}
                    >
                      {product && enrolling === product.id ? 'Processing…' : 'Enroll Now'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Curriculum Section ──────────────────────────────────── */}
      <section id="curriculum" className="bg-white flex items-start">

        {/* Left: sticky image panel */}
        <div className="hidden lg:block w-[42%] flex-shrink-0 sticky top-0 h-screen overflow-hidden relative">
          <p className="absolute top-6 left-6 z-10 text-[0.58rem] uppercase tracking-[0.32em] text-white/80 font-light">
            MJP Beauty · Curriculum
          </p>
          <img
            src={curriculumImg(900)}
            srcSet={toSrcSet(curriculumImg, [700, 900, 1024])}
            sizes="max(42vw, 67vh)"
            alt="MJP Beauty Curriculum"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-[#1a0e08]/20" />
          <div className="absolute bottom-10 left-6 z-10 backdrop-blur-md bg-white/15 border border-white/25 px-6 py-5">
            <p className="text-white font-semibold text-[1.35rem] leading-snug">
              39 modules.<br />Mapped out, in full.
            </p>
          </div>
        </div>

        {/* Right: curriculum content */}
        <div className="flex-1 min-w-0 py-14 px-8 lg:px-14 xl:px-16 min-h-screen">

          {/* Header */}
          <div className="mb-10 anim-fade-up">
            <p className="text-[0.72rem] uppercase tracking-[0.3em] text-[#a0948a] mb-4">
              What's Inside
            </p>
            <h2 className="about-heading leading-tight text-[#3d3028] mb-4" style={{ fontSize: 'clamp(1.9rem, 2.8vw, 2.7rem)' }}>
              An overview of everything<br />
              <span className="text-[#827064]">you'll master.</span>
            </h2>
            <p className="text-[#5a5047] text-sm sm:text-base leading-relaxed max-w-lg">
              No gatekeeping here — every module, mapped out so you know exactly what's covered.
            </p>
          </div>

          {/* Tabs + Module list: tabs scroll horizontally above the list on mobile, sidebar from md */}
          <div className="flex flex-col md:flex-row gap-0 anim-fade-up" style={{ transitionDelay: '0.15s' }}>

            {/* Sidebar tabs */}
            <div className="relative flex md:flex-col overflow-x-auto md:overflow-visible -mx-8 px-5 md:mx-0 md:px-0 md:pr-6 mb-6 md:mb-0 border-b md:border-b-0 md:border-r border-[#d8d0c8] md:min-w-[160px] shrink-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {/* Sliding active indicator (sidebar only) */}
              <div
                className="hidden md:block absolute left-0 w-0.5 bg-[#b07b5a] transition-[top,height] duration-300 ease-in-out"
                style={{ top: indicatorStyle.top, height: indicatorStyle.height }}
              />
              {curriculumParts.map((part, i) => (
                <button
                  key={i}
                  ref={el => { tabRefs.current[i] = el }}
                  onClick={() => setActivePart(i)}
                  className={[
                    'text-left shrink-0 whitespace-nowrap md:whitespace-normal py-3 px-3 md:py-2.5 md:pr-0 border-b-2 md:border-b-0 transition-all duration-200 flex flex-col gap-0.5',
                    activePart === i ? 'border-[#b07b5a]' : 'border-transparent',
                  ].join(' ')}
                >
                  <span className={[
                    'text-[0.9rem] transition-colors duration-200',
                    activePart === i ? 'text-[#3d3028] font-medium' : 'text-[#a0948a] font-normal',
                  ].join(' ')}>
                    {part.tab}
                  </span>
                  {part.tabSub && (
                    <span className={[
                      'hidden md:block text-[0.67rem] transition-colors duration-200',
                      activePart === i ? 'text-[#827064]' : 'text-[#c4b8b0]',
                    ].join(' ')}>
                      {part.tabSub}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Module content */}
            <div className="flex-1 md:pl-8 min-w-0">
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[#827064] mb-1">
                {curriculumParts[activePart].partLabel}
              </p>
              <h3 className="text-xl sm:text-2xl font-semibold text-[#3d3028] mb-5">
                {curriculumParts[activePart].title}
              </h3>

              {/* Modules list */}
              {curriculumParts[activePart].type === 'modules' && (
                <div className="flex flex-col">
                  {curriculumParts[activePart].modules.map((mod, i) => (
                    <div key={i} className="flex items-start gap-5 py-3.5 border-b border-[#e3ddd8] last:border-b-0">
                      <span className="text-[0.67rem] font-medium text-[#827064] min-w-[52px] mt-0.5 shrink-0">{mod.num}</span>
                      <span className="text-[#3d3028] text-sm leading-relaxed">{mod.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Business & Brows */}
              {curriculumParts[activePart].type === 'business' && (
                <div>
                  <p className="text-[#5a5047] text-sm leading-relaxed mb-5">
                    {curriculumParts[activePart].description}
                  </p>
                  <div className="flex flex-col">
                    {curriculumParts[activePart].bullets.map((b, i) => (
                      <div key={i} className="flex items-start gap-3.5 py-3.5 border-b border-[#e3ddd8] last:border-b-0">
                        <span className="mt-[6px] w-1.5 h-1.5 rounded-full bg-[#b07b5a] shrink-0" />
                        <span className="text-[#3d3028] text-sm leading-relaxed">{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bonuses */}
              {curriculumParts[activePart].type === 'bonuses' && (
                <div className="flex flex-col">
                  {curriculumParts[activePart].items.map((item, i) => (
                    <div key={i} className="py-3.5 border-b border-[#e3ddd8] last:border-b-0">
                      <p className="text-[#3d3028] text-sm font-medium leading-snug">{item.label}</p>
                      {item.sub && (
                        <p className="text-[#827064] text-xs leading-relaxed mt-0.5">{item.sub}</p>
                      )}
                      {item.bullets && (
                        <ul className="mt-2 flex flex-col gap-1">
                          {item.bullets.map((b, j) => (
                            <li key={j} className="flex items-start gap-2.5">
                              <span className="mt-[5px] w-1 h-1 rounded-full bg-[#b07b5a] shrink-0" />
                              <span className="text-[#5a5047] text-xs leading-relaxed">{b}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      <InstagramReels reels={REELS} />

      <CourseReviewsSection options={reviewOptions} />

      <OnlineFaqSection />

      <BackToTop />
    </main>
  )
}
