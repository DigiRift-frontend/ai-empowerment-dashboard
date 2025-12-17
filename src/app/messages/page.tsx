'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { mockAdminMessages, mockNotifications } from '@/lib/mock-data'
import { formatDate } from '@/lib/utils'
import {
  MessageSquare,
  Mail,
  MailOpen,
  ChevronRight,
  ArrowLeft,
  Bell,
  FileCheck,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'
import Link from 'next/link'

export default function MessagesPage() {
  const [selectedMessage, setSelectedMessage] = useState(mockAdminMessages[0])
  const unreadMessages = mockAdminMessages.filter((m) => !m.read).length
  const pendingActions = mockNotifications.filter((n) => n.actionRequired && !n.read).length

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
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                  Posteingang
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {mockAdminMessages.map((message) => (
                    <button
                      key={message.id}
                      onClick={() => setSelectedMessage(message)}
                      className={`flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-gray-50 ${
                        selectedMessage?.id === message.id ? 'bg-primary-50' : ''
                      } ${!message.read ? 'bg-blue-50/50' : ''}`}
                    >
                      <div className={`shrink-0 rounded-lg p-2 ${message.read ? 'bg-gray-100' : 'bg-blue-100'}`}>
                        {message.read ? (
                          <MailOpen className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Mail className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`truncate text-sm ${!message.read ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                            {message.subject}
                          </p>
                          {!message.read && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-gray-500">
                          {message.from}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {formatDate(message.createdAt)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Notifications */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bell className="h-4 w-4 text-gray-400" />
                  Benachrichtigungen
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {mockNotifications.slice(0, 4).map((notification) => (
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
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
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
                        <span>{formatDate(selectedMessage.createdAt)}</span>
                      </div>
                    </div>
                    {!selectedMessage.read && (
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

                  <div className="mt-8 flex gap-3 border-t border-gray-100 pt-6">
                    <Button>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Antworten
                    </Button>
                    <Button variant="outline">
                      Als gelesen markieren
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="flex h-full items-center justify-center">
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
