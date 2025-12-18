'use client'

import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UpcomingMeetings } from '@/components/dashboard/upcoming-meetings'
import {
  mockWorkshops,
  mockMeetings,
} from '@/lib/mock-data'
import { formatDate } from '@/lib/utils'
import {
  GraduationCap,
  Users,
  FileText,
  Calendar,
  Clock,
  CheckCircle2,
  Video,
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
        subtitle="Schulungen und Workshops"
      />

      <div className="p-6">
        {/* Summary Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
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

            {/* Quick Actions */}
            <Card className="bg-gradient-to-br from-primary-50 to-primary-100">
              <CardContent className="pt-6">
                <h3 className="mb-4 font-semibold text-primary-900">Schnellaktionen</h3>
                <div className="space-y-2">
                  <Button className="w-full justify-start" variant="secondary">
                    <Video className="mr-2 h-4 w-4" />
                    Workshop anfragen
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
