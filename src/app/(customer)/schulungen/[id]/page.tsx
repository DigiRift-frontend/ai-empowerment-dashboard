'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { formatDate } from '@/lib/utils'
import {
  ArrowLeft,
  Play,
  Check,
  Clock,
  Calendar,
  GraduationCap,
  Target,
  Award,
  FileText,
  Download,
  User,
  Video,
  Star,
  MessageSquare,
  Loader2,
  BookOpen,
  Lightbulb,
  Users,
  ExternalLink,
  ChevronRight,
} from 'lucide-react'
import type { Schulung, CustomerSchulungAssignment, SchulungFormat } from '@/types'

const formatLabels: Record<SchulungFormat, string> = {
  live: 'Live-Training',
  self_learning: 'Self-Learning',
  hybrid: 'Hybrid',
}

const formatColors: Record<SchulungFormat, string> = {
  live: 'bg-blue-100 text-blue-700',
  self_learning: 'bg-purple-100 text-purple-700',
  hybrid: 'bg-green-100 text-green-700',
}

const categoryLabels: Record<string, string> = {
  grundlagen: 'Grundlagen',
  fortgeschritten: 'Fortgeschritten',
  spezialisiert: 'Spezialisiert',
}

const categoryColors: Record<string, string> = {
  grundlagen: 'bg-emerald-100 text-emerald-700',
  fortgeschritten: 'bg-amber-100 text-amber-700',
  spezialisiert: 'bg-rose-100 text-rose-700',
}

const statusLabels: Record<string, string> = {
  geplant: 'Geplant',
  in_vorbereitung: 'In Vorbereitung',
  durchgefuehrt: 'Durchgeführt',
  abgeschlossen: 'Abgeschlossen',
}

const statusColors: Record<string, string> = {
  geplant: 'bg-gray-100 text-gray-700',
  in_vorbereitung: 'bg-yellow-100 text-yellow-700',
  durchgefuehrt: 'bg-blue-100 text-blue-700',
  abgeschlossen: 'bg-green-100 text-green-700',
}

