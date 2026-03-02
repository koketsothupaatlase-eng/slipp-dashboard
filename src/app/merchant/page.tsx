import { createClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/ui/StatCard'
import { SpendingTrendChart } from '@/components/charts/SpendingTrendChart'
import type { Receipt, ReceiptItem } from '@/types/database'

function fmt(n: number) {
  return `R ${Number(n).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`
}

export default async function MerchantDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Get merchant_id for this user
  const { data: muRaw } = await supabase
    .from('merchant_users')
    .select('merchant_id')
    .eq('user_id', user.id)
    .single()

  const mu = muRaw as { merchant_id: string } | null
  if (!mu) return null
  const mid = mu.merchant_id

  const [summaryRes, trendRes, recentRes] = await Promise.all([
    supabase
      .from('merchant_summary')
      .select('*')
      .eq('merchant_id', mid)
      .single(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).rpc('monthly_revenue', { p_merchant_id: mid }),
    supabase
      .from('receipts')
      .select('id, total, receipt_date, category, items')
      .eq('merchant_id', mid)
      .order('receipt_date', { ascending: false })
      .limit(8),
  ])

  const s      = summaryRes.data
  const trend  = (trendRes as any).data  ?? []
  const recent = (recentRes.data ?? []) as Pick<Receipt, 'id' | 'total' | 'receipt_date' | 'category' | 'items'>[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your store's performance at a glance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Customers"    value={s?.total_customers   ?? 0} />
        <StatCard label="Total Transactions" value={s?.total_transactions ?? 0} />
        <StatCard label="Total Revenue"      value={s ? fmt(s.total_revenue)   : '—'} />
        <StatCard label="Avg Transaction"    value={s ? fmt(s.avg_transaction) : '—'} />
      </div>

      {/* Revenue Trend */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Revenue — Last 12 Months</h2>
        <SpendingTrendChart data={trend} />
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">Recent Transactions</h2>
          <a href="/merchant/transactions" className="text-xs text-brand-green hover:underline">View all</a>
        </div>
        <div className="divide-y divide-gray-50">
          {recent.map((r) => {
            const items = r.items as ReceiptItem[]
            return (
              <div key={r.id} className="px-5 py-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {items.length > 0
                      ? items.slice(0, 2).map((i) => i.name).join(', ') + (items.length > 2 ? ` +${items.length - 2}` : '')
                      : r.category}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(r.receipt_date).toLocaleString('en-ZA')} · {r.category}
                  </p>
                </div>
                <span className="text-sm font-semibold">{fmt(r.total)}</span>
              </div>
            )
          })}
          {!recent.length && (
            <p className="px-5 py-8 text-center text-sm text-gray-400">
              No transactions yet. Your customers will appear here after their first scan.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
