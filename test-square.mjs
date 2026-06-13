// Temporary test script — safe to delete after use.
// Run with: node --env-file=.env test-square.mjs

const BASE_URL =
  process.env.SQUARE_ENVIRONMENT === 'sandbox'
    ? 'https://connect.squareupsandbox.com'
    : 'https://connect.squareup.com'

async function squareFetch(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'Square-Version': '2024-01-18',
    },
  })
  return res.json()
}

const catalog = await squareFetch('/v2/catalog/list?types=ITEM')
const items = catalog.objects ?? []

const services = items
  .filter(i => i.item_data?.product_type === 'APPOINTMENTS_SERVICE' && !i.item_data?.is_archived)
  .map(i => ({
    name: i.item_data.name,
    archived: i.item_data.is_archived,
    variations: (i.item_data.variations ?? []).map(v => ({
      name: v.item_variation_data?.name,
      availableForBooking: v.item_variation_data?.available_for_booking,
      durationMs: v.item_variation_data?.service_duration,
      price: v.item_variation_data?.price_money,
    })),
  }))

console.log(JSON.stringify(services, null, 2))
