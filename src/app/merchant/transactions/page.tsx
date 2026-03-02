import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { PrintButton } from './PrintButton'
import type { Receipt, ReceiptItem } from '@/types/database'

const CATEGORY_COLORS: Record<string, 'green' | 'blue' | 'yellow' | 'gray'> = {
  Food:          'green',
  Groceries:     'blue',
  Transport:     'yellow',
  Entertainment: 'gray',
}

export default async function TransactionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: muRaw } = await supabase
    .from('merchant_users')
    .select('merchant_id')
    .eq('user_id', user.id)
    .single()

  const mu = muRaw as { merchant_id: string } | null
  if (!mu) return null

  const { data: receiptsRaw } = await supabase
    .from('receipts')
    .select('id, user_id, total, vat, receipt_date, category, items')
    .eq('merchant_id', mu.merchant_id)
    .order('receipt_date', { ascending: false })
    .limit(200)

  const receipts = receiptsRaw as Pick<Receipt, 'id' | 'user_id' | 'total' | 'vat' | 'receipt_date' | 'category' | 'items'>[] | null

  return (
    <div className="space-y-5 print-full">
      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Transactions</h1>
          <p className="text-sm text-gray-500 mt-0.5">{receipts?.length ?? 0} receipts</p>
        </div>
        <PrintButton />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Date & Time', 'Category', 'Items', 'Tax', 'Total'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(receipts ?? []).map((r) => {
              const items = r.items as ReceiptItem[]
              const label = items.length === 0 ? '—'
                : items.length <= 2
                  ? items.map((i) => `${i.name} ×${i.quantity}`).join(', ')
                  : `${items[0].name}, ${items[1].name} +${items.length - 2} more`
              return (
                <tr key={r.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {new Date(r.receipt_date).toLocaleString('en-ZA', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <Badge color={CATEGORY_COLORS[r.category ?? ''] ?? 'gray'}>{r.category ?? '—'}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{label}</td>
                  <td className="px-4 py-3 text-gray-500">R {Number(r.vat ?? 0).toFixed(2)}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    R {Number(r.total).toFixed(2)}
                  </td>
                </tr>
              )
            })}
            {!receipts?.length && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">
                  No transactions yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
