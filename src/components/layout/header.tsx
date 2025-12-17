'use client'

import { User, ChevronDown, Search } from 'lucide-react'
import { NotificationsDropdown } from '@/components/dashboard/notifications-dropdown'
import { mockNotifications } from '@/lib/mock-data'

interface HeaderProps {
  title: string
  subtitle?: string
  badge?: string
}

export function Header({ title, subtitle, badge }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {badge && (
          <span className="rounded-full bg-primary-100 px-3 py-1 text-sm font-semibold text-primary-700">
            {badge}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Suchen..."
            className="h-9 w-64 rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        </div>

        {/* Notifications */}
        <NotificationsDropdown notifications={mockNotifications} />

        {/* User Menu */}
        <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100">
            <User className="h-5 w-5 text-primary-600" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900">Max Mustermann</p>
            <p className="text-xs text-gray-500">TechCorp GmbH</p>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </header>
  )
}
