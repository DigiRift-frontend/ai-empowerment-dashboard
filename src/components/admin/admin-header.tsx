'use client'

import { useState, useEffect, useRef } from 'react'
import { User, Bell, X, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface AdminMessage {
  id: string
  subject: string
  content: string
  read: boolean
  from: string
  messageType: string
  direction: 'incoming' | 'outgoing'
  customerId: string
  customer: {
    id: string
    companyName: string
    name: string
  }
  createdAt: string
}

interface AdminHeaderProps {
  title: string
  subtitle?: string
}

export function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const [notifications, setNotifications] = useState<AdminMessage[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchNotifications()
    // Refresh every 10 seconds
    const interval = setInterval(fetchNotifications, 10000)

    // Also refresh when window gains focus
    const handleFocus = () => fetchNotifications()
    window.addEventListener('focus', handleFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchNotifications = async () => {
    try {
      // Only fetch incoming unread messages for notifications
      const response = await fetch('/api/admin/messages?unread=true&direction=incoming&limit=5')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      })
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const unreadCount = notifications.length

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-lg">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <h3 className="font-semibold text-gray-900">Benachrichtigungen</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    {unreadCount} neu
                  </span>
                )}
              </div>
              <div className="max-h-80 overflow-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    Keine neuen Benachrichtigungen
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="border-b border-gray-50 last:border-b-0"
                    >
                      <div className="px-4 py-3 hover:bg-gray-50">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {notification.subject}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {notification.from} • {notification.customer?.companyName}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notification.createdAt).toLocaleString('de-DE', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsRead(notification.id)
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded"
                            title="Als gelesen markieren"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="border-t border-gray-100 px-4 py-2">
                <Link
                  href="/admin?view=messages&filter=incoming"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center justify-center gap-1 text-sm text-primary-600 hover:text-primary-700 py-1"
                >
                  Alle Nachrichten anzeigen
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Admin User */}
        <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900">
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900">Admin</p>
            <p className="text-xs text-gray-500">digirift</p>
          </div>
        </div>
      </div>
    </header>
  )
}
