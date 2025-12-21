'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useCustomer } from '@/hooks/use-customers'
import { useAuth } from '@/hooks/use-auth'
import { formatDate } from '@/lib/utils'
import {
  Calendar,
  Target,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  LayoutGrid,
  List,
  AlertTriangle,
  Download,
  User,
  FlaskConical,
  Loader2,
  GraduationCap,
  Play,
  BookOpen,
  Users,
  Map,
} from 'lucide-react'
import { ModuleStatus, CustomerSchulungAssignment, SchulungFormat } from '@/types'

// Unified roadmap item type
interface RoadmapItem {
  id: string
  type: 'module' | 'schulung'
  name: string
  description: string
  status: ModuleStatus | 'schulung_geplant' | 'schulung_abgeschlossen'
  priority?: string
  progress?: number
  targetDate?: string
  acceptanceStatus?: string
  assignee?: { name: string }
  liveStatus?: string
  acceptanceCriteria?: any[]
  // Schulung specific
  schulungId?: string
  format?: SchulungFormat
  scheduledDate?: string
  rating?: number
  points?: number
}

const formatLabels: Record<SchulungFormat, { icon: typeof Users }> = {
  live: { icon: Users },
  self_learning: { icon: BookOpen },
  hybrid: { icon: Play },
}

export default function RoadmapPage() {
  const { customerId } = useAuth()
  const { customer, isLoading } = useCustomer(customerId || '')
  const [activeTab, setActiveTab] = useState<'roadmap' | 'kanban'>('roadmap')
  const [listViewMode, setListViewMode] = useState<'timeline' | 'list'>('timeline')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'hoch' | 'mittel' | 'niedrig'>('all')
  const [schulungAssignments, setSchulungAssignments] = useState<CustomerSchulungAssignment[]>([])

  // Fetch schulung assignments
  useEffect(() => {
    const fetchSchulungen = async () => {
      if (!customerId) return

      try {
        const res = await fetch(`/api/customers/${customerId}/schulungen`)
        if (res.ok) {
          const data = await res.json()
          // Filter to only those marked for roadmap
          const roadmapSchulungen = data.filter((a: CustomerSchulungAssignment) =>
            a.schulung?.showInRoadmap !== false
          )
          setSchulungAssignments(roadmapSchulungen)
        }
      } catch (error) {
        console.error('Error fetching schulungen:', error)
      }
    }

    fetchSchulungen()
  }, [customerId])

  const statusConfig = {
    geplant: { label: 'Geplant', color: 'bg-gray-100', textColor: 'text-gray-600', icon: Calendar, columnColor: 'border-gray-300' },
    in_arbeit: { label: 'In Arbeit', color: 'bg-blue-100', textColor: 'text-blue-600', icon: Clock, columnColor: 'border-blue-400' },
    im_test: { label: 'Im Test', color: 'bg-purple-100', textColor: 'text-purple-600', icon: FlaskConical, columnColor: 'border-purple-400' },
    abgeschlossen: { label: 'Abgeschlossen', color: 'bg-green-100', textColor: 'text-green-600', icon: CheckCircle2, columnColor: 'border-green-400' },
  }

  const priorityConfig = {
    hoch: { label: 'Hoch', color: 'bg-red-100 text-red-700' },
    mittel: { label: 'Mittel', color: 'bg-yellow-100 text-yellow-700' },
    niedrig: { label: 'Niedrig', color: 'bg-gray-100 text-gray-700' },
  }

  const acceptanceConfig = {
    ausstehend: { label: 'Bestätigung erforderlich', color: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle },
    akzeptiert: { label: 'Akzeptiert', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    abgelehnt: { label: 'Abgelehnt', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
  }

  // Get roadmap items from modules and schulungen
  const roadmapItems = useMemo(() => {
    const items: RoadmapItem[] = []

    // Add modules
    if (customer?.modules) {
      customer.modules
        .filter((m: any) => m.showInRoadmap !== false)
        .forEach((m: any) => {
          items.push({
            id: m.id,
            type: 'module',
            name: m.name,
            description: m.description,
            status: m.status,
            priority: m.priority,
            progress: m.progress,
            targetDate: m.targetDate,
            acceptanceStatus: m.acceptanceStatus,
            assignee: m.assignee,
            liveStatus: m.liveStatus,
            acceptanceCriteria: m.acceptanceCriteria,
          })
        })
    }

    // Add schulungen (individual and from series)
    schulungAssignments.forEach((assignment) => {
      // Individual schulung
      if (assignment.schulung) {
        // Map schulung status: durchgefuehrt and abgeschlossen count as completed
        const schulungStatus = assignment.status === 'abgeschlossen' || assignment.status === 'durchgefuehrt'
          ? 'abgeschlossen'
          : assignment.status === 'in_vorbereitung'
          ? 'in_arbeit'
          : 'geplant'
        items.push({
          id: assignment.id,
          type: 'schulung',
          name: assignment.schulung.title,
          description: assignment.schulung.description,
          status: schulungStatus,
          targetDate: assignment.scheduledDate,
          schulungId: assignment.schulung.id,
          format: assignment.schulung.format,
          scheduledDate: assignment.scheduledDate,
          rating: assignment.rating,
          points: assignment.schulung.points,
        })
      }
      // Series - add all schulungen from the series (excluding removed ones)
      else if (assignment.serie?.schulungItems) {
        assignment.serie.schulungItems.forEach((item: any) => {
          if (!item.schulung) return
          // Skip excluded schulungen
          if (assignment.excludedSchulungIds?.includes(item.schulung.id)) return

          // Check if this individual schulung is completed
          const isSchulungCompleted = assignment.completedSchulungIds?.includes(item.schulung.id)

          // Map status: completed schulungen get 'abgeschlossen', others follow series status
          const schulungStatus = isSchulungCompleted
            ? 'abgeschlossen'
            : assignment.status === 'in_vorbereitung'
            ? 'in_arbeit'
            : 'geplant'

          items.push({
            id: `${assignment.id}-${item.schulung.id}`,
            type: 'schulung',
            name: item.schulung.title,
            description: item.schulung.description,
            status: schulungStatus,
            targetDate: assignment.scheduledDate,
            schulungId: item.schulung.id,
            format: item.schulung.format,
            scheduledDate: assignment.scheduledDate,
            rating: assignment.rating,
            points: item.schulung.points,
          })
        })
      }
    })

    return items.sort((a, b) => {
      // Sort by targetDate if available
      if (a.targetDate && b.targetDate) {
        return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
      }
      return 0
    })
  }, [customer?.modules, schulungAssignments])

  const filteredItems = useMemo(() => {
    return priorityFilter === 'all'
      ? roadmapItems
      : roadmapItems.filter((item: any) => item.priority === priorityFilter)
  }, [roadmapItems, priorityFilter])

  const itemsByStatus = useMemo(() => ({
    geplant: filteredItems.filter((item: any) => item.status === 'geplant'),
    in_arbeit: filteredItems.filter((item: any) => item.status === 'in_arbeit'),
    im_test: filteredItems.filter((item: any) => item.status === 'im_test'),
    abgeschlossen: filteredItems.filter((item: any) => item.status === 'abgeschlossen'),
  }), [filteredItems])

  const totalProgress = useMemo(() => {
    if (roadmapItems.length === 0) return 0
    return Math.round(
      roadmapItems.reduce((sum: number, item: any) => sum + (item.progress || 0), 0) / roadmapItems.length
    )
  }, [roadmapItems])

  const pendingCount = useMemo(() => {
    return roadmapItems.filter((item: any) => item.acceptanceStatus === 'ausstehend').length
  }, [roadmapItems])

  if (isLoading || !customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  const exportRoadmapPDF = () => {
    const content = `
AI EMPOWERMENT PROGRAMM - ROADMAP ÜBERSICHT
============================================

Kunde: ${customer.companyName}
Erstellt: ${formatDate(new Date().toISOString())}
Gesamtfortschritt: ${totalProgress}%

${'='.repeat(50)}

${roadmapItems.map((item: any) => `
PROJEKT: ${item.name}
${'-'.repeat(40)}
Beschreibung: ${item.description}
Status: ${statusConfig[item.status as keyof typeof statusConfig]?.label || item.status}
Priorität: ${priorityConfig[item.priority as keyof typeof priorityConfig]?.label || item.priority}
Fortschritt: ${item.progress || 0}%
${item.startDate ? `Startdatum: ${formatDate(item.startDate)}` : ''}
${item.targetDate ? `Zieldatum: ${formatDate(item.targetDate)}` : ''}
Akzeptanzstatus: ${item.acceptanceStatus === 'akzeptiert' ? 'Akzeptiert' : 'Ausstehend'}

Akzeptanzkriterien:
${item.acceptanceCriteria?.map((c: any, i: number) => `  ${i + 1}. ${c.description}`).join('\n') || '  Keine definiert'}

`).join('\n')}
    `.trim()

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Roadmap_${customer.companyName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Roadmap"
        subtitle="Ihre KI-Roadmap und Fortschritt"
      />

      <div className="p-6">
        {/* Pending Acceptance Banner */}
        {pendingCount > 0 && (
          <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">
                    {pendingCount} Projekt{pendingCount > 1 ? 'e' : ''} benötigt Ihre Bestätigung
                  </p>
                  <p className="text-sm text-yellow-700">
                    Bitte überprüfen und akzeptieren Sie die Akzeptanzkriterien
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex rounded-lg border border-gray-200 p-1 bg-gray-50">
              <button
                onClick={() => setActiveTab('roadmap')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'roadmap'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Map className="h-4 w-4" />
                Roadmap
              </button>
              <button
                onClick={() => setActiveTab('kanban')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'kanban'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                Kanban
              </button>
            </div>
            <Button variant="outline" size="sm" onClick={exportRoadmapPDF}>
              <Download className="mr-1 h-4 w-4" />
              Roadmap exportieren
            </Button>
          </div>
        </div>

        {/* Controls - shown on both tabs */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">Priorität:</span>
            {(['all', 'hoch', 'mittel', 'niedrig'] as const).map((priority) => (
              <Button
                key={priority}
                variant={priorityFilter === priority ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPriorityFilter(priority)}
              >
                {priority === 'all' ? 'Alle' : priorityConfig[priority].label}
              </Button>
            ))}
          </div>

          {/* View mode toggle for Roadmap tab */}
          {activeTab === 'roadmap' && (
            <div className="flex items-center gap-2">
              <Button
                variant={listViewMode === 'timeline' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setListViewMode('timeline')}
              >
                <Target className="mr-1 h-4 w-4" />
                Timeline
              </Button>
              <Button
                variant={listViewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setListViewMode('list')}
              >
                <List className="mr-1 h-4 w-4" />
                Liste
              </Button>
            </div>
          )}
        </div>

        {/* Kanban View */}
        {activeTab === 'kanban' && (
          <div className="grid gap-6 lg:grid-cols-4">
            {(['geplant', 'in_arbeit', 'im_test', 'abgeschlossen'] as ModuleStatus[]).map((status) => {
              const config = statusConfig[status]
              const StatusIcon = config.icon
              const items = itemsByStatus[status]

              return (
                <div key={status} className="space-y-4">
                  <div className={`flex items-center justify-between mb-3 pb-2 border-b-2 ${config.columnColor}`}>
                    <span className="font-medium text-gray-700">{config.label}</span>
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-600">
                      {items.length}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {items.map((item: RoadmapItem) => {
                      const isInTest = item.status === 'im_test'
                      const isCompleted = item.status === 'abgeschlossen'
                      const isSchulung = item.type === 'schulung'
                      const linkHref = isSchulung ? `/schulungen/${item.schulungId}` : `/roadmap/${item.id}`
                      const FormatIcon = item.format ? formatLabels[item.format]?.icon || GraduationCap : GraduationCap

                      return (
                        <Link key={item.id} href={linkHref} className="block">
                          <Card className={`cursor-pointer transition-all hover:shadow-md relative ${
                            isCompleted
                              ? 'bg-green-50/50 border-green-200'
                              : isSchulung
                              ? 'border-l-4 border-l-yellow-400 hover:border-primary-300'
                              : isInTest
                              ? 'border-2 border-purple-400 bg-purple-50/50 hover:border-purple-500'
                              : 'hover:border-primary-300'
                          }`}>
                            {/* Completed checkmark indicator */}
                            {isCompleted && (
                              <div className="absolute top-2 right-2">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              </div>
                            )}
                            <CardContent className="p-4">
                              {/* Schulung Badge */}
                              {isSchulung && (
                                <div className={`mb-3 -mx-4 -mt-4 rounded-t-lg px-4 py-2 ${
                                  isCompleted
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                    : 'bg-gradient-to-r from-yellow-500 to-amber-500'
                                }`}>
                                  <div className="flex items-center justify-center gap-2 text-sm font-semibold text-white">
                                    {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <GraduationCap className="h-4 w-4" />}
                                    {isCompleted ? 'Abgeschlossen' : 'Schulung'}
                                  </div>
                                </div>
                              )}

                              {/* Test Required Banner */}
                              {isInTest && !isSchulung && (
                                <div className="mb-3 -mx-4 -mt-4 rounded-t-lg bg-purple-600 px-4 py-2 text-center">
                                  <div className="flex items-center justify-center gap-2 text-sm font-semibold text-white">
                                    <FlaskConical className="h-4 w-4" />
                                    Ihr Test ist erforderlich
                                  </div>
                                </div>
                              )}

                              {/* Completed Banner for modules */}
                              {isCompleted && !isSchulung && (
                                <div className="mb-3 -mx-4 -mt-4 rounded-t-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-center">
                                  <div className="flex items-center justify-center gap-2 text-sm font-semibold text-white">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Abgeschlossen
                                  </div>
                                </div>
                              )}

                              <div className="mb-2 flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  {isSchulung && <FormatIcon className={`h-4 w-4 ${isCompleted ? 'text-green-600' : 'text-yellow-600'}`} />}
                                  <h4 className={`font-medium ${isCompleted ? 'text-green-800' : 'text-gray-900'}`}>{item.name}</h4>
                                </div>
                                {item.priority ? (
                                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityConfig[item.priority as keyof typeof priorityConfig]?.color || 'bg-gray-100 text-gray-700'}`}>
                                    {priorityConfig[item.priority as keyof typeof priorityConfig]?.label || item.priority}
                                  </span>
                                ) : item.points ? (
                                  <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700">
                                    {item.points} Punkte
                                  </span>
                                ) : null}
                              </div>
                              <p className="mb-3 text-sm text-gray-600 line-clamp-2">{item.description}</p>

                              {/* Assignee (modules only) */}
                              {!isSchulung && item.assignee && (
                                <div className="mb-3 flex items-center gap-1.5 text-xs text-gray-500">
                                  <User className="h-3 w-3" />
                                  <span>{item.assignee.name}</span>
                                </div>
                              )}

                              {/* Scheduled Date (schulungen) */}
                              {isSchulung && item.scheduledDate && (
                                <div className="mb-3 flex items-center gap-1.5 text-xs text-gray-500">
                                  <Calendar className="h-3 w-3" />
                                  <span>{formatDate(item.scheduledDate)}</span>
                                </div>
                              )}

                              {/* Acceptance Status Badge (modules only) */}
                              {!isSchulung && item.acceptanceStatus === 'ausstehend' && (
                                <div className="mb-3 flex items-center gap-1.5 rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700">
                                  <AlertTriangle className="h-3 w-3" />
                                  Bestätigung erforderlich
                                </div>
                              )}

                              {/* Progress Bar (modules only, not for geplant) */}
                              {!isSchulung && status !== 'geplant' && (
                                <div className="mb-3">
                                  <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                                    <span>Fortschritt</span>
                                    <span>{item.progress || 0}%</span>
                                  </div>
                                  <Progress value={item.progress || 0} size="sm" />
                                </div>
                              )}

                              {/* Live Status for completed modules only */}
                              {!isSchulung && item.status === 'abgeschlossen' && (
                                <div className="mb-3">
                                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${
                                    item.liveStatus === 'pausiert'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : item.liveStatus === 'deaktiviert'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-green-100 text-green-700'
                                  }`}>
                                    {item.liveStatus === 'pausiert' ? 'Pausiert' : item.liveStatus === 'deaktiviert' ? 'Deaktiviert' : 'Live'}
                                  </span>
                                </div>
                              )}

                              {item.targetDate && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Target className="h-3 w-3" />
                                  <span>{formatDate(item.targetDate)}</span>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </Link>
                      )
                    })}

                    {items.length === 0 && (
                      <div className="rounded-lg border-2 border-dashed border-gray-200 p-6 text-center">
                        <p className="text-sm text-gray-400">Keine Items</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* List View - shown in Roadmap tab when list mode selected */}
        {activeTab === 'roadmap' && listViewMode === 'list' && (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200">
                {filteredItems.map((item: RoadmapItem) => {
                  const config = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.geplant
                  const StatusIcon = config.icon
                  const isSchulung = item.type === 'schulung'
                  const isCompleted = item.status === 'abgeschlossen'
                  const linkHref = isSchulung ? `/schulungen/${item.schulungId}` : `/roadmap/${item.id}`
                  const FormatIcon = item.format ? formatLabels[item.format]?.icon || GraduationCap : GraduationCap

                  return (
                    <Link key={item.id} href={linkHref}>
                      <div className={`flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer ${
                        isCompleted
                          ? 'bg-green-50/50 border-l-4 border-l-green-400'
                          : isSchulung
                          ? 'border-l-4 border-l-yellow-400'
                          : ''
                      }`}>
                        <div className={`rounded-lg p-2 ${
                          isCompleted
                            ? 'bg-green-100'
                            : isSchulung
                            ? 'bg-yellow-100'
                            : config.color
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : isSchulung ? (
                            <GraduationCap className="h-5 w-5 text-yellow-600" />
                          ) : (
                            <StatusIcon className={`h-5 w-5 ${config.textColor}`} />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className={`font-medium ${isCompleted ? 'text-green-800' : 'text-gray-900'}`}>{item.name}</h4>
                            {/* Schulung Badge */}
                            {isSchulung && (
                              <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 flex items-center gap-1">
                                <FormatIcon className="h-3 w-3" />
                                Schulung
                              </span>
                            )}
                            {/* Priority Badge (modules only) */}
                            {!isSchulung && item.priority && (
                              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityConfig[item.priority as keyof typeof priorityConfig]?.color || 'bg-gray-100 text-gray-700'}`}>
                                {priorityConfig[item.priority as keyof typeof priorityConfig]?.label || item.priority}
                              </span>
                            )}
                            {/* Points Badge (schulungen) */}
                            {isSchulung && item.points && (
                              <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700">
                                {item.points} Punkte
                              </span>
                            )}
                            <Badge variant={item.status === 'abgeschlossen' ? 'success' : item.status === 'in_arbeit' ? 'default' : 'secondary'}>
                              {config.label}
                            </Badge>
                            {/* Acceptance Status (modules only) */}
                            {!isSchulung && item.acceptanceStatus === 'ausstehend' && (
                              <Badge variant="warning">
                                <AlertTriangle className="mr-1 h-3 w-3" />
                                Bestätigung erforderlich
                              </Badge>
                            )}
                            {/* Live Status Badge for completed modules */}
                            {!isSchulung && item.status === 'abgeschlossen' && (
                              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                item.liveStatus === 'pausiert'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : item.liveStatus === 'deaktiviert'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {item.liveStatus === 'pausiert' ? 'Pausiert' : item.liveStatus === 'deaktiviert' ? 'Deaktiviert' : 'Live'}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                          {/* Assignee (modules only) */}
                          {!isSchulung && item.assignee && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                              <User className="h-3 w-3" />
                              <span>{item.assignee.name}</span>
                            </div>
                          )}
                          {/* Scheduled Date (schulungen) */}
                          {isSchulung && item.scheduledDate && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(item.scheduledDate)}</span>
                            </div>
                          )}
                        </div>

                        {/* Progress Bar (modules only) */}
                        {!isSchulung && (
                          <div className="w-32">
                            <Progress value={item.progress || 0} size="sm" showLabel />
                          </div>
                        )}

                        {/* Format Badge (schulungen) */}
                        {isSchulung && item.format && (
                          <div className="w-24">
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                              item.format === 'live' ? 'bg-blue-100 text-blue-700' :
                              item.format === 'self_learning' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                            }`}>
                              <FormatIcon className="h-3 w-3" />
                              {item.format === 'live' ? 'Live' : item.format === 'self_learning' ? 'Self-Learning' : 'Hybrid'}
                            </span>
                          </div>
                        )}

                        {item.targetDate && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Target className="h-4 w-4" />
                            <span>{formatDate(item.targetDate)}</span>
                          </div>
                        )}

                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeline - shown in Roadmap tab when timeline mode selected */}
        {activeTab === 'roadmap' && listViewMode === 'timeline' && (
        <Card className="mt-0">
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const timelineItems = roadmapItems.filter((item: RoadmapItem) => item.targetDate || item.scheduledDate)
              if (timelineItems.length === 0) {
                return (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Keine Termine in der Timeline</p>
                    <p className="text-sm text-gray-400 mt-1">Items mit Zieldatum werden hier angezeigt</p>
                  </div>
                )
              }
              return (
                <div className="relative">
                  <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200" />
                  <div>
                    {timelineItems
                      .sort((a: RoadmapItem, b: RoadmapItem) => {
                        const dateA = new Date(a.scheduledDate || a.targetDate || '')
                        const dateB = new Date(b.scheduledDate || b.targetDate || '')
                        return dateB.getTime() - dateA.getTime()
                      })
                      .map((item: RoadmapItem) => {
                        const config = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.geplant
                        const StatusIcon = config.icon
                        const date = item.scheduledDate || item.targetDate
                        const isSchulung = item.type === 'schulung'
                        const isCompleted = item.status === 'abgeschlossen'
                        const linkHref = isSchulung ? `/schulungen/${item.schulungId}` : `/roadmap/${item.id}`
                        const FormatIcon = item.format ? formatLabels[item.format]?.icon || GraduationCap : GraduationCap

                        return (
                          <Link key={item.id} href={linkHref} className="block mb-3">
                            <div className="relative flex gap-4 pl-10 cursor-pointer group">
                              <div className={`absolute left-2.5 rounded-full p-1 ${
                                isCompleted
                                  ? 'bg-green-100'
                                  : isSchulung
                                  ? 'bg-yellow-100'
                                  : config.color
                              }`}>
                                {isCompleted ? (
                                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                                ) : isSchulung ? (
                                  <GraduationCap className="h-3 w-3 text-yellow-600" />
                                ) : (
                                  <StatusIcon className={`h-3 w-3 ${config.textColor}`} />
                                )}
                              </div>
                              <div className={`flex-1 rounded-lg border p-4 transition-all group-hover:shadow-md ${
                                isCompleted
                                  ? 'bg-green-50/50 border-l-4 border-l-green-400 border-green-200 group-hover:border-green-300'
                                  : isSchulung
                                  ? 'bg-white border-l-4 border-l-yellow-400 border-gray-200 group-hover:border-yellow-300'
                                  : 'bg-white border-gray-200 group-hover:border-primary-300'
                              }`}>
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className={`font-medium ${isCompleted ? 'text-green-800' : 'text-gray-900'}`}>{item.name}</h4>
                                    {/* Completed Badge */}
                                    {isCompleted && (
                                      <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Abgeschlossen
                                      </span>
                                    )}
                                    {/* Schulung Badge */}
                                    {isSchulung && !isCompleted && (
                                      <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                                        <FormatIcon className="h-3 w-3" />
                                        Schulung
                                      </span>
                                    )}
                                    {/* Acceptance Status (modules only) */}
                                    {!isSchulung && item.acceptanceStatus === 'ausstehend' && (
                                      <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                                        <AlertTriangle className="h-3 w-3" />
                                        Bestätigung
                                      </span>
                                    )}
                                    {/* Live Status Badge for completed modules */}
                                    {!isSchulung && item.status === 'abgeschlossen' && (
                                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                        item.liveStatus === 'pausiert'
                                          ? 'bg-yellow-100 text-yellow-700'
                                          : item.liveStatus === 'deaktiviert'
                                          ? 'bg-red-100 text-red-700'
                                          : 'bg-green-100 text-green-700'
                                      }`}>
                                        {item.liveStatus === 'pausiert' ? 'Pausiert' : item.liveStatus === 'deaktiviert' ? 'Deaktiviert' : 'Live'}
                                      </span>
                                    )}
                                    {/* Progress percentage (modules only, not for geplant) */}
                                    {!isSchulung && item.status !== 'geplant' && item.status !== 'abgeschlossen' && (
                                      <span className="text-xs text-gray-500">
                                        {item.progress || 0}%
                                      </span>
                                    )}
                                    {/* Points (schulungen) */}
                                    {isSchulung && item.points && (
                                      <span className="text-xs font-medium text-primary-600">
                                        {item.points} Punkte
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-sm text-gray-500">{date && formatDate(date)}</span>
                                </div>
                                <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                              </div>
                            </div>
                          </Link>
                        )
                      })}
                  </div>
                </div>
              )
            })()}
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  )
}
