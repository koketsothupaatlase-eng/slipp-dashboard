import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'

async function getUsers() {
  // This page is a Server Component — but the /api/admin/users route requires
  // auth cookies, so we call it relative to the server origin.
  // In production set NEXT_PUBLIC_APP_URL; in dev it defaults to localhost:3000.
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const res  = await fetch(`${base}/api/admin/users`, {
    cache: 'no-store',
    // Forward auth cookie — handled by Next.js automatically for same-origin
    credentials: 'include',
  })
  if (!res.ok) return []
  return res.json()
}

export default async function AdminUsersPage() {
  // We fetch via the service-role API route for correct auth handling.
  // For a cleaner pattern in production, import createServiceRoleClient directly.
  const { createServiceRoleClient } = await import('@/lib/supabase/service-role')
  const admin = createServiceRoleClient()

  const { data: usersData } = await admin.auth.admin.listUsers({ perPage: 1000 })
  const { data: stats }     = await admin.from('receipts').select('user_id, total, category')

  type StatEntry = { count: number; total: number; top: string | null }
  const statMap: Record<string, StatEntry> = {}
  for (const row of stats ?? []) {
    if (!statMap[row.user_id]) statMap[row.user_id] = { count: 0, total: 0, top: null }
    statMap[row.user_id].count++
    statMap[row.user_id].total += Number(row.total)
  }

  const users = (usersData?.users ?? []).map((u) => ({
    id:         u.id,
    email:      u.email ?? '',
    full_name:  (u.user_metadata?.full_name as string | undefined) ?? '—',
    age:        (u.user_metadata?.age as number | undefined),
    gender:     (u.user_metadata?.gender as string | undefined),
    role:       (u.app_metadata?.role as string | undefined) ?? 'consumer',
    joined:     u.created_at,
    count:      statMap[u.id]?.count ?? 0,
    total:      statMap[u.id]?.total ?? 0,
  }))

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-0.5">{users.length} registered accounts</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Name', 'Email', 'Age', 'Gender', 'Role', 'Receipts', 'Total Spend', 'Joined'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">
                  <Link href={`/admin/users/${u.id}`} className="hover:text-brand-green">
                    {u.full_name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3 text-gray-500">{u.age ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500">{u.gender ?? '—'}</td>
                <td className="px-4 py-3">
                  <Badge color={u.role === 'admin' ? 'green' : u.role === 'merchant' ? 'blue' : 'gray'}>
                    {u.role}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-gray-700">{u.count}</td>
                <td className="px-4 py-3 text-gray-700">
                  R {u.total.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(u.joined).toLocaleDateString('en-ZA')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
