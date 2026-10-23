import { IP_HEAD_IMG, IP_HEAD_IMG_SRCSET, IP_HEAD_PORTRAIT_IMG_SRCSET } from '@/data/training'

export default function TrainingHero() {
  return (
    <section className="hero-section">
      <picture>
        <source media="(orientation: portrait)" srcSet={IP_HEAD_PORTRAIT_IMG_SRCSET} sizes="100vw" />
        {/* object-cover on a ~2.1:1 image: rendered width is the larger of 100vw and 209vh */}
        <img
          src={IP_HEAD_IMG}
          srcSet={IP_HEAD_IMG_SRCSET}
          sizes="max(100vw, 209vh)"
          alt="In-Person Training"
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
          An Elevated In-Person Brow Training Experience
        </h1>
        <p className="hero-tagline mt-5 text-base sm:text-lg text-white/75 max-w-xl tracking-[0.08em] font-light leading-relaxed">
          With Canada's Leading Brow Educator
        </p>
      </div>
    </section>
  )
}
