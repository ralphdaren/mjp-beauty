import { useState, useEffect, useRef } from 'react'

const CLOUD = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_500'

const r0219  = `${CLOUD}/v1783028081/IMG_0219_obw3tj.jpg`
const r0284  = `${CLOUD}/v1783028107/IMG_0284_b8orbn.jpg`
const r0285  = `${CLOUD}/v1783028078/IMG_0285_twxtcw.jpg`
const r0287  = `${CLOUD}/v1783028095/IMG_0287_apjy8k.jpg`
const r0868  = `${CLOUD}/v1783028074/IMG_0868_k0tnna.jpg`
const r1062  = `${CLOUD}/v1783028085/IMG_1062_zltgls.jpg`
const r1063  = `${CLOUD}/v1783028088/IMG_1063_nl4ko7.jpg`
const r1069  = `${CLOUD}/v1783028114/IMG_1069_qmmw5o.jpg`
const r1277  = `${CLOUD}/v1783028099/IMG_1277_ijl11a.jpg`
const r1650  = `${CLOUD}/v1783028111/IMG_1650_nrpwxz.jpg`
const r1946  = `${CLOUD}/v1783028103/IMG_1946_l7qiio.jpg`
const r2138  = `${CLOUD}/v1783028118/IMG_2138_mib1wi.jpg`
const r2149  = `${CLOUD}/v1783028092/IMG_2149_l8p7rm.jpg`
const r2155  = `${CLOUD}/v1783028121/IMG_2155_gxex2s.jpg`
const r2840  = `${CLOUD}/v1783028125/IMG_2840_tbtxo5.jpg`
const r3283  = `${CLOUD}/v1783028129/IMG_3283_z767b2.jpg`
const r3328  = `${CLOUD}/v1783028132/IMG_3328_jayffp.jpg`
const r3433  = `${CLOUD}/v1783028136/IMG_3433_niob9y.jpg`
const r3435  = `${CLOUD}/v1783028140/IMG_3435_usmpnz.jpg`
const r3493  = `${CLOUD}/v1783028143/IMG_3493_nq0sfa.jpg`
const r3495  = `${CLOUD}/v1783028147/IMG_3495_xfs5oa.jpg`
const r3547  = `${CLOUD}/v1783028150/IMG_3547_tew9xj.jpg`
const r3684  = `${CLOUD}/v1783028154/IMG_3684_opvfub.jpg`
const r4393  = `${CLOUD}/v1783028158/IMG_4393_oialhb.jpg`
const r4395  = `${CLOUD}/v1783028162/IMG_4395_z0apel.jpg`
const r4399  = `${CLOUD}/v1783028166/IMG_4399_gjfcyw.jpg`
const r4467  = `${CLOUD}/v1783028169/IMG_4467_usyykg.jpg`
const r4468  = `${CLOUD}/v1783028172/IMG_4468_svpo6y.jpg`
const r4830  = `${CLOUD}/v1783028175/IMG_4830_2_py6fqm.jpg`
const r4983  = `${CLOUD}/v1783028180/IMG_4983_cbauud.jpg`
const r5509  = `${CLOUD}/v1783028183/IMG_5509_xbfj6u.jpg`
const r5898  = `${CLOUD}/v1783028186/IMG_5898_nbyl2c.jpg`
const r6018  = `${CLOUD}/v1783028190/IMG_6018_lcasfi.jpg`
const r6911  = `${CLOUD}/v1783028194/IMG_6911_rhi8o5.jpg`
const r6978  = `${CLOUD}/v1783028197/IMG_6978_tsunmg.jpg`
const r7025  = `${CLOUD}/v1783028202/IMG_7025_kga608.jpg`
const r7057  = `${CLOUD}/v1783028204/IMG_7057_r9k9ui.jpg`
const r7586  = `${CLOUD}/v1783028214/IMG_7586_cfrzru.jpg`
const r7587  = `${CLOUD}/v1783028207/IMG_7587_pdyfok.jpg`
const r7887  = `${CLOUD}/v1783028211/IMG_7887_qlgnjq.jpg`
const r7910  = `${CLOUD}/v1783028217/IMG_7910_eiadof.jpg`
const r8410  = `${CLOUD}/v1783028224/IMG_8410_tvudqf.jpg`
const r8457  = `${CLOUD}/v1783028221/IMG_8457_gr8nzq.jpg`
const r8459  = `${CLOUD}/v1783028232/IMG_8459_yrrkja.jpg`
const r8463  = `${CLOUD}/v1783028228/IMG_8463_ehfgt9.jpg`
const r8676  = `${CLOUD}/v1783028235/IMG_8676_fhxlox.jpg`
const r8677  = `${CLOUD}/v1783028239/IMG_8677_jxive8.jpg`
const r8801  = `${CLOUD}/v1783028246/IMG_8801_brjxtg.jpg`
const r9366a = `${CLOUD}/v1783028250/IMG_9366_1_lqkkiz.jpg`
const r9366  = `${CLOUD}/v1783028243/IMG_9366_sjwcjn.jpg`
const r9598  = `${CLOUD}/v1783028253/IMG_9598_geqblb.jpg`
const r9757  = `${CLOUD}/v1783028257/IMG_9757_n2aurr.jpg`

