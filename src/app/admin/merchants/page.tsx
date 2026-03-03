import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'
import { MerchantToggle } from './MerchantToggle'
import { DeleteMerchantButton } from './DeleteMerchantButton'
import type { Merchant } from '@/types/database'

export default async function AdminMerchantsPage() {
  const admin = createServiceRoleClient()

  const { data: merchantsRaw } = await admin
    .from('merchants')
    .select('*, receipts(id)')
    .order('created_at', { ascending: false })

  const rows = (merchantsRaw as (Merchant & { receipts: { id: string }[] })[] ?? []).map((m) => ({
    ...m,
    receipt_count: Array.isArray(m.receipts) ? m.receipts.length : 0,
  }))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Merchants</h1>
          <p className="text-sm text-gray-500 mt-0.5">{rows.length} merchants registered</p>
        </div>
        <Link
          href="/admin/merchants/new"
          className="bg-brand-green text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-800 transition-colors"
        >
          + New Merchant
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Name', 'Category', 'Address', 'Transactions', 'Status', 'Created', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50/50">
                <td className="px-4 py-3 font-medium text-gray-900">{m.name}</td>
                <td className="px-4 py-3 text-gray-500">{m.category}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{m.address ?? '—'}</td>
                <td className="px-4 py-3 text-gray-700">{m.receipt_count}</td>
                <td className="px-4 py-3">
                  <Badge color={m.is_active ? 'green' : 'red'}>
                    {m.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(m.created_at).toLocaleDateString('en-ZA')}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <MerchantToggle id={m.id} isActive={m.is_active} />
                    <Link
                      href={`/admin/merchants/${m.id}/edit`}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-brand-green hover:text-brand-green transition-colors"
                    >
                      Edit
                    </Link>
                    <DeleteMerchantButton id={m.id} name={m.name} />
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-sm text-gray-400">
                  No merchants yet. <Link href="/admin/merchants/new" className="text-brand-green">Create one</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
