'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function MerchantToggle({ id, isActive }: { id: string; isActive: boolean }) {
  const router  = useRouter()
  const [busy,  setBusy]  = useState(false)
  const [active, setActive] = useState(isActive)

  async function toggle() {
    setBusy(true)
    const res = await fetch('/api/admin/merchants', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id, is_active: !active }),
    })
    if (res.ok) {
      setActive(!active)
      router.refresh()
    }
    setBusy(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60 ${
        active
          ? 'text-red-600 hover:bg-red-50 border border-red-200'
          : 'text-green-700 hover:bg-green-50 border border-green-200'
      }`}
    >
      {busy ? '…' : active ? 'Deactivate' : 'Activate'}
    </button>
  )
}
