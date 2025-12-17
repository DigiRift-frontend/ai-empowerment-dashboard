'use client'

import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UpcomingMeetings } from '@/components/dashboard/upcoming-meetings'
import {
  mockWorkshops,
  mockTeamMembers,
  mockDecisions,
  mockMeetings,
} from '@/lib/mock-data'
import { formatDate, formatNumber } from '@/lib/utils'
import {
  GraduationCap,
  Users,
  FileText,
  Calendar,
  Clock,
  CheckCircle2,
  User,
  Briefcase,
  Building,
  MessageSquare,
  Video,
  ArrowRight,
} from 'lucide-react'

export default function EnablementPage() {
  const completedWorkshops = mockWorkshops.filter((w) => w.status === 'abgeschlossen')
  const plannedWorkshops = mockWorkshops.filter((w) => w.status === 'geplant')
  const totalParticipants = mockWorkshops.reduce((sum, w) => sum + w.participants, 0)
  const totalWorkshopPoints = mockWorkshops.reduce((sum, w) => sum + w.pointsUsed, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Enablement"
        subtitle="Schulungen, Teams und Zusammenarbeit"
      />

      <div className="p-6">
        {/* Summary Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Workshops gesamt</p>
                  <p className="text-2xl font-bold">{mockWorkshops.length}</p>
                  <p className="text-xs text-gray-500">{completedWorkshops.length} abgeschlossen</p>
                </div>
                <div className="rounded-lg bg-primary-100 p-3">
                  <GraduationCap className="h-6 w-6 text-primary-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Teilnehmer</p>
                  <p className="text-2xl font-bold">{totalParticipants}</p>
                  <p className="text-xs text-gray-500">gesamt geschult</p>
                </div>
                <div className="rounded-lg bg-green-100 p-3">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Team-Mitglieder</p>
                  <p className="text-2xl font-bold">{mockTeamMembers.length}</p>
                  <p className="text-xs text-gray-500">aktiv beteiligt</p>
                </div>
                <div className="rounded-lg bg-blue-100 p-3">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Schulungspunkte</p>
                  <p className="text-2xl font-bold">{totalWorkshopPoints}</p>
                  <p className="text-xs text-gray-500">Punkte investiert</p>
                </div>
                <div className="rounded-lg bg-yellow-100 p-3">
                  <FileText className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Workshops */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-gray-400" />
                  Schulungen & Workshops
                </CardTitle>
                <Button variant="outline" size="sm">
                  Neuen Workshop anfragen
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockWorkshops.map((workshop) => (
                    <div
                      key={workshop.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`rounded-lg p-3 ${
                          workshop.status === 'abgeschlossen' ? 'bg-green-100' : 'bg-yellow-100'
                        }`}>
                          {workshop.status === 'abgeschlossen' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Calendar className="h-5 w-5 text-yellow-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{workshop.title}</h4>
                          <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(workshop.date)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{workshop.duration}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{workshop.participants} Teilnehmer</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={workshop.status === 'abgeschlossen' ? 'success' : 'warning'}>
                          {workshop.status === 'abgeschlossen' ? 'Abgeschlossen' : 'Geplant'}
                        </Badge>
                        <p className="mt-1 text-sm text-gray-500">{workshop.pointsUsed} Punkte</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Decisions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-gray-400" />
                  Dokumentierte Entscheidungen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockDecisions.map((decision) => (
                    <div
                      key={decision.id}
                      className="rounded-lg border border-gray-200 p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{decision.title}</h4>
                          <p className="mt-1 text-sm text-gray-600">{decision.description}</p>
                        </div>
                        <span className="text-sm text-gray-500">{formatDate(decision.date)}</span>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-gray-400">Beteiligte:</span>
                        {decision.participants.map((participant, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                          >
                            {participant}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Team */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-400" />
                  Beteiligte Teams & Rollen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {mockTeamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 rounded-lg border border-gray-200 p-3"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                        <User className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Briefcase className="h-3 w-3" />
                          <span>{member.role}</span>
                          <span>•</span>
                          <Building className="h-3 w-3" />
                          <span>{member.department}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Upcoming Meetings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  Nächste Termine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UpcomingMeetings meetings={mockMeetings} />
              </CardContent>
            </Card>

            {/* Workshop Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Workshop-Statistik</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Durchgeführte Workshops</span>
                    <span className="font-medium">{completedWorkshops.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Geplante Workshops</span>
                    <span className="font-medium">{plannedWorkshops.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Durchschn. Teilnehmer</span>
                    <span className="font-medium">
                      {Math.round(totalParticipants / mockWorkshops.length)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Gesamtdauer</span>
                    <span className="font-medium">7.5h</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">Investierte Punkte</span>
                      <span className="text-lg font-bold text-primary-600">{totalWorkshopPoints}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Roles Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Rollen im Projekt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Projektleiter', 'KI Champion', 'Fachanwender', 'Admin'].map((role) => {
                    const count = mockTeamMembers.filter((m) => m.role === role).length
                    return (
                      <div key={role} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{role}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gradient-to-br from-primary-50 to-primary-100">
              <CardContent className="pt-6">
                <h3 className="mb-4 font-semibold text-primary-900">Schnellaktionen</h3>
                <div className="space-y-2">
                  <Button className="w-full justify-start" variant="secondary">
                    <Video className="mr-2 h-4 w-4" />
                    Workshop anfragen
                  </Button>
                  <Button className="w-full justify-start" variant="secondary">
                    <User className="mr-2 h-4 w-4" />
                    Team-Mitglied hinzufügen
                  </Button>
                  <Button className="w-full justify-start" variant="secondary">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Entscheidung dokumentieren
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
