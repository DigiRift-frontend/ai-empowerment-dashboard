import { RoadmapItem as RoadmapItemType } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatDate } from '@/lib/utils'
import { Calendar, Target, ArrowRight } from 'lucide-react'

interface RoadmapItemProps {
  item: RoadmapItemType
}

export function RoadmapItemCard({ item }: RoadmapItemProps) {
  const statusConfig = {
    geplant: { label: 'Geplant', variant: 'secondary' as const },
    in_arbeit: { label: 'In Arbeit', variant: 'default' as const },
    im_test: { label: 'Im Test', variant: 'warning' as const },
    abgeschlossen: { label: 'Abgeschlossen', variant: 'success' as const },
  }

  const priorityConfig = {
    hoch: { label: 'Hoch', color: 'text-red-600 bg-red-50' },
    mittel: { label: 'Mittel', color: 'text-yellow-600 bg-yellow-50' },
    niedrig: { label: 'Niedrig', color: 'text-gray-600 bg-gray-50' },
  }

  const config = statusConfig[item.status]
  const priority = priorityConfig[item.priority]

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{item.name}</h3>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priority.color}`}>
              {priority.label}
            </span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
        </div>
        <Badge variant={config.variant} className="ml-3 shrink-0">
          {config.label}
        </Badge>
      </div>

      {item.status !== 'geplant' && (
        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
            <span>Fortschritt</span>
            <span>{item.progress}%</span>
          </div>
          <Progress value={item.progress} size="sm" />
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-4">
          {item.startDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Start: {formatDate(item.startDate)}</span>
            </div>
          )}
          {item.targetDate && (
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              <span>Ziel: {formatDate(item.targetDate)}</span>
            </div>
          )}
        </div>
        {item.status !== 'abgeschlossen' && (
          <button className="flex items-center gap-1 text-primary-600 hover:text-primary-700">
            Details <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  )
}
