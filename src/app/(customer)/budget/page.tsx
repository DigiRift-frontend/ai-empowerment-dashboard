'use client'

import { useState, useMemo } from 'react'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { PointsDonut } from '@/components/dashboard/points-donut'
import { MonthlyChart } from '@/components/dashboard/monthly-chart'
import { useCustomer } from '@/hooks/use-customers'
import { useAuth } from '@/hooks/use-auth'
import { formatNumber, formatDate } from '@/lib/utils'
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Cpu,
  Wrench,
  Code,
  GraduationCap,
  MessageSquare,
  ClipboardList,
  Loader2,
  Phone,
} from 'lucide-react'
import { PointCategory } from '@/types'

type FilterType = 'alle' | PointCategory

const availableMonths = [
  { value: 'alle', label: 'Alle Monate' },
  { value: '2024-12', label: 'Dezember 2024' },
  { value: '2024-11', label: 'November 2024' },
  { value: '2024-10', label: 'Oktober 2024' },
  { value: '2024-09', label: 'September 2024' },
  { value: '2024-08', label: 'August 2024' },
  { value: '2024-07', label: 'Juli 2024' },
]

const categoryConfig = {
  entwicklung: { label: 'Entwicklung', color: 'bg-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-600', icon: Code },
  wartung: { label: 'Wartung', color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-600', icon: Wrench },
  schulung: { label: 'Schulung', color: 'bg-yellow-500', bgColor: 'bg-yellow-50', textColor: 'text-yellow-600', icon: GraduationCap },
  beratung: { label: 'Beratung', color: 'bg-purple-500', bgColor: 'bg-purple-50', textColor: 'text-purple-600', icon: MessageSquare },
  analyse: { label: 'Analyse & PM', color: 'bg-orange-500', bgColor: 'bg-orange-50', textColor: 'text-orange-600', icon: ClipboardList },
  kommunikation: { label: 'Kommunikation', color: 'bg-pink-500', bgColor: 'bg-pink-50', textColor: 'text-pink-600', icon: Phone },
}

export default function BudgetPage() {
  const { customerId } = useAuth()
  const { customer, isLoading } = useCustomer(customerId || '')
  const [categoryFilter, setCategoryFilter] = useState<FilterType>('alle')
  const [monthFilter, setMonthFilter] = useState<string>('alle')

  // Calculate points by category from transactions
  const pointsByCategory = useMemo(() => {
    if (!customer?.pointTransactions) return { entwicklung: 0, wartung: 0, schulung: 0, beratung: 0, analyse: 0 }

    return customer.pointTransactions.reduce((acc: Record<string, number>, t: any) => {
      acc[t.category] = (acc[t.category] || 0) + t.points
      return acc
    }, { entwicklung: 0, wartung: 0, schulung: 0, beratung: 0, analyse: 0 })
  }, [customer?.pointTransactions])

  // Calculate monthly summaries from transactions
  const monthlySummaries = useMemo(() => {
    if (!customer?.pointTransactions) return []

    const summaryMap = new Map<string, { entwicklung: number; wartung: number; schulung: number; total: number }>()

    customer.pointTransactions.forEach((t: any) => {
      const month = new Date(t.date).toLocaleDateString('de-DE', { month: 'short', year: '2-digit' })
      const existing = summaryMap.get(month) || { entwicklung: 0, wartung: 0, schulung: 0, total: 0 }

      if (t.category === 'entwicklung') existing.entwicklung += t.points
      else if (t.category === 'wartung') existing.wartung += t.points
      else if (t.category === 'schulung') existing.schulung += t.points
      existing.total += t.points

      summaryMap.set(month, existing)
    })

    return Array.from(summaryMap.entries()).map(([month, data]) => ({ month, ...data })).slice(-6)
  }, [customer?.pointTransactions])

  if (isLoading || !customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  const membership = customer.membership
  const modules = customer.modules || []
  const transactions = customer.pointTransactions || []
  const percentUsed = Math.round((membership.usedPoints / membership.monthlyPoints) * 100)

  // Monatliche Wartungskosten
  const maintenanceModules = modules.filter((m: any) => m.status === 'abgeschlossen')
  const totalMaintenancePoints = maintenanceModules.reduce((sum: number, m: any) => sum + m.monthlyMaintenancePoints, 0)

  // Gefilterte Transaktionen
  const filteredTransactions = transactions.filter((t: any) => {
    const matchesCategory = categoryFilter === 'alle' || t.category === categoryFilter
    const transactionMonth = new Date(t.date).toISOString().substring(0, 7)
    const matchesMonth = monthFilter === 'alle' || transactionMonth === monthFilter
    return matchesCategory && matchesMonth
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Punkteübersicht"
        subtitle="Ihr Verbrauch und Ihre Transaktionen"
      />

      <div className="p-6">
        {/* Budget Overview Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Monatliches Budget</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(membership.monthlyPoints)}</p>
                  <p className="text-xs text-gray-500">Punkte</p>
                </div>
                <div className="rounded-lg bg-primary-100 p-3">
                  <Coins className="h-6 w-6 text-primary-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Verbraucht</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(membership.usedPoints)}</p>
                  <p className="text-xs text-gray-500">{percentUsed}% des Budgets</p>
                </div>
                <div className="rounded-lg bg-yellow-100 p-3">
                  <TrendingDown className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Verfügbar</p>
                  <p className="text-2xl font-bold text-green-600">{formatNumber(membership.remainingPoints)}</p>
                  <p className="text-xs text-gray-500">bis {formatDate(membership.periodEnd)}</p>
                </div>
                <div className="rounded-lg bg-green-100 p-3">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Wartung/Monat</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(totalMaintenancePoints)}</p>
                  <p className="text-xs text-gray-500">für {maintenanceModules.length} Module</p>
                </div>
                <div className="rounded-lg bg-purple-100 p-3">
                  <Wrench className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Verbrauch nach Kategorie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <Progress value={percentUsed} size="lg" showLabel highIsGood={false} />
                </div>

                <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
                  {Object.entries(categoryConfig).map(([key, config]) => {
                    const value = pointsByCategory[key as PointCategory] || 0
                    const percent = membership.usedPoints > 0 ? Math.round((value / membership.usedPoints) * 100) : 0
                    const Icon = config.icon
                    return (
                      <div key={key} className={`rounded-lg ${config.bgColor} p-3`}>
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${config.textColor}`} />
                          <span className="text-xs font-medium text-gray-700">{config.label}</span>
                        </div>
                        <p className={`mt-1 text-lg font-bold ${config.textColor}`}>{value} Pkt.</p>
                        <p className="text-xs text-gray-500">{percent}%</p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Module Maintenance Costs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-gray-400" />
                  Monatliche Wartungskosten
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {maintenanceModules.length === 0 ? (
                    <p className="text-gray-500 text-sm py-4">Keine aktiven Module</p>
                  ) : (
                    <>
                      {maintenanceModules.map((mod: any) => (
                        <div key={mod.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <div>
                              <p className="font-medium text-gray-900">{mod.name}</p>
                              <p className="text-xs text-gray-500">Live</p>
                            </div>
                          </div>
                          <span className="font-semibold text-gray-900">{mod.monthlyMaintenancePoints} Pkt.</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                        <span className="font-medium text-gray-700">Gesamt Wartung</span>
                        <span className="text-lg font-bold text-primary-600">{totalMaintenancePoints} Pkt./Monat</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Monthly History Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Verlauf der letzten 6 Monate</CardTitle>
              </CardHeader>
              <CardContent>
                <MonthlyChart data={monthlySummaries} />
              </CardContent>
            </Card>

            {/* Transaction History with Filter */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Punktebuchungen</CardTitle>
                  <div className="flex items-center gap-3">
                    <select
                      value={monthFilter}
                      onChange={(e) => setMonthFilter(e.target.value)}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      {availableMonths.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value as FilterType)}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="alle">Alle Kategorien</option>
                      {Object.entries(categoryConfig).map(([key, config]) => (
                        <option key={key} value={key}>
                          {config.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredTransactions.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">Keine Buchungen in dieser Kategorie</p>
                  ) : (
                    filteredTransactions.map((transaction: any) => {
                      const config = categoryConfig[transaction.category as keyof typeof categoryConfig]
                      const Icon = config?.icon || Code
                      const relatedModule = transaction.moduleId ? modules.find((m: any) => m.id === transaction.moduleId) : null

                      return (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`rounded-lg ${config?.bgColor || 'bg-gray-50'} p-2`}>
                              <Icon className={`h-4 w-4 ${config?.textColor || 'text-gray-600'}`} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{transaction.description}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-gray-500">{formatDate(transaction.date)}</span>
                                {relatedModule && (
                                  <Badge variant="outline" className="text-xs">
                                    {relatedModule.name}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">-{transaction.points} Pkt.</p>
                            <p className={`text-xs ${config?.textColor || 'text-gray-600'}`}>{config?.label || 'Sonstig'}</p>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Distribution Donut */}
            <Card>
              <CardHeader>
                <CardTitle>Verteilung</CardTitle>
              </CardHeader>
              <CardContent>
                <PointsDonut
                  entwicklung={pointsByCategory.entwicklung}
                  wartung={pointsByCategory.wartung}
                  schulung={pointsByCategory.schulung}
                  total={membership.monthlyPoints}
                />
              </CardContent>
            </Card>

            {/* Carried Over Points */}
            {(membership.carriedOverMonth1 + membership.carriedOverMonth2 + membership.carriedOverMonth3 > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle>Übertragene Punkte</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Gesamt übertragen</span>
                      <span className="font-semibold text-gray-900">
                        {membership.carriedOverMonth1 + membership.carriedOverMonth2 + membership.carriedOverMonth3} Pkt.
                      </span>
                    </div>
                    {membership.carriedOverMonth1 > 0 && (
                      <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-orange-700">Verfallen bald</span>
                          <span className="font-semibold text-orange-700">{membership.carriedOverMonth1} Pkt.</span>
                        </div>
                        <p className="text-xs text-orange-600 mt-1">Ende nächsten Monat</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      Punkte können max. 3 Monate übertragen werden, danach verfallen sie.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Membership Info */}
            <Card>
              <CardHeader>
                <CardTitle>Ihr Paket</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 p-4 text-white">
                  <p className="text-sm opacity-80">AI Empowerment</p>
                  <p className="text-2xl font-bold">Paket {membership.tier}</p>
                  <p className="mt-2 text-sm opacity-80">{formatNumber(membership.monthlyPoints)} Punkte / Monat</p>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Vertragsbeginn</span>
                    <span className="font-medium">{formatDate(membership.contractStart)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Aktueller Zeitraum</span>
                    <span className="font-medium">{formatDate(membership.periodStart)} - {formatDate(membership.periodEnd)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Monatlicher Beitrag</span>
                    <span className="font-medium">{membership.monthlyPrice.toLocaleString('de-DE')} €</span>
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
