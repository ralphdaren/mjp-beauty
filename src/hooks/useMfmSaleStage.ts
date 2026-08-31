import { useEffect, useState } from 'react'
import { MFM_EARLY_BIRD, saleStage, type MfmSaleStage } from '@/data/madeForMore'

/** Re-renders once at each sale boundary, so a tab left open before launch
 *  picks up the new link and button copy without a refresh — the exact
 *  scenario on sale morning, when people are already sitting on the page.
 *
 *  One timeout rather than a ticking interval: the copy only changes twice. */
export function useMfmSaleStage(): MfmSaleStage {
  const [now, setNow] = useState(() => Date.now())
  const stage = saleStage(now)

  useEffect(() => {
    if (stage === 'after') return
    const boundary = Date.parse(
      stage === 'before' ? MFM_EARLY_BIRD.startsAt : MFM_EARLY_BIRD.endsAt,
    )
    // setTimeout overflows past ~24.8 days; a capped wait just re-arms itself.
    const delay = Math.min(Math.max(boundary - Date.now(), 0), 2_147_483_647)
    const id = setTimeout(() => setNow(Date.now()), delay)
    return () => clearTimeout(id)
  }, [stage, now])

  return stage
}
