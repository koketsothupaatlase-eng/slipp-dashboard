'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Receipt, Users, BarChart2, Download, type LucideIcon } from 'lucide-react'
import type { Merchant } from '@/types/database'

const navItems: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: '/merchant',              label: 'Dashboard',    Icon: LayoutDashboard },
  { href: '/merchant/transactions', label: 'Transactions', Icon: Receipt         },
  { href: '/merchant/customers',    label: 'Customers',    Icon: Users           },
  { href: '/merchant/analytics',    label: 'Analytics',    Icon: BarChart2       },
  { href: '/merchant/reports',      label: 'Reports',      Icon: Download        },
]

export function MerchantSidebar({ merchant }: { merchant: Pick<Merchant, 'name' | 'logo_url'> }) {
  const pathname = usePathname()

  return (
    <aside className="no-print w-56 bg-gray-900 flex flex-col flex-shrink-0">
      {/* Brand */}
      <div className="h-16 flex items-center px-5 border-b border-gray-800">
        <div className="flex items-center gap-2.5 min-w-0">
          <Image src="/slipp-icon.png" alt="Slipp" width={32} height={32} className="rounded-lg flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-white text-xs font-bold truncate">{merchant.name}</p>
            <p className="text-gray-500 text-xs">Powered by Slipp</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, Icon }) => {
          const active = pathname === href || (href !== '/merchant' && pathname.startsWith(href))
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
        <p className="text-xs text-gray-600">Powered by Slipp</p>
      </div>
    </aside>
  )
}
