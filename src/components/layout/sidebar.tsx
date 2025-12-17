'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Coins,
  Cpu,
  Receipt,
  Map,
  GraduationCap,
  Settings,
  HelpCircle,
  Sparkles,
} from 'lucide-react'

const navigation = [
  { name: 'Übersicht', href: '/', icon: LayoutDashboard },
  { name: 'Punktebudget', href: '/budget', icon: Coins },
  { name: 'Module', href: '/modules', icon: Cpu },
  { name: 'Kosten', href: '/costs', icon: Receipt },
  { name: 'Roadmap', href: '/roadmap', icon: Map },
  { name: 'Enablement', href: '/enablement', icon: GraduationCap },
]

const secondaryNavigation = [
  { name: 'Einstellungen', href: '/settings', icon: Settings },
  { name: 'Hilfe', href: '/help', icon: HelpCircle },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="text-lg font-bold text-gray-900">AI Empowerment</span>
          <p className="text-xs text-gray-500">Dashboard</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Hauptmenü
        </p>
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 shrink-0',
                  isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Secondary Navigation */}
      <div className="border-t border-gray-200 px-3 py-4">
        {secondaryNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 shrink-0',
                  isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </div>

      {/* Membership Badge */}
      <div className="border-t border-gray-200 p-4">
        <div className="rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 p-4 text-white">
          <p className="text-xs font-medium opacity-80">Ihr Paket</p>
          <p className="text-lg font-bold">Medium (M)</p>
          <p className="mt-1 text-xs opacity-80">200 Punkte / Monat</p>
        </div>
      </div>
    </div>
  )
}
