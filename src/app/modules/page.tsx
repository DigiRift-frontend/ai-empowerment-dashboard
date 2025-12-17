'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { mockModules, mockModuleHistory, mockTeamMembers, getTeamMemberById } from '@/lib/mock-data'
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
  ChevronDown,
  Check,
  UserPlus,
  ExternalLink,
} from 'lucide-react'
import { Module, ModuleHistoryEntry, ModuleStatus } from '@/types'

export default function ModulesPage() {
  const [filter, setFilter] = useState<ModuleStatus | 'all'>('all')
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [editingAssignee, setEditingAssignee] = useState<string | null>(null)
  const [modules, setModules] = useState(mockModules)

  const filteredModules = filter === 'all'
    ? modules
    : modules.filter((m) => m.status === filter)

  const statusConfig = {
    setup: { label: 'Setup', variant: 'warning' as const, icon: Settings, color: 'bg-yellow-500' },
    live: { label: 'Live', variant: 'success' as const, icon: Zap, color: 'bg-green-500' },
    optimierung: { label: 'Optimierung', variant: 'default' as const, icon: Wrench, color: 'bg-blue-500' },
  }

  const totalMaintenancePoints = modules
    .filter((m) => m.status === 'live' || m.status === 'optimierung')
    .reduce((sum, m) => sum + m.monthlyMaintenancePoints, 0)

  const getModuleHistory = (moduleId: string): ModuleHistoryEntry[] => {
    return mockModuleHistory.filter((h) => h.moduleId === moduleId)
  }

  const handleAssigneeChange = (moduleId: string, assigneeId: string | undefined) => {
    setModules(modules.map(m =>
      m.id === moduleId ? { ...m, assigneeId } : m
    ))
    if (selectedModule?.id === moduleId) {
      setSelectedModule({ ...selectedModule, assigneeId })
    }
    setEditingAssignee(null)
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
                    {modules.filter((m) => m.status === 'live').length}
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
                    {modules.filter((m) => m.status === 'optimierung').length}
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
              const assignee = module.assigneeId ? getTeamMemberById(module.assigneeId) : null

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

                          {/* Assignee Display */}
                          <div className="mt-3 flex items-center gap-2">
                            <div className="flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                              <User className="h-3 w-3" />
                              <span>{assignee ? assignee.name : 'Nicht zugewiesen'}</span>
                            </div>
                            {module.softwareUrl && (
                              <a
                                href={module.softwareUrl}
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
                    <div className="relative">
                      <button
                        onClick={() => setEditingAssignee(editingAssignee === selectedModule.id ? null : selectedModule.id)}
                        className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
                            <User className="h-4 w-4 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {selectedModule.assigneeId
                                ? getTeamMemberById(selectedModule.assigneeId)?.name
                                : 'Nicht zugewiesen'}
                            </p>
                            {selectedModule.assigneeId && (
                              <p className="text-xs text-gray-500">
                                {getTeamMemberById(selectedModule.assigneeId)?.role}
                              </p>
                            )}
                          </div>
                        </div>
                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${editingAssignee === selectedModule.id ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown */}
                      {editingAssignee === selectedModule.id && (
                        <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg">
                          <div className="max-h-64 overflow-y-auto p-1">
                            <button
                              onClick={() => handleAssigneeChange(selectedModule.id, undefined)}
                              className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                                !selectedModule.assigneeId ? 'bg-primary-50' : ''
                              }`}
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                                <User className="h-4 w-4 text-gray-400" />
                              </div>
                              <span className="flex-1 text-gray-600">Nicht zugewiesen</span>
                              {!selectedModule.assigneeId && <Check className="h-4 w-4 text-primary-600" />}
                            </button>
                            {mockTeamMembers.map((member) => (
                              <button
                                key={member.id}
                                onClick={() => handleAssigneeChange(selectedModule.id, member.id)}
                                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                                  selectedModule.assigneeId === member.id ? 'bg-primary-50' : ''
                                }`}
                              >
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
                                  <User className="h-4 w-4 text-primary-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{member.name}</p>
                                  <p className="text-xs text-gray-500">{member.role} • {member.department}</p>
                                </div>
                                {selectedModule.assigneeId === member.id && <Check className="h-4 w-4 text-primary-600" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="mt-3 text-xs text-gray-400">
                      Klicken Sie um den Verantwortlichen zu ändern
                    </p>
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
                  {modules
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
