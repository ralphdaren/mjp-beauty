import { useEffect, useMemo, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Star, X } from 'lucide-react'
import { getAllPublishedReviews, submitReview } from '@/lib/judgeme'
import type { JudgeMeReview } from '@/lib/judgeme'
import type { ShopifyProduct } from '@/lib/shopify'

const REVIEWS_PER_PAGE = 3

// Only the two full-course products carry reviews for this page — single
// modules have their own product pages.
const COURSES = [
  { label: 'Independent Artist', handle: import.meta.env.VITE_SHOPIFY_HANDLE_INDEPENDENT as string },
  { label: 'VIP Mentorship', handle: import.meta.env.VITE_SHOPIFY_HANDLE_VIP as string },
]

type SortOption = 'recent' | 'highest' | 'lowest'

const SORT_LABELS: Record<SortOption, string> = {
  recent: 'Most Recent',
  highest: 'Highest Rating',
  lowest: 'Lowest Rating',
}

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          width={size}
          height={size}
          fill={i <= rating ? '#b07b5a' : '#e3ddd8'}
          stroke={i <= rating ? '#b07b5a' : '#e3ddd8'}
        />
      ))}
    </div>
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

const inputClass =
  'w-full px-4 py-2.5 rounded-lg border border-[#e3e2de] bg-white text-sm text-[#3d3028] placeholder:text-[#c4b8b0] focus:outline-none focus:border-[#827064] transition-colors'

const emptyForm = { name: '', email: '', title: '', body: '', rating: 0, honeypot: '' }

