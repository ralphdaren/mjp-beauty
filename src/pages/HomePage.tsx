import headVid from '@/assets/home/home-head-vid.mp4'
import aboutImg from '@/assets/home/about-me.jpg'
import inPersonCourseImg from '@/assets/home/in-person.jpg'
import onlineCourseImg from '@/assets/home/online.jpg'
import { Link } from 'react-router-dom'
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
      <section className="bg-[#f6f2ec] text-[color:var(--foreground)] pt-12 pb-20 px-6 md:px-8">
        <div className="mx-auto mb-12 max-w-4xl text-center">
          <p className="mb-3 text-[0.85rem] uppercase tracking-[0.28em] text-[color:var(--muted-foreground)]">
            GET TO KNOW ME
          </p>
          <h2 className="about-heading text-3xl font-semibold leading-tight text-[color:var(--foreground)] sm:text-4xl md:text-[2.8rem]">
            Meet The Face Behind <span className="text-[#827064]">MJP Beauty</span>
          </h2>
        </div>

        <div className="mx-auto max-w-[1200px] rounded-[2rem] border border-[#e3e2de] bg-[color:var(--background)] shadow-[0_20px_40px_rgba(0,0,0,0.08)] p-8 sm:p-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-14">
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
                <h3 className="about-subheading m-0 text-2xl font-semibold leading-tight text-[color:var(--foreground)] sm:text-3xl md:text-[2.2rem]">
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
              <div className="flex flex-wrap gap-20">
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-semibold text-[color:var(--foreground)]">8+</span>
                  <p className="m-0 text-[0.75rem] uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                    YEARS
                    <br />
                    EXPERIENCED
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-semibold text-[color:var(--foreground)]">450+</span>
                  <p className="m-0 text-[0.75rem] uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                    STUDENTS
                    <br />
                    TRAINED
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="bg-[#f6f2ec] text-[color:var(--foreground)] pt-4 pb-12 px-6 md:px-8">
        <div className="mx-auto mb-12 max-w-4xl text-center">
          <p className="mb-3 text-[0.85rem] uppercase tracking-[0.28em] text-[color:var(--muted-foreground)]">
            COURSES AVAILABLE
          </p>
          <h2 className="about-heading text-3xl font-semibold leading-tight text-[color:var(--foreground)] sm:text-4xl md:text-[2.8rem]">
            Train with <span className="text-[#827064]">Micah</span>
          </h2>
        </div>

        <div className="mx-auto max-w-[1200px] rounded-[2rem] border border-[#e3e2de] bg-[color:var(--background)] shadow-[0_20px_40px_rgba(0,0,0,0.08)] p-8 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-2">
            <Link
              to="/in-person-training"
              className="group block overflow-hidden rounded-[2rem] border border-[#e3e2de] bg-white text-left transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)]"
            >
              <div className="relative overflow-hidden">
                <img
                  className="h-64 w-full object-cover transition duration-300 group-hover:scale-105"
                  src={inPersonCourseImg}
                  alt="In person brow training"
                />
                <div className="absolute left-6 bottom-6 rounded-full bg-white/95 px-4 py-2 text-[0.7rem] uppercase tracking-[0.22em] text-[color:var(--muted-foreground)] shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
                  Now Enrolling • January - March 2026
                </div>
              </div>
              <div className="p-7">
                  <p className="text-sm uppercase tracking-[0.24em] text-[color:var(--muted-foreground)] mb-3">
                  IN-PERSON ACADEMY
                </p>
                <h3 className="text-2xl font-semibold text-[color:var(--foreground)]">
                  In-Person Trainings
                </h3>
                <p className="mt-6 mb-6 text-sm leading-7 text-[color:var(--foreground)]">
                  Canada's first integrated program combining in-depth online training with hands-on, in-person mentorship. Trusted by 200+ students — a training so impactful, students fly in from across the country.
                </p>
                <ul className="space-y-3 text-sm text-[color:var(--foreground)] mt-6">
                  <li>✓ Full online training included</li>
                  <li>✓ Hands-on in-person mentorship</li>
                  <li>✓ Proven structure & student success</li>
                </ul>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-[#e3e2de] p-5 text-center">
                    <p className="text-[0.65rem] uppercase tracking-[0.24em] text-[color:var(--muted-foreground)] mb-2">
                      Option 1
                    </p>
                    <p className="text-sm font-semibold text-[color:var(--foreground)]">
                      Small Group
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-[#e3e2de] p-5 text-center">
                    <p className="text-[0.65rem] uppercase tracking-[0.24em] text-[color:var(--muted-foreground)] mb-2">
                      Option 2
                    </p>
                    <p className="text-sm font-semibold text-[color:var(--foreground)]">
                      Private 1-on-1
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <Link
              to="/online-brow-courses"
              className="group block overflow-hidden rounded-[2rem] border border-[#e3e2de] bg-white text-left transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)]"
            >
              <div className="overflow-hidden">
                <img
                  className="h-64 w-full object-cover transition duration-300 group-hover:scale-105"
                  src={onlineCourseImg}
                  alt="Online brow training"
                />
              </div>
              <div className="p-7">
                <p className="text-sm uppercase tracking-[0.24em] text-[color:var(--muted-foreground)] mb-3">
                  ONLINE BROW ACADEMY
                </p>
                <h3 className="text-2xl font-semibold text-[color:var(--foreground)]">
                  All-Inclusive Online Brow Training
                </h3>
                <p className="mt-6 mb-6 text-sm leading-7 text-[color:var(--foreground)]">
                  A complete A-Z online training with over 50+ in-depth modules covering brow lamination, shaping, tinting, and waxing — learn on your schedule, from anywhere.
                </p>
                <ul className="space-y-3 text-sm text-[color:var(--foreground)] mt-6">
                  <li>✓ 50+ in-depth video modules</li>
                  <li>✓ Lamination, shaping, tinting, waxing</li>
                  <li>✓ Self-paced or 4-week mentorship</li>
                </ul>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-[#e3e2de] p-5 text-center">
                    <p className="text-[0.65rem] uppercase tracking-[0.24em] text-[color:var(--muted-foreground)] mb-2">
                      Option 1
                    </p>
                    <p className="text-sm font-semibold text-[color:var(--foreground)]">
                      Independent Artist
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-[#e3e2de] p-5 text-center">
                    <p className="text-[0.65rem] uppercase tracking-[0.24em] text-[color:var(--muted-foreground)] mb-2">
                      Option 2
                    </p>
                    <p className="text-sm font-semibold text-[color:var(--foreground)]">
                      VIP Mentorship
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
