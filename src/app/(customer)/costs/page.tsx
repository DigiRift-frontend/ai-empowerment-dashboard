'use client'

import { useMemo } from 'react'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { MonthlyChart } from '@/components/dashboard/monthly-chart'
import { useCustomer } from '@/hooks/use-customers'
import { useAuth } from '@/hooks/use-auth'
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils'
import {
  Coins,
  Package,
  Calendar,
  CreditCard,
  TrendingUp,
  Clock,
  Wrench,
  GraduationCap,
  Code,
  Loader2,
} from 'lucide-react'

export default function CostsPage() {
  const { customerId } = useAuth()
  const { customer, isLoading } = useCustomer(customerId || '')

  const tierNames = {
    S: 'Small',
    M: 'Medium',
    L: 'Large',
  }

  // Calculate points by category from transactions
  const pointsByCategory = useMemo(() => {
    if (!customer?.transactions) {
      return { entwicklung: 0, wartung: 0, schulung: 0 }
    }

    const currentMonth = new Date().toISOString().slice(0, 7)
    const monthlyTransactions = customer.transactions.filter(
      (t: any) => t.date.slice(0, 7) === currentMonth
    )

    return monthlyTransactions.reduce(
      (acc: any, t: any) => {
        acc[t.category] = (acc[t.category] || 0) + t.points
        return acc
      },
      { entwicklung: 0, wartung: 0, schulung: 0 }
    )
  }, [customer?.transactions])

  // Calculate monthly summaries from transactions
  const monthlySummaries = useMemo(() => {
    if (!customer?.transactions) return []

    type MonthlySummary = { month: string; total: number; entwicklung: number; wartung: number; schulung: number }
    const summaries: Record<string, MonthlySummary> = {}

    customer.transactions.forEach((t: any) => {
      const month = t.date.slice(0, 7)
      if (!summaries[month]) {
        summaries[month] = { month, total: 0, entwicklung: 0, wartung: 0, schulung: 0 }
      }
      summaries[month].total += t.points
      const category = t.category as 'entwicklung' | 'wartung' | 'schulung'
      if (category in summaries[month]) {
        summaries[month][category] += t.points
      }
    })

    return Object.values(summaries).sort((a, b) => a.month.localeCompare(b.month))
  }, [customer?.transactions])

  if (isLoading || !customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  const { membership, transactions = [] } = customer
  const totalPointsUsed = pointsByCategory.entwicklung + pointsByCategory.wartung + pointsByCategory.schulung

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Punkte & Verbrauch"
        subtitle="Transparente Übersicht Ihres Punktebudgets"
      />

      <div className="p-6">
        {/* Package Info Card */}
        <Card className="mb-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-4">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-white/20 p-3">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Ihr Paket</p>
                  <p className="text-2xl font-bold">Paket {membership.tier}</p>
                  <p className="text-sm text-white/80">{tierNames[membership.tier as keyof typeof tierNames]}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-white/20 p-3">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Monatlicher Preis</p>
                  <p className="text-2xl font-bold">{formatCurrency(membership.monthlyPrice)}</p>
                  <p className="text-sm text-white/80">netto / Monat</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-white/20 p-3">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Vertragsbeginn</p>
                  <p className="text-2xl font-bold">{formatDate(membership.contractStart)}</p>
                  <p className="text-sm text-white/80">Laufzeit seit {Math.floor((new Date().getTime() - new Date(membership.contractStart).getTime()) / (1000 * 60 * 60 * 24 * 30))} Monaten</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-white/20 p-3">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Nächste Abbuchung</p>
                  <p className="text-2xl font-bold">{formatDate(membership.periodEnd)}</p>
                  <p className="text-sm text-white/80">Ende Abrechnungszeitraum</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Points Summary Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Monatliches Budget</p>
                  <p className="text-2xl font-bold text-primary-600">{formatNumber(membership.monthlyPoints)}</p>
                  <p className="text-xs text-gray-500">Punkte / Monat</p>
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
                  <p className="text-2xl font-bold">{formatNumber(membership.usedPoints)}</p>
                  <p className="text-xs text-gray-500">Punkte diesen Monat</p>
                </div>
                <div className="rounded-lg bg-blue-100 p-3">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
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
                  <p className="text-xs text-gray-500">Punkte übrig</p>
                </div>
                <div className="rounded-lg bg-green-100 p-3">
                  <Coins className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Auslastung</p>
                  <p className="text-2xl font-bold">{Math.round((membership.usedPoints / membership.monthlyPoints) * 100)}%</p>
                  <p className="text-xs text-gray-500">des Budgets genutzt</p>
                </div>
                <div className="rounded-lg bg-yellow-100 p-3">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <Progress
                value={(membership.usedPoints / membership.monthlyPoints) * 100}
                size="sm"
                className="mt-3"
                highIsGood={false}
              />
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Points Distribution */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Punkteverteilung {new Date().toLocaleDateString('de-DE', { month: 'long' })}</CardTitle>
                <Badge variant="outline">{formatNumber(totalPointsUsed)} Punkte gesamt</Badge>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Code className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">Entwicklung</span>
                      </div>
                      <span className="rounded-full bg-blue-200 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {totalPointsUsed > 0 ? Math.round((pointsByCategory.entwicklung / totalPointsUsed) * 100) : 0}%
                      </span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-blue-600">{pointsByCategory.entwicklung}</p>
                    <p className="text-xs text-blue-600">Punkte</p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-blue-200">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${totalPointsUsed > 0 ? (pointsByCategory.entwicklung / totalPointsUsed) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">Wartung</span>
                      </div>
                      <span className="rounded-full bg-green-200 px-2 py-0.5 text-xs font-medium text-green-700">
                        {totalPointsUsed > 0 ? Math.round((pointsByCategory.wartung / totalPointsUsed) * 100) : 0}%
                      </span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-green-600">{pointsByCategory.wartung}</p>
                    <p className="text-xs text-green-600">Punkte</p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-green-200">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${totalPointsUsed > 0 ? (pointsByCategory.wartung / totalPointsUsed) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-700">Schulung</span>
                      </div>
                      <span className="rounded-full bg-yellow-200 px-2 py-0.5 text-xs font-medium text-yellow-700">
                        {totalPointsUsed > 0 ? Math.round((pointsByCategory.schulung / totalPointsUsed) * 100) : 0}%
                      </span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-yellow-600">{pointsByCategory.schulung}</p>
                    <p className="text-xs text-yellow-600">Punkte</p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-yellow-200">
                      <div
                        className="h-full bg-yellow-500"
                        style={{ width: `${totalPointsUsed > 0 ? (pointsByCategory.schulung / totalPointsUsed) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Punkteverbrauch im Verlauf</CardTitle>
              </CardHeader>
              <CardContent>
                <MonthlyChart data={monthlySummaries} />
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Letzte Punktebuchungen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions.slice(0, 8).map((transaction: any) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`rounded-lg p-2 ${
                          transaction.category === 'entwicklung' ? 'bg-blue-100' :
                          transaction.category === 'wartung' ? 'bg-green-100' : 'bg-yellow-100'
                        }`}>
                          {transaction.category === 'entwicklung' ? (
                            <Code className="h-4 w-4 text-blue-600" />
                          ) : transaction.category === 'wartung' ? (
                            <Wrench className="h-4 w-4 text-green-600" />
                          ) : (
                            <GraduationCap className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-xs text-gray-500">{formatDate(transaction.date)}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{transaction.points} Pkt.</Badge>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <p className="text-center text-sm text-gray-500 py-4">
                      Keine Transaktionen vorhanden
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Monthly Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Monatsvergleich</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {monthlySummaries.slice(-3).reverse().map((summary, index) => {
                    const monthDate = new Date(summary.month + '-01')
                    const monthName = monthDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
                    const isCurrentMonth = index === 0

                    return (
                      <div
                        key={summary.month}
                        className={`rounded-lg p-3 ${isCurrentMonth ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${isCurrentMonth ? 'font-medium text-primary-700' : 'text-gray-600'}`}>
                            {monthName}
                          </span>
                          <span className={`font-bold ${isCurrentMonth ? 'text-primary-600' : 'text-gray-900'}`}>
                            {formatNumber(summary.total)} Pkt.
                          </span>
                        </div>
                        <Progress
                          value={(summary.total / membership.monthlyPoints) * 100}
                          size="sm"
                          className="mt-2"
                          highIsGood={false}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          {Math.round((summary.total / membership.monthlyPoints) * 100)}% des Budgets
                        </p>
                      </div>
                    )
                  })}
                  {monthlySummaries.length === 0 && (
                    <p className="text-center text-sm text-gray-500 py-4">
                      Keine Daten vorhanden
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Category Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Nach Kategorie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500" />
                      <span className="text-sm text-gray-600">Entwicklung</span>
                    </div>
                    <span className="font-medium">{formatNumber(pointsByCategory.entwicklung)} Pkt.</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                      <span className="text-sm text-gray-600">Wartung</span>
                    </div>
                    <span className="font-medium">{formatNumber(pointsByCategory.wartung)} Pkt.</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-yellow-500" />
                      <span className="text-sm text-gray-600">Schulung</span>
                    </div>
                    <span className="font-medium">{formatNumber(pointsByCategory.schulung)} Pkt.</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">Gesamt</span>
                      <span className="text-lg font-bold text-primary-600">{formatNumber(totalPointsUsed)} Pkt.</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
              <CardContent className="pt-6">
                <h3 className="mb-2 font-semibold text-gray-900">Punktesystem</h3>
                <p className="text-sm text-gray-600">
                  Ihr monatliches Punktebudget kann flexibel für Entwicklung, Wartung und
                  Schulungen eingesetzt werden. Nicht genutzte Punkte verfallen am Monatsende.
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  Bei Fragen zu Ihrem Verbrauch wenden Sie sich gerne an Ihr Projektteam.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
