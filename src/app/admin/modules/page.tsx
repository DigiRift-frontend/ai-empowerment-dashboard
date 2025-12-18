'use client'

import { useState } from 'react'
import { AdminHeader } from '@/components/admin/admin-header'
import { moduleTemplates } from '@/lib/admin-mock-data'
import { ModuleTemplate } from '@/types'
import {
  Search,
  Plus,
  Filter,
  Cpu,
  Coins,
  Clock,
  Edit,
  Trash2,
  Check,
  X,
  Copy,
} from 'lucide-react'

const categoryConfig: Record<string, { label: string; color: string }> = {
  kundenservice: { label: 'Kundenservice', color: 'bg-blue-100 text-blue-700' },
  automatisierung: { label: 'Automatisierung', color: 'bg-purple-100 text-purple-700' },
  wissensmanagement: { label: 'Wissensmanagement', color: 'bg-green-100 text-green-700' },
  analytics: { label: 'Analytics', color: 'bg-orange-100 text-orange-700' },
  'e-commerce': { label: 'E-Commerce', color: 'bg-pink-100 text-pink-700' },
}

export default function ModulkatalogPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('alle')
  const [showNewModuleModal, setShowNewModuleModal] = useState(false)
  const [templates, setTemplates] = useState<ModuleTemplate[]>(moduleTemplates)

  // Form state for new module
  const [newModule, setNewModule] = useState({
    name: '',
    description: '',
    category: 'automatisierung',
    estimatedPoints: 30,
    estimatedMaintenancePoints: 5,
    features: [''],
  })

  const categories = Array.from(new Set(templates.map(t => t.category)))

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'alle' || template.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleAddModule = () => {
    const newTemplate: ModuleTemplate = {
      id: `tpl-new-${Date.now()}`,
      name: newModule.name,
      description: newModule.description,
      category: newModule.category,
      estimatedPoints: newModule.estimatedPoints,
      estimatedMaintenancePoints: newModule.estimatedMaintenancePoints,
      features: newModule.features.filter(f => f.trim() !== ''),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    }
    setTemplates([...templates, newTemplate])
    setShowNewModuleModal(false)
    setNewModule({
      name: '',
      description: '',
      category: 'automatisierung',
      estimatedPoints: 30,
      estimatedMaintenancePoints: 5,
      features: [''],
    })
  }

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Möchten Sie diese Vorlage wirklich löschen?')) {
      setTemplates(templates.filter(t => t.id !== id))
    }
  }

  const handleCloneTemplate = (template: ModuleTemplate) => {
    const clonedTemplate: ModuleTemplate = {
      id: `tpl-clone-${Date.now()}`,
      name: `${template.name} (Kopie)`,
      description: template.description,
      category: template.category,
      estimatedPoints: template.estimatedPoints,
      estimatedMaintenancePoints: template.estimatedMaintenancePoints,
      features: [...template.features],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    }
    setTemplates([...templates, clonedTemplate])
  }

  return (
    <div className="flex flex-col h-screen">
      <AdminHeader
        title="Modulkatalog"
        subtitle={`${templates.length} Modul-Vorlagen`}
      />

      <div className="flex-1 overflow-auto p-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Module suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-4 pr-10 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="alle">Alle Kategorien</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {categoryConfig[cat]?.label || cat}
                </option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Add Module Button */}
          <button
            onClick={() => setShowNewModuleModal(true)}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Neue Vorlage
          </button>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Cpu className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryConfig[template.category]?.color || 'bg-gray-100 text-gray-700'}`}>
                      {categoryConfig[template.category]?.label || template.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCloneTemplate(template)}
                    className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Vorlage klonen"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Vorlage löschen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{template.description}</p>

              {/* Stats */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1.5 text-sm">
                  <Coins className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">~{template.estimatedPoints} Punkte</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{template.estimatedMaintenancePoints} P/Monat</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-1.5">
                {template.features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="h-3.5 w-3.5 text-green-500" />
                    {feature}
                  </div>
                ))}
                {template.features.length > 3 && (
                  <p className="text-xs text-gray-400">+{template.features.length - 3} weitere</p>
                )}
              </div>
            </div>
          ))}

          {filteredTemplates.length === 0 && (
            <div className="col-span-full bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Cpu className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Keine Module gefunden</p>
              {searchTerm && (
                <p className="text-sm text-gray-400 mt-1">
                  Versuche einen anderen Suchbegriff
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* New Module Modal */}
      {showNewModuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Neue Modul-Vorlage</h2>
              <button
                onClick={() => setShowNewModuleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newModule.name}
                  onChange={(e) => setNewModule({ ...newModule, name: e.target.value })}
                  placeholder="z.B. Chatbot für HR"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                <textarea
                  rows={3}
                  value={newModule.description}
                  onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                  placeholder="Was macht dieses Modul?"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
                <select
                  value={newModule.category}
                  onChange={(e) => setNewModule({ ...newModule, category: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Geschätzte Entwicklungspunkte
                  </label>
                  <input
                    type="number"
                    value={newModule.estimatedPoints}
                    onChange={(e) => setNewModule({ ...newModule, estimatedPoints: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wartung/Monat (Punkte)
                  </label>
                  <input
                    type="number"
                    value={newModule.estimatedMaintenancePoints}
                    onChange={(e) => setNewModule({ ...newModule, estimatedMaintenancePoints: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                <div className="space-y-2">
                  {newModule.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...newModule.features]
                          newFeatures[index] = e.target.value
                          setNewModule({ ...newModule, features: newFeatures })
                        }}
                        placeholder={`Feature ${index + 1}`}
                        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                      {newModule.features.length > 1 && (
                        <button
                          onClick={() => {
                            const newFeatures = newModule.features.filter((_, i) => i !== index)
                            setNewModule({ ...newModule, features: newFeatures })
                          }}
                          className="p-2 text-gray-400 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => setNewModule({ ...newModule, features: [...newModule.features, ''] })}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    + Feature hinzufügen
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setShowNewModuleModal(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleAddModule}
                disabled={!newModule.name.trim() || !newModule.description.trim()}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Vorlage erstellen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
