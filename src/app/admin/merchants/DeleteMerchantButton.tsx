'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function DeleteMerchantButton({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setBusy(true)
    setError(null)
    const res = await fetch('/api/admin/merchants', {
      method:  'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id }),
    })
    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error ?? 'Delete failed')
      setBusy(false)
      setConfirming(false)
    }
  }

  if (error) {
    return (
      <span className="text-xs text-red-600" title={error}>Error</span>
    )
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-1">
        <button
          onClick={handleDelete}
          disabled={busy}
          className="text-xs font-medium px-2 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-60"
        >
          {busy ? '…' : 'Confirm'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={busy}
          className="text-xs font-medium px-2 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 transition-colors"
        >
          Cancel
        </button>
      </span>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      title={`Delete ${name}`}
      className="text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
    >
      Delete
    </button>
  )
}
