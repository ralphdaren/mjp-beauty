// Checks Phase 1 row level security on the TEST project by signing in as seeded users
// with the browser (publishable) key. Run after the seed:
//   node --env-file=.env.local scripts/verify-phase1-rls.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { SEED_PASSWORD, assertTestProject } from './_test-project-guard.ts'

assertTestProject(process.env.SUPABASE_URL)
const URL_ = process.env.SUPABASE_URL!
const KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
if (!KEY) throw new Error('VITE_SUPABASE_PUBLISHABLE_KEY is missing from .env.local')

const failures: string[] = []
function check(ok: boolean, label: string) {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}`)
  if (!ok) failures.push(label)
}

async function as(email: string): Promise<{ db: SupabaseClient; id: string }> {
  const db = createClient(URL_, KEY!, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data, error } = await db.auth.signInWithPassword({ email, password: SEED_PASSWORD })
  if (error || !data.user) throw new Error(`sign in ${email}: ${error?.message}`)
  return { db, id: data.user.id }
}

async function main() {
  const sneaky = await as('sneaky@test.mjp')
  const { data: sp } = await sneaky.db.from('profiles').select('role').eq('id', sneaky.id).single()
  check(sp?.role === 'student', 'sign-up metadata role:admin still creates a student')

  const { error: roleErr } = await sneaky.db.from('profiles').update({ role: 'admin' }).eq('id', sneaky.id)
  const { data: sp2 } = await sneaky.db.from('profiles').select('role').eq('id', sneaky.id).single()
  check(!!roleErr && sp2?.role === 'student', 'a student cannot update their own role')

  const { error: nameErr } = await sneaky.db.from('profiles').update({ full_name: 'Sneaky' }).eq('id', sneaky.id)
  check(!nameErr, 'a student can update their own full_name')

  const ip = await as('inprogress@test.mjp')
  const { data: ipCourses } = await ip.db.from('courses').select('slug')
  const slugs = (ipCourses ?? []).map((c) => c.slug).sort()
  check(
    JSON.stringify(slugs) === JSON.stringify(['all-in-one-brow-training', 'brow-demo-vault']),
    `student sees only enrolled published courses (got ${slugs.join(', ')})`,
  )
  const { data: ipEnroll } = await ip.db.from('enrollments').select('user_id')
  check((ipEnroll ?? []).length > 0 && ipEnroll!.every((e) => e.user_id === ip.id), 'student sees only own enrollments')
  const { data: ipProg } = await ip.db.from('lesson_progress').select('user_id')
  check((ipProg ?? []).length > 0 && ipProg!.every((p) => p.user_id === ip.id), 'student sees only own progress')
  const { data: profiles } = await ip.db.from('profiles').select('id')
  check((profiles ?? []).length === 1, 'student sees only own profile')
  const { error: writeErr } = await ip.db.from('courses').insert({ slug: 'hack', title: 'Hack' })
  check(!!writeErr, 'student cannot create courses')

  const none = await as('nocourses@test.mjp')
  const { data: noneCourses } = await none.db.from('courses').select('id')
  check((noneCourses ?? []).length === 0, 'user with no enrollments sees zero courses')

  const admin = await as('admin@test.mjp')
  const { data: adminCourses } = await admin.db.from('courses').select('slug')
  check((adminCourses ?? []).length === 4, 'admin sees all 4 courses including the draft')
  const { data: adminEnroll } = await admin.db.from('enrollments').select('id')
  check((adminEnroll ?? []).length >= 7, 'admin sees all enrollments')

  if (failures.length) {
    console.error(`\n${failures.length} RLS check(s) failed`)
    process.exit(1)
  }
  console.log('\nAll RLS checks passed')
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
