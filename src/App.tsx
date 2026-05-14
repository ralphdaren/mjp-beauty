import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from '@/pages/HomePage'
import BookAppointmentPage from '@/pages/BookAppointmentPage'
import InPersonTrainingPage from '@/pages/InPersonTrainingPage'
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
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default App
