'use client'

import { useState, useRef } from 'react'
import { AdminHeader } from '@/components/admin/admin-header'
import { useAdvisors, createAdvisor, updateAdvisor, uploadAvatar } from '@/hooks/use-advisors'
import { useCustomers } from '@/hooks/use-customers'
import { Plus, Search, Edit, User, Building2, Phone, Mail, Loader2, Users, Upload, X, Camera } from 'lucide-react'
import Image from 'next/image'

// Vordefinierte Rollen
const ADVISOR_ROLES = [
  'Customer Success Manager',
  'Senior Berater',
  'AI Engineer',
  'Projektleiter',
  'Account Manager',
  'Technical Lead',
  'Consultant',
  'Support Manager',
]

export default function TeamPage() {
  const { advisors, isLoading, mutate } = useAdvisors()
  const { customers } = useCustomers()
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewMemberModal, setShowNewMemberModal] = useState(false)
  const [showEditMemberModal, setShowEditMemberModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)

  // Form state for new advisor
  const [newAdvisor, setNewAdvisor] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    avatarUrl: '',
  })

  // Form state for editing advisor
  const [editAdvisor, setEditAdvisor] = useState<{
    id: string
    name: string
    role: string
    email: string
    phone: string
    avatarUrl: string
  } | null>(null)

  const filteredAdvisors = advisors.filter((advisor: any) =>
    advisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    advisor.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    advisor.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get customers assigned to each advisor
  const getAdvisorCustomers = (advisorId: string) => {
    return customers.filter((customer: any) => customer.advisorId === advisorId)
  }

  const handleFileUpload = async (file: File, isEdit: boolean = false) => {
    setIsUploading(true)
    try {
      const url = await uploadAvatar(file)
      if (isEdit && editAdvisor) {
        setEditAdvisor({ ...editAdvisor, avatarUrl: url })
      } else {
        setNewAdvisor({ ...newAdvisor, avatarUrl: url })
      }
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleCreateAdvisor = async () => {
    if (!newAdvisor.name || !newAdvisor.role || !newAdvisor.email || !newAdvisor.phone) return

    setIsCreating(true)
    try {
      await createAdvisor(newAdvisor)
      mutate()
      setShowNewMemberModal(false)
      setNewAdvisor({ name: '', role: '', email: '', phone: '', avatarUrl: '' })
    } catch (error) {
      console.error('Error creating advisor:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdateAdvisor = async () => {
    if (!editAdvisor || !editAdvisor.name || !editAdvisor.role || !editAdvisor.email || !editAdvisor.phone) return

    setIsCreating(true)
    try {
      await updateAdvisor(editAdvisor.id, {
        name: editAdvisor.name,
        role: editAdvisor.role,
        email: editAdvisor.email,
        phone: editAdvisor.phone,
        avatarUrl: editAdvisor.avatarUrl,
      })
      mutate()
      setShowEditMemberModal(false)
      setEditAdvisor(null)
    } catch (error) {
      console.error('Error updating advisor:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const openEditModal = (advisor: any) => {
    setEditAdvisor({
      id: advisor.id,
      name: advisor.name,
      role: advisor.role,
      email: advisor.email,
      phone: advisor.phone,
      avatarUrl: advisor.avatarUrl || '',
    })
    setShowEditMemberModal(true)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <AdminHeader title="Team-Verwaltung" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <AdminHeader title="Team-Verwaltung" subtitle={`${advisors.length} Ansprechpartner`} />

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
            Neuer Ansprechpartner
          </button>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAdvisors.map((advisor: any) => {
            const assignedCustomers = getAdvisorCustomers(advisor.id)

            return (
              <div key={advisor.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {advisor.avatarUrl ? (
                      <div className="relative h-12 w-12 rounded-full overflow-hidden">
                        <Image
                          src={advisor.avatarUrl}
                          alt={advisor.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                        <span className="text-lg font-medium text-primary-700">
                          {advisor.name.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{advisor.name}</h3>
                      <p className="text-sm text-gray-500">{advisor.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => openEditModal(advisor)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{advisor.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Phone className="h-4 w-4" />
                    <span>{advisor.phone}</span>
                  </div>
                </div>

                {/* Customer Assignments */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kunden ({assignedCustomers.length})
                    </p>
                  </div>

                  {assignedCustomers.length === 0 ? (
                    <p className="text-sm text-gray-400">Keine Kunden zugewiesen</p>
                  ) : (
                    <div className="space-y-2">
                      {assignedCustomers.slice(0, 3).map((customer: any) => (
                        <div key={customer.id} className="flex items-center gap-2 text-sm">
                          <Building2 className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-700 truncate">{customer.companyName}</span>
                          <span className={`ml-auto px-1.5 py-0.5 rounded text-xs ${
                            customer.membership?.tier === 'L' ? 'bg-purple-50 text-purple-600' :
                            customer.membership?.tier === 'M' ? 'bg-blue-50 text-blue-600' :
                            'bg-gray-50 text-gray-600'
                          }`}>
                            {customer.membership?.tier}
                          </span>
                        </div>
                      ))}
                      {assignedCustomers.length > 3 && (
                        <p className="text-xs text-gray-400">
                          +{assignedCustomers.length - 3} weitere Kunden
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {filteredAdvisors.length === 0 && !isLoading && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Keine Ansprechpartner gefunden</p>
          </div>
        )}

        {/* New Member Modal */}
        {showNewMemberModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Neuer Ansprechpartner</h2>
                <button
                  onClick={() => {
                    setShowNewMemberModal(false)
                    setNewAdvisor({ name: '', role: '', email: '', phone: '', avatarUrl: '' })
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
                    {newAdvisor.avatarUrl ? (
                      <div className="relative h-16 w-16 rounded-full overflow-hidden">
                        <Image
                          src={newAdvisor.avatarUrl}
                          alt="Avatar"
                          fill
                          className="object-cover"
                        />
                        <button
                          onClick={() => setNewAdvisor({ ...newAdvisor, avatarUrl: '' })}
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
                    value={newAdvisor.name}
                    onChange={(e) => setNewAdvisor({ ...newAdvisor, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rolle *</label>
                  <select
                    value={newAdvisor.role}
                    onChange={(e) => setNewAdvisor({ ...newAdvisor, role: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="">-- Rolle auswählen --</option>
                    {ADVISOR_ROLES.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail *</label>
                  <input
                    type="email"
                    placeholder="max@unternehmen.de"
                    value={newAdvisor.email}
                    onChange={(e) => setNewAdvisor({ ...newAdvisor, email: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon *</label>
                  <input
                    type="tel"
                    placeholder="+49 123 456789"
                    value={newAdvisor.phone}
                    onChange={(e) => setNewAdvisor({ ...newAdvisor, phone: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
                <button
                  onClick={() => {
                    setShowNewMemberModal(false)
                    setNewAdvisor({ name: '', role: '', email: '', phone: '', avatarUrl: '' })
                  }}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleCreateAdvisor}
                  disabled={isCreating || !newAdvisor.name || !newAdvisor.role || !newAdvisor.email || !newAdvisor.phone}
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
        {showEditMemberModal && editAdvisor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Ansprechpartner bearbeiten</h2>
                <button
                  onClick={() => {
                    setShowEditMemberModal(false)
                    setEditAdvisor(null)
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
                    {editAdvisor.avatarUrl ? (
                      <div className="relative h-16 w-16 rounded-full overflow-hidden">
                        <Image
                          src={editAdvisor.avatarUrl}
                          alt="Avatar"
                          fill
                          className="object-cover"
                        />
                        <button
                          onClick={() => setEditAdvisor({ ...editAdvisor, avatarUrl: '' })}
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
                    value={editAdvisor.name}
                    onChange={(e) => setEditAdvisor({ ...editAdvisor, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rolle *</label>
                  <select
                    value={editAdvisor.role}
                    onChange={(e) => setEditAdvisor({ ...editAdvisor, role: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="">-- Rolle auswählen --</option>
                    {ADVISOR_ROLES.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                    {/* Show current role if not in predefined list */}
                    {!ADVISOR_ROLES.includes(editAdvisor.role) && editAdvisor.role && (
                      <option value={editAdvisor.role}>{editAdvisor.role}</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail *</label>
                  <input
                    type="email"
                    value={editAdvisor.email}
                    onChange={(e) => setEditAdvisor({ ...editAdvisor, email: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon *</label>
                  <input
                    type="tel"
                    value={editAdvisor.phone}
                    onChange={(e) => setEditAdvisor({ ...editAdvisor, phone: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
                <button
                  onClick={() => {
                    setShowEditMemberModal(false)
                    setEditAdvisor(null)
                  }}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleUpdateAdvisor}
                  disabled={isCreating || !editAdvisor.name || !editAdvisor.role || !editAdvisor.email || !editAdvisor.phone}
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
