'use client'

import { useState, useEffect } from 'react'
import { AdminHeader } from '@/components/admin/admin-header'
import { schulungskatalog, schulungSerien } from '@/lib/admin-mock-data'
import { Schulung, SchulungSerie } from '@/types'
import {
  Search,
  Plus,
  Filter,
  GraduationCap,
  Coins,
  Clock,
  Edit,
  Trash2,
  X,
  Layers,
  ChevronRight,
  Users,
  Video,
  BookOpen,
  Play,
  Loader2,
} from 'lucide-react'

const categoryConfig: Record<string, { label: string; color: string }> = {
  grundlagen: { label: 'Grundlagen', color: 'bg-green-100 text-green-700' },
  fortgeschritten: { label: 'Fortgeschritten', color: 'bg-blue-100 text-blue-700' },
  spezialisiert: { label: 'Spezialisiert', color: 'bg-purple-100 text-purple-700' },
}

const formatConfig: Record<string, { label: string; color: string; icon: typeof Video }> = {
  live: { label: 'Live', color: 'bg-blue-100 text-blue-700', icon: Users },
  self_learning: { label: 'Self-Learning', color: 'bg-purple-100 text-purple-700', icon: BookOpen },
  hybrid: { label: 'Hybrid', color: 'bg-green-100 text-green-700', icon: Play },
}

type ViewMode = 'schulungen' | 'serien'

