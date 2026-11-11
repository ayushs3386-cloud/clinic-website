import { useState } from 'react'
import { clinic } from './config'


export default function BookingForm({ services, apiUrl, text }) {
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
    const [booked, setBooked] = useState(null)

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
                setBooked(form)
                setForm(emptyForm)
            }
        } catch (err) {
            setError(text.serverDown)
        } finally {
            setSubmitting(false)
        }
    }

    const inputClass =
        'w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500'

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
            <div>
                <label className="block mb-1 font-medium">{text.yourName}</label>
                <input name="patient_name" value={form.patient_name} onChange={handleChange} className={inputClass} required />
            </div>

            <div>
                <label className="block mb-1 font-medium">{text.mobile}</label>
                <input name="phone" value={form.phone} onChange={handleChange} className={inputClass} maxLength={10} placeholder={text.mobilePlaceholder} required />
            </div>

            <div>
                <label className="block mb-1 font-medium">{text.emailOptional}</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} />
            </div>

            <div>
                <label className="block mb-1 font-medium">{text.service}</label>
                <select name="service" value={form.service} onChange={handleChange} className={inputClass} required>
                    <option value="">{text.selectService}</option>
                    {services.map((s) => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="block mb-1 font-medium">{text.preferredDate}</label>
                    <input type="date" name="preferred_date" min={today} value={form.preferred_date} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                    <label className="block mb-1 font-medium">{text.preferredTime}</label>
                    <select name="preferred_time" value={form.preferred_time} onChange={handleChange} className={inputClass} required>
                        <option value="">{text.selectTime}</option>
                        {clinic.times.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="block mb-1 font-medium">{text.messageOptional}</label>
                <textarea name="message" value={form.message} onChange={handleChange} rows={3} className={inputClass} />
            </div>

            {error && <p className="text-red-600">{error}</p>}

            {success && booked && (
                <div className="text-green-700 bg-green-50 rounded-lg p-3 space-y-2">
                    <p>{text.thanks}</p>
                    <a
                        href={`https://wa.me/${clinic.whatsapp}?text=${encodeURIComponent(
                            `${text.waHello}\n${text.waName}: ${booked.patient_name}\n${text.waService}: ${booked.service}\n${text.waDate}: ${booked.preferred_date}\n${text.waTime}: ${booked.preferred_time}`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block bg-green-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-600"
                    >
                        {text.confirmWhatsapp}
                    </a>
                </div>
            )}

            <button
                type="submit"
                disabled={submitting}
                className="w-full bg-brand-700 text-white font-semibold py-3 rounded-lg hover:bg-brand-800 disabled:opacity-50"
            >
                {submitting ? text.sending : text.bookBtn}
            </button>
        </form>
    )
}