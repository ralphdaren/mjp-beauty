import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from '@/pages/HomePage'
import BookAppointmentPage from '@/pages/BookAppointmentPage'
import Navbar from '@/components/Navbar'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/book-appointment" element={<BookAppointmentPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
