import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import { MobileRowSkeleton, TableRowSkeleton } from './RowSkeleton'
import { formatDateTime, formatSubmitted } from './adminFormat'
import { requestServices, type BookingRequest, type RequestStatus, type ServiceRequestsController } from './serviceRequests'

const STATUS_STYLES: Record<RequestStatus, { dot: string }> = {
  pending: { dot: 'bg-amber-500' },
  accepted: { dot: 'bg-[#4a9d6f]' },
  declined: { dot: 'bg-red-400' },
  cancelled: { dot: 'bg-[#a0948a]' },
}

const SKELETON_ROWS = 5

interface RequestActionsProps {
  requestId: string
  loading: boolean
  onAction: (requestId: string, action: 'accept' | 'decline') => void
  variant: 'table' | 'card'
}

function RequestActions({ requestId, loading, onAction, variant }: RequestActionsProps) {
  const size = variant === 'table' ? 'px-4 py-1.5 text-[11px]' : 'flex-1 py-2.5 text-xs'
  return (
    <div className={`flex gap-2 ${variant === 'table' ? 'justify-end' : ''}`}>
      <button
        onClick={() => onAction(requestId, 'decline')}
        disabled={loading}
        className={`${size} bg-white border border-red-300 text-red-500 tracking-[0.1em] uppercase rounded-full disabled:opacity-50 hover:enabled:bg-red-500 hover:enabled:border-red-500 hover:enabled:text-white transition-colors`}
      >
        {loading ? '…' : 'Decline'}
      </button>
      <button
        onClick={() => onAction(requestId, 'accept')}
        disabled={loading}
        className={`${size} bg-[#3d3530] text-white tracking-[0.1em] uppercase rounded-full disabled:opacity-50 hover:enabled:bg-[#2a2320] transition-colors`}
      >
        {loading ? '…' : 'Accept'}
      </button>
    </div>
  )
}

const TH = 'px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a0948a]'

