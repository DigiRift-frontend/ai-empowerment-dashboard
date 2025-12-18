'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { AdminHeader } from '@/components/admin/admin-header'
import {
  getCustomerById,
  getCustomerModules,
  getCustomerTransactions,
  getCustomerMessages,
  mockAdminTeamMembers,
  mockCustomerRoadmaps,
  schulungskatalog,
  schulungSerien,
  getCustomerSchulungAssignments,
  moduleTemplates,
  AdminMessage,
} from '@/lib/admin-mock-data'
import { KanbanBoard } from '@/components/admin/kanban-board'
import { Module, AcceptanceCriterion, ModuleStatus, CustomerRoadmapItem, Schulung, SchulungSerie, CustomerSchulungAssignment, ModuleTemplate } from '@/types'
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
} from 'lucide-react'
import Link from 'next/link'

type Tab = 'overview' | 'points' | 'modules' | 'schulungen' | 'roadmap' | 'messages'
type ModuleViewMode = 'kanban' | 'overview'

const tierConfig = {
  S: { color: 'bg-gray-100 text-gray-700', label: 'Small', points: 100, price: 2900 },
  M: { color: 'bg-blue-100 text-blue-700', label: 'Medium', points: 200, price: 4900 },
  L: { color: 'bg-purple-100 text-purple-700', label: 'Large', points: 400, price: 8900 },
}

const statusConfig = {
  geplant: { label: 'Geplant', color: 'bg-gray-100 text-gray-700', columnColor: 'border-gray-300' },
  'in-arbeit': { label: 'In Arbeit', color: 'bg-blue-100 text-blue-700', columnColor: 'border-blue-400' },
  'im-test': { label: 'Im Test', color: 'bg-yellow-100 text-yellow-700', columnColor: 'border-yellow-400' },
  abgeschlossen: { label: 'Fertig', color: 'bg-green-100 text-green-700', columnColor: 'border-green-400' },
}

const moduleStatusConfig: Record<string, { label: string; color: string }> = {
  geplant: { label: 'Geplant', color: 'bg-gray-100 text-gray-700' },
  'in-arbeit': { label: 'In Arbeit', color: 'bg-blue-100 text-blue-700' },
  'im-test': { label: 'Im Test', color: 'bg-yellow-100 text-yellow-700' },
  abgeschlossen: { label: 'Live', color: 'bg-green-100 text-green-700' },
}

const categoryConfig: Record<string, { label: string; color: string }> = {
  entwicklung: { label: 'Entwicklung', color: 'bg-blue-100 text-blue-700' },
  wartung: { label: 'Wartung', color: 'bg-green-100 text-green-700' },
  schulung: { label: 'Schulung', color: 'bg-yellow-100 text-yellow-700' },
  beratung: { label: 'Beratung', color: 'bg-purple-100 text-purple-700' },
  analyse: { label: 'Analyse & PM', color: 'bg-orange-100 text-orange-700' },
}

