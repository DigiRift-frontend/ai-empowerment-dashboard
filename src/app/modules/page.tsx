'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { mockModules, mockModuleHistory } from '@/lib/mock-data'
import { formatDate, formatNumber } from '@/lib/utils'
import {
  Cpu,
  Settings,
  Zap,
  Wrench,
  Filter,
  Clock,
  ChevronRight,
  Calendar,
  TrendingUp,
} from 'lucide-react'
import { Module, ModuleHistoryEntry, ModuleStatus } from '@/types'

export default function ModulesPage() {
  const [filter, setFilter] = useState<ModuleStatus | 'all'>('all')
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)

  const filteredModules = filter === 'all'
    ? mockModules
    : mockModules.filter((m) => m.status === filter)

  const statusConfig = {
    setup: { label: 'Setup', variant: 'warning' as const, icon: Settings, color: 'bg-yellow-500' },
    live: { label: 'Live', variant: 'success' as const, icon: Zap, color: 'bg-green-500' },
    optimierung: { label: 'Optimierung', variant: 'default' as const, icon: Wrench, color: 'bg-blue-500' },
  }

  const totalMaintenancePoints = mockModules
    .filter((m) => m.status === 'live' || m.status === 'optimierung')
    .reduce((sum, m) => sum + m.monthlyMaintenancePoints, 0)

  const getModuleHistory = (moduleId: string): ModuleHistoryEntry[] => {
    return mockModuleHistory.filter((h) => h.moduleId === moduleId)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Module"
        subtitle="Übersicht aller KI-Module und deren Status"
      />

      <div className="p-6">
        {/* Summary Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Gesamt Module</p>
                  <p className="text-2xl font-bold">{mockModules.length}</p>
                </div>
                <div className="rounded-lg bg-primary-100 p-3">
                  <Cpu className="h-6 w-6 text-primary-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Live</p>
                  <p className="text-2xl font-bold text-green-600">
                    {mockModules.filter((m) => m.status === 'live').length}
                  </p>
                </div>
                <div className="rounded-lg bg-green-100 p-3">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">In Optimierung</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {mockModules.filter((m) => m.status === 'optimierung').length}
                  </p>
                </div>
                <div className="rounded-lg bg-blue-100 p-3">
                  <Wrench className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Wartung/Monat</p>
                  <p className="text-2xl font-bold">{totalMaintenancePoints} Pkt.</p>
                </div>
                <div className="rounded-lg bg-yellow-100 p-3">
                  <Settings className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="mb-6 flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-500">Filter:</span>
          <div className="flex gap-2">
            {(['all', 'live', 'optimierung', 'setup'] as const).map((status) => (
              <Button
                key={status}
                variant={filter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(status)}
              >
                {status === 'all' ? 'Alle' : statusConfig[status].label}
              </Button>
            ))}
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {filteredModules.map((module) => {
              const config = statusConfig[module.status]
              const StatusIcon = config.icon
              const history = getModuleHistory(module.id)

              return (
                <Card
                  key={module.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedModule?.id === module.id ? 'border-primary-500 ring-2 ring-primary-100' : ''
                  }`}
                  onClick={() => setSelectedModule(module)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`rounded-lg p-3 ${config.color}`}>
                          <Cpu className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">{module.name}</h3>
                            <Badge variant={config.variant}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {config.label}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{module.description}</p>

                          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>Erstellt: {formatDate(module.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>Aktualisiert: {formatDate(module.updatedAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-500">Wartung/Monat</p>
                        <p className="text-lg font-bold text-gray-900">{module.monthlyMaintenancePoints} Pkt.</p>
                      </div>
                    </div>

                    {/* History Preview */}
                    {history.length > 0 && (
                      <div className="mt-4 border-t border-gray-100 pt-4">
                        <p className="mb-2 text-xs font-medium uppercase text-gray-400">Letzte Aktivität</p>
                        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">{history[0].description}</span>
                          </div>
                          <span className="text-xs text-gray-500">{formatDate(history[0].date)}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Module Details Sidebar */}
          <div className="space-y-6">
            {selectedModule ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Modul Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium">{selectedModule.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Beschreibung</p>
                        <p className="text-sm">{selectedModule.description}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <Badge variant={statusConfig[selectedModule.status].variant} className="mt-1">
                          {statusConfig[selectedModule.status].label}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Monatliche Wartung</p>
                        <p className="font-medium">{selectedModule.monthlyMaintenancePoints} Punkte</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Änderungshistorie</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getModuleHistory(selectedModule.id).map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-start gap-3 border-l-2 border-primary-200 pl-3"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">{entry.action}</p>
                            <p className="text-sm text-gray-600">{entry.description}</p>
                            <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                              <span>{formatDate(entry.date)}</span>
                              {entry.pointsUsed && (
                                <span className="rounded bg-gray-100 px-1.5 py-0.5">
                                  {entry.pointsUsed} Pkt.
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Cpu className="mb-4 h-12 w-12 text-gray-300" />
                  <p className="text-gray-500">Wählen Sie ein Modul aus, um Details anzuzeigen</p>
                </CardContent>
              </Card>
            )}

            {/* Maintenance Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Wartungsübersicht</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockModules
                    .filter((m) => m.monthlyMaintenancePoints > 0)
                    .map((module) => (
                      <div key={module.id} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{module.name}</span>
                        <span className="font-medium">{module.monthlyMaintenancePoints} Pkt.</span>
                      </div>
                    ))}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">Gesamt</span>
                      <span className="text-lg font-bold text-primary-600">{totalMaintenancePoints} Pkt.</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
