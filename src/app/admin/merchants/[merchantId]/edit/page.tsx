import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { EditMerchantForm } from './EditMerchantForm'
import Link from 'next/link'

export default async function EditMerchantPage({ params }: { params: Promise<{ merchantId: string }> }) {
  const { merchantId } = await params
  const admin = createServiceRoleClient()

  const { data: merchantRaw } = await admin
    .from('merchants')
    .select('id, name, category, address, logo_url')
    .eq('id', merchantId)
    .single()

  const merchant = merchantRaw as {
    id: string; name: string; category: string
    address: string | null; logo_url: string | null
  } | null

  if (!merchant) {
    return (
      <div className="space-y-3">
        <Link href="/admin/merchants" className="text-sm text-gray-400 hover:text-brand-green">← Merchants</Link>
        <p className="text-gray-500">Merchant not found.</p>
      </div>
    )
  }

  return (
    <div className="max-w-xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/merchants" className="text-sm text-gray-400 hover:text-brand-green">← Merchants</Link>
        <h1 className="text-xl font-bold text-gray-900">Edit {merchant.name}</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <EditMerchantForm merchant={merchant} />
      </div>
    </div>
  )
}
