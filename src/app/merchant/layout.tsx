import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MerchantSidebar } from '@/components/layout/MerchantSidebar'
import { Topbar } from '@/components/layout/Topbar'

export default async function MerchantLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (user.app_metadata?.role === 'admin') redirect('/admin')

  // Load this user's merchant info
  const { data: mu } = await supabase
    .from('merchant_users')
    .select('merchant_id, merchants(name, logo_url)')
    .eq('user_id', user.id)
    .single()

  if (!mu) redirect('/login')

  const merchant = (mu.merchants as { name: string; logo_url: string | null } | null) ?? {
    name:     'Merchant',
    logo_url: null,
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <MerchantSidebar merchant={merchant} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar user={user} title={merchant.name} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
