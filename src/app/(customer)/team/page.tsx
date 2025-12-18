'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  mockTeamMembers as initialTeamMembers,
  mockRoadmapItems,
  getProjectsByAssignee,
} from '@/lib/mock-data'
import {
  Users,
  User,
  Briefcase,
  Building,
  FolderKanban,
  CheckCircle2,
  Clock,
  ChevronRight,
  UserPlus,
  X,
} from 'lucide-react'
import { TeamMember } from '@/types'

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newMember, setNewMember] = useState({ name: '', role: '', department: '' })

  const statusConfig = {
    geplant: { label: 'Geplant', color: 'bg-gray-100 text-gray-600' },
    'in-arbeit': { label: 'In Arbeit', color: 'bg-blue-100 text-blue-600' },
    'im-test': { label: 'Im Test', color: 'bg-purple-100 text-purple-600' },
    abgeschlossen: { label: 'Abgeschlossen', color: 'bg-green-100 text-green-600' },
  }

  const roles = ['Projektleiter', 'KI Champion', 'Fachanwender', 'Admin', 'Entwickler', 'Manager']
  const departments = ['IT', 'Vertrieb', 'Marketing', 'Operations', 'Kundenservice', 'Geschäftsführung']

  // Statistiken
  const totalProjects = mockRoadmapItems.length
  const assignedProjects = mockRoadmapItems.filter((p) => p.assigneeId).length
  const unassignedProjects = totalProjects - assignedProjects

  const handleAddMember = () => {
    if (newMember.name && newMember.role && newMember.department) {
      const newId = `tm${teamMembers.length + 1}`
      setTeamMembers([...teamMembers, { id: newId, ...newMember }])
      setNewMember({ name: '', role: '', department: '' })
      setShowAddModal(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Team & Rollen"
        subtitle="Projektbeteiligte und Zuordnungen"
      />

      <div className="p-6">
        {/* Summary Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Team-Mitglieder</p>
                  <p className="text-2xl font-bold">{teamMembers.length}</p>
                  <p className="text-xs text-gray-500">aktiv beteiligt</p>
                </div>
                <div className="rounded-lg bg-primary-100 p-3">
                  <Users className="h-6 w-6 text-primary-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Projekte gesamt</p>
                  <p className="text-2xl font-bold">{totalProjects}</p>
                  <p className="text-xs text-gray-500">in der Roadmap</p>
                </div>
                <div className="rounded-lg bg-blue-100 p-3">
                  <FolderKanban className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Zugewiesen</p>
                  <p className="text-2xl font-bold text-green-600">{assignedProjects}</p>
                  <p className="text-xs text-gray-500">Projekte mit Verantwortlichem</p>
                </div>
                <div className="rounded-lg bg-green-100 p-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Nicht zugewiesen</p>
                  <p className="text-2xl font-bold text-yellow-600">{unassignedProjects}</p>
                  <p className="text-xs text-gray-500">Projekte ohne Verantwortlichem</p>
                </div>
                <div className="rounded-lg bg-yellow-100 p-3">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Member Button */}
        <div className="mb-6 flex justify-end">
          <Button onClick={() => setShowAddModal(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Mitarbeiter hinzufügen
          </Button>
        </div>

        {/* Team Members with Projects */}
        <div className="grid gap-6 lg:grid-cols-2">
          {teamMembers.map((member) => {
            const memberProjects = getProjectsByAssignee(member.id)
            const activeProjects = memberProjects.filter((p) => p.status !== 'abgeschlossen')
            const completedProjects = memberProjects.filter((p) => p.status === 'abgeschlossen')

            return (
              <Card key={member.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                        <User className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{member.name}</CardTitle>
                        <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            <span>{member.role}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            <span>{member.department}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {memberProjects.length} Projekt{memberProjects.length !== 1 ? 'e' : ''}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {memberProjects.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-500">Aktiv: <span className="font-medium text-blue-600">{activeProjects.length}</span></span>
                        <span className="text-gray-500">Abgeschlossen: <span className="font-medium text-green-600">{completedProjects.length}</span></span>
                      </div>
                      <div className="space-y-2">
                        {memberProjects.map((project) => (
                          <Link
                            key={project.id}
                            href={`/roadmap/${project.id}`}
                            className="flex items-center justify-between rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50 hover:border-primary-200"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{project.name}</p>
                              <div className="mt-1 flex items-center gap-2">
                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig[project.status].color}`}>
                                  {statusConfig[project.status].label}
                                </span>
                                {project.status !== 'abgeschlossen' && project.status !== 'geplant' && (
                                  <span className="text-xs text-gray-500">{project.progress}%</span>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border-2 border-dashed border-gray-200 p-4 text-center">
                      <p className="text-sm text-gray-400">Keine Projekte zugewiesen</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Unassigned Projects */}
        {unassignedProjects > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-700">
                <Clock className="h-5 w-5" />
                Nicht zugewiesene Projekte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {mockRoadmapItems
                  .filter((p) => !p.assigneeId)
                  .map((project) => (
                    <Link
                      key={project.id}
                      href={`/roadmap/${project.id}`}
                      className="flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 p-3 transition-colors hover:bg-yellow-100"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{project.name}</p>
                        <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig[project.status].color}`}>
                          {statusConfig[project.status].label}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </Link>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Roles Overview */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Rollen-Übersicht</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              {['Projektleiter', 'KI Champion', 'Fachanwender', 'Admin'].map((role) => {
                const members = teamMembers.filter((m) => m.role === role)
                const totalProjectsForRole = members.reduce(
                  (sum, m) => sum + getProjectsByAssignee(m.id).length,
                  0
                )

                return (
                  <div key={role} className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{role}</span>
                      <Badge variant="secondary">{members.length}</Badge>
                    </div>
                    <div className="mt-3 space-y-1">
                      {members.map((m) => (
                        <p key={m.id} className="text-sm text-gray-600">{m.name}</p>
                      ))}
                      {members.length === 0 && (
                        <p className="text-sm text-gray-400">Keine Mitglieder</p>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-gray-400">
                      {totalProjectsForRole} Projekt{totalProjectsForRole !== 1 ? 'e' : ''} zugewiesen
                    </p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Neuen Mitarbeiter hinzufügen</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Max Mustermann"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Rolle</label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Rolle auswählen...</option>
                  {roles.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Abteilung</label>
                <select
                  value={newMember.department}
                  onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Abteilung auswählen...</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Abbrechen
              </Button>
              <Button
                onClick={handleAddMember}
                disabled={!newMember.name || !newMember.role || !newMember.department}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Hinzufügen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
