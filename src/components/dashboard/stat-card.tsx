import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    label: string
    positive?: boolean
  }
  className?: string
  iconClassName?: string
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  iconClassName,
}: StatCardProps) {
  return (
    <div className={cn('rounded-xl border border-gray-200 bg-white p-6 shadow-sm', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 pt-1">
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.positive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.positive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-sm text-gray-500">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={cn('rounded-lg p-3', iconClassName || 'bg-primary-50')}>
          <Icon className={cn('h-6 w-6', iconClassName ? 'text-white' : 'text-primary-600')} />
        </div>
      </div>
    </div>
  )
}
