import { formatPrice } from '@/lib/shopify'
import { percentOff } from '@/lib/sale'

type Props = {
  price: string
  compareAtPrice: string | null
  priceClassName: string
  wasClassName: string
  cadClassName?: string // omit to hide "CAD"
  className?: string
}

// Selling price, with the regular price crossed out above it when Shopify has a compare-at price.
export default function SalePrice({ price, compareAtPrice, priceClassName, wasClassName, cadClassName, className }: Props) {
  const onSale = percentOff(price, compareAtPrice) !== null
  return (
    <div className={className}>
      {onSale && (
        <p className={`line-through ${wasClassName}`}>
          <span className="sr-only">Regular price </span>
          {formatPrice(compareAtPrice!)}
        </p>
      )}
      <div className="flex items-baseline gap-1">
        <span className={priceClassName}>
          {onSale && <span className="sr-only">Sale price </span>}
          {formatPrice(price)}
        </span>
        {cadClassName && <span className={cadClassName}>CAD</span>}
      </div>
    </div>
  )
}
