import { Module } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { Cpu, Settings, Zap, Wrench } from 'lucide-react'

interface ModuleCardProps {
  module: Module
  onClick?: () => void
}

export function ModuleCard({ module, onClick }: ModuleCardProps) {
  const statusConfig = {
    setup: { label: 'Setup', variant: 'warning' as const, icon: Settings },
    live: { label: 'Live', variant: 'success' as const, icon: Zap },
    optimierung: { label: 'Optimierung', variant: 'default' as const, icon: Wrench },
  }

  const config = statusConfig[module.status]
  const StatusIcon = config.icon

  return (
    <Card
      className="cursor-pointer transition-all hover:border-primary-300 hover:shadow-md"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary-50 p-2">
              <Cpu className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <CardTitle className="text-base">{module.name}</CardTitle>
              <p className="mt-0.5 text-xs text-gray-500">
                Aktualisiert: {formatDate(module.updatedAt)}
              </p>
            </div>
          </div>
          <Badge variant={config.variant}>
            <StatusIcon className="mr-1 h-3 w-3" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-gray-600 line-clamp-2">{module.description}</p>
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <span className="text-xs text-gray-500">Monatliche Wartung</span>
          <span className="text-sm font-medium text-gray-900">
            {module.monthlyMaintenancePoints} Punkte
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
