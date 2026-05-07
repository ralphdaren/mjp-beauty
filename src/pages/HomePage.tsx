import headVid from '@/assets/home/home-head-vid.mp4'
import aboutImg from '@/assets/home/about-me.jpg'
import '@/styles/HomePage.css'

export default function Home() {
  return (
    <main>
      {/* Landing Hero Section */}
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
          <p className="mt-5 text-base sm:text-lg text-white/75 max-w-md tracking-[0.1em] font-light leading-relaxed">
            ARE YOU HERE TO GLOW OR GROW?
          </p>
        </div>
      </section>

      {/* About Me Section */}
      <section className="bg-[color:var(--background)] text-[color:var(--foreground)] py-20 px-6 md:px-8">
        <div className="mx-auto mb-12 max-w-4xl text-center">
          <p className="mb-3 text-[0.75rem] uppercase tracking-[0.28em] text-[color:var(--muted-foreground)]">
            GET TO KNOW ME
          </p>
          <h2 className="text-3xl font-semibold leading-tight text-[color:var(--foreground)] sm:text-4xl md:text-[2.8rem]">
            Meet The Face Behind <span className="text-[color:var(--primary)]">MJP beauty</span>
          </h2>
        </div>

        <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-2 lg:gap-14">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="w-full max-w-[320px] min-h-[20rem] overflow-hidden rounded-t-[48%] rounded-b-none border border-white/20 shadow-[0_28px_70px_rgba(0,0,0,0.14)]">
              <img className="h-full w-full object-cover" src={aboutImg} alt="Micah portrait" />
            </div>
            <p className="m-0 text-sm uppercase tracking-[0.3em] text-[color:var(--muted-foreground)]">
              FOUNDER • EDUCATOR
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <h3 className="m-0 text-2xl font-semibold leading-tight text-[color:var(--foreground)] sm:text-3xl md:text-[2.2rem]">
                Hi I'm Micah
              </h3>
              <p className="mt-3 text-base leading-7 text-[color:var(--muted-foreground)]">
                Brow Artist & Leading Brow Educator in Canada
              </p>
            </div>

            <p className="m-0 max-w-2xl text-sm leading-[1.9] text-[color:var(--foreground)] sm:text-base">
              Welcome to MJP Beauty — where we don't just shape brows, we shape standards.
            </p>
            <p className="m-0 max-w-2xl text-sm leading-[1.9] text-[color:var(--foreground)] sm:text-base">
              I'm the founder of MJP Beauty, a dedicated Brow Artist specializing in natural results. After eight years in the beauty industry and training students across North America, my mission is clear: to raise the bar in brow education.
            </p>
            <p className="m-0 max-w-2xl text-sm leading-[1.9] text-[color:var(--foreground)] sm:text-base">
              Whether you're here for luxury brow services or ready to grow your skills through pro-level training, MJP Beauty is where confidence begins — with craft, care, and community.
            </p>

            <div className="h-px w-full bg-black/10" />
            <div className="flex flex-wrap gap-8">
              <div className="flex flex-col gap-2">
                <span className="text-3xl font-semibold text-[color:var(--foreground)]">8+</span>
                <p className="m-0 text-[0.75rem] uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                  YEARS EXPERIENCED
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-3xl font-semibold text-[color:var(--foreground)]">450+</span>
                <p className="m-0 text-[0.75rem] uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                  STUDENTS TRAINED
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
