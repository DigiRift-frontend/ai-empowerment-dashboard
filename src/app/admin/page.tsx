'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AdminHeader } from '@/components/admin/admin-header'
import { mockCustomers, mockCustomerModules, getAdminStats } from '@/lib/admin-mock-data'
import { Users, Euro, TrendingUp, Clock, AlertCircle, CheckCircle, ArrowRight, Bell, MessageSquare, Trash2, ArrowLeft, Inbox, Send, Pencil, X, Loader2, ChevronDown } from 'lucide-react'
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

const statusConfig = {
  geplant: { label: 'Geplant', color: 'bg-gray-100 text-gray-700' },
  in_arbeit: { label: 'In Arbeit', color: 'bg-blue-100 text-blue-700' },
  im_test: { label: 'Im Test', color: 'bg-yellow-100 text-yellow-700' },
  abgeschlossen: { label: 'Fertig', color: 'bg-green-100 text-green-700' },
}

const tierConfig = {
  'S': { color: 'bg-gray-100 text-gray-700', points: 100 },
  'M': { color: 'bg-blue-100 text-blue-700', points: 200 },
  'L': { color: 'bg-purple-100 text-purple-700', points: 400 },
}

function AdminDashboardContent() {
  const stats = getAdminStats()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [adminMessages, setAdminMessages] = useState<AdminMessage[]>([])
  const [dashboardMessages, setDashboardMessages] = useState<AdminMessage[]>([])
  const [selectedMessage, setSelectedMessage] = useState<AdminMessage | null>(null)
  const [messageFilter, setMessageFilter] = useState<'incoming' | 'outgoing'>('incoming')

  // Compose message state
  const [showComposeModal, setShowComposeModal] = useState(false)
  const [composeData, setComposeData] = useState({
    customerId: '',
    subject: '',
    content: '',
  })
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [customers, setCustomers] = useState<Array<{ id: string; name: string; companyName: string }>>([])

  // Fetch customers for compose modal
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('/api/customers')
        if (response.ok) {
          const data = await response.json()
          setCustomers(data)
        }
      } catch (error) {
        console.error('Error fetching customers:', error)
      }
    }
    fetchCustomers()
  }, [])

  const viewMode = searchParams.get('view')
  const messageId = searchParams.get('message')
  const filterParam = searchParams.get('filter') as 'incoming' | 'outgoing' | null

  useEffect(() => {
    if (filterParam && (filterParam === 'incoming' || filterParam === 'outgoing')) {
      setMessageFilter(filterParam)
    }
  }, [filterParam])

  useEffect(() => {
    fetchAdminMessages()
  }, [messageFilter])

  useEffect(() => {
    fetchDashboardMessages()
  }, [])

  // Load selected message from URL
  useEffect(() => {
    if (messageId && adminMessages.length > 0) {
      const message = adminMessages.find(m => m.id === messageId)
      if (message) {
        setSelectedMessage(message)
        if (!message.read) {
          markAsRead(message.id)
        }
      }
    } else if (!messageId) {
      setSelectedMessage(null)
    }
  }, [messageId, adminMessages])

  const fetchAdminMessages = async () => {
    try {
      const response = await fetch(`/api/admin/messages?limit=50&direction=${messageFilter}`)
      if (response.ok) {
        const data = await response.json()
        setAdminMessages(data)
      }
    } catch (error) {
      console.error('Error fetching admin messages:', error)
    }
  }

  const fetchDashboardMessages = async () => {
    try {
      // Fetch unread incoming messages for dashboard quick view
      const response = await fetch('/api/admin/messages?limit=10&direction=incoming&unread=true')
      if (response.ok) {
        const data = await response.json()
        setDashboardMessages(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard messages:', error)
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      await fetch(`/api/admin/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      })
      setAdminMessages(prev =>
        prev.map(m => m.id === messageId ? { ...m, read: true } : m)
      )
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  const deleteMessage = async (msgId: string) => {
    try {
      await fetch(`/api/admin/messages/${msgId}`, {
        method: 'DELETE',
      })
      setAdminMessages(prev => prev.filter(m => m.id !== msgId))
      if (selectedMessage?.id === msgId) {
        setSelectedMessage(null)
        router.push('/admin?view=messages')
      }
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }

  const openMessage = (message: AdminMessage) => {
    router.push(`/admin?view=messages&filter=${messageFilter}&message=${message.id}`)
  }

  const closeMessage = () => {
    router.push(`/admin?view=messages&filter=${messageFilter}`)
  }

  const backToDashboard = () => {
    router.push('/admin')
  }

  const changeFilter = (filter: 'incoming' | 'outgoing') => {
    setMessageFilter(filter)
    router.push(`/admin?view=messages&filter=${filter}`)
  }

  const handleSendBroadcastMessage = async () => {
    if (!composeData.subject.trim() || !composeData.content.trim()) {
      return
    }

    setIsSendingMessage(true)
    try {
      // Send to all customers
      await Promise.all(
        customers.map((customer) =>
          fetch(`/api/customers/${customer.id}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subject: composeData.subject,
              content: composeData.content,
              from: 'Admin',
              direction: 'outgoing',
            }),
          })
        )
      )

      setShowComposeModal(false)
      setComposeData({ customerId: '', subject: '', content: '' })
      fetchAdminMessages()
    } catch (error) {
      console.error('Error sending broadcast message:', error)
    } finally {
      setIsSendingMessage(false)
    }
  }

  const unreadCount = adminMessages.filter(m => !m.read).length

  // Alle Module mit Kundenzuordnung
  const allModules = Object.entries(mockCustomerModules).flatMap(([customerId, modules]) =>
    modules.map(module => ({
      ...module,
      customer: mockCustomers.find(c => c.id === customerId),
    }))
  )

  // Aktive Module (in_arbeit oder im_test)
  const activeModules = allModules.filter(m => m.status === 'in_arbeit' || m.status === 'im_test')

  // Module mit ausstehender Akzeptanz
  const pendingAcceptanceModules = allModules.filter(m => m.acceptanceStatus === 'ausstehend')

  // Messages View (Split-View Layout)
  if (viewMode === 'messages') {
    return (
      <div className="flex flex-col h-screen">
        <AdminHeader title="Nachrichten" subtitle={messageFilter === 'incoming' ? 'Eingehende Nachrichten' : 'Gesendete Nachrichten'} />

        <div className="flex-1 overflow-hidden">
          {/* Back to Dashboard + Broadcast Button */}
          <div className="border-b border-gray-200 bg-white px-6 py-3 flex items-center justify-between">
            <button
              onClick={backToDashboard}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück zum Dashboard
            </button>
            <button
              onClick={() => setShowComposeModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
            >
              <Pencil className="h-4 w-4" />
              An alle Kunden senden
            </button>
          </div>

          <div className="flex h-[calc(100%-52px)]">
            {/* Message List (Left Side) */}
            <div className="w-96 border-r border-gray-200 bg-white flex flex-col">
              {/* Filter Tabs */}
              <div className="flex border-b border-gray-200 flex-shrink-0">
                <button
                  onClick={() => changeFilter('incoming')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    messageFilter === 'incoming'
                      ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Inbox className="h-4 w-4" />
                  Posteingang
                  {messageFilter === 'incoming' && unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => changeFilter('outgoing')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    messageFilter === 'outgoing'
                      ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Send className="h-4 w-4" />
                  Gesendet
                </button>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-auto">
                {adminMessages.length === 0 ? (
                  <div className="px-5 py-12 text-center text-gray-500">
                    {messageFilter === 'incoming' ? (
                      <>
                        <Inbox className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>Keine eingehenden Nachrichten</p>
                      </>
                    ) : (
                      <>
                        <Send className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>Keine gesendeten Nachrichten</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {adminMessages.map((message) => (
                      <div
                        key={message.id}
                        onClick={() => {
                          setSelectedMessage(message)
                          if (!message.read && message.direction === 'incoming') {
                            markAsRead(message.id)
                          }
                        }}
                        className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                          selectedMessage?.id === message.id ? 'bg-primary-50 border-l-2 border-primary-600' : ''
                        } ${!message.read && message.direction === 'incoming' ? 'bg-blue-50/50' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-full font-medium flex-shrink-0 text-sm ${
                            message.direction === 'incoming'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-green-100 text-green-600'
                          }`}>
                            {message.direction === 'incoming'
                              ? message.from.charAt(0).toUpperCase()
                              : message.customer?.companyName?.charAt(0).toUpperCase() || 'K'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <div className="flex items-center gap-2 min-w-0">
                                {!message.read && message.direction === 'incoming' && (
                                  <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                                )}
                                <p className={`truncate text-sm ${!message.read && message.direction === 'incoming' ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                  {message.direction === 'incoming'
                                    ? message.from
                                    : message.customer?.companyName || 'Unbekannt'}
                                </p>
                              </div>
                              <p className="text-xs text-gray-400 flex-shrink-0">
                                {new Date(message.createdAt).toLocaleString('de-DE', {
                                  day: '2-digit',
                                  month: '2-digit',
                                })}
                              </p>
                            </div>
                            <p className={`truncate text-sm ${!message.read && message.direction === 'incoming' ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                              {message.subject}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Message Detail (Right Side) */}
            <div className="flex-1 bg-gray-50 overflow-auto">
              {selectedMessage ? (
                <div className="p-6 h-full">
                  <div className="bg-white rounded-xl border border-gray-200 h-full flex flex-col">
                    {/* Message Header */}
                    <div className="border-b border-gray-200 px-6 py-4 flex-shrink-0">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          selectedMessage.direction === 'incoming'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {selectedMessage.direction === 'incoming' ? 'Eingehend' : 'Gesendet'}
                        </span>
                      </div>
                      <h1 className="text-xl font-semibold text-gray-900 mb-3">
                        {selectedMessage.subject}
                      </h1>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full font-medium ${
                            selectedMessage.direction === 'incoming'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-green-100 text-green-600'
                          }`}>
                            {selectedMessage.direction === 'incoming'
                              ? selectedMessage.from.charAt(0).toUpperCase()
                              : 'A'}
                          </div>
                          <div>
                            {selectedMessage.direction === 'incoming' ? (
                              <>
                                <p className="text-sm text-gray-500">Von</p>
                                <p className="font-medium text-gray-900">{selectedMessage.from}</p>
                              </>
                            ) : (
                              <>
                                <p className="text-sm text-gray-500">An</p>
                                <p className="font-medium text-gray-900">{selectedMessage.customer?.companyName || 'Unbekannt'}</p>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {new Date(selectedMessage.createdAt).toLocaleString('de-DE', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Message Body */}
                    <div className="flex-1 px-6 py-5 overflow-auto">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {selectedMessage.content}
                      </p>
                    </div>

                    {/* Message Actions */}
                    <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
                      <div className="flex gap-2">
                        {selectedMessage.customer && (
                          <Link
                            href={`/admin/customers/${selectedMessage.customer.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          >
                            <ArrowRight className="h-4 w-4" />
                            Zum Kunden
                          </Link>
                        )}
                      </div>
                      <button
                        onClick={() => deleteMessage(selectedMessage.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Löschen
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Wählen Sie eine Nachricht aus</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Broadcast Compose Modal */}
        {showComposeModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-end p-6 pointer-events-none">
            <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-200 pointer-events-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 bg-gray-100 rounded-t-xl">
                <h3 className="font-semibold text-gray-900">Nachricht an alle Kunden</h3>
                <button
                  onClick={() => {
                    setShowComposeModal(false)
                    setComposeData({ customerId: '', subject: '', content: '' })
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 space-y-4">
                {/* Info */}
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                  <Users className="h-4 w-4 flex-shrink-0" />
                  <span>Diese Nachricht wird an alle {customers.length} Kunden gesendet.</span>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Betreff</label>
                  <input
                    type="text"
                    value={composeData.subject}
                    onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Betreff der Nachricht"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nachricht</label>
                  <textarea
                    rows={6}
                    value={composeData.content}
                    onChange={(e) => setComposeData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Ihre Nachricht an alle Kunden..."
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-4 py-3">
                <button
                  onClick={() => {
                    setShowComposeModal(false)
                    setComposeData({ customerId: '', subject: '', content: '' })
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSendBroadcastMessage}
                  disabled={isSendingMessage || !composeData.subject.trim() || !composeData.content.trim()}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingMessage ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Senden...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      An alle senden
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Default Dashboard View
  return (
    <div className="flex flex-col h-screen">
      <AdminHeader title="Admin Dashboard" subtitle="Übersicht aller Kunden und Projekte" />

      <div className="flex-1 overflow-auto p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Kunden</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <Euro className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Monatlicher Umsatz</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalMonthlyRevenue.toLocaleString('de-DE')} €
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Aktive Module</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeModules}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ausstehende Akzeptanz</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingAcceptance}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Nachrichten von Kunden - Quick View */}
        {dashboardMessages.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 mb-6">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary-500" />
                Neue Nachrichten
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                  {dashboardMessages.length} ungelesen
                </span>
              </h2>
              <Link
                href="/admin?view=messages&filter=incoming"
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                Alle anzeigen
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {dashboardMessages.slice(0, 3).map((message) => (
                <div
                  key={message.id}
                  onClick={() => {
                    setMessageFilter('incoming')
                    router.push(`/admin?view=messages&filter=incoming&message=${message.id}`)
                  }}
                  className="px-5 py-3 hover:bg-gray-50 transition-colors cursor-pointer bg-blue-50/50"
                >
                  <div className="flex items-start gap-3">
                    <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{message.subject}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {message.from} • {message.customer?.companyName || 'Unbekannt'}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 flex-shrink-0">
                      {new Date(message.createdAt).toLocaleString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kundenliste */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="font-semibold text-gray-900">Kunden</h2>
              <Link
                href="/admin/customers"
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                Alle anzeigen
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {mockCustomers.map((customer) => (
                <Link
                  key={customer.id}
                  href={`/admin/customers/${customer.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                      {customer.companyName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{customer.companyName}</p>
                      <p className="text-sm text-gray-500">{customer.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${tierConfig[customer.membership.tier].color}`}>
                      Paket {customer.membership.tier}
                    </span>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {customer.membership.remainingPoints} / {customer.membership.monthlyPoints}
                      </p>
                      <p className="text-xs text-gray-500">Punkte verfügbar</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Aktive Module */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="font-semibold text-gray-900">Aktive Module</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {activeModules.length === 0 ? (
                <div className="px-5 py-8 text-center text-gray-500">
                  Keine aktiven Module
                </div>
              ) : (
                activeModules.slice(0, 5).map((module) => (
                  <div key={module.id} className="px-5 py-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{module.name}</p>
                        <p className="text-sm text-gray-500">{module.customer?.companyName}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[module.status].color}`}>
                        {statusConfig[module.status].label}
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Fortschritt</span>
                        <span>{module.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-gray-100">
                        <div
                          className="h-1.5 rounded-full bg-primary-500"
                          style={{ width: `${module.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Ausstehende Akzeptanz */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                Ausstehende Akzeptanz
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {pendingAcceptanceModules.length === 0 ? (
                <div className="px-5 py-8 text-center text-gray-500 flex flex-col items-center gap-2">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <p>Alle Akzeptanzkriterien bestätigt</p>
                </div>
              ) : (
                pendingAcceptanceModules.map((module) => (
                  <div key={module.id} className="px-5 py-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{module.name}</p>
                        <p className="text-sm text-gray-500">{module.customer?.companyName}</p>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                        {module.acceptanceCriteria?.length || 0} Kriterien
                      </span>
                    </div>
                    {module.acceptanceCriteria && (
                      <ul className="mt-2 space-y-1">
                        {module.acceptanceCriteria.slice(0, 2).map((criterion) => (
                          <li key={criterion.id} className="text-sm text-gray-600 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                            {criterion.description.length > 50
                              ? criterion.description.substring(0, 50) + '...'
                              : criterion.description}
                          </li>
                        ))}
                        {module.acceptanceCriteria.length > 2 && (
                          <li className="text-xs text-gray-400">
                            +{module.acceptanceCriteria.length - 2} weitere
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Punkte-Übersicht */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="font-semibold text-gray-900">Punkte-Verbrauch diesen Monat</h2>
            </div>
            <div className="p-5">
              <div className="space-y-4">
                {mockCustomers.map((customer) => {
                  const usedPercent = (customer.membership.usedPoints / customer.membership.monthlyPoints) * 100
                  return (
                    <div key={customer.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{customer.companyName}</span>
                        <span className="text-sm text-gray-500">
                          {customer.membership.usedPoints} / {customer.membership.monthlyPoints}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100">
                        <div
                          className={`h-2 rounded-full ${usedPercent > 80 ? 'bg-red-500' : usedPercent > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(usedPercent, 100)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>}>
      <AdminDashboardContent />
    </Suspense>
  )
}
