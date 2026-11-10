import { Link } from 'react-router-dom'
import type { CourseCard } from '@/lib/portal/courseState'
import { CourseCover, ProgressBar, lessonLink } from './CourseCard'

export default function SpotlightCard({ card, mode }: { card: CourseCard; mode: 'continue' | 'start' }) {
  const lessonIndex = card.resumeLessonId ? card.lessonIds.indexOf(card.resumeLessonId) + 1 : 0
  return (
    <section className="flex flex-col sm:flex-row gap-4 rounded-xl border border-brand-border bg-white p-4" aria-label="Spotlight">
      <CourseCover path={card.coverImagePath} className="h-36 w-full sm:h-28 sm:w-48 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
          {mode === 'continue' ? 'Continue watching' : 'Start your first course'}
        </p>
        <h2 className="mt-1 text-base font-semibold">{card.title}</h2>
        {mode === 'continue' && lessonIndex > 0 && (
          <p className="text-xs text-brand">
            Lesson {lessonIndex} of {card.lessonIds.length}
          </p>
        )}
        <div className="mt-3 max-w-md">
          <ProgressBar percent={card.percent} />
        </div>
        <Link
          to={lessonLink(card)}
          className="mt-4 inline-flex rounded-md bg-[#3d3530] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          {mode === 'continue' ? 'Continue lesson' : 'Start course'}
        </Link>
      </div>
    </section>
  )
}
