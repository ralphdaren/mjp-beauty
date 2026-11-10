// Pure course-card rules for the student portal. No imports, so node:test can load it directly.

export const ACCESS_WARNING_DAYS = 14
const DAY_MS = 86_400_000

export interface CourseInput {
  courseId: string
  slug: string
  title: string
  coverImagePath: string | null
  /** Lesson ids in course order (module position, then lesson position). */
  lessonIds: string[]
  expiresAt: string | null
}

export interface ProgressInput {
  lessonId: string
  lastViewedAt: string | null
  completedAt: string | null
}

export type CardStatus = 'not_started' | 'in_progress' | 'completed' | 'expiring' | 'expired'

export interface CourseCard extends CourseInput {
  percent: number
  status: CardStatus
  daysLeft: number | null
  resumeLessonId: string | null
  lastViewedAt: string | null
}

export function buildCourseCard(course: CourseInput, progress: ProgressInput[], now: Date): CourseCard {
  const inCourse = new Set(course.lessonIds)
  const rows = progress.filter((p) => inCourse.has(p.lessonId))
  const completed = new Set(rows.filter((p) => p.completedAt).map((p) => p.lessonId))
  const total = course.lessonIds.length
  const percent = total ? Math.round((completed.size / total) * 100) : 0

  const viewed = rows
    .filter((p) => p.lastViewedAt)
    .sort((a, b) => Date.parse(b.lastViewedAt!) - Date.parse(a.lastViewedAt!))
  const lastViewedAt = viewed[0]?.lastViewedAt ?? null
  const resumeLessonId =
    viewed[0]?.lessonId ?? course.lessonIds.find((id) => !completed.has(id)) ?? course.lessonIds[0] ?? null

  const daysLeft = course.expiresAt === null ? null : Math.ceil((Date.parse(course.expiresAt) - now.getTime()) / DAY_MS)

  let status: CardStatus
  if (daysLeft !== null && Date.parse(course.expiresAt!) <= now.getTime()) status = 'expired'
  else if (total > 0 && completed.size === total) status = 'completed'
  else if (daysLeft !== null && daysLeft <= ACCESS_WARNING_DAYS) status = 'expiring'
  else if (completed.size > 0 || lastViewedAt) status = 'in_progress'
  else status = 'not_started'

  return { ...course, percent, status, daysLeft, resumeLessonId, lastViewedAt }
}

/** The course for the top spotlight: latest viewed one to continue, else the first one to start. */
export function pickSpotlight(cards: CourseCard[]): { card: CourseCard; mode: 'continue' | 'start' } | null {
  const active = cards.filter((c) => c.status !== 'expired')
  const viewed = active
    .filter((c) => c.lastViewedAt && c.status !== 'completed')
    .sort((a, b) => Date.parse(b.lastViewedAt!) - Date.parse(a.lastViewedAt!))
  if (viewed[0]) return { card: viewed[0], mode: 'continue' }
  const fresh = active.find((c) => c.status !== 'completed')
  return fresh ? { card: fresh, mode: 'start' } : null
}
