'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CATEGORIES = ['Retail', 'Food & Beverage', 'Grocery', 'Pharmacy', 'Fashion',
  'Electronics', 'Entertainment', 'Health & Beauty', 'Transport', 'Other']

interface Merchant {
  id: string; name: string; category: string
  address: string | null; logo_url: string | null; email: string
}

export function EditMerchantForm({ merchant }: { merchant: Merchant }) {
  const router = useRouter()
  const [form, setForm] = useState({
    name:     merchant.name,
    category: merchant.category,
    address:  merchant.address  ?? '',
    logo_url: merchant.logo_url ?? '',
    email:    merchant.email,
    password: '',
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

    const payload: Record<string, string> = { id: merchant.id, ...form }
    if (!form.password) delete payload.password   // only send if changed

    const res = await fetch('/api/admin/merchants', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Something went wrong')
      setLoading(false)
      return
    }

    router.push('/admin/merchants')
    router.refresh()
  }

  const field = (label: string, key: keyof typeof form, type = 'text') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green"
      />
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {field('Merchant / Store Name', 'name')}

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

      {field('Email', 'email', 'email')}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => set('password', e.target.value)}
          placeholder="Leave blank to keep current"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-brand-green hover:bg-green-800 text-white rounded-lg py-2.5 font-semibold text-sm transition-colors disabled:opacity-60"
        >
          {loading ? 'Saving…' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/merchants')}
          className="px-4 border border-gray-300 text-gray-700 rounded-lg py-2.5 text-sm hover:border-gray-400 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
