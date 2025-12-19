'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { AdminHeader } from '@/components/admin/admin-header'
import {
  mockCustomerRoadmaps,
  schulungskatalog,
  schulungSerien,
  moduleTemplates,
  AdminMessage,
} from '@/lib/admin-mock-data'
import { KanbanBoard } from '@/components/admin/kanban-board'
import { TeamTab } from '@/components/admin/team-tab'
import { Module, AcceptanceCriterion, ModuleStatus, CustomerRoadmapItem, Schulung, SchulungSerie, CustomerSchulungAssignment, ModuleTemplate } from '@/types'
import { useCustomer, updateMembership, updateCustomer } from '@/hooks/use-customers'
import { useTeam } from '@/hooks/use-team'
import { useAdvisors } from '@/hooks/use-advisors'
import { Loader2, Pencil, Users as UsersIcon, Settings, Upload, FileDown, Trash2 as TrashIcon } from 'lucide-react'
import {
  ArrowLeft,
  Package,
  Coins,
  Cpu,
  MessageSquare,
  Plus,
  Calendar,
  Clock,
  ExternalLink,
  AlertCircle,
  Key,
  Mail,
  Phone,
  Copy,
  CheckCircle2,
  Circle,
  ListChecks,
  Trash2,
  Map,
  GripVertical,
  GraduationCap,
  ChevronUp,
  ChevronDown,
  LayoutGrid,
  Kanban,
  Layers,
  Check,
  RefreshCw,
  Send,
  X,
} from 'lucide-react'
import Link from 'next/link'

type Tab = 'overview' | 'points' | 'modules' | 'schulungen' | 'roadmap' | 'messages' | 'team'
type ModuleViewMode = 'kanban' | 'overview'

const tierConfig = {
  S: { color: 'bg-gray-100 text-gray-700', label: 'Small', points: 100, price: 2900 },
  M: { color: 'bg-blue-100 text-blue-700', label: 'Medium', points: 200, price: 4900 },
  L: { color: 'bg-purple-100 text-purple-700', label: 'Large', points: 400, price: 8900 },
}

const statusConfig = {
  geplant: { label: 'Geplant', color: 'bg-gray-100 text-gray-700', columnColor: 'border-gray-300' },
  in_arbeit: { label: 'In Arbeit', color: 'bg-blue-100 text-blue-700', columnColor: 'border-blue-400' },
  im_test: { label: 'Im Test', color: 'bg-yellow-100 text-yellow-700', columnColor: 'border-yellow-400' },
  abgeschlossen: { label: 'Fertig', color: 'bg-green-100 text-green-700', columnColor: 'border-green-400' },
}

const moduleStatusConfig: Record<string, { label: string; color: string }> = {
  geplant: { label: 'Geplant', color: 'bg-gray-100 text-gray-700' },
  in_arbeit: { label: 'In Arbeit', color: 'bg-blue-100 text-blue-700' },
  im_test: { label: 'Im Test', color: 'bg-yellow-100 text-yellow-700' },
  abgeschlossen: { label: 'Live', color: 'bg-green-100 text-green-700' },
}

// Helper to get display status based on status + liveStatus
const getModuleDisplayStatus = (module: any): { label: string; color: string } => {
  if (module.status === 'abgeschlossen') {
    if (module.liveStatus === 'pausiert') {
      return { label: 'Pausiert', color: 'bg-yellow-100 text-yellow-700' }
    }
    if (module.liveStatus === 'deaktiviert') {
      return { label: 'Deaktiviert', color: 'bg-red-100 text-red-700' }
    }
    return { label: 'Live', color: 'bg-green-100 text-green-700' }
  }
  return moduleStatusConfig[module.status] || { label: module.status, color: 'bg-gray-100 text-gray-700' }
}

const categoryConfig: Record<string, { label: string; color: string }> = {
  entwicklung: { label: 'Entwicklung', color: 'bg-blue-100 text-blue-700' },
  wartung: { label: 'Wartung', color: 'bg-green-100 text-green-700' },
  schulung: { label: 'Schulung', color: 'bg-yellow-100 text-yellow-700' },
  beratung: { label: 'Beratung', color: 'bg-purple-100 text-purple-700' },
  analyse: { label: 'Analyse & PM', color: 'bg-orange-100 text-orange-700' },
  kommunikation: { label: 'Kommunikation', color: 'bg-pink-100 text-pink-700' },
}

