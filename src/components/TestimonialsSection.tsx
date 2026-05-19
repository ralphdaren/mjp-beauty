import { useState, useEffect, useRef } from 'react'
import r0219  from '@/assets/home/reviews/IMG_0219.jpg'
import r0284  from '@/assets/home/reviews/IMG_0284.jpg'
import r0285  from '@/assets/home/reviews/IMG_0285.jpg'
import r0287  from '@/assets/home/reviews/IMG_0287.jpg'
import r0868  from '@/assets/home/reviews/IMG_0868.jpg'
import r1062  from '@/assets/home/reviews/IMG_1062.jpg'
import r1063  from '@/assets/home/reviews/IMG_1063.jpg'
import r1069  from '@/assets/home/reviews/IMG_1069.jpg'
import r1277  from '@/assets/home/reviews/IMG_1277.jpg'
import r1650  from '@/assets/home/reviews/IMG_1650.jpg'
import r1946  from '@/assets/home/reviews/IMG_1946.jpg'
import r2138  from '@/assets/home/reviews/IMG_2138.jpg'
import r2149  from '@/assets/home/reviews/IMG_2149.jpg'
import r2155  from '@/assets/home/reviews/IMG_2155.jpg'
import r2840  from '@/assets/home/reviews/IMG_2840.jpg'
import r3283  from '@/assets/home/reviews/IMG_3283.jpg'
import r3328  from '@/assets/home/reviews/IMG_3328.jpg'
import r3433  from '@/assets/home/reviews/IMG_3433.jpg'
import r3435  from '@/assets/home/reviews/IMG_3435.jpg'
import r3493  from '@/assets/home/reviews/IMG_3493.jpg'
import r3495  from '@/assets/home/reviews/IMG_3495.jpg'
import r3547  from '@/assets/home/reviews/IMG_3547.jpg'
import r3684  from '@/assets/home/reviews/IMG_3684.jpg'
import r4393  from '@/assets/home/reviews/IMG_4393.jpg'
import r4395  from '@/assets/home/reviews/IMG_4395.jpg'
import r4399  from '@/assets/home/reviews/IMG_4399.jpg'
import r4467  from '@/assets/home/reviews/IMG_4467.jpg'
import r4468  from '@/assets/home/reviews/IMG_4468.jpg'
import r4830  from '@/assets/home/reviews/IMG_4830 2.jpg'
import r4983  from '@/assets/home/reviews/IMG_4983.jpg'
import r5509  from '@/assets/home/reviews/IMG_5509.jpg'
import r5898  from '@/assets/home/reviews/IMG_5898.jpg'
import r6018  from '@/assets/home/reviews/IMG_6018.jpg'
import r6911  from '@/assets/home/reviews/IMG_6911.jpg'
import r6978  from '@/assets/home/reviews/IMG_6978.jpg'
import r7025  from '@/assets/home/reviews/IMG_7025.jpg'
import r7057  from '@/assets/home/reviews/IMG_7057.jpg'
import r7586  from '@/assets/home/reviews/IMG_7586.jpg'
import r7587  from '@/assets/home/reviews/IMG_7587.jpg'
import r7887  from '@/assets/home/reviews/IMG_7887.jpg'
import r7910  from '@/assets/home/reviews/IMG_7910.jpg'
import r8410  from '@/assets/home/reviews/IMG_8410.jpg'
import r8457  from '@/assets/home/reviews/IMG_8457.jpg'
import r8459  from '@/assets/home/reviews/IMG_8459.jpg'
import r8463  from '@/assets/home/reviews/IMG_8463.jpg'
import r8676  from '@/assets/home/reviews/IMG_8676.jpg'
import r8677  from '@/assets/home/reviews/IMG_8677.jpg'
import r8801  from '@/assets/home/reviews/IMG_8801.jpg'
import r9366a from '@/assets/home/reviews/IMG_9366(1).jpg'
import r9366  from '@/assets/home/reviews/IMG_9366.jpg'
import r9598  from '@/assets/home/reviews/IMG_9598.jpg'
import r9757  from '@/assets/home/reviews/IMG_9757.jpg'

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
