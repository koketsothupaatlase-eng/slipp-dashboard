'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CreateMerchantForm } from '@/components/admin/CreateMerchantForm'

export default function NewMerchantPage() {
  const router = useRouter()
  return (
    <div className="max-w-xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/merchants" className="text-sm text-gray-400 hover:text-brand-green">← Merchants</Link>
        <h1 className="text-xl font-bold text-gray-900">New Merchant</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <p className="text-sm text-gray-500 mb-5">
          This creates a merchant account and sets up their dashboard login credentials.
          The merchant will use the provided email and password to log in to this portal.
        </p>
        <CreateMerchantForm onSuccess={() => router.push('/admin/merchants')} />
      </div>
    </div>
  )
}
