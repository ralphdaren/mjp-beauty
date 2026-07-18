import { useEffect } from 'react'
const headVid = 'https://res.cloudinary.com/dr9nm40gf/video/upload/q_auto/f_auto/v1781343345/home-head-vid_jlpxxp.mp4'
const aboutImg = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_900/v1783028047/about-me_vztzrm.jpg'
const inPersonCourseImg = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_700/v1783028044/in-person_jkrk1f.jpg'
const onlineCourseImg = 'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_700/v1783028040/online_os6yyd.jpg'
import { Link, useLocation } from 'react-router-dom'
import { CircleCheck } from 'lucide-react'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import BackToTop from '@/components/BackToTop'
import TestimonialsSection from '@/components/TestimonialsSection'

export default function Home() {
  const location = useLocation()
  useScrollAnimation()

  useEffect(() => {
    const target = (location.state as { scrollTo?: string } | null)?.scrollTo
    if (target) {
      const el = document.getElementById(target)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }, [location.state])

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
          <p className="hero-eyebrow text-sm tracking-[0.25em] uppercase text-white/70 mb-4 font-light">
            MJP Beauty
          </p>
          <h1 className="hero-heading text-4xl sm:text-5xl md:text-6xl font-semibold text-white leading-tight max-w-2xl">
            WELCOMES YOU
          </h1>
          <p className="hero-tagline mt-5 text-base sm:text-lg text-white/75 max-w-md tracking-[0.1em] font-light leading-relaxed">
            ARE YOU HERE TO GLOW OR GROW?
          </p>
        </div>
      </section>

      {/* About Me Section */}
      <section id="about" className="scroll-mt-[66px]">
        <div className="grid lg:grid-cols-2 min-h-[640px] lg:min-h-[740px]">
          {/* Left: cream bg + arch portrait */}
          <div className="anim-fade-left relative min-h-[520px] bg-[#f6f2ec]">
            <p className="absolute top-6 left-6 z-10 m-0 text-[0.82rem] uppercase tracking-[0.3em] text-[color:var(--muted-foreground)]">
              FOUNDER · EDUCATOR
            </p>
            <div className="about-arch-photo">
              <img
                className="w-full h-full object-cover object-center"
                src={aboutImg}
                alt="Micah portrait"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>

          {/* Right: text content */}
          <div className="anim-fade-right flex flex-col justify-center gap-4 px-10 py-12 lg:px-12 lg:py-14 xl:px-16 bg-white" style={{ transitionDelay: '0.2s' }}>
            <p className="m-0 text-[0.8rem] uppercase tracking-[0.28em] text-[color:var(--muted-foreground)]">
              GET TO KNOW ME
            </p>
            <h2 className="about-heading m-0 text-2xl font-semibold leading-tight text-[color:var(--foreground)] sm:text-3xl md:text-[2.15rem]">
              Meet Micah — The Face Behind <span className="whitespace-nowrap text-[#827064]">MJP Beauty</span>
            </h2>

            <p className="m-0 max-w-xl text-[0.8rem] leading-[1.75] text-[color:var(--foreground)] sm:text-[0.92rem]">
              Hi, I'm <span className="font-semibold">Micah</span>, the founder of MJP Beauty!
            </p>
            <p className="m-0 max-w-xl text-[0.8rem] leading-[1.75] text-[color:var(--muted-foreground)] sm:text-[0.92rem]">
              Believe it or not, this business started on a whim from my childhood home. I was a full-time university student simply looking for a way to earn a little extra income on the side, with absolutely no idea where it would lead. What started as a small side hustle quickly grew into something so much bigger than I ever imagined.
            </p>
            <p className="m-0 max-w-xl text-[0.8rem] leading-[1.75] text-[color:var(--muted-foreground)] sm:text-[0.92rem]">
              Today, after almost nine years in the beauty industry, I specialize in creating natural brow laminations and have had the privilege of training hundreds of students across North America and now worldwide. When starting my journey, one thing became incredibly clear to me: our industry deserved a higher standard of brow education. That mission is what continues to drive MJP Beauty today.
            </p>
            <p className="m-0 max-w-xl text-[0.8rem] leading-[1.75] text-[color:var(--muted-foreground)] sm:text-[0.92rem]">
              Whether you're here to experience luxury brow services or you're a beauty professional ready to master your craft through comprehensive training like no other — MJP Beauty is where confidence begins — with craft, care, and community.
            </p>

            <div className="h-px w-full bg-black/10" />

            <div className="flex flex-wrap gap-x-6 gap-y-5">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl font-semibold text-[color:var(--foreground)]">8.5+</span>
                <p className="m-0 text-[0.68rem] uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">
                  YEARS<br />EXPERIENCE
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl font-semibold text-[color:var(--foreground)]">450+</span>
                <p className="m-0 text-[0.68rem] uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">
                  STUDENTS<br />WORLDWIDE
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl font-semibold text-[color:var(--foreground)]">4000+</span>
                <p className="m-0 text-[0.68rem] uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">
                  SERVICES<br />PERFORMED
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="scroll-mt-[66px] bg-white text-[color:var(--foreground)] pt-20 pb-16 px-6 md:px-12">
        <div className="anim-fade-up pt-4 pb-10 max-w-[1200px] mx-auto text-center">
          <p className="mb-3 text-[0.75rem] uppercase tracking-[0.28em] text-[color:var(--muted-foreground)]">
            COURSES AVAILABLE
          </p>
          <h2 className="about-heading text-3xl font-semibold leading-tight text-[color:var(--foreground)] sm:text-4xl md:text-[2.8rem]">
            Train the <span className="text-[#827064]">MJP Beauty Way</span>
          </h2>
        </div>

        <div className="mx-auto max-w-[1200px] grid lg:grid-cols-2">
          {/* In-Person Column */}
          <div
            className="anim-fade-up border-b border-[#e3e2de] pb-12 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-14"
            style={{ transitionDelay: '0.15s' }}
          >
            <Link to="/in-person-training" className="group flex h-full flex-col text-left">
              <div className="mb-5 flex items-center gap-4">
                <span className="course-number">01</span>
                <div className="h-px flex-1 bg-[#e3e2de]" />
                <span className="text-[0.65rem] uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">
                  IN-PERSON ACADEMY
                </span>
              </div>
              <h3 className="mb-6 text-3xl font-semibold text-[color:var(--foreground)]">
                In-Person Trainings
              </h3>
              <div className="relative mb-6 overflow-hidden rounded-2xl">
                <img
                  className="h-72 w-full object-cover transition duration-300 group-hover:scale-105"
                  src={inPersonCourseImg}
                  alt="In person brow training"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute bottom-4 left-4 rounded-full bg-white/95 px-4 py-2 text-[0.65rem] uppercase tracking-[0.22em] text-[color:var(--muted-foreground)] shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
                  Now Enrolling · January - March 2026
                </div>
              </div>
              <p className="mb-5 text-sm leading-7 text-[color:var(--foreground)]">
                Canada's first integrated program combining in-depth online training with hands-on, in-person mentorship. Impactful training, students fly in from across the country.
              </p>
              <ul className="mb-6 space-y-3 text-sm text-[color:var(--foreground)]">
                <li className="flex items-center gap-2"><CircleCheck size={16} className="shrink-0 text-[#b89a7a]" /> Full online training included</li>
                <li className="flex items-center gap-2"><CircleCheck size={16} className="shrink-0 text-[#b89a7a]" /> Hands-on in-person mentorship</li>
                <li className="flex items-center gap-2"><CircleCheck size={16} className="shrink-0 text-[#b89a7a]" /> Proven structure & student success</li>
              </ul>
              <div className="mt-auto grid grid-cols-2 gap-4">
                <div className="rounded-[1.5rem] border border-[#e3e2de] p-5 text-center">
                  <p className="mb-2 text-[0.65rem] uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">Option 1</p>
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">Small Group</p>
                </div>
                <div className="rounded-[1.5rem] border border-[#e3e2de] p-5 text-center">
                  <p className="mb-2 text-[0.65rem] uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">Option 2</p>
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">Private 1-on-1</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Online Column */}
          <div
            className="anim-fade-up pt-12 lg:pl-14 lg:pt-0"
            style={{ transitionDelay: '0.3s' }}
          >
            <Link to="/online-brow-courses" className="group flex h-full flex-col text-left">
              <div className="mb-5 flex items-center gap-4">
                <span className="course-number">02</span>
                <div className="h-px flex-1 bg-[#e3e2de]" />
                <span className="text-[0.65rem] uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">
                  ONLINE BROW ACADEMY
                </span>
              </div>
              <h3 className="mb-6 text-3xl font-semibold text-[color:var(--foreground)]">
                All-Inclusive Online Brow Training
              </h3>
              <div className="relative mb-6 overflow-hidden rounded-2xl">
                <img
                  className="h-72 w-full object-cover transition duration-300 group-hover:scale-105"
                  src={onlineCourseImg}
                  alt="Online brow training"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <p className="mb-5 text-sm leading-7 text-[color:var(--foreground)]">
                A complete A-Z online training with over 50+ in-depth modules covering brow lamination, shaping, tinting, and waxing — learn on your schedule, from anywhere.
              </p>
              <ul className="mb-6 space-y-3 text-sm text-[color:var(--foreground)]">
                <li className="flex items-center gap-2"><CircleCheck size={16} className="shrink-0 text-[#b89a7a]" /> 50+ in-depth video modules</li>
                <li className="flex items-center gap-2"><CircleCheck size={16} className="shrink-0 text-[#b89a7a]" /> Lamination, shaping, tinting, waxing</li>
                <li className="flex items-center gap-2"><CircleCheck size={16} className="shrink-0 text-[#b89a7a]" /> Self-paced or 4-week mentorship</li>
              </ul>
              <div className="mt-auto grid grid-cols-2 gap-4">
                <div className="rounded-[1.5rem] border border-[#e3e2de] p-5 text-center">
                  <p className="mb-2 text-[0.65rem] uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">Option 1</p>
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">Independent Artist</p>
                </div>
                <div className="rounded-[1.5rem] border border-[#e3e2de] p-5 text-center">
                  <p className="mb-2 text-[0.65rem] uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">Option 2</p>
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">VIP Mentorship</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
      {/* Student Testimonials Section */}
      <TestimonialsSection />

      {/* CTA Section */}
      <section className="bg-[#635850] px-6 md:px-12 py-14">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <h2 className="anim-fade-up about-heading text-2xl sm:text-3xl md:text-4xl font-semibold text-white max-w-lg text-center md:text-left">
            Ready to start your brow journey with us?
          </h2>
          <div className="anim-fade-up flex items-center gap-4 shrink-0" style={{ transitionDelay: '0.2s' }}>
            <Link
              to="/book-appointment"
              className="px-6 py-3 text-sm font-medium tracking-wide rounded-full bg-white text-[#635850] hover:bg-white/90 transition-colors duration-200 whitespace-nowrap"
            >
              Book an Appointment
            </Link>
            <button
              onClick={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3 text-sm font-medium tracking-wide rounded-full text-white border border-white hover:bg-white/10 transition-colors duration-200 whitespace-nowrap"
            >
              View Courses
            </button>
          </div>
        </div>
      </section>
      <BackToTop />
    </main>
  )
}
