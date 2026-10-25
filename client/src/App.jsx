import { useState, useEffect } from 'react'

const API_URL = 'http://localhost:5000'

export default function App() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  return (
    <div className="min-h-screen bg-blue-50">
      <header className="bg-blue-700 text-white py-6 text-center">
        <h1 className="text-3xl font-bold">Smile Care Dental Clinic</h1>
        <p className="mt-1 text-blue-100">Gentle care for your whole family</p>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-semibold text-blue-900 mb-6">Our Services</h2>

        {loading && <p className="text-gray-600">Loading services...</p>}
        {error && <p className="text-red-600">{error}</p>}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.id} className="bg-white rounded-xl shadow p-6">
              <h3 className="text-xl font-semibold text-blue-700">{s.name}</h3>
              <p className="mt-2 text-gray-600">{s.description}</p>
              <p className="mt-4 font-medium text-gray-900">
                Starting from ₹{s.price_from}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}