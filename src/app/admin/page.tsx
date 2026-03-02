import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { StatCard } from '@/components/ui/StatCard'
import { SpendingTrendChart } from '@/components/charts/SpendingTrendChart'
import type { Receipt } from '@/types/database'

function fmt(n: number) {
  return `R ${Number(n).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`
}

export default async function AdminOverviewPage() {
  const supabase = await createClient()
  const admin    = createServiceRoleClient()

  const [summaryRes, trendRes, activityRes] = await Promise.all([
    admin.from('admin_platform_summary').select('*').single(),
    admin.rpc('platform_monthly_revenue'),
    admin
      .from('receipts')
      .select('id, merchant, merchant_id, total, receipt_date, category, user_id')
      .order('receipt_date', { ascending: false })
      .limit(20),
  ])

  type PlatformSummary = { total_users: number; total_receipts: number; total_revenue: number; active_merchants: number }
  type TrendPoint     = { year: number; month: number; transaction_count: number; total_revenue: number }

  const summary  = summaryRes.data as PlatformSummary | null
  const trend    = ((trendRes as unknown as { data: TrendPoint[] | null }).data) ?? []
  const activity = (activityRes.data ?? []) as Pick<Receipt, 'id' | 'merchant' | 'merchant_id' | 'total' | 'receipt_date' | 'category' | 'user_id'>[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Platform Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">All-time stats across the Slipp platform</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users"      value={summary?.total_users?.toLocaleString() ?? '—'} />
        <StatCard label="Total Receipts"   value={summary?.total_receipts?.toLocaleString() ?? '—'} />
        <StatCard label="Total Revenue"    value={summary ? fmt(summary.total_revenue) : '—'} />
        <StatCard label="Active Merchants" value={summary?.active_merchants?.toLocaleString() ?? '—'} />
      </div>

      {/* Revenue Trend */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Revenue Trend (last 12 months)</h2>
        <SpendingTrendChart data={trend} />
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {activity.length === 0 && (
            <p className="px-5 py-8 text-sm text-center text-gray-400">No receipts yet</p>
          )}
          {activity.map((r) => (
            <div key={r.id} className="px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{r.merchant}</p>
                <p className="text-xs text-gray-400">
                  {new Date(r.receipt_date).toLocaleString('en-ZA')} · {r.category}
                </p>
              </div>
              <span className="text-sm font-semibold text-gray-800">{fmt(r.total)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
