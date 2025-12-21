'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCustomer } from '@/hooks/use-customers'
import { useAuth } from '@/hooks/use-auth'
import { formatDate } from '@/lib/utils'
import {
  GraduationCap,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  BookOpen,
  Calendar,
  Clock,
  Loader2,
  Users,
  Play,
  Video,
  Star,
  Award,
  Target,
  Trophy,
  Flame,
  ArrowRight,
  Layers,
} from 'lucide-react'
import type { CustomerSchulungAssignment, Schulung, SchulungFormat } from '@/types'

type TabType = 'anstehend' | 'abgeschlossen' | 'alle'

// Helper type for normalized schulung display
interface DisplaySchulung {
  id: string
  schulungId: string
  assignmentId: string
  title: string
  description: string
  duration: string
  points: number
  format: SchulungFormat
  category: string
  videoUrl?: string
  videoThumbnail?: string
  status: string
  isCompleted: boolean
  scheduledDate?: string
  completedDate?: string
  rating?: number
  isFromSeries: boolean
  seriesTitle?: string
}

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

export default function SchulungenPage() {
  const router = useRouter()
  const { customerId } = useAuth()
  const { customer, isLoading } = useCustomer(customerId || '')
  const [activeTab, setActiveTab] = useState<TabType>('anstehend')
  const [assignments, setAssignments] = useState<CustomerSchulungAssignment[]>([])

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

  // Normalize assignments into flat list of schulungen (including series items)
  const displaySchulungen = useMemo(() => {
    const items: DisplaySchulung[] = []

    assignments.forEach((assignment) => {
      // Individual schulung
      if (assignment.schulung && !assignment.serieId) {
        const schulung = assignment.schulung
        items.push({
          id: `${assignment.id}-${schulung.id}`,
          schulungId: schulung.id,
          assignmentId: assignment.id,
          title: schulung.title,
          description: schulung.description,
          duration: schulung.duration,
          points: schulung.points,
          format: schulung.format || 'live',
          category: schulung.category,
          videoUrl: schulung.videoUrl,
          videoThumbnail: schulung.videoThumbnail,
          status: assignment.status,
          isCompleted: assignment.status === 'abgeschlossen' || assignment.status === 'durchgefuehrt',
          scheduledDate: assignment.scheduledDate,
          completedDate: assignment.completedDate,
          rating: assignment.rating,
          isFromSeries: false,
        })
      }
      // Series - expand into individual schulungen
      else if (assignment.serie?.schulungItems) {
        const excludedIds = assignment.excludedSchulungIds || []
        const completedIds = assignment.completedSchulungIds || []

        assignment.serie.schulungItems.forEach((item: any) => {
          if (!item.schulung) return
          if (excludedIds.includes(item.schulung.id)) return

          const schulung = item.schulung
          const isSchulungCompleted = completedIds.includes(schulung.id)

          items.push({
            id: `${assignment.id}-${schulung.id}`,
            schulungId: schulung.id,
            assignmentId: assignment.id,
            title: schulung.title,
            description: schulung.description,
            duration: schulung.duration,
            points: schulung.points,
            format: schulung.format || 'live',
            category: schulung.category,
            videoUrl: schulung.videoUrl,
            videoThumbnail: schulung.videoThumbnail,
            status: isSchulungCompleted ? 'abgeschlossen' : assignment.status,
            isCompleted: isSchulungCompleted,
            scheduledDate: assignment.scheduledDate,
            completedDate: isSchulungCompleted ? assignment.completedDate : undefined,
            rating: isSchulungCompleted ? assignment.rating : undefined,
            isFromSeries: true,
            seriesTitle: assignment.serie?.title,
          })
        })
      }
    })

    return items
  }, [assignments])

  // Filter based on active tab
  const filteredSchulungen = useMemo(() => {
    if (activeTab === 'anstehend') {
      return displaySchulungen.filter(s => !s.isCompleted)
    } else if (activeTab === 'abgeschlossen') {
      return displaySchulungen.filter(s => s.isCompleted)
    }
    return displaySchulungen
  }, [displaySchulungen, activeTab])

  // Stats for progress
  const totalCount = displaySchulungen.length
  const completedCount = displaySchulungen.filter(s => s.isCompleted).length
  const anstehendCount = totalCount - completedCount
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

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
        title="KI-Schulungen"
        subtitle="Wissen für Ihr Team"
      />

      <div className="p-6">
        <div className="mx-auto max-w-6xl">
          {/* Schulungskatalog CTA - ganz oben */}
          <Link href="/schulungen/katalog">
            <Card className="mb-6 overflow-hidden hover:shadow-md transition-all cursor-pointer group">
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-200 flex items-center justify-center">
                      <Layers className="h-5 w-5 text-primary-700" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 group-hover:text-primary-700 transition-colors">
                        Schulungskatalog entdecken
                      </h3>
                      <p className="text-sm text-gray-600">
                        Alle Kurse, Serien und Themengebiete im Überblick
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-primary-600">
                    <span className="text-sm font-medium hidden sm:block">Zum Katalog</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          {/* Hero Section - show if no schulungen yet */}
          {totalCount === 0 && (
            <Card className="mb-6 overflow-hidden">
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8 text-white">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-white/20 p-3">
                    <Sparkles className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold mb-1">
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
          )}

          {/* Main Layout with Sidebar */}
          {totalCount > 0 && (
            <div className="flex gap-6">
              {/* Left Sidebar - Progress */}
              <div className="hidden lg:block w-56 flex-shrink-0">
                <div className="sticky top-6 space-y-4">
                  {/* Progress Card */}
                  <Card className="overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Target className="h-4 w-4 text-primary-600" />
                        <h3 className="text-sm font-medium text-gray-900">Fortschritt</h3>
                      </div>

                      {/* Circular Progress */}
                      <div className="flex justify-center mb-4">
                        <div className="relative w-24 h-24">
                          <svg className="w-full h-full -rotate-90">
                            <circle
                              cx="48"
                              cy="48"
                              r="40"
                              stroke="#e5e7eb"
                              strokeWidth="8"
                              fill="none"
                            />
                            <circle
                              cx="48"
                              cy="48"
                              r="40"
                              stroke="url(#progressGradient)"
                              strokeWidth="8"
                              fill="none"
                              strokeLinecap="round"
                              strokeDasharray={`${progressPercent * 2.51} 251`}
                            />
                            <defs>
                              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xl font-bold text-gray-900">{progressPercent}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Badge */}
                      {progressPercent === 100 ? (
                        <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                          <Trophy className="h-3.5 w-3.5" />
                          Alle geschafft!
                        </div>
                      ) : progressPercent >= 50 ? (
                        <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                          <Flame className="h-3.5 w-3.5" />
                          Weiter so!
                        </div>
                      ) : null}
                    </div>
                  </Card>

                  {/* Stats Card */}
                  <Card>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Anstehend</span>
                        <span className="text-sm font-semibold text-gray-900">{anstehendCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Abgeschlossen</span>
                        <span className="text-sm font-semibold text-green-600">{completedCount}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Right Content - Schulungen */}
              <div className="flex-1 min-w-0">
                {/* Mobile Progress Bar */}
                <div className="lg:hidden mb-4 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Fortschritt</span>
                    <span className="font-medium text-gray-900">{completedCount}/{totalCount} ({progressPercent}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="text-sm font-medium text-gray-900">Ihre Schulungen</h3>
                  <div className="flex bg-gray-100 rounded-lg p-0.5">
                    <button
                      onClick={() => setActiveTab('anstehend')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        activeTab === 'anstehend'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      Anstehend
                      {anstehendCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-primary-100 text-primary-700 text-xs">
                          {anstehendCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab('abgeschlossen')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        activeTab === 'abgeschlossen'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      Abgeschlossen
                      {completedCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs">
                          {completedCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab('alle')}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        activeTab === 'alle'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      Alle
                    </button>
                  </div>
                </div>

                {/* Schulung Cards */}
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredSchulungen.map((schulung) => {
                  const FormatIcon = formatLabels[schulung.format]?.icon || Users

                  return (
                    <div
                      key={schulung.id}
                      onClick={() => router.push(`/schulungen/${schulung.schulungId}`)}
                      className={`bg-white rounded-lg border overflow-hidden hover:shadow-md transition-all cursor-pointer group ${
                        schulung.isCompleted ? 'border-green-200' : 'border-gray-200'
                      }`}
                    >
                      {/* Compact Video Thumbnail */}
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

                        {/* Play Button - smaller */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                            {schulung.isCompleted ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <Play className="h-4 w-4 text-primary-600 ml-0.5" />
                            )}
                          </div>
                        </div>

                        {/* Format Badge - smaller */}
                        <div className="absolute top-2 left-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${formatLabels[schulung.format]?.color}`}>
                            <FormatIcon className="h-3 w-3" />
                            {formatLabels[schulung.format]?.label}
                          </span>
                        </div>

                        {/* Status/Completed Badge */}
                        <div className="absolute top-2 right-2">
                          {schulung.isCompleted ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700">
                              Abgeschlossen
                            </span>
                          ) : (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusLabels[schulung.status]?.color}`}>
                              {statusLabels[schulung.status]?.label}
                            </span>
                          )}
                        </div>

                        {/* Duration - smaller */}
                        <div className="absolute bottom-2 right-2">
                          <span className="px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-medium flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            {schulung.duration}
                          </span>
                        </div>
                      </div>

                      {/* Content - more compact */}
                      <div className="p-3">
                        {/* Series indicator */}
                        {schulung.isFromSeries && schulung.seriesTitle && (
                          <p className="text-[10px] text-primary-600 font-medium mb-1 truncate">
                            {schulung.seriesTitle}
                          </p>
                        )}

                        <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">
                          {schulung.title}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                          {schulung.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs">
                            {schulung.scheduledDate && schulung.format === 'live' && !schulung.isCompleted && (
                              <span className="flex items-center gap-1 text-gray-500">
                                <Calendar className="h-3 w-3" />
                                {formatDate(schulung.scheduledDate)}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-primary-600 font-medium">
                              <Award className="h-3 w-3" />
                              {schulung.points}
                            </span>
                          </div>

                          {/* Rating (for completed) */}
                          {schulung.rating && (
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-3 w-3 ${
                                    star <= schulung.rating!
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                </div>

                {filteredSchulungen.length === 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                    {activeTab === 'anstehend' ? (
                      <>
                        <Trophy className="h-10 w-10 text-green-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 font-medium">Alle Schulungen abgeschlossen!</p>
                        <p className="text-xs text-gray-400 mt-1">Großartige Arbeit, Ihr Team ist auf dem neuesten Stand.</p>
                      </>
                    ) : activeTab === 'abgeschlossen' ? (
                      <>
                        <GraduationCap className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Noch keine Schulungen abgeschlossen</p>
                        <p className="text-xs text-gray-400 mt-1">Starten Sie mit Ihrer ersten Schulung!</p>
                      </>
                    ) : (
                      <>
                        <GraduationCap className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Keine Schulungen zugewiesen</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
