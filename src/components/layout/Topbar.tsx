'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function Topbar({ user, title }: { user: User; title?: string }) {
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials = (user.user_metadata?.full_name as string | undefined)
    ?.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
    ?? user.email?.[0]?.toUpperCase()
    ?? '?'

  return (
    <header className="no-print h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between flex-shrink-0">
      <span className="font-semibold text-gray-800">{title ?? 'Dashboard'}</span>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500 hidden sm:block">{user.email}</span>
        <div className="w-8 h-8 rounded-full bg-brand-green flex items-center justify-center text-white text-xs font-bold">
          {initials}
        </div>
        <button
          onClick={signOut}
          className="text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
