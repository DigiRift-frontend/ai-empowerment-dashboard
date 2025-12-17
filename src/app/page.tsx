'use client'

import { Header } from '@/components/layout/header'
import { StatCard } from '@/components/dashboard/stat-card'
import { PointsDonut } from '@/components/dashboard/points-donut'
import { ModuleCard } from '@/components/dashboard/module-card'
import { TransactionList } from '@/components/dashboard/transaction-list'
import { UpcomingMeetings } from '@/components/dashboard/upcoming-meetings'
import { RoadmapItemCard } from '@/components/dashboard/roadmap-item'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  mockCustomer,
  mockModules,
  mockPointTransactions,
  mockRoadmapItems,
  mockMeetings,
  mockDashboardStats,
  getPointsByCategory,
} from '@/lib/mock-data'
import { formatNumber, formatCurrency } from '@/lib/utils'
import {
  Coins,
  Cpu,
  TrendingUp,
  Calendar,
  ArrowRight,
  Receipt,
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const stats = mockDashboardStats
  const pointsByCategory = getPointsByCategory()
  const membership = mockCustomer.membership
  const percentUsed = Math.round((membership.usedPoints / membership.monthlyPoints) * 100)

  const activeRoadmapItems = mockRoadmapItems.filter(
    (item) => item.status === 'in-arbeit'
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Willkommen zurück"
        subtitle={`${mockCustomer.companyName} - Paket ${membership.tier}`}
      />

      <div className="p-6">
        {/* Stats Overview */}
        <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Verbrauchte Punkte"
            value={`${formatNumber(stats.pointsUsed)} / ${formatNumber(stats.pointsTotal)}`}
            subtitle={`${stats.pointsRemaining} Punkte verfügbar`}
            icon={Coins}
            iconClassName="bg-primary-500"
          />
          <StatCard
            title="Aktive Module"
            value={stats.activeModules}
            subtitle={`${stats.modulesInSetup} im Setup`}
            icon={Cpu}
            iconClassName="bg-green-500"
          />
          <StatCard
            title="Roadmap Fortschritt"
            value={`${stats.roadmapProgress}%`}
            subtitle="Gesamtfortschritt"
            icon={TrendingUp}
            iconClassName="bg-yellow-500"
          />
          <StatCard
            title="Externe Kosten"
            value={formatCurrency(stats.currentMonthCosts)}
            subtitle="Aktueller Monat"
            icon={Receipt}
            iconClassName="bg-purple-500"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Points & Modules */}
          <div className="space-y-6 lg:col-span-2">
            {/* Points Budget Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Punktebudget Dezember</CardTitle>
                  <p className="mt-1 text-sm text-gray-500">
                    {membership.usedPoints} von {membership.monthlyPoints} Punkten verbraucht
                  </p>
                </div>
                <Link href="/budget">
                  <Button variant="outline" size="sm">
                    Details <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Progress value={percentUsed} size="lg" showLabel />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <PointsDonut
                      entwicklung={pointsByCategory.entwicklung}
                      wartung={pointsByCategory.wartung}
                      schulung={pointsByCategory.schulung}
                      total={membership.monthlyPoints}
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-lg bg-blue-50 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Entwicklung</span>
                        <span className="font-semibold text-blue-600">{pointsByCategory.entwicklung} Punkte</span>
                      </div>
                    </div>
                    <div className="rounded-lg bg-green-50 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Wartung</span>
                        <span className="font-semibold text-green-600">{pointsByCategory.wartung} Punkte</span>
                      </div>
                    </div>
                    <div className="rounded-lg bg-yellow-50 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Schulung</span>
                        <span className="font-semibold text-yellow-600">{pointsByCategory.schulung} Punkte</span>
                      </div>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Verfügbar</span>
                        <span className="font-semibold text-gray-600">{stats.pointsRemaining} Punkte</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Modules */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Aktive Module</CardTitle>
                <Link href="/modules">
                  <Button variant="outline" size="sm">
                    Alle anzeigen <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {mockModules.slice(0, 4).map((module) => (
                    <ModuleCard key={module.id} module={module} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Roadmap Progress */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Aktuelle Roadmap</CardTitle>
                <Link href="/roadmap">
                  <Button variant="outline" size="sm">
                    Zur Roadmap <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeRoadmapItems.map((item) => (
                    <RoadmapItemCard key={item.id} item={item} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar Content */}
          <div className="space-y-6">
            {/* Upcoming Meetings */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  Nächste Termine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UpcomingMeetings meetings={mockMeetings} />
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Letzte Aktivitäten</CardTitle>
                <Link href="/budget">
                  <Button variant="ghost" size="sm">
                    Alle <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <TransactionList transactions={mockPointTransactions} limit={5} />
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Schnellaktionen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Termin vereinbaren
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Cpu className="mr-2 h-4 w-4" />
                  Neues Modul anfragen
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Receipt className="mr-2 h-4 w-4" />
                  Monatsbericht exportieren
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
