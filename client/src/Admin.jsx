import { useState, useEffect } from 'react'
import { API_URL } from './config'

const statuses = ['pending', 'confirmed', 'cancelled', 'completed']

export default function Admin() {
    const [token, setToken] = useState(localStorage.getItem('token') || '')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [appointments, setAppointments] = useState([])
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [todayOnly, setTodayOnly] = useState(false)

    function logout() {
        localStorage.removeItem('token')
        setToken('')
        setAppointments([])
    }

    async function handleLogin(e) {
        e.preventDefault()
        setError('')
        try {
            const res = await fetch(`${API_URL}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            })
            const data = await res.json()
            if (!res.ok) return setError(data.error)
            localStorage.setItem('token', data.token)
            setToken(data.token)
            setPassword('')
        } catch {
            setError('Could not reach the server')
        }
    }

    async function loadAppointments() {
        try {
            const res = await fetch(`${API_URL}/api/admin/appointments`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.status === 401) return logout()
            setAppointments(await res.json())
        } catch {
            setError('Could not load appointments')
        }
    }

    useEffect(() => {
        if (token) loadAppointments()
    }, [token])

    async function changeStatus(id, status) {
        await fetch(`${API_URL}/api/admin/appointments/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status }),
        })
        loadAppointments()
    }

    async function remove(id) {
        if (!window.confirm('Delete this appointment?')) return
        await fetch(`${API_URL}/api/admin/appointments/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        })
        loadAppointments()
    }

    const today = new Date().toLocaleDateString('en-CA') // gives YYYY-MM-DD in local time

const todayCount = appointments.filter((a) => a.preferred_date === today).length
const pendingCount = appointments.filter((a) => a.status === 'pending').length

const filtered = appointments.filter((a) => {
  const q = search.toLowerCase()
  const matchesSearch =
    a.patient_name.toLowerCase().includes(q) || a.phone.includes(q)
  const matchesStatus = statusFilter === 'all' || a.status === statusFilter
  const matchesToday = !todayOnly || a.preferred_date === today
  return matchesSearch && matchesStatus && matchesToday
})
    if (!token) {
        return (
            <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4">
                <form onSubmit={handleLogin} className="bg-white rounded-xl shadow p-6 w-full max-w-sm space-y-4">
                    <h1 className="text-2xl font-bold text-blue-900">Admin Login</h1>
                    <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                    {error && <p className="text-red-600">{error}</p>}
                    <button className="w-full bg-blue-700 text-white font-semibold py-2 rounded-lg hover:bg-blue-800">
                        Log in
                    </button>
                </form>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-blue-50 p-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-blue-900">Appointments</h1>
                    <button onClick={logout} className="text-blue-700 underline">Log out</button>
                </div>

                {error && <p className="text-red-600 mb-4">{error}</p>}

                <div className="grid grid-cols-2 gap-4 mb-4">
  <div className="bg-white rounded-xl shadow p-4">
    <p className="text-sm text-gray-500">Today's appointments</p>
    <p className="text-3xl font-bold text-blue-700">{todayCount}</p>
  </div>
  <div className="bg-white rounded-xl shadow p-4">
    <p className="text-sm text-gray-500">Pending</p>
    <p className="text-3xl font-bold text-orange-500">{pendingCount}</p>
  </div>
</div>

<div className="flex flex-wrap gap-3 mb-4">
  <input
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Search name or phone"
    className="border border-gray-300 rounded-lg px-3 py-2 flex-1 min-w-[200px]"
  />
  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="border border-gray-300 rounded-lg px-3 py-2"
  >
    <option value="all">All statuses</option>
    {statuses.map((s) => (
      <option key={s} value={s}>{s}</option>
    ))}
  </select>
  <button
    onClick={() => setTodayOnly(!todayOnly)}
    className={`px-4 py-2 rounded-lg border ${
      todayOnly ? 'bg-blue-700 text-white' : 'bg-white text-blue-700 border-blue-700'
    }`}
  >
    Today only
  </button>
</div>
                <div className="bg-white rounded-xl shadow overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-blue-100 text-blue-900">
                            <tr>
                                <th className="p-3">Patient</th>
                                <th className="p-3">Phone</th>
                                <th className="p-3">Service</th>
                                <th className="p-3">Date</th>
                                <th className="p-3">Time</th>
                                <th className="p-3">Status</th>
                                <th className="p-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((a) => (
                                <tr key={a.id} className="border-t">
                                    <td className="p-3">{a.patient_name}</td>
                                    <td className="p-3">
                                        <a href={`tel:${a.phone}`} className="text-blue-700">{a.phone}</a>
                                    </td>
                                    <td className="p-3">{a.service}</td>
                                    <td className="p-3">{a.preferred_date}</td>
                                    <td className="p-3">{a.preferred_time}</td>
                                    <td className="p-3">
                                        <select
                                            value={a.status}
                                            onChange={(e) => changeStatus(a.id, e.target.value)}
                                            className="border rounded px-2 py-1"
                                        >
                                            {statuses.map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="p-3">
                                        <button onClick={() => remove(a.id)} className="text-red-600">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <p className="p-4 text-gray-500">No appointments yet.</p>
                    )}
                </div>
            </div>
        </div>
    )
}