'use client'

import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalCostsTable } from '@/components/dashboard/external-costs-table'
import { MonthlyChart } from '@/components/dashboard/monthly-chart'
import {
  mockExternalCosts,
  mockMonthlySummaries,
  mockPointTransactions,
  getPointsByCategory,
  getExternalCostsByType,
} from '@/lib/mock-data'
import { formatCurrency, formatNumber } from '@/lib/utils'
import {
  Receipt,
  Coins,
  Server,
  Phone,
  Download,
  TrendingUp,
  PieChart,
} from 'lucide-react'

export default function CostsPage() {
  const pointsByCategory = getPointsByCategory()
  const externalCostsByType = getExternalCostsByType()
  const totalExternalCosts = Object.values(externalCostsByType).reduce((a, b) => a + b, 0)
  const totalPointsUsed = pointsByCategory.entwicklung + pointsByCategory.wartung + pointsByCategory.schulung

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Kosten & Verbrauch"
        subtitle="Transparente Übersicht aller Kosten"
      />

      <div className="p-6">
        {/* Summary Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Punkte (Dezember)</p>
                  <p className="text-2xl font-bold">{formatNumber(totalPointsUsed)}</p>
                  <p className="text-xs text-gray-500">verbraucht</p>
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
                  <p className="text-sm text-gray-500">Externe Kosten</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalExternalCosts)}</p>
                  <p className="text-xs text-gray-500">aktueller Monat</p>
                </div>
                <div className="rounded-lg bg-purple-100 p-3">
                  <Receipt className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">API Tokens</p>
                  <p className="text-2xl font-bold">{formatCurrency(externalCostsByType.tokens)}</p>
                  <p className="text-xs text-gray-500">OpenAI, etc.</p>
                </div>
                <div className="rounded-lg bg-blue-100 p-3">
                  <Server className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Infrastruktur</p>
                  <p className="text-2xl font-bold">{formatCurrency(externalCostsByType.server + externalCostsByType.telefonie)}</p>
                  <p className="text-xs text-gray-500">Server + Telefonie</p>
                </div>
                <div className="rounded-lg bg-green-100 p-3">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
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
                <CardTitle>Punkteverteilung Dezember</CardTitle>
                <Badge variant="outline">{formatNumber(totalPointsUsed)} Punkte gesamt</Badge>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-700">Entwicklung</span>
                      <span className="rounded-full bg-blue-200 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {Math.round((pointsByCategory.entwicklung / totalPointsUsed) * 100)}%
                      </span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-blue-600">{pointsByCategory.entwicklung}</p>
                    <p className="text-xs text-blue-600">Punkte</p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-blue-200">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${(pointsByCategory.entwicklung / totalPointsUsed) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-700">Wartung</span>
                      <span className="rounded-full bg-green-200 px-2 py-0.5 text-xs font-medium text-green-700">
                        {Math.round((pointsByCategory.wartung / totalPointsUsed) * 100)}%
                      </span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-green-600">{pointsByCategory.wartung}</p>
                    <p className="text-xs text-green-600">Punkte</p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-green-200">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${(pointsByCategory.wartung / totalPointsUsed) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-yellow-700">Schulung</span>
                      <span className="rounded-full bg-yellow-200 px-2 py-0.5 text-xs font-medium text-yellow-700">
                        {Math.round((pointsByCategory.schulung / totalPointsUsed) * 100)}%
                      </span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-yellow-600">{pointsByCategory.schulung}</p>
                    <p className="text-xs text-yellow-600">Punkte</p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-yellow-200">
                      <div
                        className="h-full bg-yellow-500"
                        style={{ width: `${(pointsByCategory.schulung / totalPointsUsed) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* External Costs Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Externe Kosten</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                <ExternalCostsTable costs={mockExternalCosts} />
              </CardContent>
            </Card>

            {/* Monthly Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Punkteverbrauch im Verlauf</CardTitle>
              </CardHeader>
              <CardContent>
                <MonthlyChart data={mockMonthlySummaries} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* External Costs Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-gray-400" />
                  Externe Kosten nach Typ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-purple-500" />
                      <span className="text-sm text-gray-600">API Tokens</span>
                    </div>
                    <span className="font-medium">{formatCurrency(externalCostsByType.tokens)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500" />
                      <span className="text-sm text-gray-600">Server</span>
                    </div>
                    <span className="font-medium">{formatCurrency(externalCostsByType.server)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                      <span className="text-sm text-gray-600">Telefonie</span>
                    </div>
                    <span className="font-medium">{formatCurrency(externalCostsByType.telefonie)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">Gesamt</span>
                      <span className="text-lg font-bold text-purple-600">{formatCurrency(totalExternalCosts)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Monatsvergleich</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">November 2024</span>
                      <span className="font-medium">{formatCurrency(598.50)}</span>
                    </div>
                    <p className="text-xs text-gray-400">158 Punkte</p>
                  </div>
                  <div className="rounded-lg bg-primary-50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-primary-700">Dezember 2024</span>
                      <span className="font-bold text-primary-600">{formatCurrency(totalExternalCosts)}</span>
                    </div>
                    <p className="text-xs text-primary-500">{formatNumber(totalPointsUsed)} Punkte</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Veränderung</span>
                    <Badge variant="success">+7.7%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
              <CardContent className="pt-6">
                <h3 className="mb-2 font-semibold text-gray-900">Kostentransparenz</h3>
                <p className="text-sm text-gray-600">
                  Alle externen Kosten (Token-Nutzung, Serverkosten, Telefonie) werden separat
                  von Ihrem Punktebudget erfasst und monatlich abgerechnet.
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  Bei Fragen zu einzelnen Positionen wenden Sie sich gerne an Ihr Projektteam.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
