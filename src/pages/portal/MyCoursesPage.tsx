import { Link } from 'react-router-dom'
import { useAuth } from '@/lib/auth/AuthProvider'
import { pickSpotlight } from '@/lib/portal/courseState'
import { useMyCourses } from '@/lib/portal/useMyCourses'
import CourseCard from '@/components/portal/CourseCard'
import SpotlightCard from '@/components/portal/SpotlightCard'
import { firstName } from './PortalLayout'

export default function MyCoursesPage() {
  const { profile } = useAuth()
  const { cards, error } = useMyCourses()
  const name = firstName(profile?.full_name)
  const spotlight = cards ? pickSpotlight(cards) : null

  return (
    <div className="max-w-5xl">
      <h1 className="text-xl font-semibold">{name ? `Welcome back, ${name}` : 'Welcome'}</h1>
      <p className="mt-1 text-sm text-brand">Pick up where you left off.</p>

      {error && (
        <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          We couldn't load your courses. Please refresh the page.
        </p>
      )}

      {!cards && !error && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading courses">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-64 rounded-xl border border-brand-border bg-white animate-pulse" />
          ))}
        </div>
      )}

      {cards && cards.length === 0 && (
        <div className="mt-6 rounded-xl border border-brand-border bg-white px-6 py-12 text-center">
          <p className="font-medium">You don't have any courses yet.</p>
          <Link
            to="/online-brow-courses"
            className="mt-4 inline-flex rounded-md bg-[#3d3530] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Browse courses
          </Link>
        </div>
      )}

      {cards && cards.length > 0 && (
        <>
          {spotlight && (
            <div className="mt-6">
              <SpotlightCard card={spotlight.card} mode={spotlight.mode} />
            </div>
          )}
          <h2 className="mt-8 mb-3 text-[11px] font-semibold uppercase tracking-wider text-brand-muted">My courses</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <CourseCard key={card.courseId} card={card} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
