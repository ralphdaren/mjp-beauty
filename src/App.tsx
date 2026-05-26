import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from '@/pages/HomePage'
import BookAppointmentPage from '@/pages/BookAppointmentPage'
import InPersonTrainingPage from '@/pages/InPersonTrainingPage'
import OnlineBrowAcademyPage from '@/pages/OnlineBrowAcademyPage'
import OnlineModulesPage from '@/pages/OnlineProductListingPage'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ScrollToTop from '@/components/ScrollToTop'

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/book-appointment" element={<BookAppointmentPage />} />
        <Route path="/in-person-training" element={<InPersonTrainingPage />} />
        <Route path="/online-brow-courses" element={<OnlineBrowAcademyPage />} />
        <Route path="/online-modules" element={<OnlineModulesPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default App
