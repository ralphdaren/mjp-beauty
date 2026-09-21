import { useState } from 'react'
import AdminHeader from '../components/admin/AdminHeader'
import AdminLogin from '../components/admin/AdminLogin'
import AdminSidebar from '../components/admin/AdminSidebar'
import MadeForMorePanel from '../components/admin/MadeForMorePanel'
import MentorshipPanel from '../components/admin/MentorshipPanel'
import ServiceRequestsList from '../components/admin/ServiceRequestsList'
import ServiceRequestsToolbar from '../components/admin/ServiceRequestsToolbar'
import TrainingBookingsPanel from '../components/admin/TrainingBookingsPanel'
import TrainingDatesPanel from '../components/admin/TrainingDatesPanel'
import { useServiceRequests } from '../components/admin/serviceRequests'
import { useAdminSession } from '../components/admin/useAdminSession'
import type { AdminCategory, PanelRefresh, TrainingView } from '../components/admin/adminShell'

export default function AdminPage() {
  const session = useAdminSession()
  const [category, setCategory] = useState<AdminCategory>('services')
  const [trainingView, setTrainingView] = useState<TrainingView>('bookings')
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

  const refresh: PanelRefresh | null =
    category === 'mentorship' ? null : { run: session.reloadAll, loading: session.anyLoading }

  const holdCount = session.trainingBookings.filter((b) => b.effective_status === 'hold').length

  return (
    <div className="min-h-screen bg-[#f6f2ec]">
      <AdminSidebar
        category={category}
        onSelect={setCategory}
        counts={{
          services: serviceRequests.tabCount('pending'),
          training: holdCount,
          mentorship: 0,
          mfm: session.mfmTickets.filter((t) => !t.email_sent_at).length,
        }}
        trainingView={trainingView}
        onTrainingViewSelect={setTrainingView}
        onSignOut={handleSignOut}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-72">
        <div className="sticky top-0 z-30 bg-[#f6f2ec]">
          <AdminHeader category={category} onOpenSidebar={() => setSidebarOpen(true)} refresh={refresh} />
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

        {category === 'mfm' && (
          <MadeForMorePanel
            token={session.token}
            tickets={session.mfmTickets}
            loading={session.ticketsLoading}
            error={session.ticketsError}
            onRefetch={session.refetchMfmTickets}
          />
        )}

        {category === 'mentorship' && <MentorshipPanel />}
      </div>
    </div>
  )
}
