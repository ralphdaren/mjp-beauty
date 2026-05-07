import headVid from '@/assets/home/home-head-vid.mp4'
import aboutImg from '@/assets/home/about-me.jpg'
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
      </section>

      <section className="about-section">
        <div className="section-heading">
          <p className="about-eyebrow">GET TO KNOW ME</p>
          <h2 className="about-title">
            Meet The Face Behind <span>MJP beauty</span>
          </h2>
        </div>

        <div className="about-content">
          <div className="about-visual">
            <div className="about-image-wrapper">
              <img src={aboutImg} alt="Micah portrait" />
            </div>
            <p className="about-role">FOUNDER • EDUCATOR</p>
          </div>

          <div className="about-copy">
            <div className="about-heading-group">
              <h3>Hi I'm Micah</h3>
              <p className="about-subtitle">Brow Artist & Leading Brow Educator in Canada</p>
            </div>

            <p className="about-description">
              Welcome to MJP Beauty — where we don't just shape brows, we shape standards.
            </p>
            <p className="about-description">
              I'm the founder of MJP Beauty, a dedicated Brow Artist specializing in natural results. After eight years in the beauty industry and training students across North America, my mission is clear: to raise the bar in brow education.
            </p>
            <p className="about-description">
              Whether you're here for luxury brow services or ready to grow your skills through pro-level training, MJP Beauty is where confidence begins — with craft, care, and community.
            </p>

            <div className="about-divider" />
            <div className="about-stats">
              <div className="about-stat">
                <span>8+</span>
                <p>YEARS EXPERIENCED</p>
              </div>
              <div className="about-stat">
                <span>450+</span>
                <p>STUDENTS TRAINED</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
