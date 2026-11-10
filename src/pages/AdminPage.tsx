import { useState } from 'react'
import AdminHeader from '../components/admin/AdminHeader'
import AdminSidebar from '../components/admin/AdminSidebar'
import BrowCalendarPanel from '../components/admin/BrowCalendarPanel'
import CoursesPlaceholderPanel from '../components/admin/CoursesPlaceholderPanel'
import MadeForMorePanel from '../components/admin/MadeForMorePanel'
import MentorshipPanel from '../components/admin/MentorshipPanel'
import ServiceRequestsList from '../components/admin/ServiceRequestsList'
import ServiceRequestsToolbar from '../components/admin/ServiceRequestsToolbar'
import TrainingBookingsPanel from '../components/admin/TrainingBookingsPanel'
import TrainingDatesPanel from '../components/admin/TrainingDatesPanel'
import { useServiceRequests } from '../components/admin/serviceRequests'
import { useAdminSession } from '../components/admin/useAdminSession'
import { useBrowCalendar } from '../components/admin/useBrowCalendar'
import type { AdminCategory, PanelRefresh, ServicesView, TrainingView } from '../components/admin/adminShell'

export default function AdminPage() {
  const session = useAdminSession()
  const [category, setCategory] = useState<AdminCategory>('services')
  const [trainingView, setTrainingView] = useState<TrainingView>('bookings')
  const [servicesView, setServicesView] = useState<ServicesView>('requests')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const serviceRequests = useServiceRequests({
    token: session.token,
    requests: session.requests,
    onRefetch: session.refetchRequests,
  })

  const showCalendar = session.authenticated && category === 'services' && servicesView === 'calendar'
  const calendar = useBrowCalendar(session.token, showCalendar, session.signOut)

  function handleSignOut() {
    session.signOut()
    setSidebarOpen(false)
  }

  const refresh: PanelRefresh | null =
    category === 'mentorship' || category === 'courses'
      ? null
      : showCalendar
        ? { run: calendar.reload, loading: calendar.loading }
        : { run: session.reloadAll, loading: session.anyLoading }

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
          courses: 0,
        }}
        trainingView={trainingView}
        onTrainingViewSelect={setTrainingView}
        servicesView={servicesView}
        onServicesViewSelect={setServicesView}
        onSignOut={handleSignOut}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-72">
        <div className="sticky top-0 z-30 bg-[#f6f2ec]">
          <AdminHeader category={category} onOpenSidebar={() => setSidebarOpen(true)} refresh={refresh} />
          {category === 'services' && servicesView === 'requests' && (
            <ServiceRequestsToolbar controller={serviceRequests} />
          )}
        </div>

        {showCalendar && <BrowCalendarPanel token={session.token} calendar={calendar} onUnauthorized={session.signOut} />}

        {category === 'services' && servicesView === 'requests' && (
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

        {category === 'courses' && <CoursesPlaceholderPanel />}
      </div>
    </div>
  )
}
