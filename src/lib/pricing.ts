// Manitoba exempts esthetic/personal-care services from RST — only GST applies.
export const TAX_RATE = 0.05

export function parsePrice(price: string): { prefix: string; amount: number } {
  const match = price.match(/^([^\d]*)([\d,.]+)/)
  const prefix = match?.[1]?.trim() || '$'
  const amount = match ? parseFloat(match[2].replace(/,/g, '')) : 0
  return { prefix, amount }
}

export function formatMoney(prefix: string, amount: number): string {
  return `${prefix}${amount.toFixed(2)}`
}
