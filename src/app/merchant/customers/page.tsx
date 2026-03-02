import { createClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/ui/StatCard'

function anonymize(name: string | null): string {
  if (!name) return 'Customer'
  const parts = name.trim().split(' ')
  const first = parts[0] ?? ''
  const last  = parts[1] ? parts[1][0] + '.' : ''
  return `${first} ${last}`.trim()
}

export default async function CustomersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: mu } = await supabase
    .from('merchant_users')
    .select('merchant_id')
    .eq('user_id', user.id)
    .single()

  if (!mu) return null

  const { data: customers } = await supabase
    .from('customer_insights')
    .select('*')
    .eq('merchant_id', mu.merchant_id)
    .order('lifetime_spend', { ascending: false })

  const rows = customers ?? []
  const unique   = rows.length
  const repeats  = rows.filter((r) => r.visit_count > 1).length

  // Age distribution
  const ageBuckets: Record<string, number> = {
    '18–24': 0, '25–34': 0, '35–44': 0, '45–54': 0, '55+': 0, 'Unknown': 0,
  }
  rows.forEach((r) => {
    const a = r.age
    if (!a) ageBuckets['Unknown']++
    else if (a < 25)      ageBuckets['18–24']++
    else if (a < 35)      ageBuckets['25–34']++
    else if (a < 45)      ageBuckets['35–44']++
    else if (a < 55)      ageBuckets['45–54']++
    else                  ageBuckets['55+']++
  })

  const genderCounts: Record<string, number> = {}
  rows.forEach((r) => {
    const g = (r.gender as string | null) ?? 'Unknown'
    genderCounts[g] = (genderCounts[g] ?? 0) + 1
  })

  const maxAge = Math.max(...Object.values(ageBuckets), 1)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Customer Insights</h1>
        <p className="text-sm text-gray-500 mt-0.5">Who shops at your store</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Unique Customers" value={unique} />
        <StatCard label="Repeat Customers" value={repeats} />
        <StatCard label="Return Rate" value={unique ? `${Math.round(repeats / unique * 100)}%` : '—'} />
        <StatCard
          label="Avg Spend / Customer"
          value={unique
            ? `R ${(rows.reduce((s, r) => s + Number(r.lifetime_spend), 0) / unique).toFixed(2)}`
            : '—'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Age distribution */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Age Distribution</h2>
          <div className="space-y-3">
            {Object.entries(ageBuckets).map(([label, count]) => (
              <div key={label} className="flex items-center gap-3">
                <span className="w-16 text-xs text-gray-500 flex-shrink-0">{label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-brand-green rounded-full transition-all"
                    style={{ width: `${(count / maxAge) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-xs text-gray-500 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gender split */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Gender Split</h2>
          <div className="space-y-3">
            {Object.entries(genderCounts).map(([label, count]) => {
              const pct = unique ? Math.round(count / unique * 100) : 0
              return (
                <div key={label} className="flex items-center gap-3">
                  <span className="w-20 text-xs text-gray-500 flex-shrink-0 capitalize">{label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-brand-lime rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-10 text-xs text-gray-500 text-right">{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Customer table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Customer List</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Customer', 'Age', 'Gender', 'Visits', 'Lifetime Spend', 'Avg Spend', 'Last Visit'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((r) => (
              <tr key={r.user_id} className="hover:bg-gray-50/50">
                <td className="px-4 py-3 font-medium text-gray-900">{anonymize(r.display_name)}</td>
                <td className="px-4 py-3 text-gray-500">{r.age ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500 capitalize">{r.gender ?? '—'}</td>
                <td className="px-4 py-3 text-gray-700">{r.visit_count}</td>
                <td className="px-4 py-3 text-gray-700">R {Number(r.lifetime_spend).toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-500">R {Number(r.avg_spend).toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(r.last_visit).toLocaleDateString('en-ZA')}
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-400">
                  No customer data yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
