import { createStorefrontApiClient } from '@shopify/storefront-api-client'

export const shopifyClient = createStorefrontApiClient({
  storeDomain: import.meta.env.VITE_SHOPIFY_STORE_DOMAIN,
  apiVersion: '2025-07',
  publicAccessToken: import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN,
})

/** One purchasable option on a product — a ticket tier, a course bundle, a shade. */
export type ShopifyVariant = {
  id: string
  title: string
  price: string
  currencyCode: string
  availableForSale: boolean
}

export type ShopifyProduct = {
  id: string
  title: string
  handle: string
  description: string
  descriptionHtml: string
  variantId: string
  price: string
  currencyCode: string
  featuredImage: { url: string; altText: string } | null
  images: { url: string; altText: string }[]
  /** Every variant, in the order Shopify returns them. Single-variant products
   *  keep using variantId/price above; multi-variant ones (event tickets) read this. */
  variants: ShopifyVariant[]
}

const PRODUCT_QUERY = `
  query GetProduct($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      handle
      description
      descriptionHtml
      featuredImage {
        url
        altText
      }
      images(first: 20) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 25) {
        edges {
          node {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`

const COLLECTION_PRODUCTS_QUERY = `
  query GetCollectionProducts($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            description
            featuredImage {
              url
              altText
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

const PRODUCT_SEARCH_QUERY = `
  query SearchProducts($query: String!, $first: Int!) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          handle
          description
          featuredImage {
            url
            altText
          }
          variants(first: 1) {
            edges {
              node {
                id
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`

const CART_CREATE_MUTATION = `
  mutation CartCreate($variantId: ID!, $quantity: Int!, $attributes: [AttributeInput!]) {
    cartCreate(input: {
      lines: [{ merchandiseId: $variantId, quantity: $quantity }]
      attributes: $attributes
    }) {
      cart {
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`

export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  try {
    const { data, errors } = await shopifyClient.request(PRODUCT_QUERY, {
      variables: { handle },
    })
    if (errors || !data?.productByHandle) return null

    type VariantNode = {
      id: string
      title?: string
      availableForSale?: boolean
      price?: { amount?: string; currencyCode?: string }
    }

    const product = data.productByHandle
    const variants: ShopifyVariant[] = (product.variants?.edges ?? []).map(({ node }: { node: VariantNode }) => ({
      id: node.id,
      title: node.title ?? '',
      price: node.price?.amount ?? '0',
      currencyCode: node.price?.currencyCode ?? 'CAD',
      availableForSale: node.availableForSale ?? false,
    }))
    const variant = variants[0]

    return {
      id: product.id,
      title: product.title,
      handle: product.handle ?? '',
      description: product.description ?? '',
      descriptionHtml: product.descriptionHtml ?? '',
      variantId: variant?.id ?? '',
      price: variant?.price ?? '0',
      currencyCode: variant?.currencyCode ?? 'CAD',
      featuredImage: product.featuredImage ?? null,
      images: (product.images?.edges ?? []).map(({ node }: { node: any }) => ({ url: node.url, altText: node.altText ?? '' })),
      variants,
    }
  } catch {
    return null
  }
}

export async function getCollectionProducts(collectionHandle: string, first = 50): Promise<ShopifyProduct[]> {
  try {
    const { data, errors } = await shopifyClient.request(COLLECTION_PRODUCTS_QUERY, {
      variables: { handle: collectionHandle, first },
    })
    if (errors || !data?.collection) return []

    return data.collection.products.edges.map(({ node }: { node: any }) => {
      const variant = node.variants.edges[0]?.node
      return {
        id: node.id,
        title: node.title,
        handle: node.handle ?? '',
        description: node.description ?? '',
        descriptionHtml: '',
        variantId: variant?.id ?? '',
        price: variant?.price?.amount ?? '0',
        currencyCode: variant?.price?.currencyCode ?? 'CAD',
        featuredImage: node.featuredImage ?? null,
        images: [],
        // List queries fetch one variant for pricing only — use getProductByHandle
        // when the full tier list matters.
        variants: [],
      }
    })
  } catch {
    return []
  }
}

export async function searchProducts(term: string, first = 6): Promise<ShopifyProduct[]> {
  const cleaned = term.trim()
  if (!cleaned) return []

  try {
    const { data, errors } = await shopifyClient.request(PRODUCT_SEARCH_QUERY, {
      variables: { query: `${cleaned}*`, first },
    })
    if (errors || !data?.products) return []

    return data.products.edges.map(({ node }: { node: any }) => {
      const variant = node.variants.edges[0]?.node
      return {
        id: node.id,
        title: node.title,
        handle: node.handle ?? '',
        description: node.description ?? '',
        descriptionHtml: '',
        variantId: variant?.id ?? '',
        price: variant?.price?.amount ?? '0',
        currencyCode: variant?.price?.currencyCode ?? 'CAD',
        featuredImage: node.featuredImage ?? null,
        images: [],
        // List queries fetch one variant for pricing only — use getProductByHandle
        // when the full tier list matters.
        variants: [],
      }
    })
  } catch {
    return []
  }
}

export interface CheckoutOptions {
  quantity?: number
  /** Free-form key/value pairs carried onto the Shopify order — how the ticket
   *  flow passes through details Shopify's checkout has no field for. */
  attributes?: Record<string, string>
}

export async function createCheckoutUrl(
  variantId: string,
  { quantity = 1, attributes }: CheckoutOptions = {},
): Promise<string | null> {
  try {
    const entries = Object.entries(attributes ?? {}).filter(([, value]) => value.trim() !== '')
    const { data, errors } = await shopifyClient.request(CART_CREATE_MUTATION, {
      variables: {
        variantId,
        quantity,
        attributes: entries.length ? entries.map(([key, value]) => ({ key, value })) : null,
      },
    })
    if (errors || !data?.cartCreate?.cart) return null
    return data.cartCreate.cart.checkoutUrl
  } catch {
    return null
  }
}

export function formatPrice(amount: string): string {
  const num = parseFloat(amount)
  return `$${num % 1 === 0 ? Math.floor(num) : num.toFixed(2)}`
}
