'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import {
  GraduationCap,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
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
  BookOpen,
  Clock,
  Loader2,
  Users,
  Play,
  Video,
  Award,
  Layers,
  ArrowLeft,
} from 'lucide-react'
import type { Schulung, SchulungSerie, SchulungFormat } from '@/types'

const formatLabels: Record<SchulungFormat, { label: string; color: string; icon: typeof Video }> = {
  live: { label: 'Live-Training', color: 'bg-blue-100 text-blue-700', icon: Users },
  self_learning: { label: 'Self-Learning', color: 'bg-purple-100 text-purple-700', icon: BookOpen },
  hybrid: { label: 'Hybrid', color: 'bg-green-100 text-green-700', icon: Play },
}

const categoryLabels: Record<string, { label: string; color: string }> = {
  grundlagen: { label: 'Grundlagen', color: 'bg-blue-100 text-blue-700' },
  fortgeschritten: { label: 'Fortgeschritten', color: 'bg-purple-100 text-purple-700' },
  spezialisiert: { label: 'Spezialisiert', color: 'bg-amber-100 text-amber-700' },
}

const schulungsKategorien = [
  { id: 'A', title: 'KI-Grundlagen & Orientierung', icon: Brain, themen: ['Was ist Künstliche Intelligenz?', 'Machine Learning vs. Deep Learning', 'Generative KI: Funktionsweise'] },
  { id: 'B', title: 'KI sicher & verantwortungsvoll einsetzen', icon: Shield, themen: ['Datenschutz & DSGVO', 'Risiken & Halluzinationen', 'KI-Governance'] },
  { id: 'C', title: 'Arbeiten mit KI im Alltag', icon: Briefcase, themen: ['Prompting-Grundlagen', 'KI-Ergebnisse prüfen', 'Effizientes Arbeiten'] },
  { id: 'D', title: 'Inhalte mit KI erstellen', icon: FileText, themen: ['Texterstellung', 'Präsentationen', 'Bilder & Grafiken'] },
  { id: 'E', title: 'Analysen & Entscheidungen', icon: BarChart3, themen: ['Dokumente analysieren', 'Dateninterpretation', 'Grenzen verstehen'] },
]