export default function CustomerDetailPage() {
  const params = useParams()
  const customerId = params.id as string
  const { customer, isLoading, isError, mutate } = useCustomer(customerId)
  const { teamMembers: team } = useTeam()
  const { advisors } = useAdvisors()

  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [showBookPointsModal, setShowBookPointsModal] = useState(false)
  const [showNewModuleModal, setShowNewModuleModal] = useState(false)
  const [showCredentialsModal, setShowCredentialsModal] = useState(false)
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [showModuleDetailModal, setShowModuleDetailModal] = useState(false)
  const [editingCriteria, setEditingCriteria] = useState<AcceptanceCriterion[]>([])
  const [newCriterionText, setNewCriterionText] = useState('')
  const [showAddToRoadmapModal, setShowAddToRoadmapModal] = useState(false)
  const [addToRoadmapType, setAddToRoadmapType] = useState<'modul' | 'schulung'>('modul')
  const [moduleViewMode, setModuleViewMode] = useState<ModuleViewMode>('overview')
  const [showAddSchulungModal, setShowAddSchulungModal] = useState(false)
  const [showAddModuleFromCatalogModal, setShowAddModuleFromCatalogModal] = useState(false)

  // Paket-Bearbeitung State
  const [showEditPackageModal, setShowEditPackageModal] = useState(false)
  const [editPackageData, setEditPackageData] = useState({
    tier: '',
    monthlyPoints: 0,
    monthlyPrice: 0,
    discountPercent: 0,
    bonusPoints: 0,
    contractStart: '',
    contractEnd: '',
  })
  const [isSavingPackage, setIsSavingPackage] = useState(false)

  // Credentials State
  const [isGeneratingCredentials, setIsGeneratingCredentials] = useState(false)
  const [generatedCredential, setGeneratedCredential] = useState<{ type: string; value: string } | null>(null)

  // Message State
  const [newMessageSubject, setNewMessageSubject] = useState('')
  const [newMessageContent, setNewMessageContent] = useState('')
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [messageFilter, setMessageFilter] = useState<'all' | 'incoming' | 'outgoing'>('all')
  const [selectedMessageDetail, setSelectedMessageDetail] = useState<AdminMessage | null>(null)
  const [showMessageComposeModal, setShowMessageComposeModal] = useState(false)

  // Book Points State
  const [bookPointsData, setBookPointsData] = useState({
    description: '',
    points: '',
    date: new Date().toISOString().split('T')[0],
    category: 'entwicklung',
    moduleId: '',
  })
  const [isBookingPoints, setIsBookingPoints] = useState(false)

  // Edit Transaction State
  const [editingTransaction, setEditingTransaction] = useState<{
    id: string
    description: string
    points: string
    date: string
    category: string
    moduleId: string
  } | null>(null)
  const [isEditingTransaction, setIsEditingTransaction] = useState(false)
  const [isDeletingTransaction, setIsDeletingTransaction] = useState<string | null>(null)
  const [isDeletingMessage, setIsDeletingMessage] = useState<string | null>(null)
  const [isDeletingModule, setIsDeletingModule] = useState<string | null>(null)
  const [isCreatingModule, setIsCreatingModule] = useState(false)
  const [isUploadingManual, setIsUploadingManual] = useState(false)

  // New Module Form State
  const [newModuleData, setNewModuleData] = useState({
    name: '',
    description: '',
    status: 'geplant',
    monthlyMaintenancePoints: '',
    softwareUrl: '',
    assigneeId: '', // Interner Verantwortlicher (aus team)
    customerContactId: '', // Kunden-Verantwortlicher (aus customer.teamMembers)
  })

  // Get data from API response
  const apiModules = customer?.modules || []
  const transactions = customer?.pointTransactions || []
  // Map adminMessages to the expected format
  const messages: AdminMessage[] = (customer?.adminMessages || []).map((msg: any) => ({
    id: msg.id,
    subject: msg.subject,
    content: msg.content,
    read: msg.read,
    customerRead: msg.customerRead || false,
    direction: msg.direction || 'outgoing',
    actionRequired: false,
    sentAt: msg.createdAt,
    sentBy: msg.from,
    messageType: msg.messageType || 'normal',
  }))
  const customerRoadmap = mockCustomerRoadmaps[customerId]
  const initialSchulungAssignments = customer?.schulungAssignments || []

  const [customerModules, setCustomerModules] = useState<Module[]>([])
  const [roadmapItems, setRoadmapItems] = useState<CustomerRoadmapItem[]>([])
  const [schulungAssignments, setSchulungAssignments] = useState<CustomerSchulungAssignment[]>([])

  // Update state when customer data loads
  useEffect(() => {
    if (customer) {
      // Map API modules to expected format
      const mappedModules = apiModules.map((m: any) => ({
        ...m,
        status: m.status as ModuleStatus,
      }))
      setCustomerModules(mappedModules)
      setRoadmapItems(customerRoadmap?.items || [])
      setSchulungAssignments(initialSchulungAssignments)
    }
  }, [customer, apiModules, customerRoadmap, initialSchulungAssignments])

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <AdminHeader title="Laden..." />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </div>
    )
  }

  if (isError || !customer) {
    return (
      <div className="flex flex-col h-screen">
        <AdminHeader title="Kunde nicht gefunden" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Der Kunde wurde nicht gefunden.</p>
            <Link href="/admin/customers" className="text-primary-600 hover:text-primary-700">
              Zurück zur Kundenliste
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Count unread incoming messages for badge (only customer-initiated, no status updates)
  const unreadMessagesCount = messages.filter(
    (m) => m.direction === 'incoming' && !m.read && m.messageType !== 'status_update'
  ).length

  // Count ALL unread incoming messages (including status updates) for "Mark all as read" button
  const allUnreadIncomingCount = messages.filter(
    (m) => m.direction === 'incoming' && !m.read
  ).length

  const tabs = [
    { id: 'overview' as Tab, label: 'Übersicht', icon: Package },
    { id: 'points' as Tab, label: 'Punkte', icon: Coins },
    { id: 'modules' as Tab, label: 'Module', icon: Cpu },
    { id: 'schulungen' as Tab, label: 'Schulungen', icon: GraduationCap },
    { id: 'roadmap' as Tab, label: 'Roadmap', icon: Map },
    { id: 'team' as Tab, label: 'Teammitglieder', icon: UsersIcon },
    { id: 'messages' as Tab, label: 'Nachrichten', icon: MessageSquare },
  ]

  // Send message handler
  const handleSendMessage = async () => {
    if (!newMessageSubject.trim() || !newMessageContent.trim()) {
      return
    }

    setIsSendingMessage(true)
    try {
      await fetch(`/api/customers/${customerId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: newMessageSubject,
          content: newMessageContent,
          from: 'Admin',
          direction: 'outgoing',
        }),
      })
      setNewMessageSubject('')
      setNewMessageContent('')
      mutate() // Refresh customer data to show new message
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSendingMessage(false)
    }
  }

  // Book points handler
  const handleBookPoints = async () => {
    if (!bookPointsData.description || !bookPointsData.points || !bookPointsData.date || !bookPointsData.category) {
      return
    }

    setIsBookingPoints(true)
    try {
      await fetch(`/api/customers/${customerId}/points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: bookPointsData.description,
          points: parseFloat(bookPointsData.points),
          date: bookPointsData.date,
          category: bookPointsData.category,
          moduleId: bookPointsData.moduleId || null,
        }),
      })
      setBookPointsData({
        description: '',
        points: '',
        date: new Date().toISOString().split('T')[0],
        category: 'entwicklung',
        moduleId: '',
      })
      setShowBookPointsModal(false)
      mutate() // Refresh customer data
    } catch (error) {
      console.error('Error booking points:', error)
    } finally {
      setIsBookingPoints(false)
    }
  }

  // Edit transaction
  const handleEditTransaction = async () => {
    if (!editingTransaction) return

    setIsEditingTransaction(true)
    try {
      await fetch(`/api/customers/${customerId}/points/${editingTransaction.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: editingTransaction.description,
          points: parseFloat(editingTransaction.points),
          date: editingTransaction.date,
          category: editingTransaction.category,
          moduleId: editingTransaction.moduleId || null,
        }),
      })
      setEditingTransaction(null)
      mutate() // Refresh customer data
    } catch (error) {
      console.error('Error updating transaction:', error)
    } finally {
      setIsEditingTransaction(false)
    }
  }

  // Delete transaction
  const handleDeleteTransaction = async (transactionId: string) => {
    if (!confirm('Möchten Sie diese Punktebuchung wirklich löschen? Die Punkte werden dem Kunden gutgeschrieben.')) {
      return
    }

    setIsDeletingTransaction(transactionId)
    try {
      await fetch(`/api/customers/${customerId}/points/${transactionId}`, {
        method: 'DELETE',
      })
      mutate() // Refresh customer data
    } catch (error) {
      console.error('Error deleting transaction:', error)
    } finally {
      setIsDeletingTransaction(null)
    }
  }

  // Open edit modal for transaction
  const openEditTransactionModal = (t: any) => {
    setEditingTransaction({
      id: t.id,
      description: t.description,
      points: String(t.points),
      date: new Date(t.date).toISOString().split('T')[0],
      category: t.category,
      moduleId: t.moduleId || '',
    })
  }

  // Delete message
  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Möchten Sie diese Nachricht wirklich löschen?')) {
      return
    }

    setIsDeletingMessage(messageId)
    try {
      await fetch(`/api/customers/${customerId}/messages/${messageId}`, {
        method: 'DELETE',
      })
      mutate() // Refresh customer data
    } catch (error) {
      console.error('Error deleting message:', error)
    } finally {
      setIsDeletingMessage(null)
    }
  }

  // Select message and mark as read
  const handleSelectMessage = async (msg: AdminMessage) => {
    setSelectedMessageDetail(msg)

    // Only mark incoming unread messages as read
    if (msg.direction === 'incoming' && !msg.read) {
      try {
        await fetch(`/api/admin/messages/${msg.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ read: true }),
        })
        mutate() // Refresh customer data to update the message list
      } catch (error) {
        console.error('Error marking message as read:', error)
      }
    }
  }

  // Mark all incoming messages as read
  const handleMarkAllMessagesAsRead = async () => {
    const unreadIncomingMessages = messages.filter(
      (m) => m.direction === 'incoming' && !m.read
    )

    if (unreadIncomingMessages.length === 0) return

    try {
      await Promise.all(
        unreadIncomingMessages.map((msg) =>
          fetch(`/api/admin/messages/${msg.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ read: true }),
          })
        )
      )
      mutate() // Refresh customer data
    } catch (error) {
      console.error('Error marking all messages as read:', error)
    }
  }

  // Open new module modal with defaults
  const openNewModuleModal = () => {
    // Finde den passenden TeamMember basierend auf dem Advisor-Namen
    const advisorName = customer?.advisor?.name
    const defaultAssignee = (team || []).find((m: any) =>
      m.name.toLowerCase().includes(advisorName?.split(' ')[0]?.toLowerCase() || '')
    )

    setNewModuleData({
      name: '',
      description: '',
      status: 'geplant',
      monthlyMaintenancePoints: '',
      softwareUrl: '',
      assigneeId: defaultAssignee?.id || '',
      customerContactId: '',
    })
    setShowNewModuleModal(true)
  }

  // Create new module
  const handleCreateModule = async () => {
    if (!newModuleData.name.trim()) return

    setIsCreatingModule(true)
    try {
      // Finde den Kunden-Verantwortlichen Namen
      const customerContact = (customer?.teamMembers || []).find((m: any) => m.id === newModuleData.customerContactId)

      await fetch('/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newModuleData.name,
          description: newModuleData.description,
          status: newModuleData.status,
          monthlyMaintenancePoints: parseFloat(newModuleData.monthlyMaintenancePoints) || 0,
          softwareUrl: newModuleData.softwareUrl || null,
          assigneeId: newModuleData.assigneeId || null,
          customerContactId: newModuleData.customerContactId || null,
          customerContactName: customerContact?.name || null,
          customerId: customerId,
          showInRoadmap: true,
        }),
      })
      setNewModuleData({
        name: '',
        description: '',
        status: 'geplant',
        monthlyMaintenancePoints: '',
        softwareUrl: '',
        assigneeId: '',
        customerContactId: '',
      })
      setShowNewModuleModal(false)
      mutate() // Refresh customer data
    } catch (error) {
      console.error('Error creating module:', error)
    } finally {
      setIsCreatingModule(false)
    }
  }

  // Delete module
  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Möchten Sie dieses Modul wirklich löschen?')) {
      return
    }

    setIsDeletingModule(moduleId)
    try {
      await fetch(`/api/modules/${moduleId}`, {
        method: 'DELETE',
      })
      mutate() // Refresh customer data
    } catch (error) {
      console.error('Error deleting module:', error)
    } finally {
      setIsDeletingModule(null)
    }
  }

  // Helper functions for roadmap builder
  const getModuleById = (moduleId: string) => customerModules.find(m => m.id === moduleId)
  const getSchulungById = (schulungId: string) => schulungskatalog.find(s => s.id === schulungId)

  const moveRoadmapItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...roadmapItems]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newItems.length) return

    // Swap items
    const temp = newItems[index]
    newItems[index] = newItems[targetIndex]
    newItems[targetIndex] = temp

    // Update order numbers
    newItems.forEach((item, i) => {
      item.order = i + 1
    })

    setRoadmapItems(newItems)
  }

  const removeRoadmapItem = (itemId: string) => {
    const newItems = roadmapItems.filter(item => item.id !== itemId)
    newItems.forEach((item, i) => {
      item.order = i + 1
    })
    setRoadmapItems(newItems)
  }

  const addModuleToRoadmap = (moduleId: string) => {
    const newItem: CustomerRoadmapItem = {
      id: `cri-new-${Date.now()}`,
      type: 'modul',
      moduleId,
      order: roadmapItems.length + 1,
    }
    setRoadmapItems([...roadmapItems, newItem])
    setShowAddToRoadmapModal(false)
  }

  const addSchulungToRoadmap = (schulungId: string) => {
    const newItem: CustomerRoadmapItem = {
      id: `cri-new-${Date.now()}`,
      type: 'schulung',
      schulungId,
      order: roadmapItems.length + 1,
    }
    setRoadmapItems([...roadmapItems, newItem])
    setShowAddToRoadmapModal(false)
  }

  const updateRoadmapItemDate = (itemId: string, date: string) => {
    setRoadmapItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, targetDate: date } : item
      )
    )
  }

  // Add module from catalog to customer
  const addModuleFromCatalog = async (template: ModuleTemplate) => {
    setIsCreatingModule(true)
    try {
      await fetch('/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: template.name,
          description: template.description,
          status: 'geplant',
          priority: 'mittel',
          monthlyMaintenancePoints: template.estimatedMaintenancePoints,
          customerId: customerId,
          showInRoadmap: true,
        }),
      })
      setShowAddModuleFromCatalogModal(false)
      mutate() // Refresh customer data
    } catch (error) {
      console.error('Error creating module from catalog:', error)
    } finally {
      setIsCreatingModule(false)
    }
  }

  // Add schulung or serie to customer
  const addSchulungAssignment = (type: 'schulung' | 'serie', id: string) => {
    const newAssignment: CustomerSchulungAssignment = {
      id: `csa-new-${Date.now()}`,
      customerId,
      ...(type === 'schulung' ? { schulungId: id } : { serieId: id }),
      status: 'geplant',
      scheduledDate: new Date().toISOString().split('T')[0],
      ...(type === 'serie' ? { completedSchulungIds: [] } : {}),
    }
    setSchulungAssignments([...schulungAssignments, newAssignment])
    setShowAddSchulungModal(false)

    // If serie, add all schulungen to roadmap
    if (type === 'serie') {
      const serie = schulungSerien.find(s => s.id === id)
      if (serie) {
        const newRoadmapItems = serie.schulungIds.map((schulungId, index) => ({
          id: `cri-new-${Date.now()}-${index}`,
          type: 'schulung' as const,
          schulungId,
          order: roadmapItems.length + 1 + index,
        }))
        setRoadmapItems([...roadmapItems, ...newRoadmapItems])
      }
    } else {
      // Add single schulung to roadmap
      const roadmapItem: CustomerRoadmapItem = {
        id: `cri-new-${Date.now()}`,
        type: 'schulung',
        schulungId: id,
        order: roadmapItems.length + 1,
      }
      setRoadmapItems([...roadmapItems, roadmapItem])
    }
  }

  // Get serie progress
  const getSerieProgress = (assignment: CustomerSchulungAssignment) => {
    if (!assignment.serieId) return { completed: 0, total: 0 }
    const serie = schulungSerien.find(s => s.id === assignment.serieId)
    if (!serie) return { completed: 0, total: 0 }
    const completed = assignment.completedSchulungIds?.length || 0
    return { completed, total: serie.schulungIds.length }
  }

  // Calculate total maintenance points
  const totalMaintenancePoints = customerModules
    .filter(m => m.status === 'abgeschlossen')
    .reduce((sum, m) => sum + (m.monthlyMaintenancePoints || 0), 0)

  return (
    <div className="flex flex-col h-screen">
      <AdminHeader
        title={customer.companyName}
        subtitle={`${customer.name} • ${customer.email}`}
      />

      <div className="flex-1 overflow-auto">
        {/* Customer Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/customers"
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Zurück
              </Link>
              <div className="h-6 w-px bg-gray-200" />
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-lg font-medium text-gray-600">
                  {customer.companyName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-900">{customer.companyName}</h2>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${tierConfig[customer.membership.tier as keyof typeof tierConfig]?.color || 'bg-gray-100 text-gray-700'}`}
                    >
                      Paket {customer.membership.tier}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Kunden-PIN: <span className="font-mono font-medium">{customer.customerCode}</span>
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowCredentialsModal(true)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Key className="h-4 w-4" />
              Zugangsdaten
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 -mb-4 border-b border-transparent">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {tab.id === 'messages' && unreadMessagesCount > 0 && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Paket Info */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Paket-Details</h3>
                  <button
                    onClick={() => {
                      setEditPackageData({
                        tier: customer.membership.tier,
                        monthlyPoints: customer.membership.monthlyPoints,
                        monthlyPrice: customer.membership.monthlyPrice,
                        discountPercent: customer.membership.discountPercent || 0,
                        bonusPoints: customer.membership.bonusPoints || 0,
                        contractStart: customer.membership.contractStart?.split('T')[0] || '',
                        contractEnd: customer.membership.contractEnd?.split('T')[0] || '',
                      })
                      setShowEditPackageModal(true)
                    }}
                    className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                  >
                    <Pencil className="h-4 w-4" />
                    Bearbeiten
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Paket</span>
                    <span className="font-medium">{tierConfig[customer.membership.tier as keyof typeof tierConfig]?.label || customer.membership.tier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Monatliche Punkte</span>
                    <span className="font-medium">{customer.membership.monthlyPoints}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Monatlicher Beitrag</span>
                    <span className="font-medium">
                      {customer.membership.discountPercent > 0 ? (
                        <>
                          <span className="line-through text-gray-400 mr-2">
                            {customer.membership.monthlyPrice.toLocaleString('de-DE')} €
                          </span>
                          <span className="text-green-600">
                            {(customer.membership.monthlyPrice * (1 - customer.membership.discountPercent / 100)).toLocaleString('de-DE')} €
                          </span>
                        </>
                      ) : (
                        <>{customer.membership.monthlyPrice.toLocaleString('de-DE')} €</>
                      )}
                    </span>
                  </div>
                  {customer.membership.discountPercent > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Rabatt</span>
                      <span className="font-medium text-green-600">{customer.membership.discountPercent}%</span>
                    </div>
                  )}
                  {customer.membership.bonusPoints > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Bonus-Punkte</span>
                      <span className="font-medium text-green-600">+{customer.membership.bonusPoints}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Vertragsbeginn</span>
                    <span className="font-medium">
                      {new Date(customer.membership.contractStart).toLocaleDateString('de-DE')}
                    </span>
                  </div>
                  {customer.membership.contractEnd && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Vertragsende</span>
                      <span className="font-medium">
                        {new Date(customer.membership.contractEnd).toLocaleDateString('de-DE')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Abrechnungszeitraum</span>
                    <span className="font-medium">
                      {new Date(customer.membership.periodStart).toLocaleDateString('de-DE')} -{' '}
                      {new Date(customer.membership.periodEnd).toLocaleDateString('de-DE')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Punkte Status */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Punkte-Status</h3>
                  <button
                    onClick={() => setShowBookPointsModal(true)}
                    className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                  >
                    <Plus className="h-4 w-4" />
                    Buchen
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Verbraucht</span>
                      <span className="font-medium">
                        {customer.membership.usedPoints} / {customer.membership.monthlyPoints}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100">
                      <div
                        className="h-2 rounded-full bg-primary-500"
                        style={{
                          width: `${(customer.membership.usedPoints / customer.membership.monthlyPoints) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-500 mb-2">Verfügbar</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {customer.membership.remainingPoints}
                    </p>
                  </div>
                  {(customer.membership.carriedOverMonth1 || customer.membership.carriedOverMonth2 || customer.membership.carriedOverMonth3) && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-500 mb-2">Übertragene Punkte</p>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 rounded bg-red-50 text-red-600 text-xs">
                          {customer.membership.carriedOverMonth1 || 0} (verfällt)
                        </span>
                        <span className="px-2 py-1 rounded bg-yellow-50 text-yellow-600 text-xs">
                          {customer.membership.carriedOverMonth2 || 0}
                        </span>
                        <span className="px-2 py-1 rounded bg-green-50 text-green-600 text-xs">
                          {customer.membership.carriedOverMonth3 || 0}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Ansprechpartner */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Ansprechpartner (intern)</h3>
                <div className="space-y-4">
                  {customer.advisor ? (
                    <div className="p-3 bg-gray-50 rounded-lg space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                          <span className="text-sm font-medium text-primary-700">
                            {customer.advisor.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{customer.advisor.name || 'Nicht zugewiesen'}</p>
                          <p className="text-sm text-gray-500">{customer.advisor.role || '-'}</p>
                        </div>
                      </div>
                      {(customer.advisor.email || customer.advisor.phone) && (
                        <div className="pt-2 border-t border-gray-200 space-y-1">
                          {customer.advisor.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="h-3 w-3" />
                              <a href={`mailto:${customer.advisor.email}`} className="hover:text-primary-600">
                                {customer.advisor.email}
                              </a>
                            </div>
                          )}
                          {customer.advisor.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="h-3 w-3" />
                              <a href={`tel:${customer.advisor.phone}`} className="hover:text-primary-600">
                                {customer.advisor.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-sm text-yellow-700">Kein Ansprechpartner zugewiesen</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ansprechpartner ändern
                    </label>
                    <select
                      value={customer.advisor?.id || ''}
                      onChange={async (e) => {
                        const newAdvisorId = e.target.value
                        if (newAdvisorId && newAdvisorId !== customer.advisor?.id) {
                          try {
                            await updateCustomer(customerId, { advisorId: newAdvisorId })
                            mutate() // Refresh customer data
                          } catch (error) {
                            console.error('Error updating advisor:', error)
                          }
                        }
                      }}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="">-- Auswählen --</option>
                      {advisors.map((advisor: any) => (
                        <option key={advisor.id} value={advisor.id}>
                          {advisor.name} - {advisor.role}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Schnellaktionen - moved to full width below */}
            </div>

            {/* Quick Actions - Full Width */}
            <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Schnellaktionen</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowBookPointsModal(true)}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                >
                  <Coins className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-700">Punkte buchen</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('modules')
                    openNewModuleModal()
                  }}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                >
                  <Cpu className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-700">Neues Modul</span>
                </button>
                <button
                  onClick={() => setActiveTab('messages')}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                >
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-700">Nachricht senden</span>
                </button>
              </div>
            </div>

            {/* Recent Transactions & Active Projects */}
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {/* Recent Transactions */}
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                  <h3 className="font-semibold text-gray-900">Letzte Buchungen</h3>
                  <button
                    onClick={() => setActiveTab('points')}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    Alle anzeigen
                  </button>
                </div>
                <div className="divide-y divide-gray-100">
                  {transactions.slice(0, 5).map((t: { id: string; description: string; date: string; points: number; category: string }) => (
                    <div key={t.id} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{t.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(t.date).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryConfig[t.category]?.color || 'bg-gray-100 text-gray-700'}`}
                        >
                          {categoryConfig[t.category]?.label || t.category}
                        </span>
                        <span className="font-medium text-gray-900">{t.points} P</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Modules */}
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                  <h3 className="font-semibold text-gray-900">Aktive Module</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {customerModules
                    .filter((m) => m.status === 'in_arbeit' || m.status === 'im_test')
                    .slice(0, 3)
                    .map((module) => (
                      <div key={module.id} className="px-5 py-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-gray-900">{module.name}</p>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[module.status].color}`}
                          >
                            {statusConfig[module.status].label}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{module.progress}% abgeschlossen</span>
                          {module.acceptanceStatus === 'ausstehend' && (
                            <span className="flex items-center gap-1 text-yellow-600">
                              <AlertCircle className="h-3 w-3" />
                              Akzeptanz ausstehend
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  {customerModules.filter((m) => m.status === 'in_arbeit' || m.status === 'im_test')
                    .length === 0 && (
                    <div className="px-5 py-8 text-center text-gray-500">Keine aktiven Module</div>
                  )}
                </div>
              </div>
            </div>
            </>
          )}

          {/* Points Tab */}
          {activeTab === 'points' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Punktebuchungen</h3>
                <button
                  onClick={() => setShowBookPointsModal(true)}
                  className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Punkte buchen
                </button>
              </div>

              <div className="bg-white rounded-xl border border-gray-200">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Datum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Beschreibung
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Kategorie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Modul
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Punkte
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Aktionen
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((t: { id: string; description: string; date: string; points: number; category: string; moduleId?: string }) => {
                      const relatedModule = customerModules.find((m) => m.id === t.moduleId)
                      return (
                        <tr key={t.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(t.date).toLocaleDateString('de-DE')}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {t.description}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryConfig[t.category]?.color || 'bg-gray-100 text-gray-700'}`}
                            >
                              {categoryConfig[t.category]?.label || t.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {relatedModule?.name || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                            {t.points}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => openEditTransactionModal(t)}
                                className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                title="Bearbeiten"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTransaction(t.id)}
                                disabled={isDeletingTransaction === t.id}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Löschen"
                              >
                                {isDeletingTransaction === t.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Modules Tab */}
          {activeTab === 'modules' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-semibold text-gray-900">Module</h3>
                  {/* View Mode Toggle */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setModuleViewMode('overview')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        moduleViewMode === 'overview'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <LayoutGrid className="h-4 w-4" />
                      Übersicht
                    </button>
                    <button
                      onClick={() => setModuleViewMode('kanban')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        moduleViewMode === 'kanban'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Kanban className="h-4 w-4" />
                      Kanban
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddModuleFromCatalogModal(true)}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Aus Katalog
                  </button>
                  <button
                    onClick={openNewModuleModal}
                    className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Individuelles Modul
                  </button>
                </div>
              </div>

              {customerModules.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <Cpu className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Noch keine Module angelegt</p>
                  <button
                    onClick={() => setShowAddModuleFromCatalogModal(true)}
                    className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Modul aus Katalog hinzufügen
                  </button>
                </div>
              ) : moduleViewMode === 'overview' ? (
                /* Overview Mode - Like Customer Dashboard */
                <div className="space-y-6">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <p className="text-sm text-gray-500">Gesamt</p>
                      <p className="text-2xl font-bold text-gray-900">{customerModules.length}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <p className="text-sm text-gray-500">Live</p>
                      <p className="text-2xl font-bold text-green-600">
                        {customerModules.filter(m => m.status === 'abgeschlossen').length}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <p className="text-sm text-gray-500">In Arbeit</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {customerModules.filter(m => m.status === 'in_arbeit' || m.status === 'im_test').length}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <p className="text-sm text-gray-500">Wartung/Monat</p>
                      <p className="text-2xl font-bold text-gray-900">{totalMaintenancePoints} P</p>
                    </div>
                  </div>

                  {/* Module Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {customerModules.map((module) => {
                      const assignee = (customer?.teamMembers || []).find((m: any) => m.id === module.assigneeId)
                      return (
                        <div
                          key={module.id}
                          className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer relative group"
                          onClick={() => {
                            setSelectedModule(module)
                            setEditingCriteria(module.acceptanceCriteria || [])
                            setShowModuleDetailModal(true)
                          }}
                        >
                          {/* Delete Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteModule(module.id)
                            }}
                            disabled={isDeletingModule === module.id}
                            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all disabled:opacity-50"
                            title="Modul löschen"
                          >
                            {isDeletingModule === module.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>

                          <div className="flex items-start justify-between mb-3 pr-8">
                            <h4 className="font-semibold text-gray-900">{module.name}</h4>
                            {(() => {
                              const displayStatus = getModuleDisplayStatus(module)
                              return (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${displayStatus.color}`}>
                                  {displayStatus.label}
                                </span>
                              )
                            })()}
                          </div>
                          <p className="text-sm text-gray-500 mb-4 line-clamp-2">{module.description}</p>

                          {/* Progress */}
                          {module.status !== 'abgeschlossen' && (
                            <div className="mb-4">
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
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
                          )}

                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Wartung/Monat</span>
                              <span className="font-medium">{module.monthlyMaintenancePoints} Punkte</span>
                            </div>
                            {assignee && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">Verantwortlich</span>
                                <span className="font-medium">{assignee.name}</span>
                              </div>
                            )}
                            {module.softwareUrl && (
                              <div className="pt-2 border-t border-gray-100">
                                <a
                                  href={module.softwareUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Software öffnen
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                /* Kanban Mode */
                <KanbanBoard
                  items={customerModules}
                  teamMembers={customer?.teamMembers || []}
                  showMaintenancePoints={true}
                  onStatusChange={async (itemId, newStatus) => {
                    const moduleToUpdate = customerModules.find(m => m.id === itemId)

                    // If moving to "abgeschlossen", automatically set progress to 100% and request Abnahme
                    const updateData: { status: ModuleStatus; progress?: number; abnahmeStatus?: string } = { status: newStatus }
                    if (newStatus === 'abgeschlossen') {
                      updateData.progress = 100
                      updateData.abnahmeStatus = 'ausstehend'
                    }

                    // Update local state immediately
                    setCustomerModules(prev =>
                      prev.map(m => m.id === itemId ? {
                        ...m,
                        status: newStatus,
                        ...(newStatus === 'abgeschlossen' ? { progress: 100, abnahmeStatus: 'ausstehend' as const } : {})
                      } : m)
                    )
                    // Persist to API
                    try {
                      await fetch(`/api/modules/${itemId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updateData),
                      })

                      // If moving to "abgeschlossen", send Abnahme notification to customer
                      if (newStatus === 'abgeschlossen' && customer?.id && moduleToUpdate) {
                        await fetch(`/api/customers/${customer.id}/notifications`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            type: 'acceptance_required',
                            title: 'Modul-Abnahme erforderlich',
                            message: `Das Modul "${moduleToUpdate.name}" ist fertiggestellt und bereit zur Abnahme. Bitte bestätigen Sie die Abnahme, damit die Wartung aktiviert werden kann.`,
                            actionRequired: true,
                            relatedProjectId: itemId,
                            relatedUrl: `/roadmap/${itemId}`,
                          }),
                        })
                      }

                      mutate()
                    } catch (error) {
                      console.error('Error updating module status:', error)
                    }
                  }}
                  onAssigneeChange={async (itemId, assigneeId) => {
                    // Update local state immediately
                    setCustomerModules(prev =>
                      prev.map(m => m.id === itemId ? { ...m, assigneeId: assigneeId || undefined } : m)
                    )
                    // Persist to API
                    try {
                      await fetch(`/api/modules/${itemId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ assigneeId: assigneeId || null }),
                      })
                      mutate()
                    } catch (error) {
                      console.error('Error updating module assignee:', error)
                    }
                  }}
                  onItemClick={(item) => {
                    setSelectedModule(item)
                    setEditingCriteria(item.acceptanceCriteria || [])
                    setShowModuleDetailModal(true)
                  }}
                  onDeleteItem={handleDeleteModule}
                />
              )}
            </div>
          )}

          {/* Schulungen Tab */}
          {activeTab === 'schulungen' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Schulungen & Serien</h3>
                  <p className="text-sm text-gray-500">
                    Verwalten Sie die Schulungen und Schulungsserien für diesen Kunden
                  </p>
                </div>
                <button
                  onClick={() => setShowAddSchulungModal(true)}
                  className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Schulung hinzufügen
                </button>
              </div>

              {schulungAssignments.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Noch keine Schulungen zugewiesen</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Weisen Sie Einzelschulungen oder ganze Serien zu
                  </p>
                  <button
                    onClick={() => setShowAddSchulungModal(true)}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Erste Schulung hinzufügen
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Series Section */}
                  {schulungAssignments.filter(a => a.serieId).length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200">
                      <div className="border-b border-gray-200 px-5 py-4">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <Layers className="h-5 w-5 text-purple-500" />
                          Schulungsserien
                        </h4>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {schulungAssignments
                          .filter(a => a.serieId)
                          .map((assignment) => {
                            const serie = schulungSerien.find(s => s.id === assignment.serieId)
                            if (!serie) return null
                            const progress = getSerieProgress(assignment)
                            const progressPercent = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0

                            return (
                              <div key={assignment.id} className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h5 className="font-medium text-gray-900">{serie.title}</h5>
                                    <p className="text-sm text-gray-500">{serie.description}</p>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    assignment.status === 'abgeschlossen'
                                      ? 'bg-green-100 text-green-700'
                                      : assignment.status === 'in_durchfuehrung'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {assignment.status === 'abgeschlossen' ? 'Abgeschlossen' :
                                     assignment.status === 'in_durchfuehrung' ? 'In Durchführung' : 'Geplant'}
                                  </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-4">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-500">Fortschritt</span>
                                    <span className="font-medium text-gray-700">
                                      {progress.completed} / {progress.total} Schulungen
                                    </span>
                                  </div>
                                  <div className="h-2 w-full rounded-full bg-gray-100">
                                    <div
                                      className="h-2 rounded-full bg-purple-500 transition-all"
                                      style={{ width: `${progressPercent}%` }}
                                    />
                                  </div>
                                </div>

                                {/* Individual Schulungen in Series */}
                                <div className="space-y-2">
                                  {serie.schulungIds.map((schulungId, index) => {
                                    const schulung = schulungskatalog.find(s => s.id === schulungId)
                                    const isCompleted = assignment.completedSchulungIds?.includes(schulungId)
                                    if (!schulung) return null

                                    return (
                                      <div
                                        key={schulungId}
                                        className={`flex items-center gap-3 p-3 rounded-lg ${
                                          isCompleted ? 'bg-green-50' : 'bg-gray-50'
                                        }`}
                                      >
                                        <div className="flex items-center justify-center h-6 w-6 rounded-full border-2 text-xs font-medium
                                          ${isCompleted ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300 text-gray-500'}
                                        ">
                                          {isCompleted ? (
                                            <Check className="h-4 w-4" />
                                          ) : (
                                            index + 1
                                          )}
                                        </div>
                                        <div className="flex-1">
                                          <p className={`text-sm font-medium ${isCompleted ? 'text-green-700' : 'text-gray-700'}`}>
                                            {schulung.title}
                                          </p>
                                          <p className="text-xs text-gray-500">{schulung.duration} • {schulung.points} Punkte</p>
                                        </div>
                                        {!isCompleted && (
                                          <button
                                            onClick={() => {
                                              setSchulungAssignments(prev =>
                                                prev.map(a =>
                                                  a.id === assignment.id
                                                    ? {
                                                        ...a,
                                                        completedSchulungIds: [...(a.completedSchulungIds || []), schulungId],
                                                        status: (a.completedSchulungIds?.length || 0) + 1 >= serie.schulungIds.length
                                                          ? 'abgeschlossen'
                                                          : 'in_durchfuehrung',
                                                      }
                                                    : a
                                                )
                                              )
                                            }}
                                            className="px-3 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 rounded transition-colors"
                                          >
                                            Abschließen
                                          </button>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>

                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 text-sm">
                                  <span className="text-gray-500">Gesamtpunkte: {serie.totalPoints}</span>
                                  {assignment.scheduledDate && (
                                    <span className="text-gray-500">
                                      Geplant: {new Date(assignment.scheduledDate).toLocaleDateString('de-DE')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  )}

                  {/* Individual Schulungen Section */}
                  {schulungAssignments.filter(a => a.schulungId).length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200">
                      <div className="border-b border-gray-200 px-5 py-4">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <GraduationCap className="h-5 w-5 text-yellow-500" />
                          Einzelschulungen
                        </h4>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {schulungAssignments
                          .filter(a => a.schulungId)
                          .map((assignment) => {
                            const schulung = schulungskatalog.find(s => s.id === assignment.schulungId)
                            if (!schulung) return null

                            return (
                              <div key={assignment.id} className="flex items-center justify-between p-5">
                                <div className="flex items-center gap-4">
                                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                    assignment.status === 'abgeschlossen'
                                      ? 'bg-green-100'
                                      : 'bg-yellow-100'
                                  }`}>
                                    {assignment.status === 'abgeschlossen' ? (
                                      <Check className="h-5 w-5 text-green-600" />
                                    ) : (
                                      <GraduationCap className="h-5 w-5 text-yellow-600" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{schulung.title}</p>
                                    <p className="text-sm text-gray-500">
                                      {schulung.duration} • {schulung.points} Punkte
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    schulung.category === 'grundlagen'
                                      ? 'bg-green-100 text-green-700'
                                      : schulung.category === 'fortgeschritten'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-purple-100 text-purple-700'
                                  }`}>
                                    {schulung.category}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    assignment.status === 'abgeschlossen'
                                      ? 'bg-green-100 text-green-700'
                                      : assignment.status === 'in_durchfuehrung'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {assignment.status === 'abgeschlossen' ? 'Abgeschlossen' :
                                     assignment.status === 'in_durchfuehrung' ? 'In Durchführung' : 'Geplant'}
                                  </span>
                                  {assignment.status !== 'abgeschlossen' && (
                                    <button
                                      onClick={() => {
                                        setSchulungAssignments(prev =>
                                          prev.map(a =>
                                            a.id === assignment.id
                                              ? { ...a, status: 'abgeschlossen', completedDate: new Date().toISOString().split('T')[0] }
                                              : a
                                          )
                                        )
                                      }}
                                      className="px-3 py-1 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded transition-colors"
                                    >
                                      Abschließen
                                    </button>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Roadmap Builder Tab */}
          {activeTab === 'roadmap' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Kunden-Roadmap</h3>
                  <p className="text-sm text-gray-500">
                    Definieren Sie die Roadmap, die der Kunde in seinem Dashboard sieht
                  </p>
                </div>
                <button
                  onClick={() => setShowAddToRoadmapModal(true)}
                  className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Element hinzufügen
                </button>
              </div>

              {/* Roadmap Items List */}
              <div className="bg-white rounded-xl border border-gray-200">
                {roadmapItems.length === 0 ? (
                  <div className="p-12 text-center">
                    <Map className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">Noch keine Roadmap-Elemente definiert</p>
                    <p className="text-sm text-gray-400">
                      Fügen Sie Module oder Schulungen hinzu, um die Kunden-Roadmap zu gestalten
                    </p>
                    <button
                      onClick={() => setShowAddToRoadmapModal(true)}
                      className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Erstes Element hinzufügen
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {roadmapItems.sort((a, b) => a.order - b.order).map((item, index) => {
                      const roadmapModule = item.type === 'modul' && item.moduleId ? getModuleById(item.moduleId) : null
                      const schulung = item.type === 'schulung' && item.schulungId ? getSchulungById(item.schulungId) : null

                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                        >
                          {/* Order Number & Move Buttons */}
                          <div className="flex flex-col items-center gap-1">
                            <button
                              onClick={() => moveRoadmapItem(index, 'up')}
                              disabled={index === 0}
                              className={`p-1 rounded ${index === 0 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </button>
                            <span className="text-sm font-medium text-gray-400 w-6 text-center">
                              {index + 1}
                            </span>
                            <button
                              onClick={() => moveRoadmapItem(index, 'down')}
                              disabled={index === roadmapItems.length - 1}
                              className={`p-1 rounded ${index === roadmapItems.length - 1 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Type Icon */}
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.type === 'modul' ? 'bg-blue-100' : 'bg-yellow-100'}`}>
                            {item.type === 'modul' ? (
                              <Cpu className="h-5 w-5 text-blue-600" />
                            ) : (
                              <GraduationCap className="h-5 w-5 text-yellow-600" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">
                                {item.type === 'modul' && roadmapModule ? roadmapModule.name : ''}
                                {item.type === 'schulung' && schulung ? schulung.title : ''}
                                {item.customTitle || ''}
                              </p>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.type === 'modul' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {item.type === 'modul' ? 'Modul' : 'Schulung'}
                              </span>
                              {item.type === 'modul' && roadmapModule && (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[roadmapModule.status].color}`}>
                                  {statusConfig[roadmapModule.status].label}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 truncate">
                              {item.type === 'modul' && roadmapModule ? roadmapModule.description : ''}
                              {item.type === 'schulung' && schulung ? `${schulung.description} (${schulung.duration}, ${schulung.points} Punkte)` : ''}
                            </p>
                          </div>

                          {/* Target Date */}
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <input
                              type="date"
                              value={item.targetDate || ''}
                              onChange={(e) => updateRoadmapItemDate(item.id, e.target.value)}
                              className="rounded border border-gray-200 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            />
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={() => removeRoadmapItem(item.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Save Button */}
              {roadmapItems.length > 0 && (
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      // In production: API call to save roadmap
                      console.log('Saving roadmap:', roadmapItems)
                      alert('Roadmap wurde gespeichert!')
                    }}
                    className="flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
                  >
                    Roadmap speichern
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Team Tab */}
          {activeTab === 'team' && (
            <TeamTab
              customerId={customerId}
              teamMembers={customer.teamMembers || []}
              modules={customer.modules || []}
              onUpdate={() => mutate()}
            />
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="relative h-[calc(100vh-280px)] min-h-[400px]">
              {/* Nachrichten Split-View */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-full">
                <div className="flex h-full">
                  {/* Message List (Left Side) */}
                  <div className="w-80 border-r border-gray-200 flex flex-col">
                    {/* Filter Tabs */}
                    <div className="flex border-b border-gray-200 flex-shrink-0">
                      <button
                        onClick={() => setMessageFilter('all')}
                        className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium transition-colors ${
                          messageFilter === 'all'
                            ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Alle ({messages.length})
                      </button>
                      <button
                        onClick={() => setMessageFilter('incoming')}
                        className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium transition-colors ${
                          messageFilter === 'incoming'
                            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Mail className="h-3 w-3" />
                        Eingehend
                      </button>
                      <button
                        onClick={() => setMessageFilter('outgoing')}
                        className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium transition-colors ${
                          messageFilter === 'outgoing'
                            ? 'text-green-600 border-b-2 border-green-600 bg-green-50/50'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <MessageSquare className="h-3 w-3" />
                        Gesendet
                      </button>
                    </div>

                    {/* Mark all as read button */}
                    {allUnreadIncomingCount > 0 && (
                      <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 flex-shrink-0">
                        <button
                          onClick={handleMarkAllMessagesAsRead}
                          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Alle als gelesen markieren ({allUnreadIncomingCount})
                        </button>
                      </div>
                    )}

                    {/* Message List */}
                    <div className="flex-1 overflow-auto">
                      {(() => {
                        const filteredMessages = messages.filter((m) => {
                          if (messageFilter === 'all') return true
                          return m.direction === messageFilter
                        })

                        if (filteredMessages.length === 0) {
                          return (
                            <div className="px-4 py-8 text-center">
                              <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                              <p className="text-sm text-gray-500">
                                {messageFilter === 'incoming'
                                  ? 'Keine eingehenden Nachrichten'
                                  : messageFilter === 'outgoing'
                                  ? 'Keine gesendeten Nachrichten'
                                  : 'Noch keine Nachrichten'}
                              </p>
                            </div>
                          )
                        }

                        return (
                          <div className="divide-y divide-gray-100">
                            {filteredMessages.map((msg) => {
                              const isIncoming = msg.direction === 'incoming'
                              return (
                                <div
                                  key={msg.id}
                                  onClick={() => handleSelectMessage(msg)}
                                  className={`px-3 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors ${
                                    selectedMessageDetail?.id === msg.id ? 'bg-primary-50 border-l-2 border-primary-600' : ''
                                  } ${isIncoming && !msg.read ? 'bg-blue-50/50' : ''}`}
                                >
                                  <div className="flex items-start gap-2">
                                    <div className={`shrink-0 rounded-lg p-1.5 mt-0.5 ${
                                      isIncoming
                                        ? (msg.read ? 'bg-blue-50' : 'bg-blue-100')
                                        : 'bg-green-50'
                                    }`}>
                                      {isIncoming ? (
                                        <Mail className={`h-3.5 w-3.5 ${msg.read ? 'text-blue-400' : 'text-blue-600'}`} />
                                      ) : (
                                        <MessageSquare className="h-3.5 w-3.5 text-green-600" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5 mb-0.5">
                                        {isIncoming && !msg.read && (
                                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                        )}
                                        <p className={`truncate text-sm ${
                                          isIncoming && !msg.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                                        }`}>
                                          {msg.subject}
                                        </p>
                                      </div>
                                      <p className="text-xs text-gray-500 truncate">{msg.content.substring(0, 50)}...</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-gray-400">
                                          {new Date(msg.sentAt).toLocaleDateString('de-DE', {
                                            day: '2-digit',
                                            month: '2-digit',
                                          })}
                                        </span>
                                        {!isIncoming && (
                                          <span className={`text-xs ${msg.customerRead ? 'text-green-600' : 'text-gray-400'}`}>
                                            {msg.customerRead ? '✓ Gelesen' : '○ Ungelesen'}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )
                      })()}
                    </div>
                  </div>

                  {/* Message Detail (Right Side) */}
                  <div className="flex-1 bg-gray-50 overflow-auto">
                    {selectedMessageDetail ? (
                      <div className="h-full flex flex-col">
                        {/* Message Header */}
                        <div className="border-b border-gray-200 px-5 py-3 bg-white flex-shrink-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              selectedMessageDetail.direction === 'incoming'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {selectedMessageDetail.direction === 'incoming' ? 'Eingehend' : 'Gesendet'}
                            </span>
                            {selectedMessageDetail.direction === 'outgoing' && (
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                selectedMessageDetail.customerRead
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {selectedMessageDetail.customerRead ? 'Vom Kunden gelesen' : 'Noch nicht gelesen'}
                              </span>
                            )}
                          </div>
                          <h2 className="text-lg font-semibold text-gray-900 mb-2">
                            {selectedMessageDetail.subject}
                          </h2>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`flex h-8 w-8 items-center justify-center rounded-full font-medium text-sm ${
                                selectedMessageDetail.direction === 'incoming'
                                  ? 'bg-blue-100 text-blue-600'
                                  : 'bg-green-100 text-green-600'
                              }`}>
                                {selectedMessageDetail.direction === 'incoming'
                                  ? selectedMessageDetail.sentBy.charAt(0).toUpperCase()
                                  : 'A'}
                              </div>
                              <div>
                                {selectedMessageDetail.direction === 'incoming' ? (
                                  <p className="text-sm font-medium text-gray-900">{selectedMessageDetail.sentBy}</p>
                                ) : (
                                  <p className="text-sm font-medium text-gray-900">An: {customer?.companyName}</p>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">
                              {new Date(selectedMessageDetail.sentAt).toLocaleString('de-DE', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Message Body */}
                        <div className="flex-1 px-5 py-4 overflow-auto bg-white">
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                            {selectedMessageDetail.content}
                          </p>
                        </div>

                        {/* Message Actions */}
                        <div className="border-t border-gray-200 px-5 py-3 bg-white flex justify-end flex-shrink-0">
                          <button
                            onClick={() => {
                              handleDeleteMessage(selectedMessageDetail.id)
                              setSelectedMessageDetail(null)
                            }}
                            disabled={isDeletingMessage === selectedMessageDetail.id}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            {isDeletingMessage === selectedMessageDetail.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            Löschen
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <MessageSquare className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">Wählen Sie eine Nachricht aus</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Floating Action Button */}
              <button
                onClick={() => setShowMessageComposeModal(true)}
                className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 transition-colors z-40"
                title="Neue Nachricht"
              >
                <Pencil className="h-6 w-6" />
              </button>

              {/* Compose Message Modal */}
              {showMessageComposeModal && (
                <div className="fixed inset-0 z-50 flex items-end justify-end p-6 pointer-events-none">
                  <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-200 pointer-events-auto">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 bg-gray-100 rounded-t-xl">
                      <h3 className="font-semibold text-gray-900">Nachricht an {customer?.companyName}</h3>
                      <button
                        onClick={() => {
                          setShowMessageComposeModal(false)
                          setNewMessageSubject('')
                          setNewMessageContent('')
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Modal Body */}
                    <div className="p-4 space-y-4">
                      {/* Subject */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Betreff</label>
                        <input
                          type="text"
                          value={newMessageSubject}
                          onChange={(e) => setNewMessageSubject(e.target.value)}
                          placeholder="Betreff der Nachricht"
                          className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>

                      {/* Content */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nachricht</label>
                        <textarea
                          rows={6}
                          value={newMessageContent}
                          onChange={(e) => setNewMessageContent(e.target.value)}
                          placeholder="Ihre Nachricht..."
                          className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none"
                        />
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-4 py-3">
                      <button
                        onClick={() => {
                          setShowMessageComposeModal(false)
                          setNewMessageSubject('')
                          setNewMessageContent('')
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Abbrechen
                      </button>
                      <button
                        onClick={() => {
                          handleSendMessage()
                          setShowMessageComposeModal(false)
                        }}
                        disabled={isSendingMessage || !newMessageSubject.trim() || !newMessageContent.trim()}
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
                            Senden
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Book Points Modal */}
      {showBookPointsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Punkte buchen</h2>
              <button
                onClick={() => setShowBookPointsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung *</label>
                <input
                  type="text"
                  value={bookPointsData.description}
                  onChange={(e) => setBookPointsData({ ...bookPointsData, description: e.target.value })}
                  placeholder="Was wurde gemacht?"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Punkte *</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={bookPointsData.points}
                    onChange={(e) => setBookPointsData({ ...bookPointsData, points: e.target.value })}
                    placeholder="10"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Datum *</label>
                  <input
                    type="date"
                    value={bookPointsData.date}
                    onChange={(e) => setBookPointsData({ ...bookPointsData, date: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie *</label>
                <select
                  value={bookPointsData.category}
                  onChange={(e) => setBookPointsData({ ...bookPointsData, category: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="entwicklung">Entwicklung</option>
                  <option value="wartung">Wartung</option>
                  <option value="schulung">Schulung</option>
                  <option value="beratung">Beratung</option>
                  <option value="analyse">Analyse & PM</option>
                  <option value="kommunikation">Kommunikation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modul (optional)
                </label>
                <select
                  value={bookPointsData.moduleId}
                  onChange={(e) => setBookPointsData({ ...bookPointsData, moduleId: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Kein Modul</option>
                  {customerModules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setShowBookPointsModal(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleBookPoints}
                disabled={isBookingPoints || !bookPointsData.description || !bookPointsData.points}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isBookingPoints ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Buchen...
                  </>
                ) : (
                  'Buchen'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Punktebuchung bearbeiten</h2>
              <button
                onClick={() => setEditingTransaction(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-xl">&times;</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung *</label>
                <input
                  type="text"
                  value={editingTransaction.description}
                  onChange={(e) => setEditingTransaction({ ...editingTransaction, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="z.B. Entwicklung KI-Modul"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Punkte *</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={editingTransaction.points}
                    onChange={(e) => setEditingTransaction({ ...editingTransaction, points: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Datum *</label>
                  <input
                    type="date"
                    value={editingTransaction.date}
                    onChange={(e) => setEditingTransaction({ ...editingTransaction, date: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie *</label>
                <select
                  value={editingTransaction.category}
                  onChange={(e) => setEditingTransaction({ ...editingTransaction, category: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="entwicklung">Entwicklung</option>
                  <option value="wartung">Wartung</option>
                  <option value="schulung">Schulung</option>
                  <option value="beratung">Beratung</option>
                  <option value="analyse">Analyse & PM</option>
                  <option value="kommunikation">Kommunikation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modul (optional)
                </label>
                <select
                  value={editingTransaction.moduleId}
                  onChange={(e) => setEditingTransaction({ ...editingTransaction, moduleId: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Kein Modul</option>
                  {customerModules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setEditingTransaction(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleEditTransaction}
                disabled={isEditingTransaction || !editingTransaction.description || !editingTransaction.points}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isEditingTransaction ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Speichern...
                  </>
                ) : (
                  'Speichern'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Module Modal */}
      {showNewModuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Neues Modul</h2>
              <button
                onClick={() => setShowNewModuleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  placeholder="Modulname"
                  value={newModuleData.name}
                  onChange={(e) => setNewModuleData({ ...newModuleData, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                <textarea
                  rows={3}
                  placeholder="Was macht dieses Modul?"
                  value={newModuleData.description}
                  onChange={(e) => setNewModuleData({ ...newModuleData, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={newModuleData.status}
                    onChange={(e) => setNewModuleData({ ...newModuleData, status: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="geplant">Geplant</option>
                    <option value="in_arbeit">In Arbeit</option>
                    <option value="im_test">Im Test</option>
                    <option value="abgeschlossen">Live</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wartung/Monat
                  </label>
                  <input
                    type="number"
                    placeholder="10"
                    value={newModuleData.monthlyMaintenancePoints}
                    onChange={(e) => setNewModuleData({ ...newModuleData, monthlyMaintenancePoints: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Software-URL (optional)
                </label>
                <input
                  type="url"
                  placeholder="https://"
                  value={newModuleData.softwareUrl}
                  onChange={(e) => setNewModuleData({ ...newModuleData, softwareUrl: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              {/* Interner Verantwortlicher */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interner Verantwortlicher
                </label>
                <select
                  value={newModuleData.assigneeId}
                  onChange={(e) => setNewModuleData({ ...newModuleData, assigneeId: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Nicht zugewiesen</option>
                  {(team || []).map((member: { id: string; name: string; role?: string }) => (
                    <option key={member.id} value={member.id}>
                      {member.name} - {member.role || 'Team'}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Standard: Ansprechpartner des Kunden ({customer?.advisor?.name || 'N/A'})
                </p>
              </div>

              {/* Kunden-Verantwortlicher */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verantwortlicher (Kundenseite)
                </label>
                <select
                  value={newModuleData.customerContactId}
                  onChange={(e) => setNewModuleData({ ...newModuleData, customerContactId: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Nicht zugewiesen</option>
                  {(customer?.teamMembers || []).map((member: any) => (
                    <option key={member.id} value={member.id}>
                      {member.name} - {member.role}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Der Kunde kann dies im Portal selbst ändern
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setShowNewModuleModal(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleCreateModule}
                disabled={isCreatingModule || !newModuleData.name.trim()}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCreatingModule ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Anlegen...
                  </>
                ) : (
                  'Modul anlegen'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credentials Modal */}
      {showCredentialsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Zugangsdaten</h2>
              <button
                onClick={() => {
                  setShowCredentialsModal(false)
                  setGeneratedCredential(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">E-Mail</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{customer.email}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(customer.email)}
                      className="text-gray-400 hover:text-gray-600"
                      title="Kopieren"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Key className="h-4 w-4" />
                    <span className="text-sm">Kunden-PIN</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold">{customer.customerCode}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(customer.customerCode || '')}
                      className="text-gray-400 hover:text-gray-600"
                      title="Kopieren"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Key className="h-4 w-4" />
                    <span className="text-sm">Passwort</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{customer.password || '(nicht gesetzt)'}</span>
                    {customer.password && (
                      <button
                        onClick={() => navigator.clipboard.writeText(customer.password!)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Kopieren"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Generated Credential Display */}
              {generatedCredential && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800 mb-2">
                    {generatedCredential.type === 'password' ? 'Neues Passwort generiert:' : 'Neuer PIN generiert:'}
                  </p>
                  <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-green-200">
                    <span className="font-mono text-lg font-bold text-green-700">{generatedCredential.value}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(generatedCredential.value)}
                      className="text-green-600 hover:text-green-700"
                      title="Kopieren"
                    >
                      <Copy className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="text-xs text-green-600 mt-2">
                    Bitte notieren Sie sich diese Daten - sie werden nur einmal angezeigt!
                  </p>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-500 mb-3">Neue Zugangsdaten generieren</p>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      setIsGeneratingCredentials(true)
                      try {
                        const res = await fetch(`/api/customers/${customerId}/credentials`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ type: 'password' }),
                        })
                        const data = await res.json()
                        if (data.success) {
                          setGeneratedCredential({ type: 'password', value: data.value })
                          mutate() // Refresh customer data to show new password
                        }
                      } catch (error) {
                        console.error('Error generating password:', error)
                      } finally {
                        setIsGeneratingCredentials(false)
                      }
                    }}
                    disabled={isGeneratingCredentials}
                    className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isGeneratingCredentials ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Neues Passwort
                  </button>
                  <button
                    onClick={async () => {
                      setIsGeneratingCredentials(true)
                      try {
                        const res = await fetch(`/api/customers/${customerId}/credentials`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ type: 'pin' }),
                        })
                        const data = await res.json()
                        if (data.success) {
                          setGeneratedCredential({ type: 'pin', value: data.value })
                          mutate() // Refresh customer data to show new PIN
                        }
                      } catch (error) {
                        console.error('Error generating PIN:', error)
                      } finally {
                        setIsGeneratingCredentials(false)
                      }
                    }}
                    disabled={isGeneratingCredentials}
                    className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isGeneratingCredentials ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Neuer PIN
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => {
                  setShowCredentialsModal(false)
                  setGeneratedCredential(null)
                }}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Module Detail Modal */}
      {showModuleDetailModal && selectedModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selectedModule.name}</h2>
                <p className="text-sm text-gray-500">{selectedModule.description}</p>
              </div>
              <button
                onClick={() => {
                  setShowModuleDetailModal(false)
                  setSelectedModule(null)
                  setNewCriterionText('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6 space-y-6">
              {/* Module Status Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[selectedModule.status].color}`}>
                    {statusConfig[selectedModule.status].label}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Akzeptanz</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    selectedModule.acceptanceStatus === 'akzeptiert'
                      ? 'bg-green-100 text-green-700'
                      : selectedModule.acceptanceStatus === 'abgelehnt'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {selectedModule.acceptanceStatus === 'akzeptiert' ? 'Akzeptiert' :
                     selectedModule.acceptanceStatus === 'abgelehnt' ? 'Abgelehnt' : 'Ausstehend'}
                  </span>
                </div>
              </div>

              {/* Verantwortliche */}
              <div className="grid grid-cols-2 gap-4">
                {/* Interner Verantwortlicher */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-600 mb-2 font-medium">Interner Verantwortlicher</p>
                  <select
                    value={selectedModule.assigneeId || ''}
                    onChange={(e) => {
                      const newAssigneeId = e.target.value || undefined
                      setSelectedModule({ ...selectedModule, assigneeId: newAssigneeId })
                      setCustomerModules(prev =>
                        prev.map(m => m.id === selectedModule.id ? { ...m, assigneeId: newAssigneeId } : m)
                      )
                    }}
                    className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">-- Niemand zugewiesen --</option>
                    {(team || []).map((member: { id: string; name: string; role?: string; assignedModules?: any[] }) => (
                      <option key={member.id} value={member.id}>
                        {member.name} ({member.role || 'Team'}) - {member.assignedModules?.length || 0} Projekte
                      </option>
                    ))}
                  </select>
                  {selectedModule.assigneeId && (
                    <div className="mt-2 text-xs text-blue-700">
                      {(() => {
                        const assignee = (team || []).find((m: any) => m.id === selectedModule.assigneeId)
                        if (!assignee?.assignedModules?.length) return null
                        const otherProjects = assignee.assignedModules.filter((m: any) => m.id !== selectedModule.id)
                        if (otherProjects.length === 0) return <span>Dieses ist das einzige Projekt</span>
                        return (
                          <span>Betreut auch: {otherProjects.map((m: any) => m.name).join(', ')}</span>
                        )
                      })()}
                    </div>
                  )}
                </div>

                {/* Kunden-Verantwortlicher */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-green-600 mb-2 font-medium">Kunden-Verantwortlicher</p>
                  <select
                    value={selectedModule.customerContactId || ''}
                    onChange={(e) => {
                      const selectedTeamMember = (customer?.teamMembers || []).find((m: any) => m.id === e.target.value)
                      const newContactId = e.target.value || undefined
                      const newContactName = selectedTeamMember?.name || undefined
                      setSelectedModule({ ...selectedModule, customerContactId: newContactId, customerContactName: newContactName })
                      setCustomerModules(prev =>
                        prev.map(m => m.id === selectedModule.id ? { ...m, customerContactId: newContactId, customerContactName: newContactName } : m)
                      )
                    }}
                    className="w-full rounded-lg border border-green-200 bg-white px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  >
                    <option value="">-- Niemand zugewiesen --</option>
                    {(customer?.teamMembers || []).map((member: { id: string; name: string }) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                  {selectedModule.customerContactName && !selectedModule.customerContactId && (
                    <p className="text-xs text-gray-500 mt-1 italic">
                      Manuell gesetzt: {selectedModule.customerContactName}
                    </p>
                  )}
                </div>
              </div>

              {/* Live-Status (nur bei abgeschlossenen Modulen relevant) */}
              {selectedModule.status === 'abgeschlossen' && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-900">Live-Status</p>
                      <p className="text-xs text-purple-600">Steuert wie das Modul dem Kunden angezeigt wird</p>
                    </div>
                    <select
                      value={selectedModule.liveStatus || 'aktiv'}
                      onChange={async (e) => {
                        const newStatus = e.target.value
                        setSelectedModule({ ...selectedModule, liveStatus: newStatus as any })
                        setCustomerModules(prev =>
                          prev.map(m => m.id === selectedModule.id ? { ...m, liveStatus: newStatus as any } : m)
                        )
                        try {
                          await fetch(`/api/modules/${selectedModule.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ liveStatus: newStatus }),
                          })
                          mutate()
                        } catch (error) {
                          console.error('Error updating live status:', error)
                        }
                      }}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 ${
                        selectedModule.liveStatus === 'pausiert'
                          ? 'border-yellow-300 bg-yellow-100 text-yellow-800 focus:ring-yellow-500'
                          : selectedModule.liveStatus === 'deaktiviert'
                            ? 'border-red-300 bg-red-100 text-red-800 focus:ring-red-500'
                            : 'border-green-300 bg-green-100 text-green-800 focus:ring-green-500'
                      }`}
                    >
                      <option value="aktiv">🟢 Live / Aktiv</option>
                      <option value="pausiert">🟡 Pausiert</option>
                      <option value="deaktiviert">🔴 Deaktiviert</option>
                    </select>
                  </div>
                  {selectedModule.liveStatus === 'pausiert' && (
                    <p className="mt-2 text-xs text-yellow-700 bg-yellow-100 p-2 rounded">
                      Das Modul wird dem Kunden als "Pausiert" angezeigt. Die Wartungskosten laufen weiter.
                    </p>
                  )}
                  {selectedModule.liveStatus === 'deaktiviert' && (
                    <p className="mt-2 text-xs text-red-700 bg-red-100 p-2 rounded">
                      Das Modul wird dem Kunden als "Deaktiviert" angezeigt.
                    </p>
                  )}
                </div>
              )}

              {/* Editable Module Settings */}
              <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-400" />
                  Modul-Einstellungen
                </h3>

                {/* Progress Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Fortschritt</label>
                    <span className="text-sm font-semibold text-primary-600">{selectedModule.progress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedModule.progress}
                    onChange={async (e) => {
                      const newProgress = parseInt(e.target.value)
                      setSelectedModule({ ...selectedModule, progress: newProgress })
                      setCustomerModules(prev =>
                        prev.map(m => m.id === selectedModule.id ? { ...m, progress: newProgress } : m)
                      )
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Maintenance Points */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wartungspunkte pro Monat
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={selectedModule.monthlyMaintenancePoints}
                      onChange={(e) => {
                        const newPoints = parseInt(e.target.value) || 0
                        setSelectedModule({ ...selectedModule, monthlyMaintenancePoints: newPoints })
                        setCustomerModules(prev =>
                          prev.map(m => m.id === selectedModule.id ? { ...m, monthlyMaintenancePoints: newPoints } : m)
                        )
                      }}
                      className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-500">Punkte</span>
                  </div>
                </div>

                {/* Software URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Software-URL (für Kunden-Test)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={selectedModule.softwareUrl || ''}
                      onChange={(e) => {
                        const newUrl = e.target.value
                        setSelectedModule({ ...selectedModule, softwareUrl: newUrl })
                        setCustomerModules(prev =>
                          prev.map(m => m.id === selectedModule.id ? { ...m, softwareUrl: newUrl } : m)
                        )
                      }}
                      placeholder="https://..."
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    {selectedModule.softwareUrl && (
                      <a
                        href={selectedModule.softwareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                        title="Link öffnen"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Dieser Link wird dem Kunden in der Testphase angezeigt.
                  </p>
                </div>

                {/* Video URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video-Anleitung (URL)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={selectedModule.videoUrl || ''}
                      onChange={(e) => {
                        const newUrl = e.target.value
                        setSelectedModule({ ...selectedModule, videoUrl: newUrl })
                        setCustomerModules(prev =>
                          prev.map(m => m.id === selectedModule.id ? { ...m, videoUrl: newUrl } : m)
                        )
                      }}
                      placeholder="https://youtube.com/... oder https://loom.com/..."
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    {selectedModule.videoUrl && (
                      <a
                        href={selectedModule.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                        title="Video öffnen"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Link zu einem Anleitungsvideo (YouTube, Loom, etc.)
                  </p>
                </div>

                {/* Manual/Handbook Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Handbuch/Dokumentation hochladen
                  </label>

                  {/* Show current file if exists */}
                  {selectedModule.manualUrl && (
                    <div className="mb-3 flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <FileDown className="h-5 w-5 text-green-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-green-800 truncate">
                          {selectedModule.manualFilename || 'Handbuch.pdf'}
                        </p>
                        <p className="text-xs text-green-600">Hochgeladen</p>
                      </div>
                      <a
                        href={selectedModule.manualUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                        title="Herunterladen"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => {
                          setSelectedModule({ ...selectedModule, manualUrl: undefined, manualFilename: undefined })
                          setCustomerModules(prev =>
                            prev.map(m => m.id === selectedModule.id ? { ...m, manualUrl: undefined, manualFilename: undefined } : m)
                          )
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        title="Entfernen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Upload button */}
                  <div className="flex items-center gap-2">
                    <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      isUploadingManual
                        ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                        : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'
                    }`}>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        className="hidden"
                        disabled={isUploadingManual}
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return

                          setIsUploadingManual(true)
                          try {
                            const formData = new FormData()
                            formData.append('file', file)
                            formData.append('type', 'manual')
                            formData.append('moduleId', selectedModule.id)

                            const response = await fetch('/api/upload', {
                              method: 'POST',
                              body: formData,
                            })

                            const data = await response.json()

                            if (data.success) {
                              setSelectedModule({
                                ...selectedModule,
                                manualUrl: data.url,
                                manualFilename: data.originalName,
                              })
                              setCustomerModules(prev =>
                                prev.map(m => m.id === selectedModule.id ? {
                                  ...m,
                                  manualUrl: data.url,
                                  manualFilename: data.originalName,
                                } : m)
                              )
                            } else {
                              alert(data.error || 'Fehler beim Hochladen')
                            }
                          } catch (error) {
                            console.error('Upload error:', error)
                            alert('Fehler beim Hochladen der Datei')
                          } finally {
                            setIsUploadingManual(false)
                            e.target.value = '' // Reset input
                          }
                        }}
                      />
                      {isUploadingManual ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                          <span className="text-sm text-gray-500">Wird hochgeladen...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-5 w-5 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {selectedModule.manualUrl ? 'Neue Datei hochladen' : 'PDF oder Dokument hochladen'}
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, Word, Excel oder PowerPoint (max. 50MB)
                  </p>
                </div>

                {/* Text Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Textanleitung
                  </label>
                  <textarea
                    value={selectedModule.instructions || ''}
                    onChange={(e) => {
                      const newInstructions = e.target.value
                      setSelectedModule({ ...selectedModule, instructions: newInstructions })
                      setCustomerModules(prev =>
                        prev.map(m => m.id === selectedModule.id ? { ...m, instructions: newInstructions } : m)
                      )
                    }}
                    placeholder="Schritt-für-Schritt Anleitung für den Kunden..."
                    rows={4}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Kurze Anleitung wie der Kunde das Modul testen/benutzen kann
                  </p>
                </div>
              </div>

              {/* Acceptance Criteria */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <ListChecks className="h-5 w-5 text-gray-400" />
                    Akzeptanzkriterien
                  </h3>
                  {selectedModule.acceptanceStatus === 'akzeptiert' && selectedModule.acceptedBy && (
                    <span className="text-xs text-green-600">
                      Akzeptiert von {selectedModule.acceptedBy} am {new Date(selectedModule.acceptedAt!).toLocaleDateString('de-DE')}
                    </span>
                  )}
                </div>

                {/* Existing Criteria */}
                <div className="space-y-2 mb-4">
                  {editingCriteria.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <ListChecks className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">Noch keine Akzeptanzkriterien definiert</p>
                    </div>
                  ) : (
                    editingCriteria.map((criterion, index) => (
                      <div
                        key={criterion.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border ${
                          criterion.accepted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="pt-0.5">
                          {criterion.accepted ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm ${criterion.accepted ? 'text-green-800' : 'text-gray-700'}`}>
                            {criterion.description}
                          </p>
                          {criterion.accepted && (
                            <p className="text-xs text-green-600 mt-1">Vom Kunden bestätigt</p>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setEditingCriteria(prev => prev.filter(c => c.id !== criterion.id))
                          }}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Add New Criterion */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCriterionText}
                    onChange={(e) => setNewCriterionText(e.target.value)}
                    placeholder="Neues Akzeptanzkriterium hinzufügen..."
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newCriterionText.trim()) {
                        const newCriterion: AcceptanceCriterion = {
                          id: `ac-new-${Date.now()}`,
                          description: newCriterionText.trim(),
                          accepted: false,
                        }
                        setEditingCriteria(prev => [...prev, newCriterion])
                        setNewCriterionText('')
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (newCriterionText.trim()) {
                        const newCriterion: AcceptanceCriterion = {
                          id: `ac-new-${Date.now()}`,
                          description: newCriterionText.trim(),
                          accepted: false,
                        }
                        setEditingCriteria(prev => [...prev, newCriterion])
                        setNewCriterionText('')
                      }
                    }}
                    className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Send for Acceptance */}
              {editingCriteria.length > 0 && selectedModule.acceptanceStatus !== 'akzeptiert' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Zur Akzeptanz senden</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Senden Sie die Akzeptanzkriterien an den Kunden zur Prüfung und Bestätigung.
                  </p>
                  <button
                    onClick={async () => {
                      try {
                        // First save the criteria
                        await fetch(`/api/modules/${selectedModule.id}/criteria`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ criteria: editingCriteria }),
                        })

                        // Update module acceptanceStatus to "ausstehend"
                        await fetch(`/api/modules/${selectedModule.id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ acceptanceStatus: 'ausstehend' }),
                        })

                        // Create notification for customer
                        await fetch(`/api/customers/${customer?.id}/notifications`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            type: 'acceptance_required',
                            title: 'Akzeptanzkriterien prüfen',
                            message: `Bitte prüfen Sie die Akzeptanzkriterien für das Modul "${selectedModule.name}" und bestätigen oder verwerfen Sie diese.`,
                            actionRequired: true,
                            relatedProjectId: selectedModule.id,
                            relatedUrl: `/roadmap/${selectedModule.id}`,
                          }),
                        })

                        mutate()
                        alert('Akzeptanzkriterien wurden an den Kunden gesendet!')
                      } catch (error) {
                        console.error('Error sending criteria:', error)
                        alert('Fehler beim Senden der Kriterien')
                      }
                    }}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                  >
                    <MessageSquare className="h-4 w-4" />
                    An Kunden senden
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => {
                  setShowModuleDetailModal(false)
                  setSelectedModule(null)
                  setNewCriterionText('')
                }}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={async () => {
                  try {
                    // Save module settings
                    await fetch(`/api/modules/${selectedModule.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        progress: selectedModule.progress,
                        monthlyMaintenancePoints: selectedModule.monthlyMaintenancePoints,
                        softwareUrl: selectedModule.softwareUrl || null,
                        videoUrl: selectedModule.videoUrl || null,
                        manualUrl: selectedModule.manualUrl || null,
                        manualFilename: selectedModule.manualFilename || null,
                        instructions: selectedModule.instructions || null,
                        assigneeId: selectedModule.assigneeId || null,
                        customerContactId: selectedModule.customerContactId || null,
                        customerContactName: selectedModule.customerContactName || null,
                      }),
                    })

                    // Save acceptance criteria
                    if (editingCriteria.length > 0) {
                      await fetch(`/api/modules/${selectedModule.id}/criteria`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ criteria: editingCriteria }),
                      })
                    }

                    mutate()
                    setShowModuleDetailModal(false)
                    setSelectedModule(null)
                    setNewCriterionText('')
                  } catch (error) {
                    console.error('Error saving module:', error)
                    alert('Fehler beim Speichern des Moduls')
                  }
                }}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add to Roadmap Modal */}
      {showAddToRoadmapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Element zur Roadmap hinzufügen</h2>
              <button
                onClick={() => setShowAddToRoadmapModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Tab Switcher */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setAddToRoadmapType('modul')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  addToRoadmapType === 'modul'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Cpu className="h-4 w-4" />
                Module ({customerModules.length})
              </button>
              <button
                onClick={() => setAddToRoadmapType('schulung')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  addToRoadmapType === 'schulung'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <GraduationCap className="h-4 w-4" />
                Schulungen ({schulungskatalog.length})
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {addToRoadmapType === 'modul' ? (
                <div className="space-y-2">
                  {customerModules.length === 0 ? (
                    <div className="text-center py-8">
                      <Cpu className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">Noch keine Module angelegt</p>
                    </div>
                  ) : (
                    customerModules.map((module) => {
                      const isAlreadyInRoadmap = roadmapItems.some(
                        item => item.type === 'modul' && item.moduleId === module.id
                      )
                      return (
                        <div
                          key={module.id}
                          className={`flex items-center justify-between p-4 rounded-lg border ${
                            isAlreadyInRoadmap
                              ? 'bg-gray-50 border-gray-200 opacity-60'
                              : 'bg-white border-gray-200 hover:border-primary-300 hover:bg-primary-50 cursor-pointer'
                          }`}
                          onClick={() => !isAlreadyInRoadmap && addModuleToRoadmap(module.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                              <Cpu className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{module.name}</p>
                              <p className="text-sm text-gray-500">{module.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[module.status].color}`}>
                              {statusConfig[module.status].label}
                            </span>
                            {isAlreadyInRoadmap ? (
                              <span className="text-xs text-gray-400">Bereits hinzugefügt</span>
                            ) : (
                              <Plus className="h-5 w-5 text-primary-600" />
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {schulungskatalog.map((schulung) => {
                    const isAlreadyInRoadmap = roadmapItems.some(
                      item => item.type === 'schulung' && item.schulungId === schulung.id
                    )
                    return (
                      <div
                        key={schulung.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          isAlreadyInRoadmap
                            ? 'bg-gray-50 border-gray-200 opacity-60'
                            : 'bg-white border-gray-200 hover:border-primary-300 hover:bg-primary-50 cursor-pointer'
                        }`}
                        onClick={() => !isAlreadyInRoadmap && addSchulungToRoadmap(schulung.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                            <GraduationCap className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{schulung.title}</p>
                            <p className="text-sm text-gray-500">{schulung.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{schulung.points} Punkte</p>
                            <p className="text-xs text-gray-500">{schulung.duration}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            schulung.category === 'grundlagen'
                              ? 'bg-green-100 text-green-700'
                              : schulung.category === 'fortgeschritten'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                          }`}>
                            {schulung.category}
                          </span>
                          {isAlreadyInRoadmap ? (
                            <span className="text-xs text-gray-400">Bereits hinzugefügt</span>
                          ) : (
                            <Plus className="h-5 w-5 text-primary-600" />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setShowAddToRoadmapModal(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Module from Catalog Modal */}
      {showAddModuleFromCatalogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Modul aus Katalog hinzufügen</h2>
                <p className="text-sm text-gray-500">Wählen Sie eine Vorlage aus dem Modulkatalog</p>
              </div>
              <button
                onClick={() => setShowAddModuleFromCatalogModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {moduleTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <Cpu className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Noch keine Modul-Vorlagen verfügbar</p>
                  <Link
                    href="/admin/modules"
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Zum Modulkatalog
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {moduleTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-start justify-between p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 cursor-pointer transition-colors"
                      onClick={() => addModuleFromCatalog(template)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                          <Cpu className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{template.name}</p>
                          <p className="text-sm text-gray-500 mb-2">{template.description}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>~{template.estimatedPoints} Punkte</span>
                            <span>•</span>
                            <span>{template.estimatedMaintenancePoints} P/Monat Wartung</span>
                          </div>
                        </div>
                      </div>
                      <Plus className="h-5 w-5 text-primary-600 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setShowAddModuleFromCatalogModal(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Schulung/Serie Modal */}
      {showAddSchulungModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Schulung hinzufügen</h2>
                <p className="text-sm text-gray-500">Wählen Sie eine Schulung oder erstellen Sie eine neue</p>
              </div>
              <button
                onClick={() => setShowAddSchulungModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-6">
              {/* Create New Schulung Button */}
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                <Link
                  href="/admin/schulungen"
                  className="flex items-center justify-center gap-2 text-primary-600 hover:text-primary-700"
                  onClick={() => setShowAddSchulungModal(false)}
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">Neue Schulung im Katalog erstellen</span>
                </Link>
              </div>
              {/* Series Section */}
              {schulungSerien.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                    <Layers className="h-5 w-5 text-purple-500" />
                    Schulungsserien
                  </h3>
                  <div className="space-y-2">
                    {schulungSerien.map((serie) => {
                      const isAlreadyAssigned = schulungAssignments.some(a => a.serieId === serie.id)
                      return (
                        <div
                          key={serie.id}
                          className={`p-4 rounded-lg border ${
                            isAlreadyAssigned
                              ? 'bg-gray-50 border-gray-200 opacity-60'
                              : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50 cursor-pointer'
                          } transition-colors`}
                          onClick={() => !isAlreadyAssigned && addSchulungAssignment('serie', serie.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{serie.title}</p>
                              <p className="text-sm text-gray-500 mb-2">{serie.description}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{serie.schulungIds.length} Schulungen</span>
                                <span>•</span>
                                <span>{serie.totalPoints} Punkte gesamt</span>
                              </div>
                            </div>
                            {isAlreadyAssigned ? (
                              <span className="text-xs text-gray-400">Bereits zugewiesen</span>
                            ) : (
                              <Plus className="h-5 w-5 text-purple-600 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Individual Schulungen Section */}
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                  <GraduationCap className="h-5 w-5 text-yellow-500" />
                  Einzelschulungen
                </h3>
                <div className="space-y-2">
                  {schulungskatalog.map((schulung) => {
                    const isAlreadyAssigned = schulungAssignments.some(a => a.schulungId === schulung.id)
                    return (
                      <div
                        key={schulung.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          isAlreadyAssigned
                            ? 'bg-gray-50 border-gray-200 opacity-60'
                            : 'border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 cursor-pointer'
                        } transition-colors`}
                        onClick={() => !isAlreadyAssigned && addSchulungAssignment('schulung', schulung.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                            <GraduationCap className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{schulung.title}</p>
                            <p className="text-sm text-gray-500">{schulung.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{schulung.points} Punkte</p>
                            <p className="text-xs text-gray-500">{schulung.duration}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            schulung.category === 'grundlagen'
                              ? 'bg-green-100 text-green-700'
                              : schulung.category === 'fortgeschritten'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                          }`}>
                            {schulung.category}
                          </span>
                          {isAlreadyAssigned ? (
                            <span className="text-xs text-gray-400">Bereits zugewiesen</span>
                          ) : (
                            <Plus className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setShowAddSchulungModal(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Package Modal */}
      {showEditPackageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Paket-Details bearbeiten</h2>
              <button
                onClick={() => setShowEditPackageModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paket
                </label>
                <select
                  value={editPackageData.tier}
                  onChange={(e) => {
                    const tier = e.target.value
                    const config = tierConfig[tier as keyof typeof tierConfig]
                    setEditPackageData({
                      ...editPackageData,
                      tier,
                      monthlyPoints: config.points,
                      monthlyPrice: config.price,
                    })
                  }}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="S">Paket S - Small (100 Punkte, 2.900 €)</option>
                  <option value="M">Paket M - Medium (200 Punkte, 4.900 €)</option>
                  <option value="L">Paket L - Large (400 Punkte, 8.900 €)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monatliche Punkte
                  </label>
                  <input
                    type="number"
                    value={editPackageData.monthlyPoints}
                    onChange={(e) => setEditPackageData({ ...editPackageData, monthlyPoints: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monatlicher Preis (Cent)
                  </label>
                  <input
                    type="number"
                    value={editPackageData.monthlyPrice}
                    onChange={(e) => setEditPackageData({ ...editPackageData, monthlyPrice: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    = {editPackageData.monthlyPrice.toLocaleString('de-DE')} €
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vertragsbeginn
                  </label>
                  <input
                    type="date"
                    value={editPackageData.contractStart}
                    onChange={(e) => setEditPackageData({ ...editPackageData, contractStart: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vertragsende
                  </label>
                  <input
                    type="date"
                    value={editPackageData.contractEnd}
                    onChange={(e) => setEditPackageData({ ...editPackageData, contractEnd: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rabatt (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editPackageData.discountPercent}
                    onChange={(e) => setEditPackageData({ ...editPackageData, discountPercent: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  {editPackageData.discountPercent > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      Effektivpreis: {(editPackageData.monthlyPrice * (1 - editPackageData.discountPercent / 100)).toLocaleString('de-DE')} €
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bonus-Punkte
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editPackageData.bonusPoints}
                    onChange={(e) => setEditPackageData({ ...editPackageData, bonusPoints: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Extra-Punkte für den Kunden
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setShowEditPackageModal(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={async () => {
                  setIsSavingPackage(true)
                  try {
                    await updateMembership(customerId, {
                      tier: editPackageData.tier,
                      monthlyPoints: editPackageData.monthlyPoints,
                      monthlyPrice: editPackageData.monthlyPrice,
                      discountPercent: editPackageData.discountPercent,
                      bonusPoints: editPackageData.bonusPoints,
                      contractStart: editPackageData.contractStart,
                      contractEnd: editPackageData.contractEnd || undefined,
                    })
                    mutate() // Refresh customer data
                    setShowEditPackageModal(false)
                  } catch (error) {
                    console.error('Error updating package:', error)
                  } finally {
                    setIsSavingPackage(false)
                  }
                }}
                disabled={isSavingPackage}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSavingPackage && <Loader2 className="h-4 w-4 animate-spin" />}
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
