'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCustomer } from '@/hooks/use-customers'
import { useAuth } from '@/hooks/use-auth'
import {
  Cpu,
  Settings,
  Zap,
  Wrench,
  Filter,
  User,
  ExternalLink,
  Loader2,
  ChevronRight,
} from 'lucide-react'
import { ModuleStatus } from '@/types'

export default function ModulesPage() {
  const router = useRouter()
  const { customerId } = useAuth()
  const { customer, isLoading } = useCustomer(customerId || '')
  const [filter, setFilter] = useState<ModuleStatus | 'all'>('all')

  const statusConfig = {
    geplant: { label: 'Geplant', variant: 'secondary' as const, icon: Settings, color: 'bg-gray-500' },
    in_arbeit: { label: 'In Arbeit', variant: 'warning' as const, icon: Wrench, color: 'bg-blue-500' },
    im_test: { label: 'Im Test', variant: 'default' as const, icon: Settings, color: 'bg-yellow-500' },
    abgeschlossen: { label: 'Live', variant: 'success' as const, icon: Zap, color: 'bg-green-500' },
  }

  // Helper to get display status based on status + liveStatus
  const getDisplayStatus = (mod: any) => {
    if (mod.status === 'abgeschlossen') {
      if (mod.liveStatus === 'pausiert') {
        return { label: 'Pausiert', variant: 'warning' as const, color: 'bg-yellow-500' }
      }
      if (mod.liveStatus === 'deaktiviert') {
        return { label: 'Deaktiviert', variant: 'danger' as const, color: 'bg-red-500' }
      }
      return { label: 'Live', variant: 'success' as const, color: 'bg-green-500' }
    }
    return statusConfig[mod.status as keyof typeof statusConfig]
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

        {/* Modules List */}
        <div className="space-y-4">
          {filteredModules.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Cpu className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Keine Module in dieser Kategorie</p>
              </CardContent>
            </Card>
          ) : (
            filteredModules.map((mod: any) => {
              const displayStatus = getDisplayStatus(mod)
              const config = statusConfig[mod.status as keyof typeof statusConfig] || statusConfig.geplant
              const StatusIcon = config.icon

              return (
                <Card
                  key={mod.id}
                  className="cursor-pointer transition-all hover:shadow-md hover:border-primary-300"
                  onClick={() => router.push(`/roadmap/${mod.id}?from=modules`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`rounded-lg p-3 ${config.color}`}>
                          <Cpu className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-semibold text-gray-900">{mod.name}</h3>
                            <Badge variant={displayStatus.variant}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {displayStatus.label}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-gray-600 line-clamp-2">{mod.description}</p>

                          <div className="mt-3 flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                              <User className="h-3 w-3" />
                              <span>{mod.assignee?.name || 'Nicht zugewiesen'}</span>
                            </div>
                            {mod.monthlyMaintenancePoints > 0 && (
                              <div className="flex items-center gap-1.5 rounded-full bg-yellow-100 px-2.5 py-1 text-xs text-yellow-700">
                                <Settings className="h-3 w-3" />
                                <span>{mod.monthlyMaintenancePoints} Pkt./Monat</span>
                              </div>
                            )}
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
                        </div>
                      </div>

                      <ChevronRight className="h-5 w-5 text-gray-400 shrink-0 ml-4" />
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
