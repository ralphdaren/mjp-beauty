export type JudgeMeReview = {
  id: number
  title: string
  body: string
  rating: number
  created_at: string
  reviewer: { name: string; email?: string }
  product_handle: string
  verified_buyer: boolean
  published: boolean
  hidden: boolean
}

export type ReviewSubmission = {
  productId: string
  name: string
  email: string
  rating: number
  title: string
  body: string
}

export async function getAllPublishedReviews(): Promise<JudgeMeReview[]> {
  try {
    const res = await fetch('/api/judgeme')
    if (!res.ok) return []
    const data = await res.json()
    return (data.reviews ?? []).filter(
      (r: JudgeMeReview) => r.body && r.published === true && r.hidden === false
    )
  } catch {
    return []
  }
}

export async function getProductReviews(productHandle: string): Promise<JudgeMeReview[]> {
  try {
    const res = await fetch('/api/judgeme')
    if (!res.ok) return []
    const data = await res.json()
    return (data.reviews ?? []).filter(
      (r: JudgeMeReview) =>
        r.body &&
        r.product_handle === productHandle &&
        r.published === true &&
        r.hidden === false
    )
  } catch {
    return []
  }
}

export async function submitReview(
  submission: ReviewSubmission
): Promise<{ ok: boolean; message: string }> {
  try {
    const numericId = parseInt(submission.productId.split('/').pop() ?? '0', 10)
    const res = await fetch('/api/judgeme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: numericId,
        email: submission.email,
        name: submission.name,
        rating: submission.rating,
        title: submission.title,
        body: submission.body,
      }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return { ok: false, message: (data as { message?: string }).message ?? 'Failed to submit review.' }
    }
    return { ok: true, message: 'Your review has been submitted and is pending approval. Thank you!' }
  } catch {
    return { ok: false, message: 'Failed to submit review. Please try again.' }
  }
}
