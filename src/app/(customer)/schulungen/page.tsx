'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCustomer } from '@/hooks/use-customers'
import { useAuth } from '@/hooks/use-auth'
import { formatDate } from '@/lib/utils'
import {
  GraduationCap,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Building2,
  Send,
  X,
  CheckCircle2,
  Brain,
  Shield,
  Briefcase,
  FileText,
  BarChart3,
  Megaphone,
  Workflow,
  Database,
  Rocket,
  TrendingUp,
  BookOpen,
  Calendar,
  Clock,
  Loader2,
  Users,
  Play,
  Video,
  Star,
  Award,
  ChevronRightIcon,
} from 'lucide-react'
import type { CustomerSchulungAssignment, Schulung, SchulungFormat } from '@/types'

type TabType = 'anstehend' | 'abgeschlossen' | 'alle'

const formatLabels: Record<SchulungFormat, { label: string; color: string; icon: typeof Video }> = {
  live: { label: 'Live-Training', color: 'bg-blue-100 text-blue-700', icon: Users },
  self_learning: { label: 'Self-Learning', color: 'bg-purple-100 text-purple-700', icon: BookOpen },
  hybrid: { label: 'Hybrid', color: 'bg-green-100 text-green-700', icon: Play },
}

const statusLabels: Record<string, { label: string; color: string }> = {
  geplant: { label: 'Geplant', color: 'bg-gray-100 text-gray-700' },
  in_vorbereitung: { label: 'In Vorbereitung', color: 'bg-yellow-100 text-yellow-700' },
  durchgefuehrt: { label: 'Durchgeführt', color: 'bg-blue-100 text-blue-700' },
  abgeschlossen: { label: 'Abgeschlossen', color: 'bg-green-100 text-green-700' },
}

const categoryLabels: Record<string, string> = {
  grundlagen: 'Grundlagen',
  fortgeschritten: 'Fortgeschritten',
  spezialisiert: 'Spezialisiert',
}

const schulungsKategorien = [
  { id: 'A', title: 'KI-Grundlagen & Orientierung', icon: Brain, themen: ['Was ist Künstliche Intelligenz?', 'Machine Learning vs. Deep Learning', 'Generative KI: Funktionsweise'] },
  { id: 'B', title: 'KI sicher & verantwortungsvoll einsetzen', icon: Shield, themen: ['Datenschutz & DSGVO', 'Risiken & Halluzinationen', 'KI-Governance'] },
  { id: 'C', title: 'Arbeiten mit KI im Alltag', icon: Briefcase, themen: ['Prompting-Grundlagen', 'KI-Ergebnisse prüfen', 'Effizientes Arbeiten'] },
  { id: 'D', title: 'Inhalte mit KI erstellen', icon: FileText, themen: ['Texterstellung', 'Präsentationen', 'Bilder & Grafiken'] },
  { id: 'E', title: 'Analysen & Entscheidungen', icon: BarChart3, themen: ['Dokumente analysieren', 'Dateninterpretation', 'Grenzen verstehen'] },
]

