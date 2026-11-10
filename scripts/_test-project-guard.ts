// Scripts that write data must only ever touch the TEST Supabase project.

export const TEST_PROJECT_HOST = 'ojlhxmoebovsvkewurla.supabase.co'

/** Password shared by every seeded test-project user. Test project only. */
export const SEED_PASSWORD = 'TestPass!2026'

export function assertTestProject(url: string | undefined): void {
  let host = ''
  try {
    host = new URL(url ?? '').hostname
  } catch {
    // fall through to the refusal below
  }
  if (host !== TEST_PROJECT_HOST) {
    throw new Error('Refusing to run: SUPABASE_URL is not the test project')
  }
}
