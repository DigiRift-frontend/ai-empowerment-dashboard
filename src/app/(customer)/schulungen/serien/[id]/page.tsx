'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  GraduationCap,
  Layers,
  Loader2,
  Scale,
  Shield,
  Sparkles,
  Target,
  Users,
  Wrench,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import type { SchulungSerie, SchulungSerieItem, CustomerSchulungAssignment } from '@/types'

// Module icons mapping
const moduleIcons: Record<number, typeof Brain> = {
  1: Brain,
  2: Scale,
  3: Shield,
  4: Wrench,
}

export default function SerieDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { customerId } = useAuth()
  const [serie, setSerie] = useState<SchulungSerie | null>(null)
  const [assignment, setAssignment] = useState<CustomerSchulungAssignment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedModule, setExpandedModule] = useState<number | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return

      try {
        // Fetch serie details
        const serieRes = await fetch(`/api/schulungen/serien/${params.id}`)
        if (serieRes.ok) {
          const serieData = await serieRes.json()
          setSerie(serieData)
        }

        // Fetch customer's assignment if logged in
        if (customerId) {
          const assignmentRes = await fetch(`/api/customers/${customerId}/schulungen`)
          if (assignmentRes.ok) {
            const assignments = await assignmentRes.json()
            const serieAssignment = assignments.find(
              (a: CustomerSchulungAssignment) => a.serieId === params.id
            )
            if (serieAssignment) {
              setAssignment(serieAssignment)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.id, customerId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!serie) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Serie nicht gefunden</p>
          <Link href="/schulungen/katalog" className="text-primary-600 hover:underline mt-2 inline-block">
            Zurück zum Katalog
          </Link>
        </div>
      </div>
    )
  }

  const schulungItems = serie.schulungItems || []
  const totalDuration = schulungItems.reduce((acc, item) => {
    const hours = parseInt(item.schulung?.duration || '0') || 2
    return acc + hours
  }, 0)

  const isCompleted = assignment?.status === 'abgeschlossen'
  const isAssigned = !!assignment

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title={serie.title}
        subtitle={serie.heroTagline || 'Premium Schulungsserie'}
      />

      <div className="p-6">
        <div className="mx-auto max-w-5xl">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              href="/schulungen/katalog"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück zum Schulungskatalog
            </Link>
          </div>

          {/* Hero Section */}
          <Card className="mb-8 overflow-hidden">
            <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 px-8 py-12 text-white relative">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
              </div>

              <div className="relative">
                {/* Premium Badge */}
                {serie.isFeatured && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-amber-900 text-xs font-medium mb-4">
                    <Sparkles className="h-3.5 w-3.5" />
                    Premium Workshop
                  </div>
                )}

                {/* Title */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Brain className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">{serie.title}</h1>
                    <p className="text-primary-100 text-lg max-w-2xl">
                      {serie.heroTagline || serie.description}
                    </p>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex flex-wrap gap-6 mt-8">
                  <div className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary-200" />
                    <span>{schulungItems.length} Module</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary-200" />
                    <span>{totalDuration}-{totalDuration + 4}h Gesamt</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary-200" />
                    <span>{serie.totalPoints} Punkte</span>
                  </div>
                  {serie.certificateTitle && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary-200" />
                      <span>Mit Zertifikat</span>
                    </div>
                  )}
                </div>

                {/* CTA */}
                <div className="mt-8">
                  {isAssigned ? (
                    isCompleted ? (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white">
                        <CheckCircle2 className="h-5 w-5" />
                        Abgeschlossen
                      </div>
                    ) : (
                      <Link href="/schulungen">
                        <Button size="lg" className="bg-white text-primary-700 hover:bg-primary-50">
                          Zu Ihren Schulungen
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    )
                  ) : (
                    <Button size="lg" className="bg-white text-primary-700 hover:bg-primary-50">
                      Jetzt für Ihr Team anfragen
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Benefits Grid */}
          {serie.benefits && serie.benefits.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {serie.benefits.map((benefit, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-700">{benefit}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Module Timeline */}
          <Card className="mb-8">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary-600" />
                Was Sie lernen
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {schulungItems.length} Module für umfassende KI-Kompetenz
              </p>
            </div>

            <div className="divide-y divide-gray-100">
              {schulungItems.map((item, index) => {
                const schulung = item.schulung
                if (!schulung) return null

                const ModuleIcon = moduleIcons[index + 1] || BookOpen
                const isExpanded = expandedModule === index

                // Check if this module is completed (for assigned series)
                const isModuleCompleted = assignment?.completedSchulungIds?.includes(schulung.id)

                return (
                  <div key={item.id} className="p-6">
                    {/* Module Header */}
                    <button
                      onClick={() => setExpandedModule(isExpanded ? null : index)}
                      className="w-full text-left"
                    >
                      <div className="flex items-start gap-4">
                        {/* Module Number & Icon */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isModuleCompleted
                            ? 'bg-green-100'
                            : 'bg-primary-100'
                        }`}>
                          {isModuleCompleted ? (
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                          ) : (
                            <ModuleIcon className="h-6 w-6 text-primary-600" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-primary-600">
                              Modul {index + 1}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {schulung.duration}
                            </Badge>
                            {isModuleCompleted && (
                              <Badge className="bg-green-100 text-green-700 text-xs">
                                Abgeschlossen
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-medium text-gray-900 group-hover:text-primary-600">
                            {schulung.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {schulung.description}
                          </p>
                        </div>

                        <div className="flex-shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="mt-6 ml-16 space-y-4">
                        {/* Learning Goals */}
                        {schulung.learningGoals && schulung.learningGoals.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              Inhalte
                            </h4>
                            <div className="space-y-2">
                              {schulung.learningGoals.map((goal, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0" />
                                  {goal}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Outcomes */}
                        {schulung.outcomes && schulung.outcomes.length > 0 && (
                          <div className="bg-primary-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-primary-700 mb-2 flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              Kompetenz nach Modul
                            </h4>
                            <p className="text-sm text-primary-800">
                              {schulung.outcomes[0]}
                            </p>
                          </div>
                        )}

                        {/* Link to detail page */}
                        <Link
                          href={`/schulungen/${schulung.id}`}
                          className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700"
                        >
                          Mehr erfahren
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    )}

                    {/* Arrow to next module */}
                    {index < schulungItems.length - 1 && !isExpanded && (
                      <div className="flex justify-center mt-4">
                        <div className="w-px h-8 bg-gray-200" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Certificate Section */}
          {serie.certificateTitle && (
            <Card className="mb-8 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-8">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-amber-200 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="h-8 w-8 text-amber-700" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Zertifikat
                    </h2>
                    <p className="text-gray-600 mb-4">
                      Nach erfolgreichem Abschluss aller {schulungItems.length} Module erhalten alle Teilnehmer ein Zertifikat:
                    </p>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Teilnahme an allen Modulen dokumentiert
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Nachweis über erworbene Kompetenzen
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        {serie.certificateTitle}
                      </li>
                    </ul>

                    {/* Certificate Preview */}
                    <div className="bg-white rounded-lg border-2 border-dashed border-amber-300 p-6 text-center max-w-md">
                      <div className="text-xs text-gray-400 mb-2">ZERTIFIKAT</div>
                      <div className="text-lg font-serif text-gray-700">
                        {serie.title}
                      </div>
                      <div className="text-sm text-gray-500 mt-2">
                        {serie.certificateTitle}
                      </div>
                      <div className="mt-4 text-xs text-gray-400">
                        Mit Verifizierungscode
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Target Audience */}
          {serie.targetAudience && (
            <Card className="mb-8">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary-600" />
                  Für wen ist dieser Workshop?
                </h2>
                <p className="text-gray-600 whitespace-pre-line">
                  {serie.targetAudience}
                </p>
              </div>
            </Card>
          )}

          {/* CTA Section */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-center text-white">
              <h2 className="text-xl font-semibold mb-2">
                Bereit für KI-Kompetenz in Ihrem Team?
              </h2>
              <p className="text-gray-300 mb-6 max-w-xl mx-auto">
                Wir passen den Workshop individuell auf Ihr Unternehmen an - mit praxisnahen Beispielen aus Ihrer Branche.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-primary-600 hover:bg-primary-700">
                  Jetzt anfragen
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Link href="/schulungen/katalog">
                  <Button size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                    Weitere Schulungen
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
