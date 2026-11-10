import { supabase } from '@/lib/supabase'
import { buildCourseCard, type CourseCard, type ProgressInput } from './courseState'

interface EnrollmentRow {
  expires_at: string | null
  courses: {
    id: string
    slug: string
    title: string
    cover_image_path: string | null
    modules: Array<{ position: number; lessons: Array<{ id: string; position: number }> }>
  } | null
}

const statusRank: Record<CourseCard['status'], number> = {
  in_progress: 0,
  expiring: 0,
  completed: 1,
  not_started: 1,
  expired: 2,
}

/** The signed-in user's courses as portal cards. RLS limits rows to the user's own published enrollments. */
export async function fetchMyCourses(userId: string, now: Date): Promise<CourseCard[]> {
  const [enrollments, progress] = await Promise.all([
    supabase
      .from('enrollments')
      .select('expires_at, courses(id, slug, title, cover_image_path, modules(position, lessons(id, position)))')
      .eq('user_id', userId),
    supabase.from('lesson_progress').select('lesson_id, last_viewed_at, completed_at').eq('user_id', userId),
  ])
  if (enrollments.error) throw enrollments.error
  if (progress.error) throw progress.error

  const progressRows: ProgressInput[] = (progress.data ?? []).map((p) => ({
    lessonId: p.lesson_id,
    lastViewedAt: p.last_viewed_at,
    completedAt: p.completed_at,
  }))

  const cards = (enrollments.data as unknown as EnrollmentRow[])
    .filter((e) => e.courses) // drafts come back as null under RLS
    .map((e) => {
      const c = e.courses!
      const lessonIds = [...c.modules]
        .sort((a, b) => a.position - b.position)
        .flatMap((m) => [...m.lessons].sort((a, b) => a.position - b.position).map((l) => l.id))
      return buildCourseCard(
        { courseId: c.id, slug: c.slug, title: c.title, coverImagePath: c.cover_image_path, lessonIds, expiresAt: e.expires_at },
        progressRows,
        now,
      )
    })

  return cards.sort(
    (a, b) =>
      statusRank[a.status] - statusRank[b.status] ||
      Date.parse(b.lastViewedAt ?? '1970-01-01') - Date.parse(a.lastViewedAt ?? '1970-01-01') ||
      a.title.localeCompare(b.title),
  )
}
