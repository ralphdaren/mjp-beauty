import { useEffect, useState } from 'react'
import { getTrainingDates } from '@/lib/training'
import { OPTION_CARDS } from '@/data/training'
import type { TrainingDateGroup } from '@/types/training'

const EMPTY_GROUPS: TrainingDateGroup[] = OPTION_CARDS.map((card) => ({
  id: card.id,
  title: card.title,
  dates: [],
}))

/**
 * Loads the upcoming dates for every training option in one pass, so the dates
 * card and the "all dates" modal paint from a single fetch.
 */
export function useTrainingDateGroups() {
  const [groups, setGroups] = useState<TrainingDateGroup[]>(EMPTY_GROUPS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all(OPTION_CARDS.map((card) => getTrainingDates(card.id))).then((results) => {
      if (cancelled) return
      setGroups(
        OPTION_CARDS.map((card, i) => ({
          id: card.id,
          title: card.title,
          dates: results[i],
        }))
      )
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return { groups, loading }
}
