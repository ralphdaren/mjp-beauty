import { useEffect, useState, useCallback } from 'react'
import { getCollectionProducts, createCheckoutUrl, formatPrice } from '@/lib/shopify'
import type { ShopifyProduct } from '@/lib/shopify'

const COLLECTION_HANDLE = import.meta.env.VITE_SHOPIFY_COLLECTION_MODULES as string | undefined

export default function OnlineModulesPage() {
  const [products, setProducts] = useState<ShopifyProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState<string | null>(null)

  useEffect(() => {
    if (!COLLECTION_HANDLE) { setLoading(false); return }
    getCollectionProducts(COLLECTION_HANDLE)
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleEnroll = useCallback(async (product: ShopifyProduct) => {
    if (!product.variantId) return
    setEnrolling(product.id)
    try {
      const url = await createCheckoutUrl(product.variantId)
      if (url) window.location.href = url
    } finally {
      setEnrolling(null)
    }
  }, [])

  return (
    <main>
      {/* Hero */}
      <div className="bg-[#f6f2ec] border-b border-[#e3e2de] py-14 text-center px-6">
        <p className="text-[10px] tracking-[0.35em] uppercase text-[#a0948a] mb-3">MJP Beauty</p>
        <h1 className="text-3xl font-semibold text-[#3d3530] mb-3">Online Modules</h1>
        <p className="text-sm text-[#6b5f58] max-w-md mx-auto leading-relaxed">
          Purchase any module individually of your choice — each one packed with expert-led video lessons and downloadable resources.
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="rounded-2xl border border-[#e3e2de] bg-white shadow-[0_8px_32px_rgba(130,112,100,0.10)] p-8 flex flex-col"
                >
                  <h3 className="text-lg font-semibold text-[#3d3028] leading-snug mb-3">{product.title}</h3>
                  {product.description && (
                    <p className="text-[#5a5047] text-sm leading-relaxed flex-1 mb-6">{product.description}</p>
                  )}
                  <div className="mt-auto">
                    <div className="h-px bg-[#e3e2de] mb-4" />
                    <div className="flex items-baseline gap-1.5 mb-5">
                      <span className="text-[2rem] font-semibold text-[#3d3028] leading-none">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-sm text-[#5a5047] ml-1">CAD</span>
                    </div>
                    <button
                      onClick={() => handleEnroll(product)}
                      disabled={enrolling === product.id}
                      className="w-full py-3.5 rounded-xl bg-[#3d3028] text-white text-[0.72rem] uppercase tracking-[0.2em] font-medium hover:bg-[#2a1a0e] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {enrolling === product.id ? 'Processing…' : 'Enroll Now'}
                    </button>
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
