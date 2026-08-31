// Ticket constants shared by the Made For More API routes.
//
// These mirror values in src/data/madeForMore.ts. The api/ functions are built
// separately from the Vite app and can't resolve the @/ alias, so the
// duplication is deliberate — if one side changes, change the other.
export const MFM_TICKETS_HANDLE = 'made-for-more-calgary'
export const MFM_TICKETS_PRODUCT_ID = '8732835938476'
export const EARLY_BIRD_ENDS_AT = '2026-09-04T17:00:00Z'
