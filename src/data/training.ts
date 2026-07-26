import type { FlipPerk, PerkKey, TrainingFormatItem, TrainingOptionCard } from '../types/training'

// ─── Imagery ──────────────────────────────────────────────────────────────────

export const IP_HEAD_IMG    = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_1600/v1783028022/ip-head_djhc92.jpg'
export const BROW_GUIDE_IMG = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_500/v1783028296/freebie-05_xqncqj.png'
export const PERK_01_IMG    = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_600/v1783027997/perk-01_g3rwy8.jpg'
export const PERK_02_IMG    = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_700/v1783028018/perk-02_qmp0qf.jpg'

const formatImg01 = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_800/v1783028008/format-img-01_oxprvi.jpg'
const formatImg02 = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_800/v1783028001/format-img-02_rb0b1z.jpg'
const formatImg03 = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_800/v1783028011/format-img-03_wixz0f.jpg'
const optImg01    = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_600/v1783028004/opt-img-01_yy8i3c.jpg'
const optImg02    = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_600/v1783028014/opt-img-02_pyljws.jpg'

// ─── "This is for you if ..." carousel ────────────────────────────────────────

export const IDEAL_FOR_ITEMS = [
  'You are ready to turn your passion into a real career. You are a complete beginner who does not want to piece together free tutorials or settle for basic education—you want to build your brow business on the right foundation and feel confident working on paying clients from the start.',
  'You are tired of feeling like your brow work isn\'t reaching its full potential. You know you are capable of more, but you are craving advanced techniques, better customization, and the confidence to create results that keep clients coming back and referring everyone they know.',
  'You are already in the beauty industry and want to increase your income without starting over. Whether you are a lash artist, makeup artist, or esthetician, you are ready to add one of the industry\'s most requested services to your menu so you can attract more clients, increase your revenue, and grow a more profitable business.',
]

// ─── "How it Works" ───────────────────────────────────────────────────────────

export const FORMAT_ITEMS: TrainingFormatItem[] = [
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

// ─── "Choose Your Path" ───────────────────────────────────────────────────────

export const OPTION_CARDS: TrainingOptionCard[] = [
  {
    id: 'group',
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
    id: 'private',
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

// ─── Student perks ────────────────────────────────────────────────────────────

export const KIT_ITEMS = [
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

export const FLIP_PERKS: Record<PerkKey, FlipPerk> = {
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

// ─── Training information tabs ────────────────────────────────────────────────

export const ENROLL_STEPS = [
  'Choose and decide based on our availability by clicking the “View All Available Dates” button to show our training calendar.',
  'Choose your preferred training style by clicking the “Book Now” button.',
  'Follow the prompt to submit your $500 non-refundable deposit.',
  'Wait for your confirmation and welcome e-mail from MJP Beauty.',
  'Begin your journey and gain immediate access to the online training!',
]

/** Alumni Instagram handles linked from the FAQ. */
export const STUDENT_WORK = [
  { name: 'Micah',    handle: '@micahkeziah.beauty', url: 'https://www.instagram.com/micahkeziah.beauty/', note: 'Beginner, certified October 2023' },
  { name: 'Charis',   handle: '@enamouredby.ca',     url: 'https://www.instagram.com/enamouredby.cha/',    note: 'Beginner, certified July 2025' },
  { name: 'Jonalene', handle: '@jrg.aesthetics',     url: 'https://www.instagram.com/jrg.aesthetics/',     note: 'Beginner, certified February 2023' },
  { name: 'Eunice',   handle: '@bushystudio',        url: 'https://www.instagram.com/bushystudio/',        note: 'Beginner, certified November 2025' },
  { name: 'Miranda',  handle: '@mbartistryco',       url: 'https://www.instagram.com/mbartistryco/',       note: 'Intermediate, certified July 2025' },
  { name: 'Steph',    handle: '@softbrowedit',       url: 'https://www.instagram.com/softbrowedit/',       note: 'Intermediate, certified March 2026' },
  { name: 'Bianca',   handle: '@prettylashesbyb',    url: 'https://www.instagram.com/prettylashesbyb/',    note: 'Beginner, certified May 2026' },
]
