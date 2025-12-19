'use client'

import Link from 'next/link'
import { User, ChevronDown, Search } from 'lucide-react'
import { NotificationsDropdown } from '@/components/dashboard/notifications-dropdown'
import { useAuth } from '@/hooks/use-auth'
import { useCustomer } from '@/hooks/use-customers'

interface HeaderProps {
  title: string
  subtitle?: string
  badge?: string
}

export function Header({ title, subtitle, badge }: HeaderProps) {
  const { customerId } = useAuth()
  const { customer, mutate } = useCustomer(customerId || '')

  const notifications = customer?.notifications || []
  const messages = customer?.adminMessages || []

  const handleMarkMessageAsRead = async (messageId: string) => {
    try {
      // Find the message to determine the direction
      const message = messages.find((m: any) => m.id === messageId)
      // For messages from admin (outgoing), use customerRead; otherwise use read
      const updateField = message?.direction === 'outgoing' ? 'customerRead' : 'read'

      await fetch(`/api/customers/${customerId}/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [updateField]: true }),
      })
      mutate()
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      // Mark all unread messages as read based on direction
      // For outgoing (from admin), check customerRead; for incoming, check read
      const unreadMessages = messages.filter((m: any) => {
        if (m.direction === 'outgoing') {
          return !m.customerRead
        }
        return false // Customer sent these, so they're not "unread" from customer perspective
      })
      await Promise.all(
        unreadMessages.map((m: any) =>
          fetch(`/api/customers/${customerId}/messages/${m.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerRead: true }),
          })
        )
      )

      // Mark all notifications as read
      const unreadNotifications = notifications.filter((n: any) => !n.read)
      await Promise.all(
        unreadNotifications.map((n: any) =>
          fetch(`/api/customers/${customerId}/notifications/${n.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ read: true }),
          })
        )
      )

      mutate()
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#1D354F' }}>{title}</h1>
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

        {/* Notifications & Messages */}
        <NotificationsDropdown
          notifications={notifications}
          messages={messages}
          onMarkMessageAsRead={handleMarkMessageAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
        />

        {/* User Menu */}
        <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100">
            <User className="h-5 w-5 text-primary-600" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900">{customer?.name || 'Laden...'}</p>
            <p className="text-xs text-gray-500">{customer?.companyName || ''}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </header>
  )
}
