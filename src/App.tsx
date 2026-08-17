import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
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
import MadeForMorePage from '@/pages/MadeForMorePage'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ScrollToTop from '@/components/ScrollToTop'

function AppContent() {
  const { pathname } = useLocation()
  // Both pages bring their own chrome — admin its sidebar shell, Made For More
  // its standalone event header.
  const isBareLayout = pathname === '/admin' || pathname === '/made-for-more'

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
        <Route path="/made-for-more" element={<MadeForMorePage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfUsePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/manage-booking" element={<ManageBookingPage />} />
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
