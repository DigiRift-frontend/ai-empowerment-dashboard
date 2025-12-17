'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, showLabel = false, size = 'md', variant = 'default', ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    const sizeClasses = {
      sm: 'h-1.5',
      md: 'h-2.5',
      lg: 'h-4',
    }

    const variantClasses = {
      default: 'bg-primary-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      danger: 'bg-red-500',
    }

    // Auto-determine variant based on percentage if default
    const autoVariant = variant === 'default'
      ? percentage > 90 ? 'danger' : percentage > 70 ? 'warning' : 'default'
      : variant

    return (
      <div className={cn('w-full', className)} ref={ref} {...props}>
        <div className={cn('w-full overflow-hidden rounded-full bg-gray-200', sizeClasses[size])}>
          <div
            className={cn('h-full rounded-full transition-all duration-500 ease-out', variantClasses[autoVariant])}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>{value} / {max}</span>
            <span>{Math.round(percentage)}%</span>
          </div>
        )}
      </div>
    )
  }
)

Progress.displayName = 'Progress'

export { Progress }
