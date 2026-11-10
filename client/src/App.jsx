import { useState, useEffect } from 'react'
import BookingForm from './BookingForm'
import Admin from './Admin'
import { API_URL, clinic } from './config'
import { t } from './translations'
function Home() {

  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en')
  const text = t[lang]

  function switchLang() {
    const next = lang === 'en' ? 'hi' : 'en'
    setLang(next)
    localStorage.setItem('lang', next)
  }
  useEffect(() => {
    fetch(`${API_URL}/api/services`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load services')
        return res.json()
      })
      .then((data) => setServices(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    clinic.name + ' ' + clinic.address
  )}`

  return (
    <div className="min-h-screen bg-brand-50 text-gray-800">
      {/* Navbar */}
      <nav className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <span className="font-bold text-brand-700">{clinic.name}</span>
          <div className="flex gap-4 text-sm">
            <a href="#services" className="hover:text-brand-700">{text.services}</a>
            <a href="#about" className="hover:text-brand-700">{text.doctor}</a>
            <a href="#contact" className="hover:text-brand-700">{text.contact}</a>
            <a href="#book" className="bg-brand-700 text-white px-3 py-1 rounded-lg">{text.book}</a>
            <button onClick={switchLang} className="border border-brand-700 text-brand-700 px-2 py-1 rounded-lg">
              {lang === 'en' ? 'हिंदी' : 'English'}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="bg-brand-700 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-bold">{clinic.name}</h1>
        <p className="mt-3 text-lg text-brand-100">{clinic.tagline}</p>
        <a
          href="#book"
          className="inline-block mt-6 bg-white text-brand-700 font-semibold px-6 py-3 rounded-lg hover:bg-brand-50"
        >
          {text.bookAppointment}
        </a>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12 space-y-16">
        {/* Services */}
        <section id="services">
          <h2 className="text-2xl font-semibold text-brand-900 mb-6">{text.ourServices}</h2>
          {loading && <p className="text-gray-600">{text.loading}</p>}
          {error && <p className="text-red-600">{error}</p>}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <div key={s.id} className="bg-white rounded-xl shadow p-6">
                <h3 className="text-xl font-semibold text-brand-700">{s.name}</h3>
                <p className="mt-2 text-gray-600">{s.description}</p>
                <p className="mt-4 font-medium">{text.startingFrom} ₹{s.price_from}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Doctor */}
        <section id="about" className="bg-white rounded-xl shadow p-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-28 h-28 shrink-0 rounded-full bg-brand-100 text-brand-700 text-4xl font-bold flex items-center justify-center">
            {clinic.doctor.split(' ').pop()[0]}
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-brand-900">{clinic.doctor}</h2>
            <p className="text-brand-700">{clinic.qualification}</p>
            <p className="mt-2 text-gray-600">
              {clinic.experience}. {clinic.about}
            </p>
          </div>
        </section>

        {/* Contact */}
        <section id="contact">
          <h2 className="text-2xl font-semibold text-brand-900 mb-6">{text.visitUs}</h2>
          <div className="bg-white rounded-xl shadow p-6 space-y-2">
            <p><strong>{text.address}:</strong> {clinic.address}</p>
            <p><strong>{text.hours}:</strong> {clinic.hours}</p>
            <p>
              <strong>{text.phone}:</strong>{' '}
              <a href={`tel:${clinic.phone}`} className="text-brand-700">{clinic.phone}</a>
            </p>
            <a
              href={mapsLink}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-2 text-brand-700 underline"
            >
              {text.directions}
            </a>
          </div>
        </section>

        {/* Booking */}
        <section id="book">
          <h2 className="text-2xl font-semibold text-brand-900 mb-6">{text.bookAppointment}</h2>
          <div className="max-w-xl">
            <BookingForm services={services} apiUrl={API_URL} />
          </div>
        </section>
      </main>

      <footer className="bg-brand-900 text-brand-100 text-center py-6 text-sm">
        © {new Date().getFullYear()} {clinic.name}. All rights reserved.
      </footer>

      {/* Floating WhatsApp button */}
      <a
        href={`https://wa.me/${clinic.whatsapp}?text=${encodeURIComponent('Hello, I want to book an appointment.')}`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 bg-green-500 text-white font-semibold px-4 py-3 rounded-full shadow-lg hover:bg-green-600"
      >
        WhatsApp
      </a>
    </div>
  )
}

export default function App() {
  if (window.location.pathname === '/admin') return <Admin />
  return <Home />
}