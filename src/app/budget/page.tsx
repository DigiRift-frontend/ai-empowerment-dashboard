'use client'

import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { PointsDonut } from '@/components/dashboard/points-donut'
import { MonthlyChart } from '@/components/dashboard/monthly-chart'
import { TransactionList } from '@/components/dashboard/transaction-list'
import {
  mockCustomer,
  mockPointTransactions,
  mockMonthlySummaries,
  getPointsByCategory,
} from '@/lib/mock-data'
import { formatNumber, formatDate } from '@/lib/utils'
import { Coins, TrendingUp, TrendingDown, Calendar, AlertTriangle } from 'lucide-react'

export default function BudgetPage() {
  const membership = mockCustomer.membership
  const pointsByCategory = getPointsByCategory()
  const percentUsed = Math.round((membership.usedPoints / membership.monthlyPoints) * 100)
  const daysRemaining = 16 // Mock value
  const avgDailyUsage = Math.round(membership.usedPoints / (31 - daysRemaining))
  const projectedUsage = membership.usedPoints + (avgDailyUsage * daysRemaining)
  const isOverBudget = projectedUsage > membership.monthlyPoints

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Punktebudget"
        subtitle="Übersicht über Ihren Punkteverbrauch"
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
                  <p className="text-sm text-gray-500">Prognose</p>
                  <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                    {formatNumber(projectedUsage)}
                  </p>
                  <p className="text-xs text-gray-500">erwarteter Verbrauch</p>
                </div>
                <div className={`rounded-lg p-3 ${isOverBudget ? 'bg-red-100' : 'bg-blue-100'}`}>
                  <Calendar className={`h-6 w-6 ${isOverBudget ? 'text-red-600' : 'text-blue-600'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Warning Banner if projected over budget */}
        {isOverBudget && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">Budgetwarnung</p>
              <p className="text-sm text-yellow-700">
                Basierend auf Ihrem aktuellen Verbrauch könnten Sie Ihr monatliches Budget um{' '}
                {formatNumber(projectedUsage - membership.monthlyPoints)} Punkte überschreiten.
              </p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Progress Bar */}
            <Card>
              <CardHeader>
                <CardTitle>Aktueller Verbrauch</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <Progress value={percentUsed} size="lg" showLabel />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-blue-50 p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500" />
                      <span className="text-sm font-medium text-gray-700">Entwicklung</span>
                    </div>
                    <p className="mt-2 text-xl font-bold text-blue-600">{pointsByCategory.entwicklung}</p>
                    <p className="text-xs text-gray-500">
                      {Math.round((pointsByCategory.entwicklung / membership.usedPoints) * 100)}% des Verbrauchs
                    </p>
                  </div>

                  <div className="rounded-lg bg-green-50 p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                      <span className="text-sm font-medium text-gray-700">Wartung</span>
                    </div>
                    <p className="mt-2 text-xl font-bold text-green-600">{pointsByCategory.wartung}</p>
                    <p className="text-xs text-gray-500">
                      {Math.round((pointsByCategory.wartung / membership.usedPoints) * 100)}% des Verbrauchs
                    </p>
                  </div>

                  <div className="rounded-lg bg-yellow-50 p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-yellow-500" />
                      <span className="text-sm font-medium text-gray-700">Schulung</span>
                    </div>
                    <p className="mt-2 text-xl font-bold text-yellow-600">{pointsByCategory.schulung}</p>
                    <p className="text-xs text-gray-500">
                      {Math.round((pointsByCategory.schulung / membership.usedPoints) * 100)}% des Verbrauchs
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly History Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Verlauf der letzten 6 Monate</CardTitle>
              </CardHeader>
              <CardContent>
                <MonthlyChart data={mockMonthlySummaries} />
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Punktebuchungen</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">Alle</Badge>
                  <Badge variant="secondary">Entwicklung</Badge>
                  <Badge variant="secondary">Wartung</Badge>
                  <Badge variant="secondary">Schulung</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <TransactionList transactions={mockPointTransactions} />
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
                    <span className="text-gray-500">Laufzeit</span>
                    <span className="font-medium">{formatDate(membership.periodStart)} - {formatDate(membership.periodEnd)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Tage verbleibend</span>
                    <span className="font-medium">{daysRemaining} Tage</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Durchschnitt/Tag</span>
                    <span className="font-medium">{avgDailyUsage} Punkte</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Statistik</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Höchster Monat</span>
                  <span className="font-medium">Nov 2024 (158 Pkt.)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Niedrigster Monat</span>
                  <span className="font-medium">Jul 2024 (100 Pkt.)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">6-Monats-Durchschnitt</span>
                  <span className="font-medium">126 Punkte</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Trend</span>
                  <Badge variant="success">+12% vs. Vormonat</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
