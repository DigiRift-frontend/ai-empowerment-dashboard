'use client'

import { useState } from 'react'
import { AdminHeader } from '@/components/admin/admin-header'
import { useCustomers, createCustomer } from '@/hooks/use-customers'
import { Search, Plus, Filter, Eye, Edit, Package, Users, Loader2 } from 'lucide-react'
import Link from 'next/link'

const tierConfig = {
  'S': { color: 'bg-gray-100 text-gray-700', label: 'Small', points: 100, price: '2.900 €' },
  'M': { color: 'bg-blue-100 text-blue-700', label: 'Medium', points: 200, price: '4.900 €' },
  'L': { color: 'bg-purple-100 text-purple-700', label: 'Large', points: 400, price: '8.900 €' },
}

export default function CustomersPage() {
  const { customers, isLoading, mutate } = useCustomers()
  const [searchTerm, setSearchTerm] = useState('')
  const [tierFilter, setTierFilter] = useState<string>('alle')
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // Form state
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    companyName: '',
    email: '',
    tier: 'M',
    advisorId: 'advisor1',
  })

  const filteredCustomers = customers.filter((customer: any) => {
    const matchesSearch =
      customer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTier = tierFilter === 'alle' || customer.membership?.tier === tierFilter
    return matchesSearch && matchesTier
  })

  const handleCreateCustomer = async () => {
    if (!newCustomer.name || !newCustomer.companyName || !newCustomer.email) return

    setIsCreating(true)
    try {
      await createCustomer({
        ...newCustomer,
        monthlyPoints: newCustomer.tier === 'S' ? 100 : newCustomer.tier === 'M' ? 200 : 400,
      })
      mutate()
      setShowNewCustomerModal(false)
      setNewCustomer({ name: '', companyName: '', email: '', tier: 'M', advisorId: 'advisor1' })
    } catch (error) {
      console.error('Error creating customer:', error)
    } finally {
      setIsCreating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <AdminHeader title="Kundenverwaltung" subtitle="Laden..." />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <AdminHeader title="Kundenverwaltung" subtitle={`${customers.length} Kunden`} />

      <div className="flex-1 overflow-auto p-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Kunden suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {/* Tier Filter */}
          <div className="relative">
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-4 pr-10 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="alle">Alle Pakete</option>
              <option value="S">Paket S</option>
              <option value="M">Paket M</option>
              <option value="L">Paket L</option>
            </select>
            <Filter className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Add Customer Button */}
          <button
            onClick={() => setShowNewCustomerModal(true)}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Neuer Kunde
          </button>
        </div>

        {/* Customer Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Kunde
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Paket
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Punkte
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Module
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Projekte
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Vertragsbeginn
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.map((customer: any) => {
                const modules = customer.modules || []
                const activeModules = modules.filter(
                  (m: any) => m.status === 'in_arbeit' || m.status === 'im_test'
                ).length
                const liveModules = modules.filter((m: any) => m.status === 'abgeschlossen').length
                const tier = customer.membership?.tier || 'M'

                return (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                          {customer.companyName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{customer.companyName}</p>
                          <p className="text-sm text-gray-500">{customer.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${tierConfig[tier as keyof typeof tierConfig]?.color || 'bg-gray-100 text-gray-700'}`}
                      >
                        <Package className="h-3 w-3" />
                        Paket {tier}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {customer.membership?.remainingPoints || 0} / {customer.membership?.monthlyPoints || 0}
                        </p>
                        <div className="mt-1 h-1.5 w-24 rounded-full bg-gray-100">
                          <div
                            className="h-1.5 rounded-full bg-primary-500"
                            style={{
                              width: `${customer.membership ? (customer.membership.remainingPoints / customer.membership.monthlyPoints) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900">{modules.length} Module</span>
                        {liveModules > 0 && (
                          <span className="px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-700">
                            {liveModules} live
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {activeModules > 0 ? (
                          <span className="px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                            {activeModules} in Arbeit
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {customer.membership?.contractStart
                          ? new Date(customer.membership.contractStart).toLocaleDateString('de-DE')
                          : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                          title="Details anzeigen"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                          title="Bearbeiten"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filteredCustomers.length === 0 && (
            <div className="px-6 py-12 text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Keine Kunden gefunden</p>
              {searchTerm && (
                <p className="text-sm text-gray-400 mt-1">
                  Versuche einen anderen Suchbegriff
                </p>
              )}
            </div>
          )}
        </div>

        {/* New Customer Modal */}
        {showNewCustomerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Neuen Kunden anlegen</h2>
                <button
                  onClick={() => setShowNewCustomerModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ansprechpartner
                    </label>
                    <input
                      type="text"
                      placeholder="Max Mustermann"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Firmenname
                    </label>
                    <input
                      type="text"
                      placeholder="Firma GmbH"
                      value={newCustomer.companyName}
                      onChange={(e) => setNewCustomer({ ...newCustomer, companyName: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-Mail
                  </label>
                  <input
                    type="email"
                    placeholder="max@firma.de"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Paket
                  </label>
                  <select
                    value={newCustomer.tier}
                    onChange={(e) => setNewCustomer({ ...newCustomer, tier: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="S">Paket S - 100 Punkte (2.900 €)</option>
                    <option value="M">Paket M - 200 Punkte (4.900 €)</option>
                    <option value="L">Paket L - 400 Punkte (8.900 €)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
                <button
                  onClick={() => setShowNewCustomerModal(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleCreateCustomer}
                  disabled={isCreating || !newCustomer.name || !newCustomer.companyName || !newCustomer.email}
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
                  Kunde anlegen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
