import { test } from 'node:test'
import assert from 'node:assert/strict'
import { assertTestProject } from '../scripts/_test-project-guard.ts'

test('assertTestProject accepts the test project', () => {
  assert.doesNotThrow(() => assertTestProject('https://ojlhxmoebovsvkewurla.supabase.co'))
})

test('assertTestProject refuses anything else, checking the host not a substring', () => {
  for (const u of [
    undefined,
    '',
    'not a url',
    'https://prodref.supabase.co',
    'https://evil.com/?ojlhxmoebovsvkewurla',
    'https://ojlhxmoebovsvkewurla.supabase.co.evil.com',
  ]) {
    assert.throws(() => assertTestProject(u), /Refusing to run/, String(u))
  }
})
