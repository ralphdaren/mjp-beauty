import { Link } from 'react-router-dom'

export default function AppointmentsPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold">Appointments</h1>
      <div className="mt-6 rounded-xl border border-brand-border bg-white px-6 py-10 text-center">
        <p className="text-sm text-brand">Booking from your account is coming soon. For now you can book here.</p>
        <Link
          to="/book-appointment"
          className="mt-4 inline-flex rounded-md bg-[#3d3530] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Book an appointment
        </Link>
      </div>
    </div>
  )
}
