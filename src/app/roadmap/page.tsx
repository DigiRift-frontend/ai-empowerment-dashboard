'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { mockRoadmapItems, mockCustomer, getPendingAcceptanceCount } from '@/lib/mock-data'
import { formatDate, formatNumber } from '@/lib/utils'
import {
  Map,
  Calendar,
  Target,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  LayoutGrid,
  List,
  AlertTriangle,
  FileCheck,
  Download,
  Coins,
} from 'lucide-react'
import { RoadmapStatus } from '@/types'

export default function RoadmapPage() {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'hoch' | 'mittel' | 'niedrig'>('all')

  const filteredItems = priorityFilter === 'all'
    ? mockRoadmapItems
    : mockRoadmapItems.filter((item) => item.priority === priorityFilter)

  const itemsByStatus = {
    geplant: filteredItems.filter((item) => item.status === 'geplant'),
    'in-arbeit': filteredItems.filter((item) => item.status === 'in-arbeit'),
    abgeschlossen: filteredItems.filter((item) => item.status === 'abgeschlossen'),
  }

  const statusConfig = {
    geplant: { label: 'Geplant', color: 'bg-gray-100', textColor: 'text-gray-600', icon: Calendar },
    'in-arbeit': { label: 'In Arbeit', color: 'bg-blue-100', textColor: 'text-blue-600', icon: Clock },
    abgeschlossen: { label: 'Abgeschlossen', color: 'bg-green-100', textColor: 'text-green-600', icon: CheckCircle2 },
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

  const totalProgress = Math.round(
    mockRoadmapItems.reduce((sum, item) => sum + item.progress, 0) / mockRoadmapItems.length
  )

  const pendingCount = getPendingAcceptanceCount()

  const exportRoadmapPDF = () => {
    const content = `
AI EMPOWERMENT PROGRAMM - ROADMAP ÜBERSICHT
============================================

Kunde: ${mockCustomer.companyName}
Erstellt: ${formatDate(new Date().toISOString())}
Gesamtfortschritt: ${totalProgress}%

${'='.repeat(50)}

${mockRoadmapItems.map((item) => `
PROJEKT: ${item.title}
${'-'.repeat(40)}
Beschreibung: ${item.description}
Status: ${statusConfig[item.status].label}
Priorität: ${priorityConfig[item.priority].label}
Fortschritt: ${item.progress}%
${item.startDate ? `Startdatum: ${formatDate(item.startDate)}` : ''}
${item.targetDate ? `Zieldatum: ${formatDate(item.targetDate)}` : ''}
Geschätzte Punkte: ${item.totalEstimatedPoints || 0}
Akzeptanzstatus: ${item.acceptanceStatus === 'akzeptiert' ? 'Akzeptiert' : 'Ausstehend'}

Akzeptanzkriterien:
${item.acceptanceCriteria?.map((c, i) => `  ${i + 1}. ${c.description} (${c.estimatedPoints} Pkt.)`).join('\n') || '  Keine definiert'}

`).join('\n')}
    `.trim()

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Roadmap_${mockCustomer.companyName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`
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

        {/* Summary Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Gesamtfortschritt</p>
                  <p className="text-2xl font-bold">{totalProgress}%</p>
                </div>
                <div className="rounded-lg bg-primary-100 p-3">
                  <Map className="h-6 w-6 text-primary-600" />
                </div>
              </div>
              <Progress value={totalProgress} size="sm" className="mt-3" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Geplant</p>
                  <p className="text-2xl font-bold text-gray-600">{itemsByStatus.geplant.length}</p>
                </div>
                <div className="rounded-lg bg-gray-100 p-3">
                  <Calendar className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">In Arbeit</p>
                  <p className="text-2xl font-bold text-blue-600">{itemsByStatus['in-arbeit'].length}</p>
                </div>
                <div className="rounded-lg bg-blue-100 p-3">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Abgeschlossen</p>
                  <p className="text-2xl font-bold text-green-600">{itemsByStatus.abgeschlossen.length}</p>
                </div>
                <div className="rounded-lg bg-green-100 p-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Ausstehend</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                </div>
                <div className="rounded-lg bg-yellow-100 p-3">
                  <FileCheck className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
          <div className="grid gap-6 lg:grid-cols-3">
            {(['geplant', 'in-arbeit', 'abgeschlossen'] as RoadmapStatus[]).map((status) => {
              const config = statusConfig[status]
              const StatusIcon = config.icon
              const items = itemsByStatus[status]

              return (
                <div key={status} className="space-y-4">
                  <div className={`flex items-center gap-2 rounded-lg p-3 ${config.color}`}>
                    <StatusIcon className={`h-5 w-5 ${config.textColor}`} />
                    <h3 className={`font-semibold ${config.textColor}`}>{config.label}</h3>
                    <Badge variant="secondary" className="ml-auto">
                      {items.length}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {items.map((item) => {
                      const acceptanceInfo = item.acceptanceStatus ? acceptanceConfig[item.acceptanceStatus] : null

                      return (
                        <Link key={item.id} href={`/roadmap/${item.id}`}>
                          <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary-300">
                            <CardContent className="p-4">
                              <div className="mb-2 flex items-start justify-between">
                                <h4 className="font-medium text-gray-900">{item.title}</h4>
                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityConfig[item.priority].color}`}>
                                  {priorityConfig[item.priority].label}
                                </span>
                              </div>
                              <p className="mb-3 text-sm text-gray-600 line-clamp-2">{item.description}</p>

                              {/* Acceptance Status Badge */}
                              {item.acceptanceStatus === 'ausstehend' && (
                                <div className="mb-3 flex items-center gap-1.5 rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700">
                                  <AlertTriangle className="h-3 w-3" />
                                  Bestätigung erforderlich
                                </div>
                              )}

                              {status !== 'geplant' && (
                                <div className="mb-3">
                                  <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                                    <span>Fortschritt</span>
                                    <span>{item.progress}%</span>
                                  </div>
                                  <Progress value={item.progress} size="sm" />
                                </div>
                              )}

                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center gap-2">
                                  {item.targetDate && (
                                    <div className="flex items-center gap-1">
                                      <Target className="h-3 w-3" />
                                      <span>{formatDate(item.targetDate)}</span>
                                    </div>
                                  )}
                                </div>
                                {item.totalEstimatedPoints && (
                                  <div className="flex items-center gap-1">
                                    <Coins className="h-3 w-3" />
                                    <span>{item.totalEstimatedPoints} Pkt.</span>
                                  </div>
                                )}
                              </div>
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
                {filteredItems.map((item) => {
                  const config = statusConfig[item.status]
                  const StatusIcon = config.icon

                  return (
                    <Link key={item.id} href={`/roadmap/${item.id}`}>
                      <div className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer">
                        <div className={`rounded-lg p-2 ${config.color}`}>
                          <StatusIcon className={`h-5 w-5 ${config.textColor}`} />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{item.title}</h4>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityConfig[item.priority].color}`}>
                              {priorityConfig[item.priority].label}
                            </span>
                            <Badge variant={item.status === 'abgeschlossen' ? 'success' : item.status === 'in-arbeit' ? 'default' : 'secondary'}>
                              {config.label}
                            </Badge>
                            {item.acceptanceStatus === 'ausstehend' && (
                              <Badge variant="warning">
                                <AlertTriangle className="mr-1 h-3 w-3" />
                                Bestätigung erforderlich
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                        </div>

                        <div className="w-32">
                          <Progress value={item.progress} size="sm" showLabel />
                        </div>

                        <div className="text-right text-sm text-gray-500">
                          {item.totalEstimatedPoints && (
                            <div className="flex items-center gap-1 justify-end mb-1">
                              <Coins className="h-4 w-4" />
                              <span>{item.totalEstimatedPoints} Pkt.</span>
                            </div>
                          )}
                          {item.targetDate && (
                            <div className="flex items-center gap-1 justify-end">
                              <Target className="h-4 w-4" />
                              <span>{formatDate(item.targetDate)}</span>
                            </div>
                          )}
                        </div>

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
                {mockRoadmapItems
                  .filter((item) => item.targetDate || item.completedDate)
                  .sort((a, b) => {
                    const dateA = new Date(a.completedDate || a.targetDate || '')
                    const dateB = new Date(b.completedDate || b.targetDate || '')
                    return dateB.getTime() - dateA.getTime()
                  })
                  .map((item) => {
                    const config = statusConfig[item.status]
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
                                <h4 className="font-medium text-gray-900">{item.title}</h4>
                                {item.acceptanceStatus === 'ausstehend' && (
                                  <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                                    <AlertTriangle className="h-3 w-3" />
                                    Bestätigung
                                  </span>
                                )}
                              </div>
                              <span className="text-sm text-gray-500">{date && formatDate(date)}</span>
                            </div>
                            <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                            {item.status !== 'geplant' && (
                              <Progress value={item.progress} size="sm" className="mt-2" />
                            )}
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
