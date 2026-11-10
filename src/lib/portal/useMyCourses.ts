import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/AuthProvider'
import type { CourseCard } from './courseState'
import { fetchMyCourses } from './fetchMyCourses'

/** Loads the signed-in user's course cards. `cards` is null while loading. */
export function useMyCourses(): { cards: CourseCard[] | null; error: boolean } {
  const { user } = useAuth()
  const userId = user?.id ?? null
  const [state, setState] = useState<{ for: string | null; cards: CourseCard[] | null; error: boolean }>({
    for: null,
    cards: null,
    error: false,
  })

  useEffect(() => {
    if (!userId) return
    let active = true
    fetchMyCourses(userId, new Date())
      .then((cards) => active && setState({ for: userId, cards, error: false }))
      .catch(() => active && setState({ for: userId, cards: null, error: true }))
    return () => {
      active = false
    }
  }, [userId])

  return state.for === userId ? { cards: state.cards, error: state.error } : { cards: null, error: false }
}
