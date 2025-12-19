'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { useCustomer } from '@/hooks/use-customers'
import {
  Users,
  User,
  Briefcase,
  Building,
  Mail,
  Phone,
  UserPlus,
  X,
  Loader2,
  Pencil,
  Trash2,
  Cpu,
} from 'lucide-react'

const ROLES = ['Projektleiter', 'KI Champion', 'Fachanwender', 'Admin', 'Entwickler', 'Manager', 'Geschäftsführer', 'Sonstige']
const DEPARTMENTS = ['IT', 'Vertrieb', 'Marketing', 'Operations', 'Kundenservice', 'Geschäftsführung', 'Finanzen', 'HR', 'Sonstige']

interface TeamMember {
  id: string
  name: string
  role: string
  department: string
  email?: string | null
  phone?: string | null
  moduleId?: string | null
}

export default function TeamPage() {
  const { customerId } = useAuth()
  const { customer, isLoading, mutate } = useCustomer(customerId || '')
  const [showModal, setShowModal] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [formData, setFormData] = useState({ name: '', role: '', department: '', email: '', phone: '', moduleId: '' })
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  if (isLoading || !customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  const teamMembers: TeamMember[] = customer.teamMembers || []
  const modules = customer.modules || []

  // Group by role
  const membersByRole = teamMembers.reduce((acc: Record<string, TeamMember[]>, member) => {
    if (!acc[member.role]) acc[member.role] = []
    acc[member.role].push(member)
    return acc
  }, {})

  // Group by department
  const departments = Array.from(new Set(teamMembers.map((m) => m.department)))

  const resetForm = () => {
    setFormData({ name: '', role: '', department: '', email: '', phone: '', moduleId: '' })
    setEditingMember(null)
    setShowModal(false)
  }

  const openAddModal = () => {
    setFormData({ name: '', role: '', department: '', email: '', phone: '', moduleId: '' })
    setEditingMember(null)
    setShowModal(true)
  }

  const openEditModal = (member: TeamMember) => {
    setEditingMember(member)
    setFormData({
      name: member.name,
      role: member.role,
      department: member.department,
      email: member.email || '',
      phone: member.phone || '',
      moduleId: member.moduleId || '',
    })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.role || !formData.department || !formData.email) return

    setIsSaving(true)
    try {
      if (editingMember) {
        // Update existing member
        await fetch(`/api/customers/${customerId}/team/${editingMember.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      } else {
        // Create new member
        await fetch(`/api/customers/${customerId}/team`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      }
      mutate()
      resetForm()
    } catch (error) {
      console.error('Error saving team member:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (memberId: string) => {
    if (!confirm('Möchten Sie dieses Teammitglied wirklich löschen?')) return

    setIsDeleting(memberId)
    try {
      await fetch(`/api/customers/${customerId}/team/${memberId}`, {
        method: 'DELETE',
      })
      mutate()
    } catch (error) {
      console.error('Error deleting team member:', error)
    } finally {
      setIsDeleting(null)
    }
  }

  const getModuleName = (moduleId: string | null | undefined) => {
    if (!moduleId) return null
    const foundModule = modules.find((m: any) => m.id === moduleId)
    return foundModule?.name || null
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
                  <p className="text-sm text-gray-500">Rollen</p>
                  <p className="text-2xl font-bold">{Object.keys(membersByRole).length}</p>
                  <p className="text-xs text-gray-500">verschiedene</p>
                </div>
                <div className="rounded-lg bg-blue-100 p-3">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Abteilungen</p>
                  <p className="text-2xl font-bold">{departments.length}</p>
                  <p className="text-xs text-gray-500">vertreten</p>
                </div>
                <div className="rounded-lg bg-green-100 p-3">
                  <Building className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Mit Kontakt</p>
                  <p className="text-2xl font-bold">{teamMembers.filter((m) => m.email || m.phone).length}</p>
                  <p className="text-xs text-gray-500">erreichbar</p>
                </div>
                <div className="rounded-lg bg-purple-100 p-3">
                  <Mail className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Member Button */}
        <div className="mb-6 flex justify-end">
          <Button onClick={openAddModal}>
            <UserPlus className="mr-2 h-4 w-4" />
            Mitarbeiter hinzufügen
          </Button>
        </div>

        {/* Team Members */}
        {teamMembers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Keine Teammitglieder</h4>
              <p className="text-gray-500 mb-4">
                Fügen Sie Teammitglieder hinzu, um die Projektbeteiligten zu erfassen.
              </p>
              <Button onClick={openAddModal}>
                <UserPlus className="mr-2 h-4 w-4" />
                Erstes Mitglied hinzufügen
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                        <span className="text-sm font-medium text-primary-700">
                          {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-base">{member.name}</CardTitle>
                        <p className="text-sm text-primary-600">{member.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(member)}
                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        disabled={isDeleting === member.id}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isDeleting === member.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building className="h-4 w-4 text-gray-400" />
                      {member.department}
                    </div>
                    {member.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <a href={`mailto:${member.email}`} className="hover:text-primary-600 truncate">
                          {member.email}
                        </a>
                      </div>
                    )}
                    {member.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <a href={`tel:${member.phone}`} className="hover:text-primary-600">
                          {member.phone}
                        </a>
                      </div>
                    )}
                    {member.moduleId && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Cpu className="h-4 w-4 text-gray-400" />
                        <span className="truncate">{getModuleName(member.moduleId)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </div>

      {/* Add/Edit Member Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold">
                {editingMember ? 'Mitarbeiter bearbeiten' : 'Neuen Mitarbeiter hinzufügen'}
              </h2>
              <button
                onClick={resetForm}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Max Mustermann"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Rolle *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Rolle auswählen...</option>
                  {ROLES.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Abteilung *</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Abteilung auswählen...</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Modul-Zuordnung (optional)</label>
                <select
                  value={formData.moduleId}
                  onChange={(e) => setFormData({ ...formData, moduleId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Kein Modul</option>
                  {modules.map((module: any) => (
                    <option key={module.id} value={module.id}>{module.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">E-Mail *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="max@beispiel.de"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Telefon (optional)</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="+49 123 456789"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <Button variant="outline" onClick={resetForm}>
                Abbrechen
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSaving || !formData.name || !formData.role || !formData.department || !formData.email}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Speichern...
                  </>
                ) : (
                  <>
                    {editingMember ? 'Speichern' : 'Hinzufügen'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
