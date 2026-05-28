import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getProductByHandle, createCheckoutUrl, formatPrice } from '@/lib/shopify'
import type { ShopifyProduct } from '@/lib/shopify'

export default function ProductDetailPage() {
  const { handle } = useParams<{ handle: string }>()
  const [product, setProduct] = useState<ShopifyProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    if (!handle) { setLoading(false); return }
    getProductByHandle(handle)
      .then(setProduct)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [handle])

  const images = product
    ? product.images.length > 0
      ? product.images
      : product.featuredImage ? [product.featuredImage] : []
    : []

  const handlePrev = () => setCurrentImageIndex(i => (i - 1 + images.length) % images.length)
  const handleNext = () => setCurrentImageIndex(i => (i + 1) % images.length)

  const handleAddToCart = useCallback(async () => {
    if (!product?.variantId) return
    setAddingToCart(true)
    try {
      const url = await createCheckoutUrl(product.variantId)
      if (url) window.location.href = url
    } finally {
      setAddingToCart(false)
    }
  }, [product])

  if (loading) {
    return (
      <main>
        <div className="text-center py-40 text-[#a0948a] text-sm tracking-wide">Loading…</div>
      </main>
    )
  }

  if (!product) {
    return (
      <main>
        <div className="text-center py-40">
          <p className="text-[#a0948a] text-sm mb-4">Product not found.</p>
          <Link to="/online-modules" className="text-[#3d3028] underline text-sm">Back to modules</Link>
        </div>
      </main>
    )
  }

  return (
    <main>
      {/* Breadcrumb */}
      <div className="bg-[#f6f2ec] border-b border-[#e3e2de] px-6 py-4">
        <div className="max-w-[1200px] mx-auto">
          <Link
            to="/online-modules"
            className="inline-flex items-center gap-1.5 text-xs text-[#a0948a] hover:text-[#3d3028] tracking-wide transition-colors"
          >
            <ArrowLeft size={13} />
            Back to Courses
          </Link>
        </div>
      </div>

      {/* Product detail */}
      <section className="bg-white py-16 px-6 md:px-8">
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-12 items-start">

          {/* Image carousel */}
          <div>
            {images.length > 0 ? (
              <>
                <div className="relative aspect-square bg-[#f6f2ec] rounded-xl overflow-hidden">
                  <img
                    src={images[currentImageIndex].url}
                    alt={images[currentImageIndex].altText || product.title}
                    className="w-full h-full object-contain"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrev}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-sm transition-colors"
                        aria-label="Previous image"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M10 12L6 8l4-4" stroke="#3d3028" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button
                        onClick={handleNext}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-sm transition-colors"
                        aria-label="Next image"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M6 4l4 4-4 4" stroke="#3d3028" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>

                {images.length > 1 && (
                  <>
                    {/* Dot indicators */}
                    <div className="flex gap-2 justify-center mt-4">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImageIndex(i)}
                          className={`w-2 h-2 rounded-full transition-colors ${i === currentImageIndex ? 'bg-[#3d3028]' : 'bg-[#e3e2de]'}`}
                          aria-label={`Image ${i + 1}`}
                        />
                      ))}
                    </div>

                    {/* Thumbnail strip */}
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                      {images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImageIndex(i)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === currentImageIndex ? 'border-[#3d3028]' : 'border-[#e3e2de]'}`}
                        >
                          <img src={img.url} alt={img.altText || product.title} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="aspect-square bg-[#f6f2ec] rounded-xl" />
            )}
          </div>

          {/* Product info */}
          <div className="flex flex-col">
            <p className="text-[10px] tracking-[0.35em] uppercase text-[#a0948a] mb-2">MJP Beauty</p>
            <h1 className="text-2xl font-semibold text-[#3d3028] mb-4 leading-snug">{product.title}</h1>

            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-3xl font-semibold text-[#3d3028]">{formatPrice(product.price)}</span>
              <span className="text-sm text-[#5a5047] ml-1">CAD</span>
            </div>

            <div className="h-px bg-[#e3e2de] mb-6" />

            {product.descriptionHtml ? (
              <div
                className="text-sm text-[#6b5f58] leading-relaxed mb-8 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            ) : product.description ? (
              <p className="text-sm text-[#6b5f58] leading-relaxed mb-8">{product.description}</p>
            ) : null}

            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="w-full py-3.5 rounded-lg bg-[#3d3028] text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#2a1a0e] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addingToCart ? 'Processing…' : 'Add to Cart'}
            </button>
          </div>

        </div>
      </section>
    </main>
  )
}
