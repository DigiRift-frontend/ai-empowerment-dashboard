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
  RefreshCw,
} from 'lucide-react'

interface AdminMessage {
  id: string
  subject: string
  content: string
  read: boolean
  customerRead?: boolean
  direction?: 'incoming' | 'outgoing'
  from: string
  createdAt: string
  messageType?: 'normal' | 'status_update'
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
  const [messageFilter, setMessageFilter] = useState<'all' | 'normal' | 'status_update'>('all')

  const unreadNotifications = notifications.filter((n) => !n.read).length
  // For messages from admin (outgoing), check customerRead; for messages the customer sent, they're not "unread" for them
  const unreadMessages = messages.filter((m) => {
    if (m.direction === 'outgoing') {
      return !m.customerRead
    }
    return false
  }).length
  const unreadCount = unreadNotifications + unreadMessages
  const actionRequiredCount = notifications.filter((n) => n.actionRequired).length

  // Filter messages by type
  const filteredMessages = messages.filter((m) => {
    if (messageFilter === 'all') return true
    return (m.messageType || 'normal') === messageFilter
  })

  const statusUpdateCount = messages.filter((m) => m.messageType === 'status_update').length
  const normalMessageCount = messages.filter((m) => (m.messageType || 'normal') === 'normal').length

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
        <Bell className={`h-5 w-5 ${actionRequiredCount > 0 ? 'text-red-500' : 'text-gray-500'}`} />
        {unreadCount > 0 && (
          <span className={`absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${
            actionRequiredCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-blue-500'
          }`}>
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
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-gray-900">Benachrichtigungen</h3>
                {actionRequiredCount > 0 && (
                  <span className="flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                    <AlertTriangle className="h-3 w-3" />
                    {actionRequiredCount} {actionRequiredCount === 1 ? 'Aktion' : 'Aktionen'}
                  </span>
                )}
              </div>
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

            {/* Message Type Filter - only show when messages tab is active */}
            {activeTab === 'messages' && messages.length > 0 && (
              <div className="flex gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100">
                <button
                  onClick={() => setMessageFilter('all')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                    messageFilter === 'all'
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Alle ({messages.length})
                </button>
                <button
                  onClick={() => setMessageFilter('status_update')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors flex items-center gap-1 ${
                    messageFilter === 'status_update'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <RefreshCw className="h-3 w-3" />
                  Status ({statusUpdateCount})
                </button>
                <button
                  onClick={() => setMessageFilter('normal')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors flex items-center gap-1 ${
                    messageFilter === 'normal'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Mail className="h-3 w-3" />
                  Normal ({normalMessageCount})
                </button>
              </div>
            )}

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
              {(activeTab === 'all' || activeTab === 'messages') && (activeTab === 'all' ? messages : filteredMessages).length > 0 && (
                <>
                  {activeTab === 'all' && notifications.length > 0 && messages.length > 0 && (
                    <div className="bg-gray-50 px-4 py-1.5 text-xs font-medium text-gray-500">
                      Nachrichten
                    </div>
                  )}
                  {(activeTab === 'all' ? messages : filteredMessages).map((message) => {
                    const isStatusUpdate = message.messageType === 'status_update'
                    // For outgoing messages (from admin), check customerRead; otherwise check read
                    const isUnread = message.direction === 'outgoing' ? !message.customerRead : !message.read
                    return (
                      <Link
                        key={message.id}
                        href="/messages"
                        onClick={() => {
                          onMarkMessageAsRead?.(message.id)
                          setIsOpen(false)
                        }}
                        className={`flex gap-3 border-b border-gray-50 p-4 transition-colors hover:bg-gray-50 ${
                          isUnread ? (isStatusUpdate ? 'bg-orange-50/50' : 'bg-blue-50/50') : ''
                        }`}
                      >
                        <div className={`shrink-0 rounded-lg p-2 ${
                          isStatusUpdate
                            ? (isUnread ? 'bg-orange-100' : 'bg-orange-50')
                            : (isUnread ? 'bg-blue-100' : 'bg-gray-100')
                        }`}>
                          {isStatusUpdate ? (
                            <RefreshCw className={`h-4 w-4 ${isUnread ? 'text-orange-600' : 'text-orange-400'}`} />
                          ) : (
                            <Mail className={`h-4 w-4 ${isUnread ? 'text-blue-600' : 'text-gray-500'}`} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm ${isUnread ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                              {message.subject}
                            </p>
                            {isUnread && (
                              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                isStatusUpdate
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {isStatusUpdate ? 'Status' : 'Neu'}
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
                    )
                  })}
                </>
              )}

              {/* Empty state */}
              {((activeTab === 'all' && notifications.length === 0 && messages.length === 0) ||
                (activeTab === 'notifications' && notifications.length === 0) ||
                (activeTab === 'messages' && filteredMessages.length === 0)) && (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <Bell className="mb-2 h-8 w-8 text-gray-300" />
                  <p>Keine {activeTab === 'messages'
                    ? (messageFilter === 'status_update' ? 'Status-Updates' : messageFilter === 'normal' ? 'Nachrichten' : 'Nachrichten')
                    : activeTab === 'notifications' ? 'Updates' : 'Benachrichtigungen'}</p>
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
