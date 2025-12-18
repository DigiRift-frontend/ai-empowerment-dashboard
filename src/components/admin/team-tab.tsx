'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Users,
  Briefcase,
  Building,
  Mail,
  Phone,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
  Cpu,
} from 'lucide-react'

interface TeamMember {
  id: string
  name: string
  role: string
  department: string
  email?: string | null
  phone?: string | null
  moduleId?: string | null
}

interface Module {
  id: string
  name: string
}

interface TeamTabProps {
  customerId: string
  teamMembers: TeamMember[]
  modules?: Module[]
  onUpdate: () => void
}

const ROLES = ['Projektleiter', 'KI Champion', 'Fachanwender', 'Admin', 'Entwickler', 'Manager', 'Geschäftsführer', 'Sonstige']
const DEPARTMENTS = ['IT', 'Vertrieb', 'Marketing', 'Operations', 'Kundenservice', 'Geschäftsführung', 'Finanzen', 'HR', 'Sonstige']

export function TeamTab({ customerId, teamMembers, modules = [], onUpdate }: TeamTabProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    department: '',
    email: '',
    phone: '',
    moduleId: '',
  })

  const resetForm = () => {
    setFormData({ name: '', role: '', department: '', email: '', phone: '', moduleId: '' })
    setEditingMember(null)
    setShowAddModal(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.role || !formData.department || !formData.email) return

    setIsLoading(true)
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
      onUpdate()
      resetForm()
    } catch (error) {
      console.error('Error saving team member:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (memberId: string) => {
    if (!confirm('Möchten Sie dieses Teammitglied wirklich löschen?')) return

    setIsLoading(true)
    try {
      await fetch(`/api/customers/${customerId}/team/${memberId}`, {
        method: 'DELETE',
      })
      onUpdate()
    } catch (error) {
      console.error('Error deleting team member:', error)
    } finally {
      setIsLoading(false)
    }
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
    setShowAddModal(true)
  }

  const getModuleName = (moduleId: string | null | undefined) => {
    if (!moduleId) return null
    const module = modules.find((m) => m.id === moduleId)
    return module?.name || null
  }

  // Group by role
  const membersByRole = teamMembers.reduce((acc, member) => {
    if (!acc[member.role]) acc[member.role] = []
    acc[member.role].push(member)
    return acc
  }, {} as Record<string, TeamMember[]>)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Teammitglieder des Kunden</h3>
          <p className="text-sm text-gray-500">Personen auf Kundenseite, die am Projekt beteiligt sind</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Mitglied hinzufügen
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Gesamt</p>
              <p className="text-2xl font-bold">{teamMembers.length}</p>
            </div>
            <div className="rounded-lg bg-primary-100 p-3">
              <Users className="h-5 w-5 text-primary-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Rollen</p>
              <p className="text-2xl font-bold">{Object.keys(membersByRole).length}</p>
            </div>
            <div className="rounded-lg bg-blue-100 p-3">
              <Briefcase className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Abteilungen</p>
              <p className="text-2xl font-bold">
                {new Set(teamMembers.map(m => m.department)).size}
              </p>
            </div>
            <div className="rounded-lg bg-green-100 p-3">
              <Building className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Mit Kontakt</p>
              <p className="text-2xl font-bold">
                {teamMembers.filter(m => m.email || m.phone).length}
              </p>
            </div>
            <div className="rounded-lg bg-purple-100 p-3">
              <Mail className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Team Members List */}
      {teamMembers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Keine Teammitglieder</h4>
          <p className="text-gray-500 mb-4">
            Fügen Sie Teammitglieder hinzu, um die Projektbeteiligten auf Kundenseite zu erfassen.
          </p>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Erstes Mitglied hinzufügen
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                    <span className="text-sm font-medium text-primary-700">
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{member.name}</p>
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
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building className="h-4 w-4 text-gray-400" />
                  {member.department}
                </div>
                {member.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <a href={`mailto:${member.email}`} className="hover:text-primary-600 truncate">
                      {member.email}
                    </a>
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <a href={`tel:${member.phone}`} className="hover:text-primary-600">
                      {member.phone}
                    </a>
                  </div>
                )}
                {member.moduleId && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Cpu className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{getModuleName(member.moduleId)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Roles Overview */}
      {teamMembers.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Rollen-Übersicht</h4>
          <div className="grid gap-4 md:grid-cols-4">
            {Object.entries(membersByRole).map(([role, members]) => (
              <div key={role} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{role}</span>
                  <span className="text-sm text-gray-500">{members.length}</span>
                </div>
                <div className="space-y-1">
                  {members.map((m) => (
                    <p key={m.id} className="text-sm text-gray-600">{m.name}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 sticky top-0 bg-white">
              <h3 className="font-semibold text-gray-900">
                {editingMember ? 'Mitglied bearbeiten' : 'Neues Mitglied hinzufügen'}
              </h3>
              <button
                onClick={resetForm}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Max Mustermann"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rolle *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  required
                >
                  <option value="">Rolle auswählen...</option>
                  {ROLES.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Abteilung *</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  required
                >
                  <option value="">Abteilung auswählen...</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Modul-Zuordnung (optional)</label>
                <select
                  value={formData.moduleId}
                  onChange={(e) => setFormData({ ...formData, moduleId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Kein Modul</option>
                  {modules.map((module) => (
                    <option key={module.id} value={module.id}>{module.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon (optional)</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="+49 123 456789"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Abbrechen
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !formData.name || !formData.role || !formData.department || !formData.email}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Speichern...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      {editingMember ? 'Speichern' : 'Hinzufügen'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
