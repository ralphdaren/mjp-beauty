import { Link } from 'react-router-dom'
import type { CourseCard as Card } from '@/lib/portal/courseState'

export function CourseCover({ path, className = '' }: { path: string | null; className?: string }) {
  if (path) return <img src={path} alt="" className={`object-cover rounded-md ${className}`} />
  return <div className={`rounded-md bg-gradient-to-br from-[#d9b8a3] to-[#b98b74] ${className}`} aria-hidden="true" />
}

export function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-brand-border overflow-hidden" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full bg-[#8a5a44]" style={{ width: `${percent}%` }} />
    </div>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function lessonLink(card: Card): string {
  return `/portal/courses/${card.slug}${card.resumeLessonId ? `?lesson=${card.resumeLessonId}` : ''}`
}

const daysText = (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`

export default function CourseCard({ card }: { card: Card }) {
  const expired = card.status === 'expired'
  return (
    <div className={`flex flex-col rounded-xl border border-brand-border bg-white p-3 ${expired ? 'opacity-60' : ''}`}>
      <CourseCover path={card.coverImagePath} className={`h-32 w-full ${expired ? 'grayscale' : ''}`} />
      <h3 className="mt-3 text-sm font-semibold leading-snug">{card.title}</h3>
      <div className="mt-2">
        <ProgressBar percent={card.percent} />
        <p className="mt-1 text-xs text-brand">{card.percent}% complete</p>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {card.status === 'completed' && (
          <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-800">Certificate ready</span>
        )}
        {card.status === 'expiring' && card.daysLeft !== null && (
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
            Access ends in {daysText(card.daysLeft)}
          </span>
        )}
        {expired ? (
          <>
            <span className="text-xs font-semibold text-brand">Access ended</span>
            <Link to="/online-modules" className="ml-auto rounded-md border border-[#3d3530] px-3 py-1.5 text-xs font-semibold hover:bg-brand-light">
              Buy again
            </Link>
          </>
        ) : (
          card.status !== 'completed' && (
            <Link to={lessonLink(card)} className="ml-auto rounded-md bg-[#3d3530] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90">
              {card.status === 'not_started' ? 'Start' : 'Continue'}
            </Link>
          )
        )}
      </div>
    </div>
  )
}
