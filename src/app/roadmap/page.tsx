'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { mockRoadmapItems } from '@/lib/mock-data'
import { formatDate } from '@/lib/utils'
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

  const totalProgress = Math.round(
    mockRoadmapItems.reduce((sum, item) => sum + item.progress, 0) / mockRoadmapItems.length
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Roadmap"
        subtitle="Ihre KI-Roadmap und Fortschritt"
      />

      <div className="p-6">
        {/* Summary Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
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
                    {items.map((item) => (
                      <Card key={item.id} className="transition-all hover:shadow-md">
                        <CardContent className="p-4">
                          <div className="mb-2 flex items-start justify-between">
                            <h4 className="font-medium text-gray-900">{item.title}</h4>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityConfig[item.priority].color}`}>
                              {priorityConfig[item.priority].label}
                            </span>
                          </div>
                          <p className="mb-3 text-sm text-gray-600 line-clamp-2">{item.description}</p>

                          {status !== 'geplant' && (
                            <div className="mb-3">
                              <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                                <span>Fortschritt</span>
                                <span>{item.progress}%</span>
                              </div>
                              <Progress value={item.progress} size="sm" />
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            {item.targetDate && (
                              <div className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                <span>{formatDate(item.targetDate)}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}

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
                    <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
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
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                      </div>

                      <div className="w-32">
                        <Progress value={item.progress} size="sm" showLabel />
                      </div>

                      <div className="text-right text-sm text-gray-500">
                        {item.targetDate && (
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            <span>{formatDate(item.targetDate)}</span>
                          </div>
                        )}
                      </div>

                      <Button variant="ghost" size="icon">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
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
                      <div key={item.id} className="relative flex gap-4 pl-10">
                        <div className={`absolute left-2.5 rounded-full p-1 ${config.color}`}>
                          <StatusIcon className={`h-3 w-3 ${config.textColor}`} />
                        </div>
                        <div className="flex-1 rounded-lg border border-gray-200 bg-white p-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">{item.title}</h4>
                            <span className="text-sm text-gray-500">{date && formatDate(date)}</span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                          {item.status !== 'geplant' && (
                            <Progress value={item.progress} size="sm" className="mt-2" />
                          )}
                        </div>
                      </div>
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
