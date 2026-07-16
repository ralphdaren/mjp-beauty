import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Plus, Pencil, Trash2, X, ChevronDown } from 'lucide-react'

interface TrainingDateRow {
  id: string
  option: 'group' | 'private'
  starts_at: string
  location: string
  spots_total: number
  spots_taken: number
  spots_remaining: number
  is_published: boolean
}

interface FormState {
  option: 'group' | 'private'
  datetime: string // datetime-local value
  location: string
  spotsTotal: string
  isPublished: boolean
}

const TIMEZONE = 'America/Winnipeg'
const EMPTY_FORM: FormState = { option: 'group', datetime: '', location: '', spotsTotal: '5', isPublished: true }

const OPTION_LABEL: Record<'group' | 'private', string> = { group: 'Small Group', private: 'Private 1-on-1' }

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-CA', {
    timeZone: TIMEZONE,
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

// ISO → 'YYYY-MM-DDTHH:mm' in the browser's local time, for the datetime-local input.
function isoToLocalInput(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function TrainingDatesPanel({ token }: { token: string }) {
  const [dates, setDates] = useState<TrainingDateRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  const fetchDates = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin?resource=training-dates', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load dates')
      setDates(data.dates ?? [])
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchDates() }, [fetchDates])

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setFormOpen(true)
  }

  function openEdit(row: TrainingDateRow) {
    setEditingId(row.id)
    setForm({
      option: row.option,
      datetime: isoToLocalInput(row.starts_at),
      location: row.location,
      spotsTotal: String(row.spots_total),
      isPublished: row.is_published,
    })
    setFormError('')
    setFormOpen(true)
  }

  async function handleSave() {
    const spots = Number(form.spotsTotal)
    if (!form.datetime) return setFormError('Please pick a date and time.')
    if (!form.location.trim()) return setFormError('Please enter a location.')
    if (!Number.isInteger(spots) || spots < 0) return setFormError('Seats must be a whole number.')

    setSaving(true)
    setFormError('')
    try {
      const payload = {
        resource: 'training-dates',
        action: editingId ? 'update' : 'create',
        ...(editingId ? { id: editingId } : {}),
        option: form.option,
        startsAt: new Date(form.datetime).toISOString(),
        location: form.location.trim(),
        spotsTotal: spots,
        isPublished: form.isPublished,
      }
      const res = await fetch('/api/admin', { method: 'POST', headers: authHeaders, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to save')
      setFormOpen(false)
      await fetchDates()
    } catch (err) {
      setFormError(String(err).replace('Error: ', ''))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this training date? Any holds/bookings on it will also be removed.')) return
    setDeletingId(id)
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ resource: 'training-dates', action: 'delete', id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to delete')
      await fetchDates()
    } catch (err) {
      alert(String(err))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="px-6 py-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDates}
            disabled={loading}
            className="p-2.5 border border-[#e3e2de] rounded-full text-[#6b5f58] hover:border-[#3d3530] hover:text-[#3d3530] transition-colors disabled:opacity-50 bg-white"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <p className="text-sm text-[#6b5f58]">{dates.length} date{dates.length === 1 ? '' : 's'}</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 bg-[#3d3530] text-white text-xs tracking-[0.1em] uppercase rounded-full px-4 py-2.5 hover:bg-[#2a2320] transition-colors"
        >
          <Plus size={15} />
          Add Date
        </button>
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {!loading && dates.length === 0 && (
        <div className="text-center py-16 text-[#a0948a] text-sm">No training dates yet. Add your first one.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dates.map((d) => (
          <div key={d.id} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#3d3530]">{formatDateTime(d.starts_at)}</p>
                <p className="text-xs text-[#6b5f58]">{d.location}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.08em] shrink-0 bg-[#f0ece6] text-[#6b5f58]">
                {OPTION_LABEL[d.option]}
              </span>
            </div>

            <div className="bg-[#f6f2ec] rounded-xl p-4 flex items-center justify-between text-xs mb-4">
              <div>
                <p className="text-[#a0948a] uppercase tracking-[0.1em] mb-0.5">Seats</p>
                <p className="text-[#3d3530] font-medium">
                  {d.spots_taken} booked / {d.spots_total} total
                  <span className={`ml-2 ${d.spots_remaining <= 0 ? 'text-red-400' : 'text-[#4a9d6f]'}`}>
                    {d.spots_remaining <= 0 ? 'Full' : `${d.spots_remaining} left`}
                  </span>
                </p>
              </div>
              {!d.is_published && (
                <span className="text-[10px] uppercase tracking-[0.1em] text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Hidden</span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => openEdit(d)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white border border-[#e3e2de] text-[#6b5f58] text-xs tracking-[0.1em] uppercase rounded-full hover:border-[#3d3530] hover:text-[#3d3530] transition-colors"
              >
                <Pencil size={13} />
                Edit
              </button>
              <button
                onClick={() => handleDelete(d.id)}
                disabled={deletingId === d.id}
                className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-white border border-red-200 text-red-500 text-xs tracking-[0.1em] uppercase rounded-full hover:enabled:bg-red-500 hover:enabled:border-red-500 hover:enabled:text-white disabled:opacity-50 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create / edit modal */}
      {formOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !saving && setFormOpen(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-[420px] shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e3e2de]">
              <h3 className="text-sm font-semibold text-[#3d3530]">{editingId ? 'Edit Training Date' : 'Add Training Date'}</h3>
              <button onClick={() => !saving && setFormOpen(false)} className="p-1 rounded-full hover:bg-[#f0ece6] transition-colors" aria-label="Close">
                <X size={16} className="text-[#827064]" />
              </button>
            </div>

            <div className="px-5 py-5 space-y-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#a0948a] mb-1.5">Training</label>
                <div className="relative">
                  <select
                    value={form.option}
                    onChange={(e) => setForm((f) => ({ ...f, option: e.target.value as 'group' | 'private' }))}
                    className="w-full appearance-none border border-[#e3e2de] rounded-lg pl-3 pr-9 py-2.5 text-sm text-[#3d3530] focus:outline-none focus:border-[#827064] bg-white"
                  >
                    <option value="group">Small Group</option>
                    <option value="private">Private 1-on-1</option>
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#a0948a]" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#a0948a] mb-1.5">Date &amp; Time</label>
                <input
                  type="datetime-local"
                  value={form.datetime}
                  onChange={(e) => setForm((f) => ({ ...f, datetime: e.target.value }))}
                  className="w-full border border-[#e3e2de] rounded-lg px-3 py-2.5 text-sm text-[#3d3530] focus:outline-none focus:border-[#827064] bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#a0948a] mb-1.5">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="e.g. MJP Beauty Studio, Winnipeg"
                  className="w-full border border-[#e3e2de] rounded-lg px-3 py-2.5 text-sm text-[#3d3530] placeholder:text-[#c0b4ac] focus:outline-none focus:border-[#827064] bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#a0948a] mb-1.5">Total Seats</label>
                <input
                  type="number"
                  min={0}
                  value={form.spotsTotal}
                  onChange={(e) => setForm((f) => ({ ...f, spotsTotal: e.target.value }))}
                  className="w-full border border-[#e3e2de] rounded-lg px-3 py-2.5 text-sm text-[#3d3530] focus:outline-none focus:border-[#827064] bg-white"
                />
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
                  className="accent-[#3d3530]"
                />
                <span className="text-xs text-[#6b5f58]">Published (visible to students on the website)</span>
              </label>

              {formError && <p className="text-xs text-red-500">{formError}</p>}
            </div>

            <div className="flex gap-2 px-5 pb-5">
              <button
                onClick={() => setFormOpen(false)}
                disabled={saving}
                className="flex-1 py-2.5 bg-white border border-[#e3e2de] text-[#6b5f58] text-xs tracking-[0.1em] uppercase rounded-full hover:border-[#3d3530] hover:text-[#3d3530] disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 bg-[#3d3530] text-white text-xs tracking-[0.1em] uppercase rounded-full hover:enabled:bg-[#2a2320] disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Date'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
