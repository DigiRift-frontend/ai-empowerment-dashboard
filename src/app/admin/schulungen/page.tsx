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
  Upload,
  FileText,
  File,
  Download,
  Paperclip,
} from 'lucide-react'

interface SchulungMaterial {
  id: string
  title: string
  fileUrl: string
  fileType: string
  createdAt: string
}

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

  // Materials management
  const [selectedSchulungForMaterials, setSelectedSchulungForMaterials] = useState<Schulung | null>(null)
  const [materials, setMaterials] = useState<SchulungMaterial[]>([])
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false)
  const [isUploadingMaterial, setIsUploadingMaterial] = useState(false)
  const [newMaterialTitle, setNewMaterialTitle] = useState('')

  // Edit Schulung state
  const [editingSchulung, setEditingSchulung] = useState<Schulung | null>(null)
  const [editSchulungData, setEditSchulungData] = useState({
    title: '',
    description: '',
    duration: '',
    points: 0,
    category: 'grundlagen' as 'grundlagen' | 'fortgeschritten' | 'spezialisiert',
    format: 'live' as 'live' | 'self_learning' | 'hybrid',
    learningGoals: [] as string[],
    outcomes: [] as string[],
    videoUrl: '',
  })
  const [isSavingSchulung, setIsSavingSchulung] = useState(false)

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

  // Open edit modal for a Schulung
  const openEditModal = (schulung: Schulung) => {
    setEditingSchulung(schulung)
    setEditSchulungData({
      title: schulung.title,
      description: schulung.description,
      duration: schulung.duration,
      points: schulung.points,
      category: schulung.category,
      format: schulung.format || 'live',
      learningGoals: schulung.learningGoals || [],
      outcomes: schulung.outcomes || [],
      videoUrl: schulung.videoUrl || '',
    })
  }

  // Save edited Schulung
  const handleSaveSchulung = async () => {
    if (!editingSchulung) return

    setIsSavingSchulung(true)
    try {
      const res = await fetch(`/api/schulungen/${editingSchulung.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editSchulungData),
      })

      if (res.ok) {
        const updatedSchulung = await res.json()
        setSchulungen(schulungen.map(s => s.id === editingSchulung.id ? updatedSchulung : s))
        setEditingSchulung(null)
      } else {
        alert('Fehler beim Speichern')
      }
    } catch (error) {
      console.error('Error saving schulung:', error)
      alert('Fehler beim Speichern')
    } finally {
      setIsSavingSchulung(false)
    }
  }

  // Handle learning goals/outcomes editing
  const addLearningGoal = () => {
    setEditSchulungData({
      ...editSchulungData,
      learningGoals: [...editSchulungData.learningGoals, ''],
    })
  }

  const updateLearningGoal = (index: number, value: string) => {
    const newGoals = [...editSchulungData.learningGoals]
    newGoals[index] = value
    setEditSchulungData({ ...editSchulungData, learningGoals: newGoals })
  }

  const removeLearningGoal = (index: number) => {
    setEditSchulungData({
      ...editSchulungData,
      learningGoals: editSchulungData.learningGoals.filter((_, i) => i !== index),
    })
  }

  const addOutcome = () => {
    setEditSchulungData({
      ...editSchulungData,
      outcomes: [...editSchulungData.outcomes, ''],
    })
  }

  const updateOutcome = (index: number, value: string) => {
    const newOutcomes = [...editSchulungData.outcomes]
    newOutcomes[index] = value
    setEditSchulungData({ ...editSchulungData, outcomes: newOutcomes })
  }

  const removeOutcome = (index: number) => {
    setEditSchulungData({
      ...editSchulungData,
      outcomes: editSchulungData.outcomes.filter((_, i) => i !== index),
    })
  }

  // Fetch materials for a schulung
  const fetchMaterials = async (schulungId: string) => {
    setIsLoadingMaterials(true)
    try {
      const res = await fetch(`/api/schulungen/${schulungId}/materials`)
      if (res.ok) {
        const data = await res.json()
        setMaterials(data)
      }
    } catch (error) {
      console.error('Error fetching materials:', error)
    } finally {
      setIsLoadingMaterials(false)
    }
  }

  // Open materials modal
  const openMaterialsModal = (schulung: Schulung) => {
    setSelectedSchulungForMaterials(schulung)
    fetchMaterials(schulung.id)
  }

  // Upload material
  const handleUploadMaterial = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedSchulungForMaterials) return

    setIsUploadingMaterial(true)
    try {
      // First upload the file
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'schulung-material')

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes.ok) {
        const error = await uploadRes.json()
        throw new Error(error.error || 'Upload fehlgeschlagen')
      }

      const uploadData = await uploadRes.json()

      // Get file extension for type
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'pdf'

      // Then create the material record
      const materialRes = await fetch(`/api/schulungen/${selectedSchulungForMaterials.id}/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newMaterialTitle || file.name.replace(/\.[^/.]+$/, ''),
          fileUrl: uploadData.url,
          fileType: fileExt,
        }),
      })

      if (materialRes.ok) {
        const newMaterial = await materialRes.json()
        setMaterials([newMaterial, ...materials])
        setNewMaterialTitle('')
        // Reset file input
        e.target.value = ''
      } else {
        throw new Error('Material konnte nicht gespeichert werden')
      }
    } catch (error) {
      console.error('Error uploading material:', error)
      alert(error instanceof Error ? error.message : 'Fehler beim Hochladen')
    } finally {
      setIsUploadingMaterial(false)
    }
  }

  // Delete material
  const handleDeleteMaterial = async (materialId: string) => {
    if (!selectedSchulungForMaterials) return
    if (!confirm('Möchten Sie dieses Material wirklich löschen?')) return

    try {
      const res = await fetch(`/api/schulungen/${selectedSchulungForMaterials.id}/materials?materialId=${materialId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setMaterials(materials.filter(m => m.id !== materialId))
      } else {
        alert('Fehler beim Löschen')
      }
    } catch (error) {
      console.error('Error deleting material:', error)
      alert('Fehler beim Löschen')
    }
  }

  // Get file type icon
  const getFileTypeIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />
      case 'pptx':
      case 'ppt':
        return <FileText className="h-5 w-5 text-orange-500" />
      case 'docx':
      case 'doc':
        return <FileText className="h-5 w-5 text-blue-500" />
      case 'xlsx':
      case 'xls':
        return <FileText className="h-5 w-5 text-green-500" />
      case 'mp4':
      case 'webm':
        return <Video className="h-5 w-5 text-purple-500" />
      default:
        return <File className="h-5 w-5 text-gray-500" />
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
                    <button
                      onClick={() => openMaterialsModal(schulung)}
                      className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Materialien verwalten"
                    >
                      <Paperclip className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(schulung)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Bearbeiten"
                    >
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
                  {schulung.materials && schulung.materials.length > 0 && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <Paperclip className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{schulung.materials.length} Material{schulung.materials.length !== 1 ? 'ien' : ''}</span>
                    </div>
                  )}
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

      {/* Edit Schulung Modal */}
      {editingSchulung && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Schulung bearbeiten</h2>
              <button
                onClick={() => setEditingSchulung(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6 space-y-4">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
                <input
                  type="text"
                  value={editSchulungData.title}
                  onChange={(e) => setEditSchulungData({ ...editSchulungData, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                <textarea
                  rows={3}
                  value={editSchulungData.description}
                  onChange={(e) => setEditSchulungData({ ...editSchulungData, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
                  <select
                    value={editSchulungData.category}
                    onChange={(e) => setEditSchulungData({ ...editSchulungData, category: e.target.value as 'grundlagen' | 'fortgeschritten' | 'spezialisiert' })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    {Object.entries(categoryConfig).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                  <select
                    value={editSchulungData.format}
                    onChange={(e) => setEditSchulungData({ ...editSchulungData, format: e.target.value as 'live' | 'self_learning' | 'hybrid' })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    {Object.entries(formatConfig).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dauer</label>
                  <input
                    type="text"
                    value={editSchulungData.duration}
                    onChange={(e) => setEditSchulungData({ ...editSchulungData, duration: e.target.value })}
                    placeholder="z.B. 3 Stunden"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Punkte</label>
                  <input
                    type="number"
                    value={editSchulungData.points}
                    onChange={(e) => setEditSchulungData({ ...editSchulungData, points: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video-Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={editSchulungData.videoUrl}
                    onChange={(e) => setEditSchulungData({ ...editSchulungData, videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=... oder Vimeo/Loom-Link"
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  {editSchulungData.videoUrl && (
                    <a
                      href={editSchulungData.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm"
                    >
                      <Video className="h-4 w-4" />
                      Testen
                    </a>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">YouTube, Vimeo, Loom oder andere Video-URLs</p>
              </div>

              {/* Learning Goals */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Lernziele</label>
                  <button
                    type="button"
                    onClick={addLearningGoal}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    + Hinzufügen
                  </button>
                </div>
                <div className="space-y-2">
                  {editSchulungData.learningGoals.map((goal, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={goal}
                        onChange={(e) => updateLearningGoal(index, e.target.value)}
                        placeholder="z.B. Grundlagen der KI verstehen"
                        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeLearningGoal(index)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-lg"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {editSchulungData.learningGoals.length === 0 && (
                    <p className="text-sm text-gray-400 italic">Noch keine Lernziele definiert</p>
                  )}
                </div>
              </div>

              {/* Outcomes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Ergebnisse / Outcomes</label>
                  <button
                    type="button"
                    onClick={addOutcome}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    + Hinzufügen
                  </button>
                </div>
                <div className="space-y-2">
                  {editSchulungData.outcomes.map((outcome, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={outcome}
                        onChange={(e) => updateOutcome(index, e.target.value)}
                        placeholder="z.B. Eigene Prompts schreiben können"
                        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeOutcome(index)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-lg"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {editSchulungData.outcomes.length === 0 && (
                    <p className="text-sm text-gray-400 italic">Noch keine Outcomes definiert</p>
                  )}
                </div>
              </div>

              {/* Materials shortcut */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setEditingSchulung(null)
                    openMaterialsModal(editingSchulung)
                  }}
                  className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
                >
                  <Paperclip className="h-4 w-4" />
                  Schulungsmaterialien verwalten
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setEditingSchulung(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSaveSchulung}
                disabled={!editSchulungData.title.trim() || isSavingSchulung}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSavingSchulung && <Loader2 className="h-4 w-4 animate-spin" />}
                Speichern
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

      {/* Materials Modal */}
      {selectedSchulungForMaterials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Schulungsmaterialien</h2>
                <p className="text-sm text-gray-500">{selectedSchulungForMaterials.title}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedSchulungForMaterials(null)
                  setMaterials([])
                  setNewMaterialTitle('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {/* Upload Section */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newMaterialTitle}
                      onChange={(e) => setNewMaterialTitle(e.target.value)}
                      placeholder="Titel des Materials (optional)"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 mb-2"
                    />
                    <label className="flex items-center justify-center gap-2 cursor-pointer rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
                      {isUploadingMaterial ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Wird hochgeladen...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Datei hochladen
                        </>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleUploadMaterial}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.mp4,.webm,.zip"
                        disabled={isUploadingMaterial}
                      />
                    </label>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Erlaubt: PDF, Word, Excel, PowerPoint, Bilder, Videos, ZIP (max. 100MB)
                </p>
              </div>

              {/* Materials List */}
              {isLoadingMaterials ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                </div>
              ) : materials.length === 0 ? (
                <div className="text-center py-8">
                  <Paperclip className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Noch keine Materialien vorhanden</p>
                  <p className="text-sm text-gray-400">Laden Sie Dateien hoch, um sie mit der Schulung zu verknüpfen</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    {materials.length} Material{materials.length !== 1 ? 'ien' : ''}
                  </h3>
                  {materials.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      {getFileTypeIcon(material.fileType)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{material.title}</p>
                        <p className="text-xs text-gray-500 uppercase">{material.fileType}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <a
                          href={material.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Herunterladen"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => handleDeleteMaterial(material.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Löschen"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => {
                  setSelectedSchulungForMaterials(null)
                  setMaterials([])
                  setNewMaterialTitle('')
                }}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
