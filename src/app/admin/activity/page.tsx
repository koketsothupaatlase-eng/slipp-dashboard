import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Badge } from '@/components/ui/Badge'
import type { ReceiptItem } from '@/types/database'

const CATEGORY_COLORS: Record<string, 'green' | 'blue' | 'yellow' | 'gray'> = {
  Food:          'green',
  Groceries:     'blue',
  Transport:     'yellow',
  Entertainment: 'gray',
}

export default async function ActivityPage() {
  const admin = createServiceRoleClient()

  const { data: receipts } = await admin
    .from('receipts')
    .select('id, merchant, merchant_id, total, vat, receipt_date, category, items, user_id')
    .order('receipt_date', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Activity Feed</h1>
        <p className="text-sm text-gray-500 mt-0.5">Last 100 receipt scans across the platform</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        {(receipts ?? []).map((r) => {
          const items = r.items as ReceiptItem[]
          return (
            <div key={r.id} className="px-5 py-4 flex gap-4">
              {/* Timeline dot */}
              <div className="flex-shrink-0 pt-1">
                <div className="w-2 h-2 rounded-full bg-brand-green mt-1" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{r.merchant}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(r.receipt_date).toLocaleString('en-ZA', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-900">
                      R {Number(r.total).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">VAT R {Number(r.vat ?? 0).toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge color={CATEGORY_COLORS[r.category] ?? 'gray'}>{r.category}</Badge>
                  {items.length > 0 && (
                    <span className="text-xs text-gray-400">
                      {items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        {!receipts?.length && (
          <p className="px-5 py-10 text-center text-sm text-gray-400">No activity yet</p>
        )}
      </div>
    </div>
  )
}
