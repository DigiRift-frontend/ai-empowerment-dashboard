'use client'

import { useState, useRef } from 'react'
import { AdminHeader } from '@/components/admin/admin-header'
import { useTeam } from '@/hooks/use-team'
import { Plus, Search, Edit, User, Building2, Phone, Mail, Loader2, Users, Upload, X, Camera, Cpu, Trash2 } from 'lucide-react'
import Image from 'next/image'

// Vordefinierte Rollen
const TEAM_ROLES = [
  'Geschäftsführer',
  'AI Engineer',
  'Senior AI Engineer',
  'ML Engineer',
  'Customer Success Manager',
  'Projektleiter',
  'Solution Architect',
  'Technical Lead',
  'Consultant',
  'Support Manager',
]

const DEPARTMENTS = [
  'Management',
  'Engineering',
  'Data Science',
  'Customer Success',
  'Architecture',
  'Sales',
  'Operations',
]

export default function TeamPage() {
  const { teamMembers, isLoading, mutate } = useTeam()
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewMemberModal, setShowNewMemberModal] = useState(false)
  const [showEditMemberModal, setShowEditMemberModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)

  // Form state for new team member
  const [newMember, setNewMember] = useState({
    name: '',
    role: '',
    department: '',
    email: '',
    avatarUrl: '',
  })

  // Form state for editing team member
  const [editMember, setEditMember] = useState<{
    id: string
    name: string
    role: string
    department: string
    email: string
    avatarUrl: string
  } | null>(null)

  const filteredMembers = (teamMembers || []).filter((member: any) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.department?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleFileUpload = async (file: File, isEdit: boolean = false) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', 'avatar')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      const url = data.url

      if (isEdit && editMember) {
        setEditMember({ ...editMember, avatarUrl: url })
      } else {
        setNewMember({ ...newMember, avatarUrl: url })
      }
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleCreateMember = async () => {
    if (!newMember.name || !newMember.role || !newMember.department || !newMember.email) return

    setIsCreating(true)
    try {
      await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember),
      })
      mutate()
      setShowNewMemberModal(false)
      setNewMember({ name: '', role: '', department: '', email: '', avatarUrl: '' })
    } catch (error) {
      console.error('Error creating team member:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdateMember = async () => {
    if (!editMember || !editMember.name || !editMember.role || !editMember.department || !editMember.email) return

    setIsCreating(true)
    try {
      await fetch(`/api/team/${editMember.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editMember.name,
          role: editMember.role,
          department: editMember.department,
          email: editMember.email,
          avatarUrl: editMember.avatarUrl,
        }),
      })
      mutate()
      setShowEditMemberModal(false)
      setEditMember(null)
    } catch (error) {
      console.error('Error updating team member:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteMember = async (id: string) => {
    if (!confirm('Möchten Sie dieses Teammitglied wirklich löschen?')) return

    setIsDeleting(id)
    try {
      await fetch(`/api/team/${id}`, { method: 'DELETE' })
      mutate()
    } catch (error) {
      console.error('Error deleting team member:', error)
    } finally {
      setIsDeleting(null)
    }
  }

  const openEditModal = (member: any) => {
    setEditMember({
      id: member.id,
      name: member.name,
      role: member.role,
      department: member.department || '',
      email: member.email || '',
      avatarUrl: member.avatarUrl || '',
    })
    setShowEditMemberModal(true)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <AdminHeader title="Internes Team" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <AdminHeader title="Internes Team" subtitle={`${teamMembers?.length || 0} Teammitglieder`} />

      <div className="flex-1 overflow-auto p-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Team durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {/* Add Member Button */}
          <button
            onClick={() => setShowNewMemberModal(true)}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Neues Teammitglied
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Hinweis:</strong> Diese Teammitglieder können als "Interner Verantwortlicher" für Module ausgewählt werden.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member: any) => (
            <div key={member.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {member.avatarUrl ? (
                    <div className="relative h-12 w-12 rounded-full overflow-hidden">
                      <Image
                        src={member.avatarUrl}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                      <span className="text-lg font-medium text-primary-700">
                        {member.name.split(' ').map((n: string) => n[0]).join('')}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-500">{member.role}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(member)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMember(member.id)}
                    disabled={isDeleting === member.id}
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                  >
                    {isDeleting === member.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                {member.department && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Building2 className="h-4 w-4" />
                    <span>{member.department}</span>
                  </div>
                )}
                {member.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{member.email}</span>
                  </div>
                )}
              </div>

              {/* Assigned Modules */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="h-4 w-4 text-gray-400" />
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Projekte ({member.assignedModules?.length || 0})
                  </p>
                </div>

                {!member.assignedModules?.length ? (
                  <p className="text-sm text-gray-400">Keine Projekte zugewiesen</p>
                ) : (
                  <div className="space-y-2">
                    {member.assignedModules.slice(0, 3).map((module: any) => (
                      <div key={module.id} className="flex items-center gap-2 text-sm">
                        <span className="text-gray-700 truncate flex-1">{module.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-xs ${
                          module.status === 'abgeschlossen' ? 'bg-green-50 text-green-600' :
                          module.status === 'im_test' ? 'bg-yellow-50 text-yellow-600' :
                          module.status === 'in_arbeit' ? 'bg-blue-50 text-blue-600' :
                          'bg-gray-50 text-gray-600'
                        }`}>
                          {module.status === 'abgeschlossen' ? 'Live' :
                           module.status === 'im_test' ? 'Test' :
                           module.status === 'in_arbeit' ? 'Arbeit' : 'Geplant'}
                        </span>
                      </div>
                    ))}
                    {member.assignedModules.length > 3 && (
                      <p className="text-xs text-gray-400">
                        +{member.assignedModules.length - 3} weitere Projekte
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredMembers.length === 0 && !isLoading && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Keine Teammitglieder gefunden</p>
            <button
              onClick={() => setShowNewMemberModal(true)}
              className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Erstes Teammitglied anlegen
            </button>
          </div>
        )}

        {/* New Member Modal */}
        {showNewMemberModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Neues Teammitglied</h2>
                <button
                  onClick={() => {
                    setShowNewMemberModal(false)
                    setNewMember({ name: '', role: '', department: '', email: '', avatarUrl: '' })
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Avatar Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profilbild</label>
                  <div className="flex items-center gap-4">
                    {newMember.avatarUrl ? (
                      <div className="relative h-16 w-16 rounded-full overflow-hidden">
                        <Image
                          src={newMember.avatarUrl}
                          alt="Avatar"
                          fill
                          className="object-cover"
                        />
                        <button
                          onClick={() => setNewMember({ ...newMember, avatarUrl: '' })}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                        <User className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file, false)
                      }}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                      Bild hochladen
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    placeholder="Max Mustermann"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rolle *</label>
                  <select
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="">-- Rolle auswählen --</option>
                    {TEAM_ROLES.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Abteilung *</label>
                  <select
                    value={newMember.department}
                    onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="">-- Abteilung auswählen --</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail *</label>
                  <input
                    type="email"
                    placeholder="max@unternehmen.de"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
                <button
                  onClick={() => {
                    setShowNewMemberModal(false)
                    setNewMember({ name: '', role: '', department: '', email: '', avatarUrl: '' })
                  }}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleCreateMember}
                  disabled={isCreating || !newMember.name || !newMember.role || !newMember.department || !newMember.email}
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
                  Anlegen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Member Modal */}
        {showEditMemberModal && editMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Teammitglied bearbeiten</h2>
                <button
                  onClick={() => {
                    setShowEditMemberModal(false)
                    setEditMember(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Avatar Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profilbild</label>
                  <div className="flex items-center gap-4">
                    {editMember.avatarUrl ? (
                      <div className="relative h-16 w-16 rounded-full overflow-hidden">
                        <Image
                          src={editMember.avatarUrl}
                          alt="Avatar"
                          fill
                          className="object-cover"
                        />
                        <button
                          onClick={() => setEditMember({ ...editMember, avatarUrl: '' })}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                        <User className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <input
                      ref={editFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file, true)
                      }}
                      className="hidden"
                    />
                    <button
                      onClick={() => editFileInputRef.current?.click()}
                      disabled={isUploading}
                      className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                      Bild ändern
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={editMember.name}
                    onChange={(e) => setEditMember({ ...editMember, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rolle *</label>
                  <select
                    value={editMember.role}
                    onChange={(e) => setEditMember({ ...editMember, role: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="">-- Rolle auswählen --</option>
                    {TEAM_ROLES.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                    {/* Show current role if not in predefined list */}
                    {!TEAM_ROLES.includes(editMember.role) && editMember.role && (
                      <option value={editMember.role}>{editMember.role}</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Abteilung *</label>
                  <select
                    value={editMember.department}
                    onChange={(e) => setEditMember({ ...editMember, department: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="">-- Abteilung auswählen --</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                    {/* Show current department if not in predefined list */}
                    {!DEPARTMENTS.includes(editMember.department) && editMember.department && (
                      <option value={editMember.department}>{editMember.department}</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail *</label>
                  <input
                    type="email"
                    value={editMember.email}
                    onChange={(e) => setEditMember({ ...editMember, email: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
                <button
                  onClick={() => {
                    setShowEditMemberModal(false)
                    setEditMember(null)
                  }}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleUpdateMember}
                  disabled={isCreating || !editMember.name || !editMember.role || !editMember.department || !editMember.email}
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
                  Speichern
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
