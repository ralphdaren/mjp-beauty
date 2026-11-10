import { Award } from 'lucide-react'
import { useMyCourses } from '@/lib/portal/useMyCourses'

export default function CertificatesPage() {
  const { cards, error } = useMyCourses()
  const completed = (cards ?? []).filter((c) => c.status === 'completed')

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold">Certificates</h1>
      {error && (
        <p className="mt-6 text-sm text-red-700" role="alert">
          We couldn't load your certificates. Please refresh the page.
        </p>
      )}
      {cards && completed.length === 0 && (
        <p className="mt-6 rounded-xl border border-brand-border bg-white px-6 py-10 text-center text-sm text-brand">
          Finish a course to unlock its certificate.
        </p>
      )}
      {completed.length > 0 && (
        <ul className="mt-6 space-y-3">
          {completed.map((c) => (
            <li key={c.courseId} className="flex items-center gap-3 rounded-xl border border-brand-border bg-white px-4 py-3">
              <Award size={20} className="text-[#8a5a44] shrink-0" />
              <span className="text-sm">
                <span className="font-semibold">{c.title}</span>: certificate coming soon
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