export default function CourseReviewsSection({
  products,
}: {
  // Index-aligned with COURSES — supplies the Judge.me product id when writing a review.
  products: (ShopifyProduct | null)[]
}) {
  const [reviews, setReviews] = useState<JudgeMeReview[]>([])
  const [filter, setFilter] = useState<'all' | string>('all')
  const [sort, setSort] = useState<SortOption>('recent')
  const [page, setPage] = useState(1)

  // Write-a-review modal
  const [showModal, setShowModal] = useState(false)
  const [courseIndex, setCourseIndex] = useState(0)
  const [form, setForm] = useState(emptyForm)
  const [hoverRating, setHoverRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{ ok: boolean; message: string } | null>(null)

  useEffect(() => {
    const handles = COURSES.map(c => c.handle)
    getAllPublishedReviews().then(all =>
      setReviews(all.filter(r => handles.includes(r.product_handle)))
    )
  }, [])

  // The summary always reflects every course review; only the list below reacts
  // to the filter.
  const avg = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  const breakdown = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
  }))

  const visibleReviews = useMemo(() => {
    const filtered = filter === 'all' ? reviews : reviews.filter(r => r.product_handle === filter)
    return [...filtered].sort((a, b) => {
      if (sort === 'highest') return b.rating - a.rating
      if (sort === 'lowest') return a.rating - b.rating
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [reviews, filter, sort])

  const totalPages = Math.max(1, Math.ceil(visibleReviews.length / REVIEWS_PER_PAGE))
  const pageReviews = visibleReviews.slice((page - 1) * REVIEWS_PER_PAGE, page * REVIEWS_PER_PAGE)

  // Changing the visible set always sends the reader back to its first page.
  const applyFilter = (value: string) => { setFilter(value); setPage(1) }
  const applySort = (value: SortOption) => { setSort(value); setPage(1) }

  const closeModal = useCallback(() => {
    setShowModal(false)
    setForm(emptyForm)
    setHoverRating(0)
    setSubmitResult(null)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const product = products[courseIndex]
    if (!product || form.rating === 0) return
    setSubmitting(true)
    const result = await submitReview({
      productId: product.id,
      name: form.name,
      email: form.email,
      rating: form.rating,
      title: form.title,
      body: form.body,
      honeypot: form.honeypot,
    })
    setSubmitting(false)
    setSubmitResult(result)
    if (result.ok) setForm(emptyForm)
  }

  if (reviews.length === 0) return null

  return (
    <section className="bg-[#f6f2ec] py-20 px-6 md:px-8">
      <div className="max-w-[1200px] mx-auto">

        {/* Header — no scroll-reveal class here: the page-level observer only
            picks up elements present at mount, and this section renders once
            the reviews have loaded. */}
        <div>
          <p className="text-[0.72rem] uppercase tracking-[0.3em] text-[#b07b5a] mb-4">
            Client Reviews
          </p>
          <h2
            className="about-heading leading-tight text-[#3d3028]"
            style={{ fontSize: 'clamp(1.9rem, 3.2vw, 3rem)' }}
          >
            What Beauty Artists Are Saying.
          </h2>
        </div>

        <div className="h-px bg-[#d8d0c8] mt-10" />

        {/* Rating summary */}
        <div className="grid gap-10 py-12 items-center md:grid-cols-[minmax(150px,auto)_1fr] lg:grid-cols-[minmax(150px,auto)_1fr_auto]">

          {/* Average */}
          <div>
            <p className="about-heading text-[3.5rem] leading-none text-[#3d3028]">
              {avg.toFixed(1)}
            </p>
            <div className="mt-3">
              <Stars rating={Math.round(avg)} size={16} />
            </div>
            <p className="mt-2 text-sm text-[#5a5047]">
              Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Star breakdown */}
          <div className="flex flex-col gap-3 w-full max-w-[560px] lg:mx-auto">
            {breakdown.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-4">
                <span className="text-sm text-[#5a5047] w-3 text-right shrink-0">{star}</span>
                <div className="flex-1 h-[3px] bg-[#e0dbd4] overflow-hidden">
                  <div
                    className="h-full bg-[#b07b5a] transition-all duration-500"
                    style={{ width: `${(count / reviews.length) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-[#5a5047] w-4 text-right shrink-0">{count}</span>
              </div>
            ))}
          </div>

          {/* Write a review */}
          <button
            onClick={() => setShowModal(true)}
            className="justify-self-start lg:justify-self-end px-9 py-4 bg-[#3d3028] text-white text-[0.72rem] uppercase tracking-[0.2em] font-medium hover:bg-[#2a1a0e] transition-colors duration-200"
          >
            Write a Review
          </button>
        </div>

        <div className="h-px bg-[#d8d0c8]" />

        {/* Filter + sort toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-5 py-7">
          <p className="text-sm text-[#3d3028]">
            {visibleReviews.length} Review{visibleReviews.length !== 1 ? 's' : ''}
          </p>

          <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
            {/* Filter */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="text-[0.68rem] uppercase tracking-[0.22em] text-[#b07b5a]">Filter</span>
              {[{ label: 'All', value: 'all' }, ...COURSES.map(c => ({ label: c.label, value: c.handle }))].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => applyFilter(opt.value)}
                  className={[
                    'text-sm transition-colors duration-200',
                    filter === opt.value
                      ? 'text-[#3d3028] underline underline-offset-[6px] decoration-[#3d3028]'
                      : 'text-[#a0948a] hover:text-[#5a5047]',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="text-[0.68rem] uppercase tracking-[0.22em] text-[#b07b5a]">Sort by</span>
              {(Object.keys(SORT_LABELS) as SortOption[]).map(opt => (
                <button
                  key={opt}
                  onClick={() => applySort(opt)}
                  className={[
                    'text-sm transition-colors duration-200',
                    sort === opt
                      ? 'text-[#3d3028] underline underline-offset-[6px] decoration-[#3d3028]'
                      : 'text-[#a0948a] hover:text-[#5a5047]',
                  ].join(' ')}
                >
                  {SORT_LABELS[opt]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Review list */}
        {pageReviews.length > 0 ? (
          <div className="flex flex-col">
            {pageReviews.map(review => (
              <div
                key={review.id}
                className="grid gap-4 md:gap-10 md:grid-cols-[minmax(180px,220px)_1fr] py-10 border-t border-[#e0dbd4]"
              >
                <div>
                  <p className="about-heading text-xl text-[#3d3028] leading-snug">
                    {review.reviewer.name}
                  </p>
                  {review.created_at && (
                    <p className="mt-1.5 text-sm text-[#a0948a]">{formatDate(review.created_at)}</p>
                  )}
                </div>
                <div>
                  <Stars rating={review.rating} size={14} />
                  {review.title && (
                    <h3 className="about-subheading text-xl sm:text-2xl text-[#3d3028] leading-snug mt-4">
                      {review.title}
                    </h3>
                  )}
                  <p className="mt-3 text-[#5a5047] text-sm sm:text-base leading-relaxed max-w-2xl">
                    {review.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-14 border-t border-[#e0dbd4] text-center">
            <p className="text-sm text-[#a0948a]">No reviews for this option yet.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-10 border-t border-[#e0dbd4]">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-9 h-9 rounded-full border border-[#d8d0c8] bg-white flex items-center justify-center text-[#3d3028] hover:border-[#3d3028] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-sm text-[#5a5047]">
              Page <span className="font-medium text-[#3d3028]">{page}</span> of{' '}
              <span className="font-medium text-[#3d3028]">{totalPages}</span>
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-9 h-9 rounded-full border border-[#d8d0c8] bg-white flex items-center justify-center text-[#3d3028] hover:border-[#3d3028] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Write a Review modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
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

            <div className="px-8 py-6 overflow-y-auto">
              {submitResult ? (
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
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {/* Honeypot — off-screen and skipped by keyboard and screen
                      readers, so only a bot ever fills it in. */}
                  <div
                    style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}
                    aria-hidden="true"
                  >
                    <label htmlFor="review-website">Website</label>
                    <input
                      type="text"
                      id="review-website"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={form.honeypot}
                      onChange={e => setForm(f => ({ ...f, honeypot: e.target.value }))}
                    />
                  </div>

                  {/* Which course */}
                  <div>
                    <label className="text-xs font-medium text-[#6b5f58] tracking-wide block mb-2">
                      Which training did you take? <span className="text-red-400">*</span>
                    </label>
                    <div className="flex gap-2">
                      {COURSES.map((course, i) => (
                        <button
                          type="button"
                          key={course.handle}
                          onClick={() => setCourseIndex(i)}
                          className={`flex-1 py-2.5 rounded-lg text-xs tracking-wide transition-colors duration-150 ${
                            courseIndex === i
                              ? 'bg-[#3d3028] text-white'
                              : 'bg-white text-[#6b5f58] border border-[#e3e2de] hover:border-[#3d3028] hover:text-[#3d3028]'
                          }`}
                        >
                          {course.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
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
                          <Star
                            width={28}
                            height={28}
                            fill={i <= (hoverRating || form.rating) ? '#b07b5a' : '#e3ddd8'}
                            stroke={i <= (hoverRating || form.rating) ? '#b07b5a' : '#e3ddd8'}
                          />
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
                      maxLength={200}
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
                      maxLength={254}
                      placeholder="your@email.com"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className={inputClass}
                    />
                    <p className="text-[11px] text-[#a0948a] mt-1">Used to verify your enrollment. Not displayed publicly.</p>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="text-xs font-medium text-[#6b5f58] tracking-wide block mb-1.5">
                      Review Title
                    </label>
                    <input
                      type="text"
                      maxLength={200}
                      placeholder="Sum it up in a few words"
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      className={inputClass}
                    />
                  </div>

                  {/* Body */}
                  <div>
                    <label className="text-xs font-medium text-[#6b5f58] tracking-wide block mb-1.5">
                      Your Review <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      maxLength={5000}
                      placeholder="Share your experience with this training…"
                      value={form.body}
                      onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={submitting || form.rating === 0 || !products[courseIndex]}
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
    </section>
  )
}
