import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, X, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { getProductByHandle, createCheckoutUrl, formatPrice } from '@/lib/shopify'
import type { ShopifyProduct } from '@/lib/shopify'
import { getProductReviews, submitReview } from '@/lib/judgeme'
import type { JudgeMeReview } from '@/lib/judgeme'

const REVIEWS_PER_PAGE = 3

type FilterOption = 'recent' | 'highest' | 'lowest'

function Stars({ rating, size = 15 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          width={size}
          height={size}
          fill={i <= rating ? '#3d3028' : '#e3e2de'}
          stroke={i <= rating ? '#3d3028' : '#e3e2de'}
        />
      ))}
    </div>
  )
}

function StarIcon({ filled, size = 20 }: { filled: boolean; size?: number }) {
  return (
    <Star
      width={size}
      height={size}
      fill={filled ? '#3d3028' : '#e3e2de'}
      stroke={filled ? '#3d3028' : '#e3e2de'}
    />
  )
}

function formatDate(iso: string): string {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return ''
  }
}

// Max thumbnails rendered at once; any beyond this collapse into a "+N" tile.
const THUMBNAIL_LIMIT = 5

export default function ProductDetailPage() {
  const { handle } = useParams<{ handle: string }>()
  const [product, setProduct] = useState<ShopifyProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [addingToCart, setAddingToCart] = useState(false)
  const [reviews, setReviews] = useState<JudgeMeReview[]>([])

  // Review list state
  const [filter, setFilter] = useState<FilterOption>('recent')
  const [page, setPage] = useState(1)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', rating: 0, title: '', body: '' })
  const [hoverRating, setHoverRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{ ok: boolean; message: string } | null>(null)

  useEffect(() => {
    if (!handle) { setLoading(false); return }
    getProductByHandle(handle)
      .then(setProduct)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [handle])

  useEffect(() => {
    if (!handle) return
    getProductReviews(handle).then(setReviews)
  }, [handle])

  useEffect(() => { setPage(1) }, [filter])

  const images = product
    ? product.images.length > 0
      ? product.images
      : product.featuredImage ? [product.featuredImage] : []
    : []

  const handlePrev = () => setCurrentImageIndex(i => (i - 1 + images.length) % images.length)
  const handleNext = () => setCurrentImageIndex(i => (i + 1) % images.length)

  // Live finger offset while swiping; the track follows the drag, then snaps on release.
  const trackRef = useRef<HTMLDivElement>(null)
  const swipeStartX = useRef(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    swipeStartX.current = e.touches[0].clientX
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) setDragOffset(e.touches[0].clientX - swipeStartX.current)
  }

  const handleTouchEnd = () => {
    const width = trackRef.current?.offsetWidth ?? 0
    // A quarter of the frame is enough intent to advance; anything less snaps back.
    if (width > 0 && Math.abs(dragOffset) > width / 4) {
      dragOffset < 0 ? handleNext() : handlePrev()
    }
    setDragOffset(0)
    setIsDragging(false)
  }

  // Slide the thumbnail window so the active image is always one of the visible tiles.
  const thumbStart = Math.min(
    Math.max(0, currentImageIndex - Math.floor(THUMBNAIL_LIMIT / 2)),
    Math.max(0, images.length - THUMBNAIL_LIMIT),
  )
  const visibleThumbs = images.slice(thumbStart, thumbStart + THUMBNAIL_LIMIT)
  const hiddenThumbCount = images.length - (thumbStart + visibleThumbs.length)

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

  // Review computed values
  const avg = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  const breakdown = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
  }))

  const sortedReviews = [...reviews].sort((a, b) => {
    if (filter === 'recent') {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
      return bTime - aTime
    }
    if (filter === 'highest') return b.rating - a.rating
    return a.rating - b.rating
  })

  const totalPages = Math.max(1, Math.ceil(sortedReviews.length / REVIEWS_PER_PAGE))
  const pageReviews = sortedReviews.slice((page - 1) * REVIEWS_PER_PAGE, page * REVIEWS_PER_PAGE)

  const openModal = () => {
    setSubmitResult(null)
    setForm({ name: '', email: '', rating: 0, title: '', body: '' })
    setHoverRating(0)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSubmitResult(null)
    setHoverRating(0)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!product || form.rating === 0 || !form.name.trim() || !form.email.trim() || !form.body.trim()) return
    setSubmitting(true)
    const result = await submitReview({
      productId: product.id,
      name: form.name.trim(),
      email: form.email.trim(),
      rating: form.rating,
      title: form.title.trim(),
      body: form.body.trim(),
    })
    setSubmitting(false)
    setSubmitResult(result)
  }

  const inputClass =
    'w-full rounded-lg border border-[#e3e2de] bg-[#faf8f5] px-3.5 py-2.5 text-sm text-[#3d3028] placeholder-[#c4b8b0] outline-none focus:border-[#3d3028] transition-colors'

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
          <div className="min-w-0">
            {images.length > 0 ? (
              <>
                <div
                  ref={trackRef}
                  className="relative aspect-square bg-[#f6f2ec] rounded-xl overflow-hidden touch-pan-y"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <div
                    className={`flex h-full ${isDragging ? '' : 'transition-transform duration-500 ease-out'} motion-reduce:transition-none`}
                    style={{ transform: `translateX(calc(${currentImageIndex * -100}% + ${dragOffset}px))` }}
                  >
                    {images.map((img, i) => (
                      <img
                        key={i}
                        src={img.url}
                        alt={img.altText || product.title}
                        className="w-full h-full shrink-0 object-contain select-none pointer-events-none"
                        loading={i === 0 ? 'eager' : 'lazy'}
                        decoding="async"
                        draggable={false}
                      />
                    ))}
                  </div>
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

                    <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                      {visibleThumbs.map((img, i) => {
                        const index = thumbStart + i
                        // The final tile stands in for every remaining image when the set is capped.
                        const isOverflowTile = hiddenThumbCount > 0 && i === visibleThumbs.length - 1
                        return (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${index === currentImageIndex ? 'border-[#3d3028]' : 'border-[#e3e2de]'}`}
                            aria-label={isOverflowTile ? `Show ${hiddenThumbCount} more image${hiddenThumbCount !== 1 ? 's' : ''}` : `Image ${index + 1}`}
                          >
                            <img src={img.url} alt={img.altText || product.title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                            {isOverflowTile && (
                              <span className="absolute inset-0 flex items-center justify-center bg-[#3d3028]/65 text-white text-xs font-medium">
                                +{hiddenThumbCount}
                              </span>
                            )}
                          </button>
                        )
                      })}
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

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-semibold text-[#3d3028]">{formatPrice(product.price)}</span>
                <span className="text-sm text-[#5a5047] ml-1">CAD</span>
              </div>
              {reviews.length > 0 && (
                <div className="flex items-center gap-1">
                  <Star size={13} fill="#3d3028" stroke="#3d3028" />
                  <span className="text-sm text-[#3d3028] font-medium leading-none">{avg.toFixed(1)}</span>
                  <span className="text-sm text-[#a0948a] leading-none">({reviews.length})</span>
                </div>
              )}
            </div>

            <div className="h-px bg-[#e3e2de] mb-6" />

            {product.descriptionHtml ? (
              <div
                className="shopify-description mb-8"
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

      {/* Reviews */}
      <section className="bg-[#f6f2ec] py-16 px-6 md:px-8 border-t border-[#e3e2de]">
        <div className="max-w-[1200px] mx-auto">

          {/* Section header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-semibold text-[#3d3028]">Reviews</h2>
              {reviews.length > 0 && (
                <p className="text-xs text-[#a0948a] mt-0.5">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
              )}
            </div>
            <button
              onClick={openModal}
              className="px-5 py-2.5 rounded-lg border border-[#3d3028] text-[#3d3028] text-xs tracking-[0.15em] uppercase font-medium hover:bg-[#3d3028] hover:text-white transition-colors duration-200"
            >
              Write a Review
            </button>
          </div>

          {reviews.length > 0 ? (
            <>
              {/* Summary card */}
              <div className="bg-white rounded-xl border border-[#e3e2de] p-6 mb-8 flex flex-col md:flex-row gap-8 items-center md:items-stretch">
                {/* Average score */}
                <div className="flex flex-col items-center justify-center gap-2 min-w-[130px]">
                  <span className="text-5xl font-semibold text-[#3d3028] leading-none">{avg.toFixed(1)}</span>
                  <Stars rating={Math.round(avg)} size={16} />
                  <span className="text-xs text-[#a0948a]">out of 5</span>
                </div>

                <div className="w-px bg-[#e3e2de] hidden md:block self-stretch" />
                <div className="w-full h-px bg-[#e3e2de] md:hidden" />

                {/* Star breakdown */}
                <div className="flex flex-col gap-2.5 flex-1 justify-center">
                  {breakdown.map(({ star, count }) => (
                    <div key={star} className="flex items-center gap-3">
                      <span className="text-xs text-[#6b5f58] w-3 text-right shrink-0">{star}</span>
                      <svg width="11" height="11" viewBox="0 0 20 20" className="shrink-0">
                        <path
                          d="M10 1l2.39 4.843L18 6.908l-4 3.897.944 5.504L10 13.77l-4.944 2.539L6 10.805 2 6.908l5.61-1.065L10 1z"
                          fill="#3d3028"
                        />
                      </svg>
                      <div className="flex-1 h-1.5 bg-[#e3e2de] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#3d3028] rounded-full transition-all duration-500"
                          style={{ width: reviews.length > 0 ? `${(count / reviews.length) * 100}%` : '0%' }}
                        />
                      </div>
                      <span className="text-xs text-[#a0948a] w-5 text-right shrink-0">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <span className="text-xs text-[#a0948a] tracking-wide shrink-0">Sort by:</span>
                <div className="flex gap-2 flex-wrap">
                  {(['recent', 'highest', 'lowest'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-1.5 rounded-full text-xs tracking-wide transition-colors duration-150 ${
                        filter === f
                          ? 'bg-[#3d3028] text-white'
                          : 'bg-white text-[#6b5f58] border border-[#e3e2de] hover:border-[#3d3028] hover:text-[#3d3028]'
                      }`}
                    >
                      {f === 'recent' ? 'Most Recent' : f === 'highest' ? 'Highest Rating' : 'Lowest Rating'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Review list */}
              <div className="flex flex-col gap-4 mb-8">
                {pageReviews.map(review => (
                  <div key={review.id} className="bg-white rounded-xl border border-[#e3e2de] p-6">
                    <Stars rating={review.rating} size={14} />
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-2.5 mb-3">
                      <span className="text-sm font-semibold text-[#3d3028]">{review.reviewer.name}</span>
                      {review.created_at && (
                        <>
                          <span className="text-[#d5cdc7] text-xs">·</span>
                          <span className="text-xs text-[#a0948a]">{formatDate(review.created_at)}</span>
                        </>
                      )}
                    </div>
                    {review.title && (
                      <p className="text-sm font-semibold text-[#3d3028] mb-2">{review.title}</p>
                    )}
                    <p className="text-sm text-[#6b5f58] leading-relaxed">{review.body}</p>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-9 h-9 rounded-full border border-[#e3e2de] bg-white flex items-center justify-center text-[#3d3028] hover:border-[#3d3028] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <span className="text-sm text-[#6b5f58]">
                    Page <span className="font-medium text-[#3d3028]">{page}</span> of{' '}
                    <span className="font-medium text-[#3d3028]">{totalPages}</span>
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-9 h-9 rounded-full border border-[#e3e2de] bg-white flex items-center justify-center text-[#3d3028] hover:border-[#3d3028] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Next page"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-sm text-[#a0948a]">No reviews yet — be the first to share your experience!</p>
            </div>
          )}
        </div>
      </section>

      {/* Write a Review modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-[#e3e2de]">
              <h3 className="text-base font-semibold text-[#3d3028]">Write a Review</h3>
              <button
                onClick={closeModal}
                className="w-7 h-7 flex items-center justify-center rounded-full text-[#a0948a] hover:text-[#3d3028] hover:bg-[#f6f2ec] transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-8 py-6">
              {submitResult ? (
                /* Result screen */
                <div className="flex flex-col items-center text-center gap-4 py-4">
                  {submitResult.ok ? (
                    <div className="w-12 h-12 rounded-full bg-[#f0faf0] flex items-center justify-center">
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                        <path d="M5 11l4.5 4.5L17 7" stroke="#2d7a3a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#fff0f0] flex items-center justify-center">
                      <X size={20} className="text-red-500" />
                    </div>
                  )}
                  <p className={`text-sm leading-relaxed ${submitResult.ok ? 'text-[#3d3028]' : 'text-red-600'}`}>
                    {submitResult.message}
                  </p>
                  <div className="flex gap-3 mt-2">
                    {submitResult.ok ? (
                      <button
                        onClick={closeModal}
                        className="px-6 py-2.5 rounded-lg bg-[#3d3028] text-white text-xs tracking-[0.15em] uppercase font-medium hover:bg-[#2a1a0e] transition-colors"
                      >
                        Done
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setSubmitResult(null)}
                          className="px-5 py-2.5 rounded-lg bg-[#3d3028] text-white text-xs tracking-[0.15em] uppercase font-medium hover:bg-[#2a1a0e] transition-colors"
                        >
                          Try Again
                        </button>
                        <button
                          onClick={closeModal}
                          className="px-5 py-2.5 rounded-lg border border-[#e3e2de] text-[#6b5f58] text-xs tracking-[0.15em] uppercase font-medium hover:border-[#3d3028] transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                /* Review form */
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {/* Star rating picker */}
                  <div>
                    <label className="text-xs font-medium text-[#6b5f58] tracking-wide block mb-2">
                      Rating <span className="text-red-400">*</span>
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <button
                          type="button"
                          key={i}
                          onMouseEnter={() => setHoverRating(i)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setForm(f => ({ ...f, rating: i }))}
                          className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
                          aria-label={`${i} star${i !== 1 ? 's' : ''}`}
                        >
                          <StarIcon filled={i <= (hoverRating || form.rating)} size={28} />
                        </button>
                      ))}
                    </div>
                    {form.rating === 0 && (
                      <p className="text-[11px] text-[#a0948a] mt-1">Please select a rating</p>
                    )}
                  </div>

                  {/* Name */}
                  <div>
                    <label className="text-xs font-medium text-[#6b5f58] tracking-wide block mb-1.5">
                      Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className={inputClass}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-xs font-medium text-[#6b5f58] tracking-wide block mb-1.5">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="your@email.com"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className={inputClass}
                    />
                    <p className="text-[11px] text-[#a0948a] mt-1">Used to verify your purchase. Not displayed publicly.</p>
                  </div>

                  {/* Review title */}
                  <div>
                    <label className="text-xs font-medium text-[#6b5f58] tracking-wide block mb-1.5">
                      Review Title
                    </label>
                    <input
                      type="text"
                      placeholder="Sum it up in a few words"
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      className={inputClass}
                    />
                  </div>

                  {/* Review body */}
                  <div>
                    <label className="text-xs font-medium text-[#6b5f58] tracking-wide block mb-1.5">
                      Your Review <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Share your experience with this course…"
                      value={form.body}
                      onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={submitting || form.rating === 0}
                      className="flex-1 py-3 rounded-lg bg-[#3d3028] text-white text-xs tracking-[0.2em] uppercase font-medium hover:bg-[#2a1a0e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Submitting…' : 'Submit Review'}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-5 py-3 rounded-lg border border-[#e3e2de] text-[#6b5f58] text-xs tracking-[0.15em] uppercase font-medium hover:border-[#3d3028] hover:text-[#3d3028] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
