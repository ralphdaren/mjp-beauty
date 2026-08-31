import { useEffect, useState } from 'react'
import { MFM_EARLY_BIRD, saleStage, type MfmSaleStage } from '@/data/madeForMore'

export function useMfmSaleStage(): MfmSaleStage {
  const [now, setNow] = useState(() => Date.now())
  const stage = saleStage(now)

  useEffect(() => {
    if (stage === 'after') return
    const boundary = Date.parse(
      stage === 'before' ? MFM_EARLY_BIRD.startsAt : MFM_EARLY_BIRD.endsAt,
    )
    const delay = Math.min(Math.max(boundary - Date.now(), 0), 2_147_483_647)
    const id = setTimeout(() => setNow(Date.now()), delay)
    return () => clearTimeout(id)
  }, [stage, now])

  return stage
}