function RequestsTable({ controller, loading }: { controller: ServiceRequestsController; loading: boolean }) {
  const { tab, pageItems, actionLoading, handleAction } = controller
  const showActions = tab === 'pending'

  return (
    <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#ece7e0]">
              <th className={`w-[28%] ${TH}`}>Client</th>
              <th className={`w-[26%] ${TH}`}>Service</th>
              <th className={`w-[18%] ${TH}`}>Appointment</th>
              <th className={`w-[14%] ${TH}`}>Submitted</th>
              {showActions && <th className={`w-[1%] ${TH} text-right whitespace-nowrap`}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                  <TableRowSkeleton key={i} columns={showActions ? 5 : 4} />
                ))
              : pageItems.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-[#f1ece5] last:border-0 align-top hover:bg-[#faf8f5] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="text-xs font-semibold text-[#3d3530]">
                        {r.first_name} {r.last_name}
                      </p>
                      <p className="text-xs text-[#6b5f58] break-all">{r.email}</p>
                      {r.phone && <p className="text-xs text-[#a0948a]">{r.phone}</p>}
                    </td>
                    <td className="px-5 py-4 space-y-1.5">
                      {requestServices(r).map((item, index) => (
                        <div key={`${item.tierLabel}-${index}`}>
                          <p className="text-xs font-medium text-[#3d3530]">{item.serviceName}</p>
                          <p className="text-xs text-[#6b5f58]">{item.tierLabel}</p>
                        </div>
                      ))}
                    </td>
                    <td className="px-5 py-4 text-xs text-[#3d3530] whitespace-nowrap">
                      {formatDateTime(r.start_at)}
                      {r.duration_minutes ? (
                        <span className="block text-[#a0948a]">{r.duration_minutes} min</span>
                      ) : null}
                    </td>
                    <td className="px-5 py-4 text-xs text-[#a0948a] whitespace-nowrap">{formatSubmitted(r.created_at)}</td>
                    {showActions && (
                      <td className="px-5 py-4 whitespace-nowrap">
                        <RequestActions
                          requestId={r.id}
                          loading={actionLoading === r.id}
                          onAction={handleAction}
                          variant="table"
                        />
                      </td>
                    )}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-[#a0948a] uppercase tracking-[0.1em] shrink-0">{label}</span>
      {children}
    </div>
  )
}

function RequestCard({ request, controller }: { request: BookingRequest; controller: ServiceRequestsController }) {
  const r = request
  const { expanded, toggleExpanded, actionLoading, handleAction } = controller
  const services = requestServices(r)
  const isOpen = expanded.has(r.id)

  return (
    <div>
      <button
        onClick={() => toggleExpanded(r.id)}
        aria-expanded={isOpen}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_STYLES[r.status].dot}`} />
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold text-[#3d3530] truncate">
            {r.first_name} {r.last_name}
          </span>
          <span className="block text-[11px] text-[#6b5f58] truncate">
            {services[0].serviceName}
            {services.length > 1 ? ` +${services.length - 1}` : ''} · {formatSubmitted(r.start_at)}
          </span>
        </span>
        <ChevronDown
          size={15}
          className={`shrink-0 text-[#a0948a] transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-3">
          <div className="bg-[#f6f2ec] rounded-xl p-4 space-y-2 text-xs">
            <DetailRow label="Email">
              <span className="text-[#3d3530] text-right break-all">{r.email}</span>
            </DetailRow>
            {r.phone && (
              <DetailRow label="Phone">
                <span className="text-[#3d3530] text-right">{r.phone}</span>
              </DetailRow>
            )}
            {services.map((item, index) => (
              <DetailRow
                key={`${item.tierLabel}-${index}`}
                label={services.length > 1 ? `Service ${index + 1}` : 'Service'}
              >
                <span className="text-right">
                  <span className="text-[#3d3530] font-medium block">{item.serviceName}</span>
                  <span className="text-[#6b5f58] block">{item.tierLabel}</span>
                </span>
              </DetailRow>
            ))}
            <DetailRow label="Appointment">
              <span className="text-[#3d3530] text-right">
                {formatDateTime(r.start_at)}
                {r.duration_minutes ? <span className="block text-[#a0948a]">{r.duration_minutes} min</span> : null}
              </span>
            </DetailRow>
            <DetailRow label="Submitted">
              <span className="text-[#a0948a] text-right">{formatSubmitted(r.created_at)}</span>
            </DetailRow>
          </div>

          {r.status === 'pending' && (
            <RequestActions
              requestId={r.id}
              loading={actionLoading === r.id}
              onAction={handleAction}
              variant="card"
            />
          )}
        </div>
      )}
    </div>
  )
}

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  const button = 'p-2 rounded-full border border-[#e3e2de] text-[#6b5f58] hover:border-[#3d3530] hover:text-[#3d3530] disabled:opacity-35 disabled:cursor-not-allowed transition-colors'
  return (
    <div className="flex items-center justify-center gap-4 mt-6">
      <button onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1} className={button} aria-label="Previous page">
        <ChevronLeft size={15} />
      </button>
      <span className="text-xs text-[#6b5f58]">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className={button}
        aria-label="Next page"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  )
}

interface ServiceRequestsListProps {
  controller: ServiceRequestsController
  loading: boolean
  error: string
}

export default function ServiceRequestsList({ controller, loading, error }: ServiceRequestsListProps) {
  const { tab, search, hasActiveFilters, filtered, pageItems, page, totalPages, setPage } = controller
  const isEmpty = !loading && filtered.length === 0

  return (
    <div className="px-6 py-5 max-w-5xl mx-auto">
      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {isEmpty ? (
        <div className="text-center py-16 text-[#a0948a] text-sm">
          No {tab} requests{search.trim() || hasActiveFilters ? ' match your search.' : '.'}
        </div>
      ) : (
        <>
          <RequestsTable controller={controller} loading={loading} />

          <div className="md:hidden bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-[#f1ece5]">
            {loading
              ? Array.from({ length: SKELETON_ROWS }).map((_, i) => <MobileRowSkeleton key={i} />)
              : pageItems.map((r) => <RequestCard key={r.id} request={r} controller={controller} />)}
          </div>
        </>
      )}

      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}
    </div>
  )
}
