import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

// POST /api/admin/merchants — create merchant + auth user + link
export async function POST(req: NextRequest) {
  const serverClient = await createClient()
  const { data: { user } } = await serverClient.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { name, category, address, logo_url, email, password } = body as {
    name: string; category: string; address?: string
    logo_url?: string; email: string; password: string
  }

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'name, email and password are required' }, { status: 400 })
  }

  const admin = createServiceRoleClient()

  // 1. Create merchant row
  const { data: merchant, error: mErr } = await admin
    .from('merchants')
    .insert({ name, category: category ?? 'Retail', address, logo_url, created_by: user.id })
    .select()
    .single()

  if (mErr) return NextResponse.json({ error: mErr.message }, { status: 400 })

  // 2. Create Supabase auth user for the merchant
  const { data: newUser, error: uErr } = await admin.auth.admin.createUser({
    email,
    password,
    app_metadata:  { role: 'merchant' },
    user_metadata: { full_name: name },
    email_confirm: true,
  })

  if (uErr) {
    // Rollback merchant row
    await admin.from('merchants').delete().eq('id', merchant.id)
    return NextResponse.json({ error: uErr.message }, { status: 400 })
  }

  // 3. Link merchant user
  const { error: lErr } = await admin
    .from('merchant_users')
    .insert({ merchant_id: merchant.id, user_id: newUser.user.id, role: 'owner' })

  if (lErr) return NextResponse.json({ error: lErr.message }, { status: 400 })

  return NextResponse.json({ merchant, user_id: newUser.user.id }, { status: 201 })
}

// PATCH /api/admin/merchants — update merchant fields and/or toggle is_active
export async function PATCH(req: NextRequest) {
  const serverClient = await createClient()
  const { data: { user } } = await serverClient.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { id, is_active, name, category, address, logo_url } = body
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createServiceRoleClient() as any

  const updates: Record<string, unknown> = {}
  if (is_active !== undefined) updates.is_active = is_active
  if (name      !== undefined) updates.name      = name
  if (category  !== undefined) updates.category  = category
  if (address   !== undefined) updates.address   = address
  if (logo_url  !== undefined) updates.logo_url  = logo_url

  const { data, error } = await admin
    .from('merchants')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
