'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCustomer } from '@/hooks/use-customers'
import { useAuth } from '@/hooks/use-auth'
import { formatDateTime } from '@/lib/utils'
import {
  MessageSquare,
  Mail,
  MailOpen,
  ChevronRight,
  Bell,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Inbox,
  RefreshCw,
  Filter,
} from 'lucide-react'
import Link from 'next/link'

interface AdminMessage {
  id: string
  subject: string
  content: string
  read: boolean           // Admin read status (for incoming messages from customer)
  customerRead: boolean   // Customer read status (for outgoing messages from admin)
  from: string
  createdAt: string
  messageType?: 'normal' | 'status_update'
  direction: 'incoming' | 'outgoing'  // incoming = customer -> admin, outgoing = admin -> customer
}

export default function MessagesPage() {
  const { customerId, isLoading: authLoading } = useAuth()
  const { customer, isLoading: customerLoading, mutate } = useCustomer(customerId || null)

  const isLoading = authLoading || customerLoading

  const messages: AdminMessage[] = customer?.adminMessages || []
  const notifications = customer?.notifications || []

  const [selectedMessage, setSelectedMessage] = useState<AdminMessage | null>(null)
  const [messageFilter, setMessageFilter] = useState<'all' | 'normal' | 'status_update'>('all')

  // For customer view: check customerRead for outgoing messages (from admin to customer)
  const isMessageUnread = (message: AdminMessage) => {
    // Outgoing messages (admin -> customer): customer has not read yet
    if (message.direction === 'outgoing') {
      return !message.customerRead
    }
    // Incoming messages (customer -> admin): already read by customer (they sent it)
    return false
  }

  const unreadMessages = messages.filter(isMessageUnread).length
  const pendingActions = notifications.filter((n: any) => n.actionRequired && !n.read).length

  // Filter messages by type
  const filteredMessages = messages.filter((m) => {
    if (messageFilter === 'all') return true
    return (m.messageType || 'normal') === messageFilter
  })

  const statusUpdateCount = messages.filter((m) => m.messageType === 'status_update').length
  const normalMessageCount = messages.filter((m) => (m.messageType || 'normal') === 'normal').length

  // Select first message when messages load
  useEffect(() => {
    if (messages.length > 0 && !selectedMessage) {
      setSelectedMessage(messages[0])
    }
  }, [messages.length])

  // Mark message as read by customer (called automatically when message is selected)
  const markAsRead = async (message: AdminMessage) => {
    try {
      // For outgoing messages (admin -> customer): set customerRead
      // For incoming messages (customer -> admin): nothing to update (customer already knows)
      if (message.direction === 'outgoing') {
        await fetch(`/api/customers/${customerId}/messages/${message.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customerRead: true }),
        })
        mutate()
      }
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  // Handle message selection - auto mark as read
  const handleSelectMessage = (message: AdminMessage) => {
    setSelectedMessage(message)
    if (isMessageUnread(message)) {
      markAsRead(message)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          title="Nachrichten"
          subtitle="Kommunikation mit Ihrem AI Empowerment Team"
        />
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Nachrichten"
        subtitle="Kommunikation mit Ihrem AI Empowerment Team"
      />

      <div className="p-6">
        {/* Action Required Banner */}
        {pendingActions > 0 && (
          <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">
                    {pendingActions} Aktion{pendingActions > 1 ? 'en' : ''} erforderlich
                  </p>
                  <p className="text-sm text-yellow-700">
                    Bitte bestätigen Sie ausstehende Akzeptanzkriterien
                  </p>
                </div>
              </div>
              <Link href="/roadmap">
                <Button variant="outline" size="sm">
                  Zur Roadmap
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Message List */}
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="flex items-center gap-3 pt-4">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{unreadMessages}</p>
                    <p className="text-xs text-gray-500">Ungelesen</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-3 pt-4">
                  <div className="rounded-lg bg-yellow-100 p-2">
                    <FileCheck className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{pendingActions}</p>
                    <p className="text-xs text-gray-500">Aktionen</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Messages */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-gray-400" />
                    Posteingang
                  </div>
                  <span className="text-sm font-normal text-gray-500">{messages.length}</span>
                </CardTitle>
              </CardHeader>

              {/* Message Type Filter */}
              {messages.length > 0 && (
                <div className="flex gap-2 px-4 py-2 border-b border-gray-100">
                  <button
                    onClick={() => setMessageFilter('all')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                      messageFilter === 'all'
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Alle ({messages.length})
                  </button>
                  <button
                    onClick={() => setMessageFilter('status_update')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors flex items-center gap-1 ${
                      messageFilter === 'status_update'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Mail className="h-3 w-3" />
                    Nachrichten ({normalMessageCount})
                  </button>
                </div>
              )}

              <CardContent className="p-0">
                {filteredMessages.length === 0 ? (
                  <div className="p-8 text-center">
                    <Inbox className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500">
                      {messageFilter === 'status_update'
                        ? 'Keine Status-Updates vorhanden'
                        : messageFilter === 'normal'
                        ? 'Keine Nachrichten vorhanden'
                        : 'Keine Nachrichten vorhanden'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredMessages.map((message) => {
                      const isStatusUpdate = message.messageType === 'status_update'
                      const unread = isMessageUnread(message)
                      // In "All" tab: uniform styling, in filtered tabs: show type-specific colors
                      const showTypeColors = messageFilter !== 'all'

                      return (
                        <button
                          key={message.id}
                          onClick={() => handleSelectMessage(message)}
                          className={`flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-gray-50 ${
                            selectedMessage?.id === message.id ? 'bg-primary-50' : ''
                          } ${unread ? 'bg-blue-50/50' : ''}`}
                        >
                          <div className={`shrink-0 rounded-lg p-2 ${
                            showTypeColors && isStatusUpdate
                              ? (unread ? 'bg-orange-100' : 'bg-orange-50')
                              : (unread ? 'bg-blue-100' : 'bg-gray-100')
                          }`}>
                            {showTypeColors && isStatusUpdate ? (
                              <RefreshCw className={`h-4 w-4 ${unread ? 'text-orange-600' : 'text-orange-400'}`} />
                            ) : unread ? (
                              <Mail className="h-4 w-4 text-blue-600" />
                            ) : (
                              <MailOpen className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={`truncate text-sm ${unread ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                                {message.subject}
                              </p>
                              {unread && (
                                <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                              )}
                            </div>
                            <p className="mt-0.5 truncate text-xs text-gray-500">
                              {message.from}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              {formatDateTime(message.createdAt)}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Notifications */}
            {notifications.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Bell className="h-4 w-4 text-gray-400" />
                    Benachrichtigungen
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100">
                    {notifications.slice(0, 4).map((notification: any) => (
                      <Link
                        key={notification.id}
                        href={notification.relatedUrl || '#'}
                        className={`flex items-start gap-3 p-4 transition-colors hover:bg-gray-50 ${
                          !notification.read ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div className={`shrink-0 rounded-lg p-2 ${
                          notification.actionRequired ? 'bg-yellow-100' : 'bg-gray-100'
                        }`}>
                          {notification.actionRequired ? (
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!notification.read ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                            {notification.title}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {formatDateTime(notification.createdAt)}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <Card className="h-full">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{selectedMessage.subject}</CardTitle>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                        <span>Von: {selectedMessage.from}</span>
                        <span>{formatDateTime(selectedMessage.createdAt)}</span>
                      </div>
                    </div>
                    {isMessageUnread(selectedMessage) && (
                      <Badge variant="default">Neu</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="prose prose-sm max-w-none">
                    {selectedMessage.content.split('\n').map((paragraph, index) => {
                      if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                        return (
                          <h4 key={index} className="mt-4 font-semibold text-gray-900">
                            {paragraph.replace(/\*\*/g, '')}
                          </h4>
                        )
                      }
                      if (paragraph.startsWith('- ')) {
                        return (
                          <li key={index} className="text-gray-600">
                            {paragraph.substring(2)}
                          </li>
                        )
                      }
                      if (paragraph.match(/^\d+\./)) {
                        return (
                          <p key={index} className="text-gray-600 ml-4">
                            {paragraph}
                          </p>
                        )
                      }
                      return paragraph ? (
                        <p key={index} className="text-gray-600">
                          {paragraph}
                        </p>
                      ) : (
                        <br key={index} />
                      )
                    })}
                  </div>

                </CardContent>
              </Card>
            ) : (
              <Card className="flex h-full min-h-[400px] items-center justify-center">
                <div className="text-center text-gray-500">
                  <Mail className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                  <p>Wählen Sie eine Nachricht aus</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
