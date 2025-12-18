'use client'

import { AdminHeader } from '@/components/admin/admin-header'
import { mockCustomers, mockCustomerModules, getAdminStats } from '@/lib/admin-mock-data'
import { Users, Euro, TrendingUp, Clock, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const statusConfig = {
  geplant: { label: 'Geplant', color: 'bg-gray-100 text-gray-700' },
  in_arbeit: { label: 'In Arbeit', color: 'bg-blue-100 text-blue-700' },
  im_test: { label: 'Im Test', color: 'bg-yellow-100 text-yellow-700' },
  abgeschlossen: { label: 'Fertig', color: 'bg-green-100 text-green-700' },
}

const tierConfig = {
  'S': { color: 'bg-gray-100 text-gray-700', points: 100 },
  'M': { color: 'bg-blue-100 text-blue-700', points: 200 },
  'L': { color: 'bg-purple-100 text-purple-700', points: 400 },
}

export default function AdminDashboardPage() {
  const stats = getAdminStats()

  // Alle Module mit Kundenzuordnung
  const allModules = Object.entries(mockCustomerModules).flatMap(([customerId, modules]) =>
    modules.map(module => ({
      ...module,
      customer: mockCustomers.find(c => c.id === customerId),
    }))
  )

  // Aktive Module (in_arbeit oder im_test)
  const activeModules = allModules.filter(m => m.status === 'in_arbeit' || m.status === 'im_test')

  // Module mit ausstehender Akzeptanz
  const pendingAcceptanceModules = allModules.filter(m => m.acceptanceStatus === 'ausstehend')

  return (
    <div className="flex flex-col h-screen">
      <AdminHeader title="Admin Dashboard" subtitle="Übersicht aller Kunden und Projekte" />

      <div className="flex-1 overflow-auto p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Kunden</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <Euro className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Monatlicher Umsatz</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalMonthlyRevenue.toLocaleString('de-DE')} €
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Aktive Module</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeModules}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ausstehende Akzeptanz</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingAcceptance}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kundenliste */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="font-semibold text-gray-900">Kunden</h2>
              <Link
                href="/admin/customers"
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                Alle anzeigen
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {mockCustomers.map((customer) => (
                <Link
                  key={customer.id}
                  href={`/admin/customers/${customer.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                      {customer.companyName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{customer.companyName}</p>
                      <p className="text-sm text-gray-500">{customer.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${tierConfig[customer.membership.tier].color}`}>
                      Paket {customer.membership.tier}
                    </span>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {customer.membership.remainingPoints} / {customer.membership.monthlyPoints}
                      </p>
                      <p className="text-xs text-gray-500">Punkte verfügbar</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Aktive Module */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="font-semibold text-gray-900">Aktive Module</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {activeModules.length === 0 ? (
                <div className="px-5 py-8 text-center text-gray-500">
                  Keine aktiven Module
                </div>
              ) : (
                activeModules.slice(0, 5).map((module) => (
                  <div key={module.id} className="px-5 py-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{module.name}</p>
                        <p className="text-sm text-gray-500">{module.customer?.companyName}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[module.status].color}`}>
                        {statusConfig[module.status].label}
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Fortschritt</span>
                        <span>{module.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-gray-100">
                        <div
                          className="h-1.5 rounded-full bg-primary-500"
                          style={{ width: `${module.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Ausstehende Akzeptanz */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                Ausstehende Akzeptanz
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {pendingAcceptanceModules.length === 0 ? (
                <div className="px-5 py-8 text-center text-gray-500 flex flex-col items-center gap-2">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <p>Alle Akzeptanzkriterien bestätigt</p>
                </div>
              ) : (
                pendingAcceptanceModules.map((module) => (
                  <div key={module.id} className="px-5 py-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{module.name}</p>
                        <p className="text-sm text-gray-500">{module.customer?.companyName}</p>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                        {module.acceptanceCriteria?.length || 0} Kriterien
                      </span>
                    </div>
                    {module.acceptanceCriteria && (
                      <ul className="mt-2 space-y-1">
                        {module.acceptanceCriteria.slice(0, 2).map((criterion) => (
                          <li key={criterion.id} className="text-sm text-gray-600 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                            {criterion.description.length > 50
                              ? criterion.description.substring(0, 50) + '...'
                              : criterion.description}
                          </li>
                        ))}
                        {module.acceptanceCriteria.length > 2 && (
                          <li className="text-xs text-gray-400">
                            +{module.acceptanceCriteria.length - 2} weitere
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Punkte-Übersicht */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="font-semibold text-gray-900">Punkte-Verbrauch diesen Monat</h2>
            </div>
            <div className="p-5">
              <div className="space-y-4">
                {mockCustomers.map((customer) => {
                  const usedPercent = (customer.membership.usedPoints / customer.membership.monthlyPoints) * 100
                  return (
                    <div key={customer.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{customer.companyName}</span>
                        <span className="text-sm text-gray-500">
                          {customer.membership.usedPoints} / {customer.membership.monthlyPoints}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100">
                        <div
                          className={`h-2 rounded-full ${usedPercent > 80 ? 'bg-red-500' : usedPercent > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(usedPercent, 100)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
