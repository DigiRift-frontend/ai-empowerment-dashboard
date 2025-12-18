'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useCustomer } from '@/hooks/use-customers'
import { useAuth } from '@/hooks/use-auth'
import { formatDate } from '@/lib/utils'
import {
  ChevronRight,
  Cpu,
  Target,
  GraduationCap,
  AlertCircle,
  Package,
  X,
  Calendar,
  CreditCard,
  TrendingUp,
  Loader2,
  Play,
  FileText,
  BookOpen,
  Download,
} from 'lucide-react'

export default function DashboardPage() {
  const { customerId } = useAuth()
  const { customer, isLoading } = useCustomer(customerId || '')
  const [showPackageDetails, setShowPackageDetails] = useState(false)

  if (isLoading || !customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  const membership = customer.membership
  const modules = customer.modules || []
  const workshops = customer.workshops || []

  // Nächste Ziele - Module die in der Roadmap sichtbar sind
  const roadmapModules = modules.filter((m: any) => m.showInRoadmap)
  const activeProjects = roadmapModules.filter((i: any) => i.status === 'in_arbeit')
  const nextPlannedProject = roadmapModules.find((i: any) => i.status === 'geplant')

  // Aktive Module
  const liveModules = modules.filter((m: any) => m.status === 'abgeschlossen')

  // Schulungen
  const upcomingWorkshop = workshops.find((w: any) => w.status === 'geplant')

  // Module mit Anleitungen
  const modulesWithDocs = modules.filter((m: any) => m.videoUrl || m.manualUrl || m.instructions)

  // Offene Aktionen
  const pendingAcceptance = modules.filter(
    (m: any) => m.status === 'im_test' && m.acceptanceStatus === 'ausstehend'
  )
  const pendingTests = modules.filter(
    (m: any) => m.status === 'im_test' && !m.testCompletedAt
  )
  const hasActions = pendingAcceptance.length > 0 || pendingTests.length > 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="AI Empowerment Programm" />

      <div className="p-6">
        <div className="mx-auto max-w-5xl space-y-6">

          {/* Welcome Hero */}
          <div className="py-8 text-center">
            <h2 className="text-5xl font-light tracking-tight">
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-500 bg-clip-text text-transparent">
                Willkommen
              </span>
              {' '}
              <span className="text-gray-900">{customer.companyName}</span>
            </h2>
          </div>

          {/* Offene Aktionen - nur wenn vorhanden */}
          {hasActions && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <span className="font-medium text-gray-900">
                    {pendingAcceptance.length + pendingTests.length} offene Aufgaben
                  </span>
                  <div className="flex-1" />
                  {pendingAcceptance.length > 0 && (
                    <Link href={`/roadmap/${pendingAcceptance[0].id}`}>
                      <Button size="sm" variant="outline">
                        Kriterien bestätigen
                      </Button>
                    </Link>
                  )}
                  {pendingTests.length > 0 && (
                    <Link href={`/roadmap/${pendingTests[0].id}`}>
                      <Button size="sm" variant="outline">
                        Test durchführen
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Paket-Modul */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowPackageDetails(true)}
              className="w-full max-w-md text-left"
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                      <Package className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">Paket {membership.tier}</span>
                        <Badge variant="secondary" className="text-xs">
                          {membership.monthlyPoints} Pkt./Monat
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-600">
                          <span className="font-medium text-gray-900">{membership.remainingPoints}</span> Punkte verfügbar
                        </span>
                        <span className="text-xs text-gray-400">
                          Nächster Einzug: {formatDate(membership.periodEnd)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="mt-3">
                    <Progress
                      value={(membership.usedPoints / membership.monthlyPoints) * 100}
                      size="sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Aktuelle Ziele */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Target className="h-4 w-4 text-gray-400" />
                    Aktuelle Ziele
                  </CardTitle>
                  <Link href="/roadmap">
                    <Button variant="ghost" size="sm">
                      Roadmap
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {activeProjects.length === 0 && !nextPlannedProject ? (
                  <p className="text-gray-500 text-sm py-4">Keine aktiven Projekte</p>
                ) : (
                  <div className="space-y-4">
                    {activeProjects.map((project: any) => (
                      <Link key={project.id} href={`/roadmap/${project.id}`} className="block">
                        <div className="rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{project.name}</span>
                            <Badge variant="secondary">{project.progress}%</Badge>
                          </div>
                          <Progress value={project.progress} size="sm" />
                          <p className="text-xs text-gray-500 mt-2 line-clamp-1">
                            {project.description}
                          </p>
                        </div>
                      </Link>
                    ))}
                    {nextPlannedProject && (
                      <Link href={`/roadmap/${nextPlannedProject.id}`} className="block">
                        <div className="rounded-lg border border-dashed border-gray-300 p-3 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">{nextPlannedProject.name}</span>
                            <Badge variant="outline">Geplant</Badge>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Nächstes Projekt in der Pipeline
                          </p>
                        </div>
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Aktive Module */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-gray-400" />
                    Ihre KI-Module
                  </CardTitle>
                  <Link href="/modules">
                    <Button variant="ghost" size="sm">
                      Alle
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {liveModules.length === 0 ? (
                  <p className="text-gray-500 text-sm py-4">Keine aktiven Module</p>
                ) : (
                  <div className="space-y-2">
                    {liveModules.map((mod: any) => (
                      <Link key={mod.id} href="/modules" className="block">
                        <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors">
                          <div>
                            <p className="font-medium text-gray-900">{mod.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {mod.monthlyMaintenancePoints} Punkte/Monat Wartung
                            </p>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Live</Badge>
                        </div>
                      </Link>
                    ))}
                    {modules.filter((m: any) => m.status === 'in_arbeit' || m.status === 'im_test').length > 0 && (
                      <div className="text-xs text-gray-500 mt-2">
                        + {modules.filter((m: any) => m.status === 'in_arbeit' || m.status === 'im_test').length} Module in Arbeit
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Anleitungen & Dokumentation */}
          {modulesWithDocs.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gray-400" />
                  Anleitungen & Dokumentation
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {modulesWithDocs.slice(0, 4).map((mod: any) => (
                    <div
                      key={mod.id}
                      className="rounded-lg border border-gray-200 p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium text-gray-900">{mod.name}</p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {mod.status === 'abgeschlossen' ? 'Live' :
                             mod.status === 'im_test' ? 'Im Test' :
                             mod.status === 'in_arbeit' ? 'In Arbeit' : 'Geplant'}
                          </Badge>
                        </div>
                        <Link href={`/roadmap/${mod.id}`}>
                          <Button variant="ghost" size="sm">
                            Details
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {mod.videoUrl && (
                          <a
                            href={mod.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100 transition-colors"
                          >
                            <Play className="h-4 w-4" />
                            Video ansehen
                          </a>
                        )}
                        {mod.manualUrl && (
                          <a
                            href={mod.manualUrl}
                            download
                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-100 transition-colors"
                          >
                            <Download className="h-4 w-4" />
                            {mod.manualFilename || 'Handbuch'}
                          </a>
                        )}
                        {mod.instructions && (
                          <Link
                            href={`/roadmap/${mod.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <FileText className="h-4 w-4" />
                            Anleitung lesen
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                  {modulesWithDocs.length > 4 && (
                    <p className="text-center text-sm text-gray-500">
                      + {modulesWithDocs.length - 4} weitere Module mit Anleitungen
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Schulungen */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-gray-400" />
                  KI-Schulungen für Ihr Team
                </CardTitle>
                <Link href="/schulungen">
                  <Button variant="ghost" size="sm">
                    Alle Kurse
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid gap-4 md:grid-cols-3">
                <Link href="/schulungen" className="block">
                  <div className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors text-center">
                    <p className="text-2xl font-bold text-gray-900">8</p>
                    <p className="text-sm text-gray-500">Verfügbare Kurse</p>
                  </div>
                </Link>
                <Link href="/schulungen" className="block">
                  <div className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {workshops.filter((w: any) => w.status === 'abgeschlossen').length}
                    </p>
                    <p className="text-sm text-gray-500">Abgeschlossen</p>
                  </div>
                </Link>
                {upcomingWorkshop ? (
                  <Link href="/schulungen" className="block">
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 hover:bg-blue-100 transition-colors">
                      <p className="text-sm font-medium text-gray-900">{upcomingWorkshop.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(upcomingWorkshop.date).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <Link href="/schulungen" className="block">
                    <div className="rounded-lg border border-dashed border-gray-300 p-4 hover:bg-gray-50 transition-colors text-center">
                      <p className="text-sm text-gray-500">Schulung buchen</p>
                    </div>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Paket-Details Modal */}
      {showPackageDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                  <Package className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Paket {membership.tier}</h3>
                  <p className="text-sm text-gray-500">AI Empowerment Programm</p>
                </div>
              </div>
              <button
                onClick={() => setShowPackageDetails(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Punkte-Übersicht */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Punktebudget</span>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Monatlich</span>
                    <span className="font-semibold text-gray-900">{membership.monthlyPoints} Punkte</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Verbraucht</span>
                    <span className="text-gray-900">{membership.usedPoints} Punkte</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="font-medium text-gray-700">Verfügbar</span>
                    <span className="font-semibold text-primary-600">{membership.remainingPoints} Punkte</span>
                  </div>
                </div>
                {(membership.carriedOverMonth1 + membership.carriedOverMonth2 + membership.carriedOverMonth3 > 0) && (
                  <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50 p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">Übertragene Punkte</span>
                      <span className="font-medium text-gray-900">
                        {membership.carriedOverMonth1 + membership.carriedOverMonth2 + membership.carriedOverMonth3} Punkte
                      </span>
                    </div>
                    {membership.carriedOverMonth1 > 0 && (
                      <p className="text-xs text-orange-600 mt-1">
                        {membership.carriedOverMonth1} Punkte verfallen Ende nächsten Monat
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Punkte können max. 3 Monate übertragen werden
                    </p>
                  </div>
                )}
              </div>

              {/* Vertragsdaten */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Vertragsdaten</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">Vertragsbeginn</p>
                    <p className="font-medium text-gray-900">{formatDate(membership.contractStart)}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">Aktueller Zeitraum</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(membership.periodStart)} - {formatDate(membership.periodEnd)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Kosten */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Kosten</span>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Monatlicher Beitrag</span>
                    <span className="text-xl font-bold text-gray-900">
                      {membership.monthlyPrice.toLocaleString('de-DE')} €
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Nächster Einzug am {formatDate(membership.periodEnd)}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 px-6 py-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowPackageDetails(false)}
              >
                Schließen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