export default function SchulungenPage() {
  const router = useRouter()
  const { customerId } = useAuth()
  const { customer, isLoading } = useCustomer(customerId || '')
  const [activeTab, setActiveTab] = useState<TabType>('anstehend')
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [assignments, setAssignments] = useState<CustomerSchulungAssignment[]>([])
  const [formData, setFormData] = useState({
    themen: '',
    nachricht: '',
  })

  // Fetch customer's schulung assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!customerId) return

      try {
        const res = await fetch(`/api/customers/${customerId}/schulungen`)
        if (res.ok) {
          const data = await res.json()
          setAssignments(data)
        }
      } catch (error) {
        console.error('Error fetching assignments:', error)
      }
    }

    fetchAssignments()
  }, [customerId])

  const toggleCategory = (id: string) => {
    setExpandedCategory(expandedCategory === id ? null : id)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitted(true)
    setTimeout(() => {
      setShowRequestForm(false)
      setFormSubmitted(false)
      setFormData({ themen: '', nachricht: '' })
    }, 2000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  // Filter assignments based on active tab
  const filteredAssignments = assignments.filter(assignment => {
    if (activeTab === 'anstehend') {
      return assignment.status !== 'abgeschlossen'
    } else if (activeTab === 'abgeschlossen') {
      return assignment.status === 'abgeschlossen'
    }
    return true
  })

  const anstehendCount = assignments.filter(a => a.status !== 'abgeschlossen').length
  const abgeschlossenCount = assignments.filter(a => a.status === 'abgeschlossen').length

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="KI-Schulungen"
        subtitle="Wissen für Ihr Team"
      />

      <div className="p-6">
        <div className="mx-auto max-w-5xl">
          {/* Hero Section */}
          <Card className="mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8 text-white">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-white/20 p-3">
                  <Sparkles className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">
                    Ihre Lernplattform für KI-Kompetenz
                  </h2>
                  <p className="text-primary-100 text-sm leading-relaxed max-w-2xl">
                    Ob Self-Learning oder Live-Training - wir befähigen Ihr Team zum erfolgreichen
                    Einsatz von KI. Jede Schulung ist individuell auf Ihr Unternehmen zugeschnitten.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Tabs for Assignments */}
          {assignments.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Ihre Schulungen</h3>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('anstehend')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'anstehend'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Anstehend
                    {anstehendCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 text-xs">
                        {anstehendCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('abgeschlossen')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'abgeschlossen'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Abgeschlossen
                    {abgeschlossenCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs">
                        {abgeschlossenCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('alle')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'alle'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Alle
                  </button>
                </div>
              </div>

              {/* Assignment Cards */}
              <div className="grid md:grid-cols-2 gap-4">
                {filteredAssignments.map((assignment) => {
                  const schulung = assignment.schulung
                  if (!schulung) return null

                  const format = schulung.format || 'live'
                  const FormatIcon = formatLabels[format]?.icon || Users

                  return (
                    <div
                      key={assignment.id}
                      onClick={() => router.push(`/schulungen/${schulung.id}`)}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                    >
                      {/* Video Thumbnail */}
                      <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900">
                        {schulung.videoThumbnail ? (
                          <img
                            src={schulung.videoThumbnail}
                            alt={schulung.title}
                            className="absolute inset-0 w-full h-full object-cover opacity-80"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/30 to-primary-800/40" />
                        )}

                        {/* Play Button */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="h-6 w-6 text-primary-600 ml-1" />
                          </div>
                        </div>

                        {/* Format Badge */}
                        <div className="absolute top-3 left-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${formatLabels[format]?.color}`}>
                            <FormatIcon className="h-3.5 w-3.5" />
                            {formatLabels[format]?.label}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusLabels[assignment.status]?.color}`}>
                            {statusLabels[assignment.status]?.label}
                          </span>
                        </div>

                        {/* Duration */}
                        <div className="absolute bottom-3 right-3">
                          <span className="px-2.5 py-1 rounded-lg bg-black/60 text-white text-xs font-medium flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {schulung.duration}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                          {schulung.title}
                        </h4>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                          {schulung.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-sm">
                            {assignment.scheduledDate && format === 'live' && (
                              <span className="flex items-center gap-1 text-gray-500">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDate(assignment.scheduledDate)}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-primary-600 font-medium">
                              <Award className="h-3.5 w-3.5" />
                              {schulung.points} Punkte
                            </span>
                          </div>

                          {/* Rating (for completed) */}
                          {assignment.rating && (
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-3.5 w-3.5 ${
                                    star <= assignment.rating!
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Arrow indicator */}
                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-end">
                          <span className="text-sm text-primary-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                            Details ansehen
                            <ChevronRightIcon className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {filteredAssignments.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    {activeTab === 'anstehend'
                      ? 'Keine anstehenden Schulungen'
                      : activeTab === 'abgeschlossen'
                        ? 'Noch keine abgeschlossenen Schulungen'
                        : 'Keine Schulungen zugewiesen'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Schulungskatalog */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary-600" />
                  Schulungskatalog
                </CardTitle>
                <Button variant="outline" onClick={() => setShowRequestForm(true)}>
                  <Building2 className="mr-2 h-4 w-4" />
                  Schulung anfragen
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Entdecken Sie unsere Themenbereiche und fordern Sie individuelle Schulungen an.
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {schulungsKategorien.map((kategorie) => {
                  const isExpanded = expandedCategory === kategorie.id
                  const Icon = kategorie.icon

                  return (
                    <div key={kategorie.id}>
                      <button
                        onClick={() => toggleCategory(kategorie.id)}
                        className="flex w-full items-center gap-4 px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
                          <Icon className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-primary-600">{kategorie.id}.</span>
                            <span className="font-medium text-gray-900">{kategorie.title}</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {kategorie.themen.length} Themen
                          </p>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="bg-gray-50 px-6 py-4">
                          <div className="ml-14 space-y-2">
                            {kategorie.themen.map((thema, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-3 text-sm text-gray-700"
                              >
                                <div className="h-1.5 w-1.5 rounded-full bg-primary-400" />
                                {thema}
                              </div>
                            ))}
                          </div>
                          <div className="ml-14 mt-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setFormData({ ...formData, themen: kategorie.title })
                                setShowRequestForm(true)
                              }}
                            >
                              Schulung anfragen
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-8 text-center">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 font-semibold text-gray-900">
              Individuelle Anforderungen?
            </h3>
            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
              Wir entwickeln maßgeschneiderte Schulungsprogramme – abgestimmt auf Ihre Branche und Ziele.
            </p>
            <Button className="mt-4" onClick={() => setShowRequestForm(true)}>
              Anfrage stellen
            </Button>
          </div>
        </div>
      </div>

      {/* Request Form Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl">
            {formSubmitted ? (
              <div className="p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  Anfrage gesendet!
                </h3>
                <p className="mt-2 text-gray-500">
                  Wir melden uns innerhalb von 24 Stunden bei Ihnen.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Schulung anfragen</h3>
                    <p className="text-sm text-gray-500">Wir erstellen ein individuelles Angebot</p>
                  </div>
                  <button
                    onClick={() => setShowRequestForm(false)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gewünschte Themen
                    </label>
                    <input
                      type="text"
                      value={formData.themen}
                      onChange={(e) => setFormData({ ...formData, themen: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="z.B. Prompting, KI im Marketing"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weitere Informationen
                    </label>
                    <textarea
                      rows={3}
                      value={formData.nachricht}
                      onChange={(e) => setFormData({ ...formData, nachricht: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="Format (Online/Präsenz), Teilnehmer, Vorkenntnisse..."
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowRequestForm(false)}
                    >
                      Abbrechen
                    </Button>
                    <Button type="submit" className="flex-1">
                      <Send className="mr-2 h-4 w-4" />
                      Absenden
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
