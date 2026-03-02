import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

export async function GET(_req: NextRequest) {
  // Verify admin
  const serverClient = await createClient()
  const { data: { user } } = await serverClient.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createServiceRoleClient()

  // List all auth users (service role)
  const { data: usersData, error } = await admin.auth.admin.listUsers({ perPage: 1000 })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Aggregate receipt stats per user
  const { data: stats } = await admin
    .from('receipts')
    .select('user_id, total, category')

  type StatEntry = { count: number; total: number; categories: Record<string, number> }
  const statMap: Record<string, StatEntry> = {}
  for (const row of stats ?? []) {
    if (!statMap[row.user_id]) statMap[row.user_id] = { count: 0, total: 0, categories: {} }
    statMap[row.user_id].count++
    statMap[row.user_id].total += Number(row.total)
    statMap[row.user_id].categories[row.category] =
      (statMap[row.user_id].categories[row.category] ?? 0) + 1
  }

  const result = usersData.users.map((u) => ({
    id:            u.id,
    email:         u.email,
    full_name:     u.user_metadata?.full_name,
    age:           u.user_metadata?.age,
    gender:        u.user_metadata?.gender,
    phone:         u.user_metadata?.phone,
    role:          u.app_metadata?.role ?? 'consumer',
    created_at:    u.created_at,
    receipt_count: statMap[u.id]?.count ?? 0,
    total_spend:   statMap[u.id]?.total ?? 0,
    top_category:  Object.entries(statMap[u.id]?.categories ?? {})
      .sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
  }))

  return NextResponse.json(result)
}
