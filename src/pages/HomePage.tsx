import { NavLink } from 'react-router-dom'
import headVid from '@/assets/home/home-head-vid.mp4'
import '@/styles/HomePage.css'

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section className="hero-section">
        {/* Background video */}
        <video
          className="hero-video"
          src={headVid}
          autoPlay
          muted
          loop
          playsInline
        />

        {/* Dark overlay */}
        <div className="hero-overlay" />

        {/* Text content */}
        <div className="hero-content">
          <p className="text-sm tracking-[0.25em] uppercase text-white/70 mb-4 font-light">
            MJP Beauty
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-white leading-tight max-w-2xl">
            WELCOMES YOU
          </h1>
          <p className="mt-5 text-base sm:text-lg text-white/75 max-w-md font-light leading-relaxed">
            ARE YOU HERE TO GLOW OR GROW?
          </p>
        </div>

        {/* Subtle bottom fade into page background */}
        <div className="hero-bottom-fade" />
      </section>
    </main>
  )
}
