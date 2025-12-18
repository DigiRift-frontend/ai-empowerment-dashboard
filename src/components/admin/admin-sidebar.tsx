'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Coins,
  Map,
  Cpu,
  MessageSquare,
  GraduationCap,
  UserCog,
  Settings,
  ChevronLeft,
} from 'lucide-react'

const navigation = [
  { name: 'Übersicht', href: '/admin', icon: LayoutDashboard },
  { name: 'Kunden', href: '/admin/customers', icon: Users },
  { name: 'Modulkatalog', href: '/admin/modules', icon: Cpu },
  { name: 'Schulungskatalog', href: '/admin/schulungen', icon: GraduationCap },
  { name: 'Team', href: '/admin/team', icon: UserCog },
]

const secondaryNavigation = [
  { name: 'Einstellungen', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col border-r border-gray-200 bg-gray-900">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between bg-gray-900 border-b border-gray-800 px-4">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-lg bg-white p-1">
            <Image
              src="/blue_cropped.png"
              alt="digirift Logo"
              fill
              className="object-contain p-1"
            />
          </div>
          <div>
            <span className="text-sm font-bold text-white">Admin</span>
            <p className="text-xs text-gray-400">AI Empowerment</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4">
        <p className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Hauptmenü
        </p>
        {navigation.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors mb-1',
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 shrink-0',
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Secondary Navigation */}
      <div className="px-3 pb-4">
        <div className="border-t border-gray-800 pt-4">
          {secondaryNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors mb-1',
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* Back to Customer View */}
        <Link
          href="/"
          className="mt-4 flex items-center gap-2 rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Zur Kundenansicht
        </Link>
      </div>
    </div>
  )
}
