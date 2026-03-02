import { createClient } from '@/lib/supabase/server'
import { TimeOfDayChart } from '@/components/charts/TimeOfDayChart'
import { DayOfWeekHeatmap } from '@/components/charts/DayOfWeekHeatmap'
import { CategoryPieChart } from '@/components/charts/CategoryPieChart'
import { ItemRankingChart } from '@/components/charts/ItemRankingChart'

export default async function AnalyticsPage() {
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
  const mid = mu.merchant_id

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any
  const [hourly, dow, items, receiptsRes] = await Promise.all([
    sb.rpc('hourly_transaction_counts', { p_merchant_id: mid }),
    sb.rpc('dow_transaction_counts',    { p_merchant_id: mid }),
    sb.rpc('top_items',                 { p_merchant_id: mid, p_limit: 10 }),
    supabase
      .from('receipts')
      .select('category, total')
      .eq('merchant_id', mid),
  ])

  // Build category data from receipts
  const catMap: Record<string, number> = {}
  const receiptRows = (receiptsRes as { data: { category: string | null; total: number }[] | null }).data ?? []
  receiptRows.forEach((r) => {
    const key = r.category ?? 'Other'
    catMap[key] = (catMap[key] ?? 0) + Number(r.total)
  })
  const catData = Object.entries(catMap).map(([category, total]) => ({ category, total }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Trends and patterns in your store's transactions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Time of day */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Transactions by Time of Day</h2>
          <TimeOfDayChart data={(hourly as any).data ?? []} />
        </div>

        {/* Category revenue */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Revenue by Category</h2>
          <CategoryPieChart data={catData} />
        </div>
      </div>

      {/* Day of week heatmap */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Busiest Days of the Week</h2>
        <DayOfWeekHeatmap data={(dow as any).data ?? []} />
      </div>

      {/* Top items */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Top 10 Items by Units Sold</h2>
        <ItemRankingChart data={(items as any).data ?? []} />
      </div>
    </div>
  )
}
