import { percentOff, saleTagLabel } from '@/lib/sale'

type Props = {
  price: string
  compareAtPrice: string | null
  variant: 'pill' | 'corner' // corner sits on top of a product image (parent must be `relative`)
  tone?: 'light' | 'dark' // dark = used on the dark VIP card
  short?: boolean // always "15% off", never "Black Friday · 15% off" (small image corners)
}

export default function SaleTag({ price, compareAtPrice, variant, tone = 'light', short }: Props) {
  const percent = percentOff(price, compareAtPrice)
  if (percent === null) return null
  const text = short ? `${percent}% off` : saleTagLabel(percent)
  const base = 'rounded-full px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.18em] font-semibold leading-none whitespace-nowrap'
  if (variant === 'corner') {
    return <span className={`${base} absolute top-3 left-3 z-[1] bg-[#2a1a0e] text-[#f6f2ec]`}>{text}</span>
  }
  const colors = tone === 'dark' ? 'bg-[#f6f2ec] text-[#2a1a0e]' : 'bg-[#3d3028] text-[#f6f2ec]'
  return <span className={`${base} inline-block mb-3 ${colors}`}>{text}</span>
}