export default function SchulungDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { customerId } = useAuth()
  const schulungId = params.id as string

  const [schulung, setSchulung] = useState<Schulung | null>(null)
  const [assignment, setAssignment] = useState<CustomerSchulungAssignment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [feedbackText, setFeedbackText] = useState('')
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!schulungId) return

      try {
        setIsLoading(true)

        // Fetch schulung details
        const schulungRes = await fetch(`/api/schulungen/${schulungId}`)
        if (schulungRes.ok) {
          const schulungData = await schulungRes.json()
          setSchulung(schulungData)
        }

        // Fetch customer's assignment for this schulung if customerId exists
        if (customerId) {
          const assignmentsRes = await fetch(`/api/customers/${customerId}/schulungen`)
          if (assignmentsRes.ok) {
            const assignments = await assignmentsRes.json()
            const foundAssignment = assignments.find(
              (a: CustomerSchulungAssignment) => a.schulungId === schulungId
            )
            if (foundAssignment) {
              setAssignment(foundAssignment)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching schulung:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [schulungId, customerId])

  const handleSubmitFeedback = async () => {
    if (!assignment || !customerId || feedbackRating === 0) return

    setIsSubmittingFeedback(true)
    try {
      const res = await fetch(`/api/customers/${customerId}/schulungen/${assignment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: feedbackRating,
          feedback: feedbackText,
        }),
      })

      if (res.ok) {
        const updated = await res.json()
        setAssignment(updated)
        setShowFeedbackForm(false)
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!schulung) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Schulung nicht gefunden" subtitle="" />
        <div className="p-6">
          <div className="max-w-4xl mx-auto text-center py-12">
            <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Diese Schulung wurde nicht gefunden.</p>
            <Button onClick={() => router.push('/schulungen')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zu Schulungen
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const hasVideo = schulung.videoUrl
  const hasMaterials = schulung.materials && schulung.materials.length > 0
  const hasTrainer = schulung.trainer
  const isCompleted = assignment?.status === 'abgeschlossen'
  const hasFeedback = assignment?.rating

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title={schulung.title}
        subtitle={categoryLabels[schulung.category] || schulung.category}
      />

      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.push('/schulungen')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Zurück zu Schulungen</span>
          </button>

          {/* Hero Section with Video */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Main Content - Video & Description */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Placeholder */}
              <Card className="overflow-hidden">
                <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  {schulung.videoThumbnail ? (
                    <img
                      src={schulung.videoThumbnail}
                      alt={schulung.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-60"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-primary-800/30" />
                  )}

                  {/* Play Button Overlay */}
                  <div className="relative z-10 flex flex-col items-center">
                    {hasVideo ? (
                      <a
                        href={schulung.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-20 h-20 rounded-full bg-white/90 hover:bg-white shadow-lg transition-transform hover:scale-105"
                      >
                        <Play className="h-8 w-8 text-primary-600 ml-1" />
                      </a>
                    ) : (
                      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white/20 border-2 border-white/30">
                        <Video className="h-8 w-8 text-white/60" />
                      </div>
                    )}
                    <p className="mt-4 text-white/80 text-sm font-medium">
                      {hasVideo ? 'Video ansehen' : 'Video folgt...'}
                    </p>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-lg bg-black/50 text-white text-sm font-medium flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {schulung.duration}
                    </span>
                    <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${formatColors[schulung.format]}`}>
                      {formatLabels[schulung.format]}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${categoryColors[schulung.category]}`}>
                        {categoryLabels[schulung.category]}
                      </span>
                      {assignment && (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[assignment.status]}`}>
                          {statusLabels[assignment.status]}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-primary-600 font-semibold">
                      <Award className="h-4 w-4" />
                      {schulung.points} Punkte
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{schulung.description}</p>
                </CardContent>
              </Card>

              {/* Learning Goals */}
              {schulung.learningGoals && schulung.learningGoals.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-900">
                      <Target className="h-4 w-4 text-primary-600" />
                      Was Sie lernen werden
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2.5">
                      {schulung.learningGoals.map((goal, index) => (
                        <li key={index} className="flex items-start gap-2.5">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-50 flex items-center justify-center mt-0.5">
                            <Check className="h-3 w-3 text-primary-600" />
                          </div>
                          <span className="text-sm text-gray-600 leading-relaxed">{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Outcomes */}
              {schulung.outcomes && schulung.outcomes.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-900">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      Wozu befähigen wir Ihr Team
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {schulung.outcomes.map((outcome, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50/50 border border-amber-100/50"
                        >
                          <div className="flex-shrink-0 w-6 h-6 rounded bg-amber-100/70 flex items-center justify-center">
                            <Award className="h-3 w-3 text-amber-600" />
                          </div>
                          <span className="text-sm text-gray-600 leading-relaxed">{outcome}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Feedback Section */}
              {isCompleted && (
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <MessageSquare className="h-5 w-5 text-primary-600" />
                      Ihr Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {hasFeedback ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-6 w-6 ${
                                star <= (assignment?.rating || 0)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-gray-600">
                            {assignment?.rating}/5 Sterne
                          </span>
                        </div>
                        {assignment?.feedback && (
                          <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                            &quot;{assignment.feedback}&quot;
                          </p>
                        )}
                        {assignment?.feedbackDate && (
                          <p className="text-sm text-gray-500">
                            Abgegeben am {formatDate(assignment.feedbackDate)}
                          </p>
                        )}
                      </div>
                    ) : showFeedbackForm ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Wie bewerten Sie diese Schulung?
                          </label>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setFeedbackRating(star)}
                                className="p-1 hover:scale-110 transition-transform"
                              >
                                <Star
                                  className={`h-8 w-8 ${
                                    star <= feedbackRating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-gray-300 hover:text-amber-200'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ihr Kommentar (optional)
                          </label>
                          <textarea
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            placeholder="Was hat Ihnen gefallen? Was können wir verbessern?"
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            onClick={() => setShowFeedbackForm(false)}
                          >
                            Abbrechen
                          </Button>
                          <Button
                            onClick={handleSubmitFeedback}
                            disabled={feedbackRating === 0 || isSubmittingFeedback}
                          >
                            {isSubmittingFeedback ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            Feedback absenden
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600 mb-4">
                          Sie haben diese Schulung abgeschlossen. Teilen Sie uns Ihre Erfahrung mit!
                        </p>
                        <Button onClick={() => setShowFeedbackForm(true)}>
                          Feedback geben
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Schulung Details Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">Schulungsdetails</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-md bg-gray-50 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Dauer</p>
                      <p className="text-sm text-gray-700">{schulung.duration}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-md bg-gray-50 flex items-center justify-center">
                      <Award className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Punkte</p>
                      <p className="text-sm text-gray-700">{schulung.points} Punkte</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-md bg-gray-50 flex items-center justify-center">
                      <Video className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Format</p>
                      <p className="text-sm text-gray-700">{formatLabels[schulung.format]}</p>
                    </div>
                  </div>

                  {assignment?.scheduledDate && schulung.format === 'live' && (
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-md bg-primary-50 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Termin</p>
                        <p className="text-sm text-gray-700">{formatDate(assignment.scheduledDate)}</p>
                      </div>
                    </div>
                  )}

                  {assignment?.participantCount && (
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-md bg-gray-50 flex items-center justify-center">
                        <Users className="h-4 w-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Teilnehmer</p>
                        <p className="text-sm text-gray-700">{assignment.participantCount} Personen</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Materials Card in Sidebar */}
              {hasMaterials && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">Materialien</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {schulung.materials!.map((material) => (
                      <a
                        key={material.id}
                        href={material.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 p-2 rounded-md hover:bg-gray-50 transition-colors group"
                      >
                        <div className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center group-hover:bg-primary-50 transition-colors">
                          <FileText className="h-3.5 w-3.5 text-gray-500 group-hover:text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 truncate">{material.title}</p>
                          <p className="text-xs text-gray-400 uppercase">{material.fileType}</p>
                        </div>
                        <Download className="h-3.5 w-3.5 text-gray-300 group-hover:text-primary-600" />
                      </a>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Trainer Card */}
              {hasTrainer && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ihr Trainer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                        {schulung.trainer?.avatarUrl ? (
                          <img
                            src={schulung.trainer.avatarUrl}
                            alt={schulung.trainer.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">{schulung.trainer!.name}</p>
                        <p className="text-xs text-gray-400">{schulung.trainer!.role}</p>
                      </div>
                    </div>
                    {schulung.trainer?.calendlyUrl && (
                      <a
                        href={schulung.trainer.calendlyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-xs font-medium"
                      >
                        <Calendar className="h-3 w-3" />
                        Termin vereinbaren
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Status Card */}
              {assignment && (
                <Card className={`border ${
                  isCompleted ? 'border-green-200 bg-green-50/30' : 'border-primary-200 bg-primary-50/30'
                }`}>
                  <CardContent className="pt-4 pb-4">
                    <div className="text-center">
                      <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center ${
                        isCompleted ? 'bg-green-100' : 'bg-primary-100'
                      }`}>
                        {isCompleted ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : (
                          <GraduationCap className="h-5 w-5 text-primary-600" />
                        )}
                      </div>
                      <p className={`mt-2 text-sm font-medium ${
                        isCompleted ? 'text-green-700' : 'text-primary-700'
                      }`}>
                        {statusLabels[assignment.status]}
                      </p>
                      {assignment.completedDate && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Abgeschlossen am {formatDate(assignment.completedDate)}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              {hasVideo && (
                <a
                  href={schulung.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-md bg-primary-600 text-white hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  <Play className="h-3.5 w-3.5" />
                  Video starten
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
