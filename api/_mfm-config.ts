// Ticket constants shared by the Made For More API routes.
//
// These mirror values in src/data/madeForMore.ts. The api/ functions are built
// separately from the Vite app and can't resolve the @/ alias, so the
// duplication is deliberate — if one side changes, change the other.

/** Shopify product holding both ticket tiers. */
export const MFM_TICKETS_HANDLE = 'made-for-more-calgary'

/** Numeric product id as it appears on webhook line items. Matching on this
 *  rather than the title means renaming the product in Shopify won't quietly
 *  stop ticket orders from being recognised. */
export const MFM_TICKETS_PRODUCT_ID = '8732835938476'

/** Noon Central, Sept 4 2026 — when early bird closes and, per Micah, when the
 *  giveaway winner gets announced. Orders after this don't get the giveaway
 *  block in their ticket email. */
export const EARLY_BIRD_ENDS_AT = '2026-09-04T17:00:00Z'
