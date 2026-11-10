import { Link, useParams } from 'react-router-dom'
import { useMyCourses } from '@/lib/portal/useMyCourses'

export default function CoursePlaceholderPage() {
  const { slug } = useParams()
  const { cards, error } = useMyCourses()
  const card = cards?.find((c) => c.slug === slug)
  const back = (
    <Link to="/portal" className="mt-4 inline-block text-sm font-medium hover:underline">
      Back to my courses
    </Link>
  )

  if (!cards && !error) return <div className="h-40 max-w-3xl rounded-xl border border-brand-border bg-white animate-pulse" />

  if (!card) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-xl font-semibold">We couldn't find that course.</h1>
        {back}
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold">{card.title}</h1>
      <p className="mt-2 text-sm text-brand">Lessons are coming soon.</p>
      {back}
    </div>
  )
}
