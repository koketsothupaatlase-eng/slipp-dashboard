'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CATEGORIES = ['Retail', 'Food & Beverage', 'Grocery', 'Pharmacy', 'Fashion',
  'Electronics', 'Entertainment', 'Health & Beauty', 'Transport', 'Other']

export function CreateMerchantForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '', category: 'Retail', address: '', logo_url: '', email: '', password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/admin/merchants', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(form),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Something went wrong')
      setLoading(false)
      return
    }

    onSuccess?.()
    router.refresh()
  }

  const field = (label: string, key: keyof typeof form, type = 'text', opts?: { required?: boolean }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {opts?.required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        required={opts?.required}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green"
      />
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {field('Merchant / Store Name', 'name', 'text', { required: true })}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          value={form.category}
          onChange={(e) => set('category', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/40"
        >
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {field('Address', 'address')}
      {field('Logo URL', 'logo_url', 'url')}

      <hr className="border-gray-100" />
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Dashboard Login Credentials</p>

      {field('Email', 'email', 'email', { required: true })}
      {field('Password', 'password', 'password', { required: true })}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand-green hover:bg-green-800 text-white rounded-lg py-2.5 font-semibold text-sm transition-colors disabled:opacity-60"
      >
        {loading ? 'Creating…' : 'Create Merchant'}
      </button>
    </form>
  )
}
