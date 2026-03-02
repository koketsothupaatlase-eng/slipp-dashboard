import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { StatCard } from '@/components/ui/StatCard'
import { CategoryPieChart } from '@/components/charts/CategoryPieChart'

export default async function UserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const admin  = createServiceRoleClient()
  const { userId } = await params

  const [userRes, receiptsRes] = await Promise.all([
    admin.auth.admin.getUserById(userId),
    admin
      .from('receipts')
      .select('*')
      .eq('user_id', userId)
      .order('receipt_date', { ascending: false })
      .limit(50),
  ])

  const u        = userRes.data?.user
  const receipts = receiptsRes.data ?? []

  const totalSpend = receipts.reduce((s, r) => s + Number(r.total), 0)
  const avgSpend   = receipts.length ? totalSpend / receipts.length : 0

  // Category breakdown
  const catMap: Record<string, number> = {}
  receipts.forEach((r) => { catMap[r.category] = (catMap[r.category] ?? 0) + Number(r.total) })
  const catData = Object.entries(catMap).map(([category, total]) => ({ category, total }))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/users" className="text-sm text-gray-400 hover:text-brand-green">← Users</Link>
        <h1 className="text-xl font-bold text-gray-900">
          {(u?.user_metadata?.full_name as string | undefined) ?? u?.email ?? userId}
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Receipts" value={receipts.length} />
        <StatCard label="Total Spend"    value={`R ${totalSpend.toFixed(2)}`} />
        <StatCard label="Avg Transaction" value={`R ${avgSpend.toFixed(2)}`} />
        <StatCard label="Age / Gender"
          value={[u?.user_metadata?.age, u?.user_metadata?.gender].filter(Boolean).join(' / ') || '—'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Spending by category */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Spending by Category</h2>
          <CategoryPieChart data={catData} />
        </div>

        {/* Recent receipts */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">Recent Receipts</h2>
          </div>
          <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
            {receipts.map((r) => (
              <div key={r.id} className="px-5 py-3 flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{r.merchant}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(r.receipt_date).toLocaleString('en-ZA')} · {r.category}
                  </p>
                </div>
                <span className="text-sm font-semibold">R {Number(r.total).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
