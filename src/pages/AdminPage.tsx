import { useState } from 'react'
import AdminHeader from '../components/admin/AdminHeader'
import AdminLogin from '../components/admin/AdminLogin'
import AdminSidebar from '../components/admin/AdminSidebar'
import MentorshipPanel from '../components/admin/MentorshipPanel'
import ServiceRequestsList from '../components/admin/ServiceRequestsList'
import ServiceRequestsToolbar from '../components/admin/ServiceRequestsToolbar'
import TrainingBookingsPanel from '../components/admin/TrainingBookingsPanel'
import TrainingDatesPanel from '../components/admin/TrainingDatesPanel'
import { useServiceRequests } from '../components/admin/serviceRequests'
import { useAdminSession } from '../components/admin/useAdminSession'
import type { AdminCategory, PanelRefresh, TrainingView } from '../components/admin/adminShell'

/**
 * Shell for the admin dashboard: sign-in, the sidebar/header chrome, and the
 * panel the sidebar currently points at.
 *
 * Data and sign-in state live in useAdminSession; each panel owns its own view
 * state. This file only composes them.
 */
export default function AdminPage() {
  const session = useAdminSession()
  const [category, setCategory] = useState<AdminCategory>('services')
  const [trainingView, setTrainingView] = useState<TrainingView>('bookings')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Held here rather than in the services components so filters and the open
  // page survive a trip to another panel and back.
  const serviceRequests = useServiceRequests({
    token: session.token,
    requests: session.requests,
    onRefetch: session.refetchRequests,
  })

  function handleSignOut() {
    session.signOut()
    setSidebarOpen(false)
  }

  if (!session.authenticated) return <AdminLogin onSubmit={session.signIn} />

  // The header's refresh button reloads every dataset, not just the visible
  // panel — it is the same single request the page load uses, so refreshing the
  // whole dashboard costs no more than refreshing one panel, and it keeps the
  // sidebar's counts honest. Mentorship has no data, hence null.
  const refresh: PanelRefresh | null =
    category === 'mentorship' ? null : { run: session.reloadAll, loading: session.anyLoading }

  const holdCount = session.trainingBookings.filter((b) => b.effective_status === 'hold').length

  return (
    <div className="min-h-screen bg-[#f6f2ec]">
      {/* Selecting a panel deliberately leaves the mobile drawer open — admins
          dismiss it themselves, via the close icon or the backdrop. */}
      <AdminSidebar
        category={category}
        onSelect={setCategory}
        counts={{ services: serviceRequests.tabCount('pending'), training: holdCount, mentorship: 0 }}
        trainingView={trainingView}
        onTrainingViewSelect={setTrainingView}
        onSignOut={handleSignOut}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-72">
        <div className="sticky top-0 z-30 bg-[#f6f2ec]">
          <AdminHeader category={category} onOpenSidebar={() => setSidebarOpen(true)} refresh={refresh} />
          {/* Only the services list pins its controls; the training panels keep
              theirs inline, above their own rows. */}
          {category === 'services' && <ServiceRequestsToolbar controller={serviceRequests} />}
        </div>

        {category === 'services' && (
          <ServiceRequestsList
            controller={serviceRequests}
            loading={session.requestsLoading}
            error={session.requestsError}
          />
        )}

        {category === 'training' && trainingView === 'bookings' && (
          <TrainingBookingsPanel
            token={session.token}
            bookings={session.trainingBookings}
            loading={session.bookingsLoading}
            error={session.bookingsError}
            onRefetch={session.refetchTrainingBookings}
          />
        )}
        {category === 'training' && trainingView === 'dates' && (
          <TrainingDatesPanel
            token={session.token}
            dates={session.trainingDates}
            loading={session.datesLoading}
            error={session.datesError}
            onRefetch={session.refetchTrainingDates}
          />
        )}

        {category === 'mentorship' && <MentorshipPanel />}
      </div>
    </div>
  )
}
