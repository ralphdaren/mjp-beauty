import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getCollectionProducts, createCheckoutUrl, formatPrice } from '@/lib/shopify'
import type { ShopifyProduct } from '@/lib/shopify'

const COLLECTION_HANDLE = import.meta.env.VITE_SHOPIFY_COLLECTION_MODULES as string | undefined

export default function OnlineModulesPage() {
  const [products, setProducts] = useState<ShopifyProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState<string | null>(null)

  useEffect(() => {
    if (!COLLECTION_HANDLE) { setLoading(false); return }
    getCollectionProducts(COLLECTION_HANDLE)
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleAddToCart = useCallback(async (product: ShopifyProduct) => {
    if (!product.variantId) return
    setAddingToCart(product.id)
    try {
      const url = await createCheckoutUrl(product.variantId)
      if (url) window.location.href = url
    } finally {
      setAddingToCart(null)
    }
  }, [])

  return (
    <main>
      {/* Hero */}
      <div className="bg-[#f6f2ec] border-b border-[#e3e2de] py-14 text-center px-6">
        <p className="text-[10px] tracking-[0.35em] uppercase text-[#a0948a] mb-3">MJP Beauty</p>
        <h1 className="text-3xl font-semibold text-[#3d3530] mb-3">Explore Courses</h1>
        <p className="text-sm text-[#6b5f58] max-w-md mx-auto leading-relaxed">
          Purchase any courses individually of your choice — each one packed with expert-led video lessons and downloadable resources.
        </p>
      </div>

      {/* Product listing */}
      <section className="bg-white py-20 px-6 md:px-8">
        <div className="mx-auto max-w-[1200px]">

          {loading && (
            <div className="text-center py-20 text-[#a0948a] text-sm tracking-wide">Loading modules…</div>
          )}

          {!loading && products.length === 0 && (
            <div className="text-center py-20 text-[#a0948a] text-sm tracking-wide">No modules available yet. Check back soon.</div>
          )}

          {!loading && products.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="rounded-xl border border-[#e3e2de] bg-white shadow-[0_4px_16px_rgba(130,112,100,0.08)] overflow-hidden flex flex-col"
                >
                  <Link to={`/online-modules/${product.handle}`} className="block group">
                    {product.featuredImage ? (
                      <div className="w-full aspect-square bg-[#f6f2ec]">
                        <img
                          src={product.featuredImage.url}
                          alt={product.featuredImage.altText || product.title}
                          className="w-full h-full object-contain transition-opacity duration-200 group-hover:opacity-90"
                        />
                      </div>
                    ) : (
                      <div className="w-full aspect-square bg-[#f6f2ec]" />
                    )}
                    <div className="px-4 pt-4 pb-2">
                      <h3 className="text-sm font-semibold text-[#3d3028] leading-snug group-hover:underline">{product.title}</h3>
                    </div>
                  </Link>
                  <div className="px-4 pb-4 flex flex-col flex-1">
                    <div className="mt-auto">
                      <div className="h-px bg-[#e3e2de] mb-3" />
                      <div className="flex items-baseline gap-1 mb-3">
                        <span className="text-xl font-semibold text-[#3d3028] leading-none">
                          {formatPrice(product.price)}
                        </span>
                        <span className="text-xs text-[#5a5047] ml-1">CAD</span>
                      </div>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={addingToCart === product.id}
                        className="w-full py-2.5 rounded-lg bg-[#3d3028] text-white text-[0.65rem] uppercase tracking-[0.2em] font-medium hover:bg-[#2a1a0e] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {addingToCart === product.id ? 'Processing…' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>
    </main>
  )
}
