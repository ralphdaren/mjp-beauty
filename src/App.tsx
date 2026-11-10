import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from '@/pages/HomePage'
import BookAppointmentPage from '@/pages/BookAppointmentPage'
import InPersonTrainingPage from '@/pages/InPersonTrainingPage'
import OnlineBrowAcademyPage from '@/pages/OnlineBrowAcademyPage'
import OnlineModulesPage from '@/pages/OnlineProductListingPage'
import ProductDetailPage from '@/pages/ProductDetailPage'
import FreebiesPage from '@/pages/FreebiesPage'
import BizMentorshipPage from '@/pages/BizMentorshipPage'
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage'
import TermsOfUsePage from '@/pages/TermsOfUsePage'
import AdminPage from '@/pages/AdminPage'
import ManageBookingPage from '@/pages/ManageBookingPage'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ScrollToTop from '@/components/ScrollToTop'
import LoginPage from '@/pages/auth/LoginPage'
import SignupPage from '@/pages/auth/SignupPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
import AuthCallbackPage from '@/pages/auth/AuthCallbackPage'
import RequireAuth from '@/components/auth/RequireAuth'
import PortalLayout from '@/pages/portal/PortalLayout'
import MyCoursesPage from '@/pages/portal/MyCoursesPage'
import CertificatesPage from '@/pages/portal/CertificatesPage'
import AppointmentsPage from '@/pages/portal/AppointmentsPage'
import AccountPage from '@/pages/portal/AccountPage'
import CoursePlaceholderPage from '@/pages/portal/CoursePlaceholderPage'

const BARE_PATHS = ['/admin', '/login', '/signup', '/forgot-password', '/reset-password', '/auth/callback']
const isBarePath = (pathname: string) => BARE_PATHS.includes(pathname) || pathname === '/portal' || pathname.startsWith('/portal/')

function AppContent() {
  const { pathname } = useLocation()
  const isBareLayout = isBarePath(pathname)

  return (
    <>
      <ScrollToTop />
      {!isBareLayout && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/book-appointment" element={<BookAppointmentPage />} />
        <Route path="/in-person-training" element={<InPersonTrainingPage />} />
        <Route path="/online-brow-courses" element={<OnlineBrowAcademyPage />} />
        <Route path="/online-modules" element={<OnlineModulesPage />} />
        <Route path="/online-modules/:handle" element={<ProductDetailPage />} />
        <Route path="/freebies" element={<FreebiesPage />} />
        <Route path="/biz-mentorship" element={<BizMentorshipPage />} />
        <Route path="/made-for-more-calgary/*" element={<Navigate to="/" replace />} />
        <Route path="/made-for-more" element={<Navigate to="/" replace />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfUsePage />} />
        <Route
          path="/admin"
          element={
            <RequireAuth role="admin">
              <AdminPage />
            </RequireAuth>
          }
        />
        <Route path="/manage-booking" element={<ManageBookingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route
          path="/portal"
          element={
            <RequireAuth>
              <PortalLayout />
            </RequireAuth>
          }
        >
          <Route index element={<MyCoursesPage />} />
          <Route path="certificates" element={<CertificatesPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="courses/:slug" element={<CoursePlaceholderPage />} />
        </Route>
      </Routes>
      {!isBareLayout && <Footer />}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
