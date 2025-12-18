'use client'

import { useState } from 'react'
import { AdminHeader } from '@/components/admin/admin-header'
import { mockAdminTeamMembers, mockCustomerModules, mockCustomerRoadmap, mockCustomers } from '@/lib/admin-mock-data'
import { Plus, Search, Edit, Trash2, User, Briefcase, Building2 } from 'lucide-react'

export default function TeamPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewMemberModal, setShowNewMemberModal] = useState(false)

  const filteredMembers = mockAdminTeamMembers.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate assignments for each team member
  const getMemberAssignments = (memberId: string) => {
    const moduleAssignments: { customerName: string; moduleName: string }[] = []
    const projectAssignments: { customerName: string; projectName: string }[] = []

    Object.entries(mockCustomerModules).forEach(([customerId, modules]) => {
      const customer = mockCustomers.find(c => c.id === customerId)
      modules.forEach(module => {
        if (module.assigneeId === memberId) {
          moduleAssignments.push({
            customerName: customer?.companyName || 'Unbekannt',
            moduleName: module.name
          })
        }
      })
    })

    Object.entries(mockCustomerRoadmap).forEach(([customerId, items]) => {
      const customer = mockCustomers.find(c => c.id === customerId)
      items.forEach(item => {
        if (item.assigneeId === memberId) {
          projectAssignments.push({
            customerName: customer?.companyName || 'Unbekannt',
            projectName: item.title
          })
        }
      })
    })

    return { moduleAssignments, projectAssignments }
  }

  return (
    <div className="flex flex-col h-screen">
      <AdminHeader title="Team-Verwaltung" subtitle={`${mockAdminTeamMembers.length} Teammitglieder`} />

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
            Neues Mitglied
          </button>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => {
            const { moduleAssignments, projectAssignments } = getMemberAssignments(member.id)
            const totalAssignments = moduleAssignments.length + projectAssignments.length

            return (
              <div key={member.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <User className="h-6 w-6 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-500">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Building2 className="h-4 w-4" />
                  <span>{member.department}</span>
                </div>

                {/* Assignments */}
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Zuweisungen ({totalAssignments})
                  </p>

                  {totalAssignments === 0 ? (
                    <p className="text-sm text-gray-400">Keine Zuweisungen</p>
                  ) : (
                    <div className="space-y-2">
                      {projectAssignments.slice(0, 2).map((assignment, index) => (
                        <div key={`project-${index}`} className="flex items-center gap-2 text-sm">
                          <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-xs">
                            Projekt
                          </span>
                          <span className="text-gray-700 truncate">{assignment.projectName}</span>
                        </div>
                      ))}
                      {moduleAssignments.slice(0, 2).map((assignment, index) => (
                        <div key={`module-${index}`} className="flex items-center gap-2 text-sm">
                          <span className="px-1.5 py-0.5 rounded bg-green-50 text-green-600 text-xs">
                            Modul
                          </span>
                          <span className="text-gray-700 truncate">{assignment.moduleName}</span>
                        </div>
                      ))}
                      {totalAssignments > 4 && (
                        <p className="text-xs text-gray-400">
                          +{totalAssignments - 4} weitere
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {filteredMembers.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Keine Teammitglieder gefunden</p>
          </div>
        )}

        {/* New Member Modal */}
        {showNewMemberModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Neues Teammitglied</h2>
                <button
                  onClick={() => setShowNewMemberModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    placeholder="Max Mustermann"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rolle</label>
                  <input
                    type="text"
                    placeholder="AI Engineer"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Abteilung</label>
                  <select className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                    <option value="Engineering">Engineering</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Customer Success">Customer Success</option>
                    <option value="Architecture">Architecture</option>
                    <option value="Management">Management</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
                <button
                  onClick={() => setShowNewMemberModal(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                </button>
                <button className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
                  Mitglied anlegen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
