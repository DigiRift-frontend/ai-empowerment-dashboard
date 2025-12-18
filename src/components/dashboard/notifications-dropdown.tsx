'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Notification } from '@/types'
import { formatDate } from '@/lib/utils'
import {
  Bell,
  CheckCircle,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  FileCheck,
  FlaskConical,
  X,
  ChevronRight,
  Mail,
} from 'lucide-react'

interface AdminMessage {
  id: string
  subject: string
  content: string
  read: boolean
  from: string
  createdAt: string
}

interface NotificationsDropdownProps {
  notifications: Notification[]
  messages?: AdminMessage[]
  onMarkAsRead?: (id: string) => void
  onMarkAllAsRead?: () => void
  onMarkMessageAsRead?: (id: string) => void
}

export function NotificationsDropdown({
  notifications,
  messages = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onMarkMessageAsRead,
}: NotificationsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'notifications' | 'messages'>('all')

  const unreadNotifications = notifications.filter((n) => !n.read).length
  const unreadMessages = messages.filter((m) => !m.read).length
  const unreadCount = unreadNotifications + unreadMessages

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'test_required':
        return <FlaskConical className="h-4 w-4 text-purple-600" />
      case 'acceptance_required':
        return <FileCheck className="h-4 w-4 text-yellow-600" />
      case 'message':
        return <MessageSquare className="h-4 w-4 text-blue-600" />
      case 'project_update':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'milestone_reached':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'budget_warning':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'test_required':
        return 'bg-purple-100'
      case 'acceptance_required':
        return 'bg-yellow-100'
      case 'message':
        return 'bg-blue-100'
      case 'project_update':
        return 'bg-green-100'
      case 'milestone_reached':
        return 'bg-green-100'
      case 'budget_warning':
        return 'bg-red-100'
      default:
        return 'bg-gray-100'
    }
  }

  const getActionBadge = (type: Notification['type'], actionRequired: boolean) => {
    if (type === 'test_required') {
      return (
        <span className="shrink-0 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-700">
          Test erforderlich
        </span>
      )
    }
    if (actionRequired) {
      return (
        <span className="shrink-0 rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-medium text-yellow-700">
          Aktion erforderlich
        </span>
      )
    }
    return null
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 hover:bg-gray-100"
      >
        <Bell className="h-5 w-5 text-gray-500" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full z-20 mt-2 w-96 rounded-xl border border-gray-200 bg-white shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h3 className="font-semibold text-gray-900">Benachrichtigungen</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="text-xs text-primary-600 hover:text-primary-700"
                  >
                    Alle gelesen
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded p-1 hover:bg-gray-100"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'border-b-2 border-primary-500 text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Alle
                {unreadCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'notifications'
                    ? 'border-b-2 border-primary-500 text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Updates
                {unreadNotifications > 0 && (
                  <span className="ml-1.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                    {unreadNotifications}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'messages'
                    ? 'border-b-2 border-primary-500 text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Nachrichten
                {unreadMessages > 0 && (
                  <span className="ml-1.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-600">
                    {unreadMessages}
                  </span>
                )}
              </button>
            </div>

            {/* Content List */}
            <div className="max-h-96 overflow-y-auto">
              {/* Notifications */}
              {(activeTab === 'all' || activeTab === 'notifications') && notifications.length > 0 && (
                <>
                  {activeTab === 'all' && notifications.length > 0 && messages.length > 0 && (
                    <div className="bg-gray-50 px-4 py-1.5 text-xs font-medium text-gray-500">
                      Updates
                    </div>
                  )}
                  {notifications.map((notification) => (
                    <Link
                      key={notification.id}
                      href={notification.relatedUrl || '#'}
                      onClick={() => {
                        onMarkAsRead?.(notification.id)
                        setIsOpen(false)
                      }}
                      className={`flex gap-3 border-b border-gray-50 p-4 transition-colors hover:bg-gray-50 ${
                        !notification.read ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className={`shrink-0 rounded-lg p-2 ${getTypeColor(notification.type)}`}>
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${!notification.read ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                            {notification.title}
                          </p>
                          {getActionBadge(notification.type, notification.actionRequired)}
                        </div>
                        <p className="mt-0.5 text-sm text-gray-600 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
                    </Link>
                  ))}
                </>
              )}

              {/* Messages */}
              {(activeTab === 'all' || activeTab === 'messages') && messages.length > 0 && (
                <>
                  {activeTab === 'all' && notifications.length > 0 && messages.length > 0 && (
                    <div className="bg-gray-50 px-4 py-1.5 text-xs font-medium text-gray-500">
                      Nachrichten
                    </div>
                  )}
                  {messages.map((message) => (
                    <Link
                      key={message.id}
                      href="/messages"
                      onClick={() => {
                        onMarkMessageAsRead?.(message.id)
                        setIsOpen(false)
                      }}
                      className={`flex gap-3 border-b border-gray-50 p-4 transition-colors hover:bg-gray-50 ${
                        !message.read ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className={`shrink-0 rounded-lg p-2 ${message.read ? 'bg-gray-100' : 'bg-blue-100'}`}>
                        <Mail className={`h-4 w-4 ${message.read ? 'text-gray-500' : 'text-blue-600'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${!message.read ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                            {message.subject}
                          </p>
                          {!message.read && (
                            <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                              Neu
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-gray-500">
                          Von: {message.from}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {formatDate(message.createdAt)}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
                    </Link>
                  ))}
                </>
              )}

              {/* Empty state */}
              {((activeTab === 'all' && notifications.length === 0 && messages.length === 0) ||
                (activeTab === 'notifications' && notifications.length === 0) ||
                (activeTab === 'messages' && messages.length === 0)) && (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <Bell className="mb-2 h-8 w-8 text-gray-300" />
                  <p>Keine {activeTab === 'messages' ? 'Nachrichten' : activeTab === 'notifications' ? 'Updates' : 'Benachrichtigungen'}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 p-2">
              <Link
                href="/messages"
                onClick={() => setIsOpen(false)}
                className="block rounded-lg px-3 py-2 text-center text-sm font-medium text-primary-600 hover:bg-primary-50"
              >
                Alle Nachrichten anzeigen
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
