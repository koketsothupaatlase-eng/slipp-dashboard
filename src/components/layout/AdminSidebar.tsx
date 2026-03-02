'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Store, Activity, type LucideIcon } from 'lucide-react'

const navItems: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: '/admin',           label: 'Overview',  Icon: LayoutDashboard },
  { href: '/admin/users',     label: 'Users',     Icon: Users           },
  { href: '/admin/merchants', label: 'Merchants', Icon: Store           },
  { href: '/admin/activity',  label: 'Activity',  Icon: Activity        },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="no-print w-56 bg-gray-900 flex flex-col flex-shrink-0">
      {/* Brand */}
      <div className="h-16 flex items-center px-5 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <Image src="/slipp-icon.png" alt="Slipp" width={32} height={32} className="rounded-lg" />
          <div>
            <span className="text-white text-sm font-bold">Slipp</span>
            <span className="block text-gray-500 text-xs">Admin Portal</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, Icon }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-brand-green text-white font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon
                size={17}
                className={active ? 'text-white' : 'text-brand-lime'}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-5 py-4 border-t border-gray-800">
        <p className="text-xs text-gray-600">Slipp Admin Portal</p>
      </div>
    </aside>
  )
}
