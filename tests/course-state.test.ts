import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildCourseCard, pickSpotlight, type CourseInput, type ProgressInput } from '../src/lib/portal/courseState.ts'

const now = new Date('2026-11-10T12:00:00Z')
const DAY = 86_400_000
const lessons = ['l1', 'l2', 'l3', 'l4', 'l5', 'l6']

function course(over: Partial<CourseInput> = {}): CourseInput {
  return { courseId: 'c1', slug: 'c1', title: 'Course', coverImagePath: null, lessonIds: lessons, expiresAt: null, ...over }
}
const at = (ms: number) => new Date(now.getTime() + ms).toISOString()

test('zero lessons gives 0 percent and not_started, never NaN', () => {
  const c = buildCourseCard(course({ lessonIds: [] }), [], now)
  assert.equal(c.percent, 0)
  assert.equal(c.status, 'not_started')
  assert.equal(c.resumeLessonId, null)
})

test('no progress with lifetime access is not_started and resumes at the first lesson', () => {
  const c = buildCourseCard(course(), [], now)
  assert.equal(c.status, 'not_started')
  assert.equal(c.daysLeft, null)
  assert.equal(c.resumeLessonId, 'l1')
})

test('partial progress resumes at the most recently viewed lesson', () => {
  const p: ProgressInput[] = [
    { lessonId: 'l1', lastViewedAt: at(-3 * DAY), completedAt: at(-3 * DAY) },
    { lessonId: 'l2', lastViewedAt: at(-2 * DAY), completedAt: at(-2 * DAY) },
    { lessonId: 'l3', lastViewedAt: at(-1 * DAY), completedAt: null },
  ]
  const c = buildCourseCard(course(), p, now)
  assert.equal(c.percent, 33)
  assert.equal(c.status, 'in_progress')
  assert.equal(c.resumeLessonId, 'l3')
  assert.equal(c.lastViewedAt, at(-1 * DAY))
})

test('all lessons completed is completed at 100 percent', () => {
  const p = lessons.map((id) => ({ lessonId: id, lastViewedAt: at(-DAY), completedAt: at(-DAY) }))
  const c = buildCourseCard(course(), p, now)
  assert.equal(c.percent, 100)
  assert.equal(c.status, 'completed')
})

test('access ending within 14 days is expiring with daysLeft', () => {
  const p = [{ lessonId: 'l1', lastViewedAt: at(-DAY), completedAt: null }]
  const c = buildCourseCard(course({ expiresAt: at(10 * DAY) }), p, now)
  assert.equal(c.status, 'expiring')
  assert.equal(c.daysLeft, 10)
})

test('access ending in 15 days is not expiring', () => {
  const c = buildCourseCard(course({ expiresAt: at(15 * DAY) }), [], now)
  assert.equal(c.status, 'not_started')
  assert.equal(c.daysLeft, 15)
})

test('expired access wins over completed', () => {
  const p = lessons.map((id) => ({ lessonId: id, lastViewedAt: at(-2 * DAY), completedAt: at(-2 * DAY) }))
  const c = buildCourseCard(course({ expiresAt: at(-DAY) }), p, now)
  assert.equal(c.status, 'expired')
})

test('pickSpotlight continues the latest viewed non-expired course', () => {
  const a = buildCourseCard(course({ courseId: 'a' }), [{ lessonId: 'l1', lastViewedAt: at(-3 * DAY), completedAt: null }], now)
  const b = buildCourseCard(course({ courseId: 'b' }), [{ lessonId: 'l2', lastViewedAt: at(-1 * DAY), completedAt: null }], now)
  const x = buildCourseCard(course({ courseId: 'x', expiresAt: at(-DAY) }), [{ lessonId: 'l1', lastViewedAt: at(-1000), completedAt: null }], now)
  const s = pickSpotlight([a, x, b])
  assert.equal(s?.card.courseId, 'b')
  assert.equal(s?.mode, 'continue')
})

test('pickSpotlight starts the first unviewed course when nothing was viewed', () => {
  const done = buildCourseCard(course({ courseId: 'd' }), lessons.map((id) => ({ lessonId: id, lastViewedAt: null, completedAt: at(-DAY) })), now)
  const fresh = buildCourseCard(course({ courseId: 'f' }), [], now)
  const s = pickSpotlight([done, fresh])
  assert.equal(s?.card.courseId, 'f')
  assert.equal(s?.mode, 'start')
})

test('pickSpotlight returns null when empty or all expired', () => {
  assert.equal(pickSpotlight([]), null)
  const x = buildCourseCard(course({ expiresAt: at(-DAY) }), [], now)
  assert.equal(pickSpotlight([x]), null)
})
