import { useEffect, useState } from 'react'
import { MFM_STAGE_BOUNDARY, saleStage, type MfmSaleStage } from '@/data/madeForMore'

export function useMfmSaleStage(): MfmSaleStage {
  const [now, setNow] = useState(() => Date.now())
  const stage = saleStage(now)

  useEffect(() => {
    const boundary = MFM_STAGE_BOUNDARY[stage]
    if (!boundary) return
    const delay = Math.min(Math.max(Date.parse(boundary) - Date.now(), 0), 2_147_483_647)
    const id = setTimeout(() => setNow(Date.now()), delay)
    return () => clearTimeout(id)
  }, [stage, now])

  return stage
}
