import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('de-DE').format(num)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

export function formatDateLong(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

export function calculatePercentage(used: number, total: number): number {
  if (total === 0) return 0
  return Math.round((used / total) * 100)
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    setup: 'bg-warning-500',
    live: 'bg-success-500',
    optimierung: 'bg-primary-500',
    geplant: 'bg-gray-400',
    'in_arbeit': 'bg-primary-500',
    abgeschlossen: 'bg-success-500',
  }
  return colors[status.toLowerCase()] || 'bg-gray-400'
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    setup: 'Setup',
    live: 'Live',
    optimierung: 'Optimierung',
    geplant: 'Geplant',
    'in-arbeit': 'In Arbeit',
    abgeschlossen: 'Abgeschlossen',
  }
  return labels[status.toLowerCase()] || status
}
