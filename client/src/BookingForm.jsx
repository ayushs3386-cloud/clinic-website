import { useState } from 'react'

const times = [
    '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM',
    '04:00 PM', '05:00 PM', '06:00 PM',
]

export default function BookingForm({ services, apiUrl }) {
    const emptyForm = {
        patient_name: '',
        phone: '',
        email: '',
        service: '',
        preferred_date: '',
        preferred_time: '',
        message: '',
    }

    const [form, setForm] = useState(emptyForm)
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const today = new Date().toISOString().split('T')[0]

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setSuccess(false)
        setSubmitting(true)

        try {
            const res = await fetch(`${apiUrl}/api/appointments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Something went wrong')
            } else {
                setSuccess(true)
                setForm(emptyForm)
            }
        } catch (err) {
            setError('Could not reach the server. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    const inputClass =
        'w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
            <div>
                <label className="block mb-1 font-medium">Your name</label>
                <input name="patient_name" value={form.patient_name} onChange={handleChange} className={inputClass} required />
            </div>

            <div>
                <label className="block mb-1 font-medium">Mobile number</label>
                <input name="phone" value={form.phone} onChange={handleChange} className={inputClass} maxLength={10} placeholder="10-digit number" required />
            </div>

            <div>
                <label className="block mb-1 font-medium">Email (optional)</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} />
            </div>

            <div>
                <label className="block mb-1 font-medium">Service</label>
                <select name="service" value={form.service} onChange={handleChange} className={inputClass} required>
                    <option value="">Select a service</option>
                    {services.map((s) => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="block mb-1 font-medium">Preferred date</label>
                    <input type="date" name="preferred_date" min={today} value={form.preferred_date} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Preferred time</label>
                    <select name="preferred_time" value={form.preferred_time} onChange={handleChange} className={inputClass} required>
                        <option value="">Select a time</option>
                        {times.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="block mb-1 font-medium">Message (optional)</label>
                <textarea name="message" value={form.message} onChange={handleChange} rows={3} className={inputClass} />
            </div>

            {error && <p className="text-red-600">{error}</p>}
            {success && (
                <p className="text-green-700 bg-green-50 rounded-lg p-3">
                    Thank you! Your request is received. We will call you to confirm.
                </p>
            )}

            <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-700 text-white font-semibold py-3 rounded-lg hover:bg-blue-800 disabled:opacity-50"
            >
                {submitting ? 'Sending...' : 'Book Appointment'}
            </button>
        </form>
    )
}