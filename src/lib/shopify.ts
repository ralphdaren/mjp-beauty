import { createStorefrontApiClient } from '@shopify/storefront-api-client'

export const shopifyClient = createStorefrontApiClient({
  storeDomain: import.meta.env.VITE_SHOPIFY_STORE_DOMAIN,
  apiVersion: '2025-07',
  publicAccessToken: import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN,
})

export type ShopifyProduct = {
  id: string
  title: string
  variantId: string
  price: string
  currencyCode: string
}

const PRODUCT_QUERY = `
  query GetProduct($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
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
`

const CART_CREATE_MUTATION = `
  mutation CartCreate($variantId: ID!) {
    cartCreate(input: {
      lines: [{ merchandiseId: $variantId, quantity: 1 }]
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

    const product = data.productByHandle
    const variant = product.variants.edges[0]?.node

    return {
      id: product.id,
      title: product.title,
      variantId: variant?.id ?? '',
      price: variant?.price?.amount ?? '0',
      currencyCode: variant?.price?.currencyCode ?? 'CAD',
    }
  } catch {
    return null
  }
}

export async function createCheckoutUrl(variantId: string): Promise<string | null> {
  try {
    const { data, errors } = await shopifyClient.request(CART_CREATE_MUTATION, {
      variables: { variantId },
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
