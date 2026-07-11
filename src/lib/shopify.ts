import { createStorefrontApiClient } from '@shopify/storefront-api-client'

export const shopifyClient = createStorefrontApiClient({
  storeDomain: import.meta.env.VITE_SHOPIFY_STORE_DOMAIN,
  apiVersion: '2025-07',
  publicAccessToken: import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN,
})

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
      handle: product.handle ?? '',
      description: product.description ?? '',
      descriptionHtml: product.descriptionHtml ?? '',
      variantId: variant?.id ?? '',
      price: variant?.price?.amount ?? '0',
      currencyCode: variant?.price?.currencyCode ?? 'CAD',
      featuredImage: product.featuredImage ?? null,
      images: (product.images?.edges ?? []).map(({ node }: { node: any }) => ({ url: node.url, altText: node.altText ?? '' })),
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
      }
    })
  } catch {
    return []
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

export type TrainingDate = {
  id: string
  date: string
  location: string
  spotsTotal: number
  spotsRemaining: number
}

const TRAINING_DATES_QUERY = `
  query GetTrainingDates($handle: String!) {
    productByHandle(handle: $handle) {
      metafield(namespace: "custom", key: "training_dates") {
        references(first: 50) {
          nodes {
            ... on Metaobject {
              id
              fields {
                key
                value
              }
            }
          }
        }
      }
    }
  }
`

export async function getTrainingDates(handle: string): Promise<TrainingDate[]> {
  try {
    const { data, errors } = await shopifyClient.request(TRAINING_DATES_QUERY, {
      variables: { handle },
    })
    if (errors || !data?.productByHandle?.metafield) return []

    const dates: TrainingDate[] = data.productByHandle.metafield.references.nodes.map((node: any) => {
      const fields: Record<string, string> = {}
      for (const f of node.fields) fields[f.key] = f.value
      return {
        id: node.id,
        date: fields.date ?? '',
        location: fields.location ?? '',
        spotsTotal: parseInt(fields.spots_total ?? '0', 10),
        spotsRemaining: parseInt(fields.spots_remaining ?? '0', 10),
      }
    })

    return dates
      .filter((d) => d.date)
      .sort((a, b) => a.date.localeCompare(b.date))
  } catch {
    return []
  }
}
