'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCustomer } from '@/hooks/use-customers'
import { useAuth } from '@/hooks/use-auth'
import { formatDate } from '@/lib/utils'
import {
  Cpu,
  Settings,
  Zap,
  Wrench,
  Filter,
  Clock,
  Calendar,
  User,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import { ModuleStatus } from '@/types'

export default function ModulesPage() {
  const { customerId } = useAuth()
  const { customer, isLoading } = useCustomer(customerId || '')
  const [filter, setFilter] = useState<ModuleStatus | 'all'>('all')
  const [selectedModule, setSelectedModule] = useState<any | null>(null)

  const statusConfig = {
    geplant: { label: 'Geplant', variant: 'secondary' as const, icon: Settings, color: 'bg-gray-500' },
    in_arbeit: { label: 'In Arbeit', variant: 'warning' as const, icon: Wrench, color: 'bg-blue-500' },
    im_test: { label: 'Im Test', variant: 'default' as const, icon: Settings, color: 'bg-yellow-500' },
    abgeschlossen: { label: 'Live', variant: 'success' as const, icon: Zap, color: 'bg-green-500' },
  }

  if (isLoading || !customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  const modules = customer.modules || []

  const filteredModules = filter === 'all'
    ? modules
    : modules.filter((m: any) => m.status === filter)

  const totalMaintenancePoints = modules
    .filter((m: any) => m.status === 'abgeschlossen')
    .reduce((sum: number, m: any) => sum + m.monthlyMaintenancePoints, 0)

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
                  <p className="text-2xl font-bold">{modules.length}</p>
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
                    {modules.filter((m: any) => m.status === 'abgeschlossen').length}
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
                  <p className="text-sm text-gray-500">In Arbeit</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {modules.filter((m: any) => m.status === 'in_arbeit' || m.status === 'im_test').length}
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
            {(['all', 'abgeschlossen', 'in_arbeit', 'im_test', 'geplant'] as const).map((status) => (
              <Button
                key={status}
                variant={filter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(status)}
              >
                {status === 'all' ? 'Alle' : statusConfig[status as keyof typeof statusConfig]?.label || status}
              </Button>
            ))}
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {filteredModules.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Cpu className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Keine Module in dieser Kategorie</p>
                </CardContent>
              </Card>
            ) : (
              filteredModules.map((mod: any) => {
                const config = statusConfig[mod.status as keyof typeof statusConfig] || statusConfig.geplant
                const StatusIcon = config.icon

                return (
                  <Card
                    key={mod.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedModule?.id === mod.id ? 'border-primary-500 ring-2 ring-primary-100' : ''
                    }`}
                    onClick={() => setSelectedModule(mod)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`rounded-lg p-3 ${config.color}`}>
                            <Cpu className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold text-gray-900">{mod.name}</h3>
                              <Badge variant={config.variant}>
                                <StatusIcon className="mr-1 h-3 w-3" />
                                {config.label}
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-gray-600">{mod.description}</p>

                            {/* Assignee Display */}
                            <div className="mt-3 flex items-center gap-2">
                              <div className="flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                                <User className="h-3 w-3" />
                                <span>{mod.assignee?.name || 'Nicht zugewiesen'}</span>
                              </div>
                              {mod.softwareUrl && (
                                <a
                                  href={mod.softwareUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center gap-1.5 rounded-full bg-primary-100 px-2.5 py-1 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-200"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  <span>Software öffnen</span>
                                </a>
                              )}
                            </div>

                            <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>Erstellt: {formatDate(mod.createdAt)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>Aktualisiert: {formatDate(mod.updatedAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-gray-500">Wartung/Monat</p>
                          <p className="text-lg font-bold text-gray-900">{mod.monthlyMaintenancePoints} Pkt.</p>
                        </div>
                      </div>

                      {/* History Preview */}
                      {mod.historyEntries && mod.historyEntries.length > 0 && (
                        <div className="mt-4 border-t border-gray-100 pt-4">
                          <p className="mb-2 text-xs font-medium uppercase text-gray-400">Letzte Aktivität</p>
                          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">{mod.historyEntries[0].description}</span>
                            </div>
                            <span className="text-xs text-gray-500">{formatDate(mod.historyEntries[0].date)}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })
            )}
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
                        <Badge
                          variant={statusConfig[selectedModule.status as keyof typeof statusConfig]?.variant || 'secondary'}
                          className="mt-1"
                        >
                          {statusConfig[selectedModule.status as keyof typeof statusConfig]?.label || selectedModule.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Monatliche Wartung</p>
                        <p className="font-medium">{selectedModule.monthlyMaintenancePoints} Punkte</p>
                      </div>
                      {selectedModule.softwareUrl && (
                        <div>
                          <p className="text-sm text-gray-500">Software</p>
                          <a
                            href={selectedModule.softwareUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-100"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Software öffnen
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Responsible Person Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-gray-400" />
                      Verantwortlicher
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                        <User className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {selectedModule.assignee?.name || 'Nicht zugewiesen'}
                        </p>
                        {selectedModule.assignee && (
                          <p className="text-xs text-gray-500">
                            {selectedModule.assignee.role}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* History */}
                {selectedModule.historyEntries && selectedModule.historyEntries.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Änderungshistorie</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedModule.historyEntries.map((entry: any) => (
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
                )}
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
                  {modules
                    .filter((m: any) => m.monthlyMaintenancePoints > 0)
                    .map((mod: any) => (
                      <div key={mod.id} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{mod.name}</span>
                        <span className="font-medium">{mod.monthlyMaintenancePoints} Pkt.</span>
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