export default function SchulungskatalogPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('schulungen')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('alle')
  const [showNewSchulungModal, setShowNewSchulungModal] = useState(false)
  const [showNewSerieModal, setShowNewSerieModal] = useState(false)
  const [schulungen, setSchulungen] = useState<Schulung[]>([])
  const [serien, setSerien] = useState<SchulungSerie[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch schulungen and serien from database
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const res = await fetch('/api/schulungen')
        if (res.ok) {
          const data = await res.json()
          setSchulungen(data.schulungen || [])
          setSerien(data.serien || [])
        }
      } catch (error) {
        console.error('Error fetching schulungen:', error)
        // Fallback to mock data
        setSchulungen(schulungskatalog)
        setSerien(schulungSerien)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Form state for new Schulung
  const [newSchulung, setNewSchulung] = useState({
    title: '',
    description: '',
    duration: '2 Stunden',
    points: 10,
    category: 'grundlagen' as 'grundlagen' | 'fortgeschritten' | 'spezialisiert',
  })

  // Form state for new Serie
  const [newSerie, setNewSerie] = useState({
    title: '',
    description: '',
    schulungIds: [] as string[],
  })

  const filteredSchulungen = schulungen.filter((schulung) => {
    const matchesSearch =
      schulung.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schulung.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'alle' || schulung.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const filteredSerien = serien.filter((serie) =>
    serie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    serie.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddSchulung = async () => {
    try {
      const res = await fetch('/api/schulungen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newSchulung.title,
          description: newSchulung.description,
          duration: newSchulung.duration,
          points: newSchulung.points,
          category: newSchulung.category,
          isCustom: true,
          learningGoals: [],
          outcomes: [],
          format: 'live',
          showInRoadmap: true,
        }),
      })

      if (res.ok) {
        const createdSchulung = await res.json()
        setSchulungen([...schulungen, createdSchulung])
        setShowNewSchulungModal(false)
        setNewSchulung({
          title: '',
          description: '',
          duration: '2 Stunden',
          points: 10,
          category: 'grundlagen',
        })
      } else {
        console.error('Failed to create schulung')
        alert('Fehler beim Erstellen der Schulung')
      }
    } catch (error) {
      console.error('Error creating schulung:', error)
      alert('Fehler beim Erstellen der Schulung')
    }
  }

  const handleAddSerie = () => {
    const totalPoints = newSerie.schulungIds.reduce((sum, id) => {
      const schulung = schulungen.find(s => s.id === id)
      return sum + (schulung?.points || 0)
    }, 0)

    const newSerieItem: SchulungSerie = {
      id: `ser-new-${Date.now()}`,
      title: newSerie.title,
      description: newSerie.description,
      schulungIds: newSerie.schulungIds,
      totalPoints,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    }
    setSerien([...serien, newSerieItem])
    setShowNewSerieModal(false)
    setNewSerie({
      title: '',
      description: '',
      schulungIds: [],
    })
  }

  const handleDeleteSchulung = async (id: string) => {
    if (confirm('Möchten Sie diese Schulung wirklich löschen?')) {
      try {
        const res = await fetch(`/api/schulungen/${id}`, {
          method: 'DELETE',
        })

        if (res.ok) {
          setSchulungen(schulungen.filter(s => s.id !== id))
        } else {
          alert('Fehler beim Löschen der Schulung')
        }
      } catch (error) {
        console.error('Error deleting schulung:', error)
        alert('Fehler beim Löschen der Schulung')
      }
    }
  }

  const handleDeleteSerie = (id: string) => {
    if (confirm('Möchten Sie diese Serie wirklich löschen?')) {
      setSerien(serien.filter(s => s.id !== id))
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <AdminHeader
        title="Schulungskatalog"
        subtitle={`${schulungen.length} Schulungen, ${serien.length} Serien`}
      />

      <div className="flex-1 overflow-auto p-6">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        )}

        {!isLoading && (
          <>
            {/* View Mode Toggle */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('schulungen')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'schulungen'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <GraduationCap className="h-4 w-4" />
                  Schulungen
                </button>
                <button
                  onClick={() => setViewMode('serien')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'serien'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Layers className="h-4 w-4" />
                  Serien
                </button>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={viewMode === 'schulungen' ? 'Schulungen suchen...' : 'Serien suchen...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            {/* Category Filter (only for Schulungen) */}
            {viewMode === 'schulungen' && (
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-4 pr-10 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="alle">Alle Kategorien</option>
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            )}

            {/* Add Button */}
            <button
              onClick={() => viewMode === 'schulungen' ? setShowNewSchulungModal(true) : setShowNewSerieModal(true)}
              className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {viewMode === 'schulungen' ? 'Neue Schulung' : 'Neue Serie'}
            </button>
            </div>

            {/* Schulungen Grid */}
        {viewMode === 'schulungen' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSchulungen.map((schulung) => (
              <div
                key={schulung.id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                      <GraduationCap className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{schulung.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryConfig[schulung.category].color}`}>
                        {categoryConfig[schulung.category].label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSchulung(schulung.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-500 mb-4">{schulung.description}</p>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Coins className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{schulung.points} Punkte</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{schulung.duration}</span>
                  </div>
                </div>

                {schulung.isCustom && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">Individuell erstellt</span>
                  </div>
                )}
              </div>
            ))}

            {filteredSchulungen.length === 0 && (
              <div className="col-span-full bg-white rounded-xl border border-gray-200 p-12 text-center">
                <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Keine Schulungen gefunden</p>
              </div>
            )}
          </div>
        )}

        {/* Serien Grid */}
        {viewMode === 'serien' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSerien.map((serie) => {
              const serieSchulungen = serie.schulungIds
                .map(id => schulungen.find(s => s.id === id))
                .filter(Boolean) as Schulung[]

              return (
                <div
                  key={serie.id}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                        <Layers className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{serie.title}</h3>
                        <p className="text-sm text-gray-500">
                          {serie.schulungIds.length} Schulungen, {serie.totalPoints} Punkte
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSerie(serie.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 mb-4">{serie.description}</p>

                  {/* Schulungen in Serie */}
                  <div className="space-y-2">
                    {serieSchulungen.map((schulung, index) => (
                      <div
                        key={schulung.id}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600">
                          {index + 1}
                        </span>
                        <span className="flex-1 text-sm text-gray-700">{schulung.title}</span>
                        <span className="text-xs text-gray-500">{schulung.points} P</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            {filteredSerien.length === 0 && (
              <div className="col-span-full bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Layers className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Keine Serien gefunden</p>
                <button
                  onClick={() => setShowNewSerieModal(true)}
                  className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Erste Serie erstellen
                </button>
              </div>
            )}
          </div>
        )}
          </>
        )}
      </div>

      {/* New Schulung Modal */}
      {showNewSchulungModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Neue Schulung</h2>
              <button
                onClick={() => setShowNewSchulungModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
                <input
                  type="text"
                  value={newSchulung.title}
                  onChange={(e) => setNewSchulung({ ...newSchulung, title: e.target.value })}
                  placeholder="z.B. KI im Marketing"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                <textarea
                  rows={3}
                  value={newSchulung.description}
                  onChange={(e) => setNewSchulung({ ...newSchulung, description: e.target.value })}
                  placeholder="Worum geht es in der Schulung?"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
                  <select
                    value={newSchulung.category}
                    onChange={(e) => setNewSchulung({ ...newSchulung, category: e.target.value as 'grundlagen' | 'fortgeschritten' | 'spezialisiert' })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    {Object.entries(categoryConfig).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dauer</label>
                  <input
                    type="text"
                    value={newSchulung.duration}
                    onChange={(e) => setNewSchulung({ ...newSchulung, duration: e.target.value })}
                    placeholder="z.B. 3 Stunden"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Punkte</label>
                  <input
                    type="number"
                    value={newSchulung.points}
                    onChange={(e) => setNewSchulung({ ...newSchulung, points: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setShowNewSchulungModal(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleAddSchulung}
                disabled={!newSchulung.title.trim() || !newSchulung.description.trim()}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Schulung erstellen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Serie Modal */}
      {showNewSerieModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Neue Serie</h2>
              <button
                onClick={() => setShowNewSerieModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
                <input
                  type="text"
                  value={newSerie.title}
                  onChange={(e) => setNewSerie({ ...newSerie, title: e.target.value })}
                  placeholder="z.B. KI-Einführung Komplett"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                <textarea
                  rows={2}
                  value={newSerie.description}
                  onChange={(e) => setNewSerie({ ...newSerie, description: e.target.value })}
                  placeholder="Worum geht es in der Serie?"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schulungen auswählen ({newSerie.schulungIds.length} ausgewählt)
                </label>
                <div className="space-y-2 max-h-60 overflow-auto border border-gray-200 rounded-lg p-2">
                  {schulungen.map((schulung) => {
                    const isSelected = newSerie.schulungIds.includes(schulung.id)
                    const index = newSerie.schulungIds.indexOf(schulung.id)
                    return (
                      <div
                        key={schulung.id}
                        onClick={() => {
                          if (isSelected) {
                            setNewSerie({
                              ...newSerie,
                              schulungIds: newSerie.schulungIds.filter(id => id !== schulung.id)
                            })
                          } else {
                            setNewSerie({
                              ...newSerie,
                              schulungIds: [...newSerie.schulungIds, schulung.id]
                            })
                          }
                        }}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-primary-50 border border-primary-200'
                            : 'bg-gray-50 border border-transparent hover:bg-gray-100'
                        }`}
                      >
                        {isSelected && (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-xs font-medium text-white">
                            {index + 1}
                          </span>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{schulung.title}</p>
                          <p className="text-xs text-gray-500">{schulung.points} Punkte, {schulung.duration}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryConfig[schulung.category].color}`}>
                          {categoryConfig[schulung.category].label}
                        </span>
                      </div>
                    )
                  })}
                </div>
                {newSerie.schulungIds.length > 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    Gesamt: {newSerie.schulungIds.reduce((sum, id) => {
                      const schulung = schulungen.find(s => s.id === id)
                      return sum + (schulung?.points || 0)
                    }, 0)} Punkte
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setShowNewSerieModal(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleAddSerie}
                disabled={!newSerie.title.trim() || newSerie.schulungIds.length < 2}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Serie erstellen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