export default function SchulungskatalogPage() {
  const router = useRouter()
  const { customerId } = useAuth()
  const [schulungen, setSchulungen] = useState<Schulung[]>([])
  const [serien, setSerien] = useState<SchulungSerie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'alle' | 'einzelkurse' | 'serien'>('alle')
  const [categoryFilter, setCategoryFilter] = useState<string>('alle')
  const [formData, setFormData] = useState({
    themen: '',
    nachricht: '',
  })

  // Fetch all schulungen
  useEffect(() => {
    const fetchSchulungen = async () => {
      try {
        const res = await fetch('/api/schulungen')
        if (res.ok) {
          const data = await res.json()
          setSchulungen(data.schulungen || [])
          setSerien(data.serien || [])
        }
      } catch (error) {
        console.error('Error fetching schulungen:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchulungen()
  }, [])

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

  // Filter schulungen
  const filteredSchulungen = schulungen.filter((s) => {
    if (categoryFilter !== 'alle' && s.category !== categoryFilter) return false
    return true
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Schulungskatalog"
        subtitle="Entdecken Sie unsere KI-Trainings"
      />

      <div className="p-6">
        <div className="mx-auto max-w-5xl">
          {/* Breadcrumb / Back Link */}
          <div className="mb-6">
            <Link
              href="/schulungen"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück zu Ihren Schulungen
            </Link>
          </div>

          {/* Hero Section */}
          <Card className="mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8 text-white">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-white/20 p-3">
                  <BookOpen className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-1">
                    Unser Schulungsangebot
                  </h2>
                  <p className="text-primary-100 text-sm leading-relaxed max-w-2xl">
                    Von Grundlagen bis Spezialisierung - wir bieten Live-Trainings und Self-Learning Kurse,
                    die individuell auf Ihre Bedürfnisse zugeschnitten werden.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Filter */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setActiveFilter('alle')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeFilter === 'alle'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Alle
              </button>
              <button
                onClick={() => setActiveFilter('einzelkurse')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeFilter === 'einzelkurse'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Einzelkurse
              </button>
              <button
                onClick={() => setActiveFilter('serien')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeFilter === 'serien'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Kursserien
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Kategorie:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
              >
                <option value="alle">Alle Kategorien</option>
                <option value="grundlagen">Grundlagen</option>
                <option value="fortgeschritten">Fortgeschritten</option>
                <option value="spezialisiert">Spezialisiert</option>
              </select>
            </div>

            <div className="flex-1" />

            <Button variant="outline" size="sm" onClick={() => setShowRequestForm(true)}>
              <Building2 className="mr-2 h-4 w-4" />
              Individuelle Schulung anfragen
            </Button>
          </div>

          {/* Serien Section */}
          {/* Featured/Premium Series */}
          {(activeFilter === 'alle' || activeFilter === 'serien') && serien.filter(s => s.isFeatured).length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-600" />
                Premium Schulungsserien
              </h3>
              <div className="grid gap-4">
                {serien.filter(s => s.isFeatured).map((serie) => (
                  <Link key={serie.id} href={`/schulungen/serien/${serie.id}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-white">
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                              <Award className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900">{serie.title}</h4>
                                <Badge className="bg-amber-100 text-amber-700 text-xs">
                                  Premium
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500">
                                {serie.heroTagline || `${serie.schulungItems?.length || 0} Module • ${serie.totalPoints} Punkte`}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{serie.description}</p>
                        {serie.benefits && serie.benefits.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {serie.benefits.slice(0, 4).map((benefit, index) => (
                              <span key={index} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white border border-gray-200 text-xs text-gray-600">
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                {benefit}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Regular Series */}
          {(activeFilter === 'alle' || activeFilter === 'serien') && serien.filter(s => !s.isFeatured).length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary-600" />
                Kursserien
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {serien.filter(s => !s.isFeatured).map((serie) => (
                  <Link key={serie.id} href={`/schulungen/serien/${serie.id}`}>
                    <Card className="overflow-hidden hover:shadow-md transition-all cursor-pointer group h-full">
                      <div className="bg-gradient-to-r from-primary-50 to-primary-100 px-4 py-3 border-b border-primary-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary-200 flex items-center justify-center">
                              <Layers className="h-4 w-4 text-primary-700" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 text-sm">{serie.title}</h4>
                              <p className="text-xs text-gray-500">
                                {serie.schulungItems?.length || 0} Kurse
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-primary-100 text-primary-700 text-xs">
                            {serie.totalPoints} Punkte
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-600 mb-3">{serie.description}</p>
                        <div className="space-y-1.5">
                          {serie.schulungItems?.slice(0, 3).map((item: any, index: number) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-2 text-xs text-gray-500"
                            >
                              <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium">
                                {index + 1}
                              </span>
                              <span className="truncate">{item.schulung?.title}</span>
                            </div>
                          ))}
                          {(serie.schulungItems?.length || 0) > 3 && (
                            <p className="text-xs text-gray-400 ml-7">
                              + {(serie.schulungItems?.length || 0) - 3} weitere Kurse
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Einzelkurse Section */}
          {(activeFilter === 'alle' || activeFilter === 'einzelkurse') && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary-600" />
                Einzelkurse
                <span className="text-gray-400 font-normal">({filteredSchulungen.length})</span>
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSchulungen.map((schulung) => {
                  const FormatIcon = formatLabels[schulung.format || 'live']?.icon || Users
                  const catInfo = categoryLabels[schulung.category] || categoryLabels.grundlagen

                  return (
                    <div
                      key={schulung.id}
                      onClick={() => router.push(`/schulungen/${schulung.id}`)}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer group"
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-[16/9] bg-gradient-to-br from-gray-700 to-gray-900">
                        {schulung.videoThumbnail ? (
                          <img
                            src={schulung.videoThumbnail}
                            alt={schulung.title}
                            className="absolute inset-0 w-full h-full object-cover opacity-80"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-primary-800/30" />
                        )}

                        {/* Play Button */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                            <Play className="h-4 w-4 text-primary-600 ml-0.5" />
                          </div>
                        </div>

                        {/* Format Badge */}
                        <div className="absolute top-2 left-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${formatLabels[schulung.format || 'live']?.color}`}>
                            <FormatIcon className="h-3 w-3" />
                            {formatLabels[schulung.format || 'live']?.label}
                          </span>
                        </div>

                        {/* Category Badge */}
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${catInfo.color}`}>
                            {catInfo.label}
                          </span>
                        </div>

                        {/* Duration */}
                        <div className="absolute bottom-2 right-2">
                          <span className="px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-medium flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            {schulung.duration}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-3">
                        <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">
                          {schulung.title}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                          {schulung.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-xs text-primary-600 font-medium">
                            <Award className="h-3 w-3" />
                            {schulung.points} Punkte
                          </span>
                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Themengebiete */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary-600" />
                Themengebiete
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
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
