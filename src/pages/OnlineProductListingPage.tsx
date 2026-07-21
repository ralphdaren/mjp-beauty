import { useEffect, useState, useCallback } from 'react'
import { Star, ArrowRight, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getCollectionProducts, getProductByHandle, createCheckoutUrl, formatPrice } from '@/lib/shopify'
import type { ShopifyProduct } from '@/lib/shopify'
import { getAllPublishedReviews } from '@/lib/judgeme'

type ReviewSummary = { avg: number; count: number }

const COLLECTION_HANDLE = import.meta.env.VITE_SHOPIFY_COLLECTION_MODULES as string | undefined

/**
 * The all-in-one course is sold as two separate Shopify products (tracks), not as
 * variants of one product — so each has its own handle and its own detail page.
 */
const ALL_IN_ONE_TRACKS = [
  { label: 'Independent Artist', handle: import.meta.env.VITE_SHOPIFY_HANDLE_INDEPENDENT as string | undefined },
  { label: 'VIP Mentorship', handle: import.meta.env.VITE_SHOPIFY_HANDLE_VIP as string | undefined },
]

export default function OnlineModulesPage() {
  const [products, setProducts] = useState<ShopifyProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState<string | null>(null)
  const [reviewSummaries, setReviewSummaries] = useState<Record<string, ReviewSummary>>({})
  const [tracks, setTracks] = useState<(ShopifyProduct | null)[]>([])
  const [activeTrack, setActiveTrack] = useState(0)

  useEffect(() => {
    Promise.all(
      ALL_IN_ONE_TRACKS.map(t => (t.handle ? getProductByHandle(t.handle) : Promise.resolve(null)))
    )
      .then(setTracks)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!COLLECTION_HANDLE) { setLoading(false); return }
    getCollectionProducts(COLLECTION_HANDLE)
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    getAllPublishedReviews().then(reviews => {
      const map: Record<string, ReviewSummary> = {}
      for (const r of reviews) {
        const h = r.product_handle
        if (!map[h]) map[h] = { avg: 0, count: 0 }
        map[h].count += 1
        map[h].avg += r.rating
      }
      for (const h of Object.keys(map)) {
        map[h].avg = map[h].avg / map[h].count
      }
      setReviewSummaries(map)
    })
  }, [])

  const selectedTrack = tracks[activeTrack] ?? null

  // Keep the featured tracks out of the grid below so they don't render twice.
  const trackHandles = new Set(ALL_IN_ONE_TRACKS.map(t => t.handle).filter(Boolean))
  const gridProducts = products.filter(p => !trackHandles.has(p.handle))

  const handleCheckout = useCallback(async (product: ShopifyProduct) => {
    if (!product.variantId) return
    setCheckingOut(product.id)
    try {
      const url = await createCheckoutUrl(product.variantId)
      if (url) window.location.href = url
    } finally {
      setCheckingOut(null)
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

          {/* Featured: All-In-One Course */}
          {selectedTrack && (
            <div className="mb-14 rounded-2xl border border-[#e3e2de] bg-[#faf8f5] shadow-[0_4px_20px_rgba(130,112,100,0.08)] overflow-hidden">
              <div className="flex flex-col md:flex-row md:max-h-[420px]">
                {selectedTrack.featuredImage && (
                  <div className="md:w-[38%] shrink-0 bg-[#f6f2ec]">
                    <img
                      src={selectedTrack.featuredImage.url}
                      alt={selectedTrack.featuredImage.altText || selectedTrack.title}
                      className="w-full h-56 md:h-full object-cover"
                      decoding="async"
                    />
                  </div>
                )}

                <div className="flex-1 p-6 md:p-8 flex flex-col">
                  <p className="text-[10px] tracking-[0.3em] uppercase text-[#a0948a] mb-2">Featured · Complete Program</p>
                  <h2 className="text-2xl font-semibold text-[#3d3028] mb-2 leading-snug">All-In-One Course</h2>
                  <p className="text-sm text-[#6b5f58] leading-relaxed mb-6 max-w-lg">
                    Every module bundled into one complete program. Choose the track that fits where you are in your career.
                  </p>

                  {/* Track selector */}
                  <div
                    role="radiogroup"
                    aria-label="Choose your track"
                    className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#efeae3] mb-5"
                  >
                    {ALL_IN_ONE_TRACKS.map((track, i) => {
                      const product = tracks[i]
                      const isActive = activeTrack === i
                      return (
                        <button
                          key={track.label}
                          role="radio"
                          aria-checked={isActive}
                          disabled={!product}
                          onClick={() => setActiveTrack(i)}
                          className={`rounded-lg px-3 py-3 text-center transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
                            isActive ? 'bg-white shadow-[0_2px_8px_rgba(130,112,100,0.12)]' : 'hover:bg-white/50'
                          }`}
                        >
                          <span className={`block text-[0.65rem] uppercase tracking-[0.15em] font-medium leading-tight ${
                            isActive ? 'text-[#3d3028]' : 'text-[#8a7d73]'
                          }`}>
                            {track.label}
                          </span>
                          {product && (
                            <span className={`block text-xs mt-1 ${isActive ? 'text-[#5a5047]' : 'text-[#a0948a]'}`}>
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-semibold text-[#3d3028] leading-none">
                          {formatPrice(selectedTrack.price)}
                        </span>
                        <span className="text-xs text-[#5a5047] ml-1">CAD</span>
                      </div>
                      {reviewSummaries[selectedTrack.handle] && (
                        <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
                          <Star size={11} fill="#3d3028" stroke="#3d3028" />
                          <span className="text-xs text-[#3d3028] font-medium leading-none">
                            {reviewSummaries[selectedTrack.handle].avg.toFixed(1)}
                          </span>
                          <span className="text-xs text-[#a0948a] leading-none">
                            ({reviewSummaries[selectedTrack.handle].count} reviews)
                          </span>
                        </div>
                      )}
                    </div>

                    <Link
                      to={`/online-modules/${selectedTrack.handle}`}
                      className="inline-flex items-center gap-1.5 text-xs text-[#6b5f58] hover:text-[#3d3028] underline underline-offset-4 mb-4 transition-colors duration-200"
                    >
                      View {ALL_IN_ONE_TRACKS[activeTrack].label} details
                      <ArrowRight size={13} />
                    </Link>

                    <button
                      onClick={() => handleCheckout(selectedTrack)}
                      disabled={checkingOut === selectedTrack.id}
                      className="w-full py-3 rounded-lg bg-[#3d3028] text-white text-[0.65rem] uppercase tracking-[0.2em] font-medium hover:bg-[#2a1a0e] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                    >
                      <Lock size={12} />
                      {checkingOut === selectedTrack.id ? 'Processing…' : 'Checkout'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-20 text-[#a0948a] text-sm tracking-wide">Loading modules…</div>
          )}

          {!loading && gridProducts.length === 0 && (
            <div className="text-center py-20 text-[#a0948a] text-sm tracking-wide">No modules available yet. Check back soon.</div>
          )}

          {!loading && gridProducts.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gridProducts.map((product) => (
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
                          loading="lazy"
                          decoding="async"
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
                      <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between mb-3">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-semibold text-[#3d3028] leading-none">
                            {formatPrice(product.price)}
                          </span>
                          <span className="text-xs text-[#5a5047] ml-1">CAD</span>
                        </div>
                        {reviewSummaries[product.handle] && (
                          <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
                            <Star size={11} fill="#3d3028" stroke="#3d3028" />
                            <span className="text-[0.7rem] sm:text-xs text-[#3d3028] font-medium leading-none">
                              {reviewSummaries[product.handle].avg.toFixed(1)}
                            </span>
                            <span className="text-[0.7rem] sm:text-xs text-[#a0948a] leading-none">
                              ({reviewSummaries[product.handle].count} reviews)
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleCheckout(product)}
                        disabled={checkingOut === product.id}
                        className="w-full py-2.5 rounded-lg bg-[#3d3028] text-white text-[0.65rem] uppercase tracking-[0.2em] font-medium hover:bg-[#2a1a0e] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5"
                      >
                        <Lock size={11} />
                        {checkingOut === product.id ? 'Processing…' : 'Checkout'}
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
