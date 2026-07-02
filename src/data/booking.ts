import type { Service } from '../types/booking'

const browLamImg1 = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_700/v1783028342/brow-lm-img-01_pnidos.jpg'
const browLamImg2 = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_700/v1783028342/brow-lm-img-02_rmqbae.jpg'
const browStImg1  = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_700/v1783028351/brow-st-img-01_v5ms1d.jpg'
const browStImg2  = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_700/v1783028351/brow-st-img-02_knrsde.jpg'
const browWtImg1  = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_700/v1783028361/brow-wt-img-01_pijrj8.jpg'
const browWtImg2  = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_700/v1783028360/brow-wt-img-02_i0fu0d.jpg'
const keratinImg1 = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_700/v1783028371/keratin-lt-img-01_bwcm5l.jpg'
const keratinImg2 = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_700/v1783028372/keratin-lt-img-02_hoxajf.jpg'

const browLamVid = 'https://res.cloudinary.com/dr9nm40gf/video/upload/q_auto/f_auto/v1781343234/brow-lm-vid-01_isylz1.mp4'
const browWtVid  = 'https://res.cloudinary.com/dr9nm40gf/video/upload/q_auto/f_auto/v1781343535/brow-wt-vid-01_jladew.mp4'
const keratinVid = 'https://res.cloudinary.com/dr9nm40gf/video/upload/q_auto/f_auto/v1781343313/keratin-lt-vid-01_cuveqw.mp4'

export const SERVICES: Service[] = [
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
    video: keratinVid,
  },
]

export const FAQ_DATA = [
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

export const AFTERCARE_DATA = [
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