export default function CustomerDetailPage() {
  const params = useParams()
  const customerId = params.id as string
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

  const customer = getCustomerById(customerId)
  const initialModules = getCustomerModules(customerId)
  const transactions = getCustomerTransactions(customerId)
  const messages = getCustomerMessages(customerId)
  const customerRoadmap = mockCustomerRoadmaps[customerId]
  const initialSchulungAssignments = getCustomerSchulungAssignments(customerId)

  const [customerModules, setCustomerModules] = useState<Module[]>(initialModules)
  const [roadmapItems, setRoadmapItems] = useState<CustomerRoadmapItem[]>(
    customerRoadmap?.items || []
  )
  const [schulungAssignments, setSchulungAssignments] = useState<CustomerSchulungAssignment[]>(
    initialSchulungAssignments
  )

  if (!customer) {
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

  const tabs = [
    { id: 'overview' as Tab, label: 'Übersicht', icon: Package },
    { id: 'points' as Tab, label: 'Punkte', icon: Coins },
    { id: 'modules' as Tab, label: 'Module', icon: Cpu },
    { id: 'schulungen' as Tab, label: 'Schulungen', icon: GraduationCap },
    { id: 'roadmap' as Tab, label: 'Roadmap', icon: Map },
    { id: 'messages' as Tab, label: 'Nachrichten', icon: MessageSquare },
  ]

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
  const addModuleFromCatalog = (template: ModuleTemplate) => {
    const newModule: Module = {
      id: `mod-new-${Date.now()}`,
      name: template.name,
      description: template.description,
      status: 'geplant',
      priority: 'mittel',
      progress: 0,
      monthlyMaintenancePoints: template.estimatedMaintenancePoints,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      showInRoadmap: true,
      roadmapOrder: customerModules.length + 1,
    }
    setCustomerModules([...customerModules, newModule])
    setShowAddModuleFromCatalogModal(false)

    // Also add to roadmap
    const roadmapItem: CustomerRoadmapItem = {
      id: `cri-new-${Date.now()}`,
      type: 'modul',
      moduleId: newModule.id,
      order: roadmapItems.length + 1,
    }
    setRoadmapItems([...roadmapItems, roadmapItem])
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
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${tierConfig[customer.membership.tier].color}`}
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
                <h3 className="font-semibold text-gray-900 mb-4">Paket-Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Paket</span>
                    <span className="font-medium">{tierConfig[customer.membership.tier].label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Monatliche Punkte</span>
                    <span className="font-medium">{customer.membership.monthlyPoints}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Monatlicher Beitrag</span>
                    <span className="font-medium">
                      {(customer.membership.monthlyPrice / 100).toLocaleString('de-DE')} €
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Vertragsbeginn</span>
                    <span className="font-medium">
                      {new Date(customer.membership.contractStart).toLocaleDateString('de-DE')}
                    </span>
                  </div>
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
                  {customer.membership.carriedOverPoints && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-500 mb-2">Übertragene Punkte</p>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 rounded bg-red-50 text-red-600 text-xs">
                          {customer.membership.carriedOverPoints.month1} (verfällt)
                        </span>
                        <span className="px-2 py-1 rounded bg-yellow-50 text-yellow-600 text-xs">
                          {customer.membership.carriedOverPoints.month2}
                        </span>
                        <span className="px-2 py-1 rounded bg-green-50 text-green-600 text-xs">
                          {customer.membership.carriedOverPoints.month3}
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
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                      <span className="text-sm font-medium text-primary-700">
                        {customer.advisor.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{customer.advisor.name}</p>
                      <p className="text-sm text-gray-500">{customer.advisor.role}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ansprechpartner ändern
                    </label>
                    <select
                      defaultValue={customer.advisor.id}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      {mockAdminTeamMembers.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name} - {member.role}
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
                    setShowNewModuleModal(true)
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
                  {transactions.slice(0, 5).map((t) => (
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
                    .filter((m) => m.status === 'in-arbeit' || m.status === 'im-test')
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
                  {customerModules.filter((m) => m.status === 'in-arbeit' || m.status === 'im-test')
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((t) => {
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
                    onClick={() => setShowNewModuleModal(true)}
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
                        {customerModules.filter(m => m.status === 'in-arbeit' || m.status === 'im-test').length}
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
                      const assignee = mockAdminTeamMembers.find(m => m.id === module.assigneeId)
                      return (
                        <div
                          key={module.id}
                          className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => {
                            setSelectedModule(module)
                            setEditingCriteria(module.acceptanceCriteria || [])
                            setShowModuleDetailModal(true)
                          }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-gray-900">{module.name}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${moduleStatusConfig[module.status].color}`}>
                              {moduleStatusConfig[module.status].label}
                            </span>
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
                  teamMembers={mockAdminTeamMembers}
                  showMaintenancePoints={true}
                  onStatusChange={(itemId, newStatus) => {
                    setCustomerModules(prev =>
                      prev.map(m => m.id === itemId ? { ...m, status: newStatus } : m)
                    )
                  }}
                  onAssigneeChange={(itemId, assigneeId) => {
                    setCustomerModules(prev =>
                      prev.map(m => m.id === itemId ? { ...m, assigneeId: assigneeId || undefined } : m)
                    )
                  }}
                  onItemClick={(item) => {
                    setSelectedModule(item)
                    setEditingCriteria(item.acceptanceCriteria || [])
                    setShowModuleDetailModal(true)
                  }}
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
                  Schulung zuweisen
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
                    Erste Schulung zuweisen
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
                                      : assignment.status === 'in-durchfuehrung'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {assignment.status === 'abgeschlossen' ? 'Abgeschlossen' :
                                     assignment.status === 'in-durchfuehrung' ? 'In Durchführung' : 'Geplant'}
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
                                                          : 'in-durchfuehrung',
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
                                      : assignment.status === 'in-durchfuehrung'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {assignment.status === 'abgeschlossen' ? 'Abgeschlossen' :
                                     assignment.status === 'in-durchfuehrung' ? 'In Durchführung' : 'Geplant'}
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

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Nachrichten</h3>
              </div>

              {/* Neue Nachricht */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h4 className="font-medium text-gray-900 mb-4">Neue Nachricht senden</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Betreff</label>
                    <input
                      type="text"
                      placeholder="Betreff der Nachricht"
                      className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nachricht</label>
                    <textarea
                      rows={4}
                      placeholder="Ihre Nachricht an den Kunden..."
                      className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="text-sm text-gray-700">Aktion erforderlich</span>
                    </label>
                    <button className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
                      <MessageSquare className="h-4 w-4" />
                      Senden
                    </button>
                  </div>
                </div>
              </div>

              {/* Nachrichtenhistorie */}
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h4 className="font-medium text-gray-900">Nachrichtenhistorie ({messages.length})</h4>
                </div>
                <div className="divide-y divide-gray-100">
                  {messages.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Noch keine Nachrichten gesendet</p>
                    </div>
                  ) : (
                    [...messages].reverse().map((msg) => (
                      <div key={msg.id} className="px-6 py-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium text-gray-900 truncate">{msg.subject}</h5>
                              {msg.actionRequired && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                  Aktion erforderlich
                                </span>
                              )}
                              {!msg.read && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                  Ungelesen
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">{msg.content}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>
                                {new Date(msg.sentAt).toLocaleDateString('de-DE', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              <span>von {msg.sentBy}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                <input
                  type="text"
                  placeholder="Was wurde gemacht?"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Punkte</label>
                  <input
                    type="number"
                    placeholder="10"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
                  <input
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
                <select className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                  <option value="entwicklung">Entwicklung</option>
                  <option value="wartung">Wartung</option>
                  <option value="schulung">Schulung</option>
                  <option value="beratung">Beratung</option>
                  <option value="analyse">Analyse & PM</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modul (optional)
                </label>
                <select className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
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
              <button className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
                Buchen
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  placeholder="Modulname"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                <textarea
                  rows={3}
                  placeholder="Was macht dieses Modul?"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                    <option value="setup">Setup</option>
                    <option value="live">Live</option>
                    <option value="optimierung">Optimierung</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wartung/Monat
                  </label>
                  <input
                    type="number"
                    placeholder="10"
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
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verantwortlicher
                </label>
                <select className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                  <option value="">Nicht zugewiesen</option>
                  {mockAdminTeamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} - {member.role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setShowNewModuleModal(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Abbrechen
              </button>
              <button className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
                Modul anlegen
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
                onClick={() => setShowCredentialsModal(false)}
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
                    <button className="text-gray-400 hover:text-gray-600">
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
                    <button className="text-gray-400 hover:text-gray-600">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-500 mb-3">Neue Zugangsdaten generieren</p>
                <div className="flex gap-2">
                  <button className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    Neues Passwort
                  </button>
                  <button className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    Neuer PIN
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setShowCredentialsModal(false)}
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
              {/* Module Status */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[selectedModule.status].color}`}>
                    {statusConfig[selectedModule.status].label}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Fortschritt</p>
                  <p className="font-medium text-gray-900">{selectedModule.progress}%</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Wartung/Monat</p>
                  <p className="font-medium text-gray-900">{selectedModule.monthlyMaintenancePoints} P</p>
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
                    onClick={() => {
                      // In production: API call to send notification to customer
                      console.log('Sending criteria for acceptance:', editingCriteria)
                      alert('Akzeptanzkriterien wurden an den Kunden gesendet!')
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
                onClick={() => {
                  // In production: API call to save criteria
                  console.log('Saving criteria:', editingCriteria)
                  setShowModuleDetailModal(false)
                  setSelectedModule(null)
                  setNewCriterionText('')
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
                <h2 className="text-lg font-semibold text-gray-900">Schulung zuweisen</h2>
                <p className="text-sm text-gray-500">Wählen Sie eine Schulung oder eine Serie aus</p>
              </div>
              <button
                onClick={() => setShowAddSchulungModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-6">
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
    </div>
  )
}
