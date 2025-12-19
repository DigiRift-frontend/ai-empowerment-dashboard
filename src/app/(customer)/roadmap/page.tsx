'use client'

import { useState, useMemo } from 'react'
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
} from 'lucide-react'
import { ModuleStatus } from '@/types'

export default function RoadmapPage() {
  const { customerId } = useAuth()
  const { customer, isLoading } = useCustomer(customerId || '')
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'hoch' | 'mittel' | 'niedrig'>('all')

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

  // Get roadmap items from modules
  const roadmapItems = useMemo(() => {
    if (!customer?.modules) return []
    return customer.modules
      .filter((m: any) => m.showInRoadmap !== false)
      .sort((a: any, b: any) => (a.roadmapOrder || 0) - (b.roadmapOrder || 0))
  }, [customer?.modules])

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


        {/* Controls */}
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

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportRoadmapPDF}>
              <Download className="mr-1 h-4 w-4" />
              Roadmap exportieren
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid className="mr-1 h-4 w-4" />
              Kanban
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="mr-1 h-4 w-4" />
              Liste
            </Button>
          </div>
        </div>

        {/* Kanban View */}
        {viewMode === 'kanban' && (
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

                  <div className="space-y-3">
                    {items.map((item: any) => {
                      const isInTest = item.status === 'im_test'

                      return (
                        <Link key={item.id} href={`/roadmap/${item.id}`}>
                          <Card className={`cursor-pointer transition-all hover:shadow-md ${
                            isInTest
                              ? 'border-2 border-purple-400 bg-purple-50/50 hover:border-purple-500'
                              : 'hover:border-primary-300'
                          }`}>
                            <CardContent className="p-4">
                              {/* Test Required Banner */}
                              {isInTest && (
                                <div className="mb-3 -mx-4 -mt-4 rounded-t-lg bg-purple-600 px-4 py-2 text-center">
                                  <div className="flex items-center justify-center gap-2 text-sm font-semibold text-white">
                                    <FlaskConical className="h-4 w-4" />
                                    Ihr Test ist erforderlich
                                  </div>
                                </div>
                              )}

                              <div className="mb-2 flex items-start justify-between">
                                <h4 className="font-medium text-gray-900">{item.name}</h4>
                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityConfig[item.priority as keyof typeof priorityConfig]?.color || 'bg-gray-100 text-gray-700'}`}>
                                  {priorityConfig[item.priority as keyof typeof priorityConfig]?.label || item.priority}
                                </span>
                              </div>
                              <p className="mb-3 text-sm text-gray-600 line-clamp-2">{item.description}</p>

                              {/* Assignee */}
                              {item.assignee && (
                                <div className="mb-3 flex items-center gap-1.5 text-xs text-gray-500">
                                  <User className="h-3 w-3" />
                                  <span>{item.assignee.name}</span>
                                </div>
                              )}

                              {/* Acceptance Status Badge */}
                              {item.acceptanceStatus === 'ausstehend' && (
                                <div className="mb-3 flex items-center gap-1.5 rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700">
                                  <AlertTriangle className="h-3 w-3" />
                                  Bestätigung erforderlich
                                </div>
                              )}

                              {/* Progress Bar (not for geplant) */}
                              {status !== 'geplant' && (
                                <div className="mb-3">
                                  <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                                    <span>Fortschritt</span>
                                    <span>{item.progress || 0}%</span>
                                  </div>
                                  <Progress value={item.progress || 0} size="sm" />
                                </div>
                              )}

                              {/* Live Status for completed modules */}
                              {item.status === 'abgeschlossen' && (
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

        {/* List View */}
        {viewMode === 'list' && (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200">
                {filteredItems.map((item: any) => {
                  const config = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.geplant
                  const StatusIcon = config.icon

                  return (
                    <Link key={item.id} href={`/roadmap/${item.id}`}>
                      <div className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer">
                        <div className={`rounded-lg p-2 ${config.color}`}>
                          <StatusIcon className={`h-5 w-5 ${config.textColor}`} />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityConfig[item.priority as keyof typeof priorityConfig]?.color || 'bg-gray-100 text-gray-700'}`}>
                              {priorityConfig[item.priority as keyof typeof priorityConfig]?.label || item.priority}
                            </span>
                            <Badge variant={item.status === 'abgeschlossen' ? 'success' : item.status === 'in_arbeit' ? 'default' : 'secondary'}>
                              {config.label}
                            </Badge>
                            {item.acceptanceStatus === 'ausstehend' && (
                              <Badge variant="warning">
                                <AlertTriangle className="mr-1 h-3 w-3" />
                                Bestätigung erforderlich
                              </Badge>
                            )}
                            {/* Live Status Badge for completed modules */}
                            {item.status === 'abgeschlossen' && (
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
                          {item.assignee && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                              <User className="h-3 w-3" />
                              <span>{item.assignee.name}</span>
                            </div>
                          )}
                        </div>

                        {/* Progress Bar */}
                        <div className="w-32">
                          <Progress value={item.progress || 0} size="sm" showLabel />
                        </div>

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

        {/* Timeline */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200" />

              <div className="space-y-6">
                {roadmapItems
                  .filter((item: any) => item.targetDate || item.completedDate)
                  .sort((a: any, b: any) => {
                    const dateA = new Date(a.completedDate || a.targetDate || '')
                    const dateB = new Date(b.completedDate || b.targetDate || '')
                    return dateB.getTime() - dateA.getTime()
                  })
                  .map((item: any) => {
                    const config = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.geplant
                    const StatusIcon = config.icon
                    const date = item.completedDate || item.targetDate

                    return (
                      <Link key={item.id} href={`/roadmap/${item.id}`}>
                        <div className="relative flex gap-4 pl-10 cursor-pointer group">
                          <div className={`absolute left-2.5 rounded-full p-1 ${config.color}`}>
                            <StatusIcon className={`h-3 w-3 ${config.textColor}`} />
                          </div>
                          <div className="flex-1 rounded-lg border border-gray-200 bg-white p-4 transition-all group-hover:shadow-md group-hover:border-primary-300">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-900">{item.name}</h4>
                                {item.acceptanceStatus === 'ausstehend' && (
                                  <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                                    <AlertTriangle className="h-3 w-3" />
                                    Bestätigung
                                  </span>
                                )}
                                {/* Live Status Badge for completed modules */}
                                {item.status === 'abgeschlossen' && (
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
                                {/* Progress percentage (no bar) */}
                                {item.status !== 'geplant' && (
                                  <span className="text-xs text-gray-500">
                                    {item.progress || 0}%
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