const allImages: string[] = [
  r0219, r0284, r0285, r0287, r0868,
  r1062, r1063, r1069, r1277, r1650,
  r1946, r2138, r2149, r2155, r2840,
  r3283, r3328, r3433, r3435, r3493,
  r3495, r3547, r3684, r4393, r4395,
  r4399, r4467, r4468, r4830, r4983,
  r5509, r5898, r6018, r6911, r6978,
  r7025, r7057, r7586, r7587, r7887,
  r7910, r8410, r8457, r8459, r8463,
  r8676, r8677, r8801, r9366a, r9366,
  r9598, r9757,
]

const NUM_COLS = 4
const columns: string[][] = Array.from({ length: NUM_COLS }, () => [])
allImages.forEach((img, i) => columns[i % NUM_COLS].push(img))

const DURATIONS = [40, 55, 34, 48]

function ScrollColumn({ images, duration }: { images: string[]; duration: number }) {
  const [ready, setReady] = useState(false)
  const [hovered, setHovered] = useState(false)
  const innerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = innerRef.current
    if (!el) return

    // Only watch the first copy of images — once they're decoded the height is stable
    const imgs = Array.from(el.querySelectorAll('img')).slice(0, images.length)
    let pending = imgs.filter(img => !img.complete).length

    const start = () => requestAnimationFrame(() => setReady(true))

    if (pending === 0) {
      start()
      return
    }

    const onDone = () => {
      pending--
      if (pending <= 0) start()
    }

    imgs.forEach(img => {
      if (!img.complete) {
        img.addEventListener('load', onDone, { once: true })
        img.addEventListener('error', onDone, { once: true })
      }
    })

    return () => {
      imgs.forEach(img => {
        img.removeEventListener('load', onDone)
        img.removeEventListener('error', onDone)
      })
    }
  }, [images.length])

  return (
    <div
      className="reviews-column"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        ref={innerRef}
        className="reviews-column-inner"
        style={{
          animationDuration: `${duration}s`,
          animationPlayState: ready && !hovered ? 'running' : 'paused',
        }}
      >
        {[...images, ...images, ...images, ...images].map((src, i) => (
          <img
            key={i}
            src={src}
            alt="Student review"
            className="reviews-img"
            draggable={false}
            loading="lazy"
            decoding="async"
          />
        ))}
      </div>
    </div>
  )
}

export default function TestimonialsSection() {
  return (
    <section className="testimonials-section">
      <div className="anim-fade-up testimonials-header">
        <p className="testimonials-eyebrow">STUDENT STORIES</p>
        <h2 className="about-heading testimonials-heading">
          Real Results from{' '}
          <span className="text-[#827064]">Real Students</span>
        </h2>
        <p className="testimonials-subtext">
          From first strokes to fully booked — see what our students are creating
          after training with MJP Beauty.
        </p>
      </div>

      <div className="reviews-grid">
        {columns.map((imgs, idx) => (
          <ScrollColumn key={idx} images={imgs} duration={DURATIONS[idx]} />
        ))}
      </div>
    </section>
  )
}
