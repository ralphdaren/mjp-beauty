// Seeds the TEST Supabase project with fake users and courses for Phase 1.
// Run: node --env-file=.env.local scripts/seed-test-project.ts   (safe to run repeatedly)
import { createClient } from '@supabase/supabase-js'
import { SEED_PASSWORD, assertTestProject } from './_test-project-guard.ts'

assertTestProject(process.env.SUPABASE_URL)

const db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const DAY = 86_400_000
const iso = (offsetMs: number) => new Date(Date.now() + offsetMs).toISOString()

const USERS: Array<{ email: string; name: string; meta?: Record<string, unknown> }> = [
  { email: 'admin@test.mjp', name: 'Test Admin' },
  { email: 'inprogress@test.mjp', name: 'Ivy Progress' },
  { email: 'completed@test.mjp', name: 'Cora Complete' },
  { email: 'expiring@test.mjp', name: 'Ella Expiring' },
  { email: 'expired@test.mjp', name: 'Eden Expired' },
  { email: 'notstarted@test.mjp', name: 'Nora New' },
  { email: 'nocourses@test.mjp', name: 'Nia None' },
  // Tries to make itself admin through sign-up metadata; the trigger must ignore it.
  { email: 'sneaky@test.mjp', name: 'Sneaky', meta: { role: 'admin' } },
]

const COURSES = [
  { slug: 'all-in-one-brow-training', title: 'All-in-One Online Brow Training', status: 'published' },
  { slug: 'brow-lamination-module', title: 'Brow Lamination Module', status: 'published' },
  { slug: 'brow-demo-vault', title: 'Brow Demo Vault', status: 'published' },
  { slug: 'draft-course', title: 'Draft Course', status: 'draft' },
] as const

function must<T>(res: { data: T; error: { message: string } | null }, what: string): T {
  if (res.error) throw new Error(`${what}: ${res.error.message}`)
  return res.data
}

async function ensureUsers(): Promise<Record<string, string>> {
  const existing = must(await db.auth.admin.listUsers({ perPage: 1000 }), 'list users').users
  const ids: Record<string, string> = {}
  for (const u of USERS) {
    const found = existing.find((e) => e.email === u.email)
    if (found) {
      ids[u.email] = found.id
      continue
    }
    const created = must(
      await db.auth.admin.createUser({
        email: u.email,
        password: SEED_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: u.name, ...u.meta },
      }),
      `create ${u.email}`,
    )
    ids[u.email] = created.user!.id
    console.log(`created ${u.email}`)
  }
  must(await db.from('profiles').update({ role: 'admin' }).eq('id', ids['admin@test.mjp']), 'set admin role')
  return ids
}

async function ensureCourses(): Promise<Record<string, string[]>> {
  const lessonsBySlug: Record<string, string[]> = {}
  for (const c of COURSES) {
    const [course] = must(
      await db.from('courses').upsert({ slug: c.slug, title: c.title, status: c.status }, { onConflict: 'slug' }).select('id'),
      `upsert ${c.slug}`,
    )
    const mods = must(await db.from('modules').select('id').eq('course_id', course.id), 'list modules')
    if (mods.length === 0) {
      for (let m = 1; m <= 2; m++) {
        const [mod] = must(
          await db.from('modules').insert({ course_id: course.id, title: `Module ${m}`, position: m }).select('id'),
          'insert module',
        )
        must(
          await db.from('lessons').insert(
            [1, 2, 3].map((l) => ({ module_id: mod.id, title: `Lesson ${m}.${l}`, position: l, body: 'Test lesson.' })),
          ),
          'insert lessons',
        )
      }
      console.log(`created structure for ${c.slug}`)
    }
    const rows = must(
      await db
        .from('lessons')
        .select('id, position, modules!inner(course_id, position)')
        .eq('modules.course_id', course.id),
      'list lessons',
    ) as unknown as Array<{ id: string; position: number; modules: { position: number } }>
    rows.sort((a, b) => a.modules.position - b.modules.position || a.position - b.position)
    lessonsBySlug[c.slug] = rows.map((r) => r.id)
  }
  return lessonsBySlug
}

async function main() {
  const users = await ensureUsers()
  const lessons = await ensureCourses()
  const { data: courseRows } = await db.from('courses').select('id, slug')
  const courseId = (slug: string) => courseRows!.find((c) => c.slug === slug)!.id

  const enroll = (email: string, slug: string, expiresAt: string | null = null) => ({
    user_id: users[email],
    course_id: courseId(slug),
    expires_at: expiresAt,
    source: 'manual',
  })
  must(
    await db.from('enrollments').upsert(
      [
        enroll('inprogress@test.mjp', 'all-in-one-brow-training'),
        enroll('inprogress@test.mjp', 'brow-demo-vault'),
        enroll('inprogress@test.mjp', 'draft-course'), // must stay invisible (draft)
        enroll('completed@test.mjp', 'brow-lamination-module'),
        enroll('expiring@test.mjp', 'all-in-one-brow-training', iso(10 * DAY)),
        enroll('expired@test.mjp', 'brow-demo-vault', iso(-DAY)),
        enroll('notstarted@test.mjp', 'brow-lamination-module'),
      ],
      { onConflict: 'user_id,course_id' },
    ),
    'upsert enrollments',
  )

  const aio = lessons['all-in-one-brow-training']
  const lam = lessons['brow-lamination-module']
  const vault = lessons['brow-demo-vault']
  const progress = (email: string, lessonId: string, viewedAgo: number | null, completed: boolean) => ({
    user_id: users[email],
    lesson_id: lessonId,
    last_viewed_at: viewedAgo === null ? null : iso(-viewedAgo),
    completed_at: completed ? iso(-(viewedAgo ?? DAY)) : null,
  })
  must(
    await db.from('lesson_progress').upsert(
      [
        progress('inprogress@test.mjp', aio[0], 3 * DAY, true),
        progress('inprogress@test.mjp', aio[1], 2 * DAY, true),
        progress('inprogress@test.mjp', aio[2], DAY, false),
        ...lam.map((id) => progress('completed@test.mjp', id, 2 * DAY, true)),
        progress('expiring@test.mjp', aio[0], DAY, false),
        progress('expired@test.mjp', vault[0], 5 * DAY, true),
      ],
      { onConflict: 'user_id,lesson_id' },
    ),
    'upsert progress',
  )
  console.log(`Seed complete. All test users use password ${SEED_PASSWORD}`)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
