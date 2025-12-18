'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { formatDate } from '@/lib/utils'
import { useCustomer } from '@/hooks/use-customers'
import { useAuth } from '@/hooks/use-auth'
import {
  ArrowLeft,
  Calendar,
  Target,
  CheckCircle2,
  User,
  Download,
  FileText,
  Check,
  AlertTriangle,
  FlaskConical,
  Send,
  CheckCheck,
  X,
  Loader2,
  ExternalLink,
  PlayCircle,
  BookOpen,
  Settings,
} from 'lucide-react'
import { Module, TestFeedback, AcceptanceCriterion } from '@/types'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = params.id as string
  const fromModules = searchParams.get('from') === 'modules'
  const { customerId } = useAuth()
  const { customer } = useCustomer(customerId || '')

  const [project, setProject] = useState<Module | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Acceptance state
  const [isAccepting, setIsAccepting] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectComment, setRejectComment] = useState('')

  // Test feedback state
  const [testFeedback, setTestFeedback] = useState<TestFeedback[]>([])
  const [newFeedback, setNewFeedback] = useState('')
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [isCompletingTest, setIsCompletingTest] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)

  // Customer contact state
  const [customerContactName, setCustomerContactName] = useState('')
  const [isEditingContact, setIsEditingContact] = useState(false)
  const [isSavingContact, setIsSavingContact] = useState(false)

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/modules/${projectId}`)
        if (!response.ok) {
          throw new Error('Projekt nicht gefunden')
        }
        const data = await response.json()
        setProject(data)
        setTestFeedback(data.testFeedback || [])
        setTestCompleted(!!data.testCompletedAt)
        setCustomerContactName(data.customerContactName || '')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Fehler beim Laden')
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [projectId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Lädt..." />
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Projekt nicht gefunden" />
        <div className="flex flex-col items-center justify-center p-12">
          <p className="text-gray-500">Das angeforderte Projekt wurde nicht gefunden.</p>
          <Button onClick={() => router.push('/roadmap')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zur Roadmap
          </Button>
        </div>
      </div>
    )
  }

  const statusConfig = {
    geplant: { label: 'Geplant', variant: 'secondary' as const, color: 'bg-gray-100 text-gray-600' },
    in_arbeit: { label: 'In Arbeit', variant: 'default' as const, color: 'bg-blue-100 text-blue-600' },
    im_test: { label: 'Im Test', variant: 'default' as const, color: 'bg-purple-100 text-purple-600' },
    abgeschlossen: { label: 'Abgeschlossen', variant: 'success' as const, color: 'bg-green-100 text-green-600' },
  }

  const priorityConfig = {
    hoch: { label: 'Hoch', color: 'bg-red-100 text-red-700' },
    mittel: { label: 'Mittel', color: 'bg-yellow-100 text-yellow-700' },
    niedrig: { label: 'Niedrig', color: 'bg-gray-100 text-gray-700' },
  }

  const acceptanceConfig = {
    ausstehend: { label: 'Ausstehend', color: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle },
    akzeptiert: { label: 'Akzeptiert', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    abgelehnt: { label: 'Abgelehnt', color: 'bg-red-100 text-red-700', icon: X },
  }

  const handleAccept = async () => {
    setIsAccepting(true)
    try {
      // Update module acceptance status
      await fetch(`/api/modules/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acceptanceStatus: 'akzeptiert',
          acceptedAt: new Date().toISOString(),
          acceptedBy: customer?.name || 'Kunde',
        }),
      })

      // Mark acceptance_required notifications as done
      if (customer?.id) {
        const notificationsRes = await fetch(`/api/customers/${customer.id}/notifications`)
        const notifications = await notificationsRes.json()
        const acceptanceNotification = notifications.find(
          (n: { type: string; relatedProjectId: string; actionRequired: boolean }) =>
            n.type === 'acceptance_required' && n.relatedProjectId === projectId && n.actionRequired
        )
        if (acceptanceNotification) {
          await fetch(`/api/customers/${customer.id}/notifications/${acceptanceNotification.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ actionRequired: false }),
          })
        }
      }

      // Update local state
      setProject(prev => prev ? {
        ...prev,
        acceptanceStatus: 'akzeptiert',
        acceptedAt: new Date().toISOString(),
        acceptedBy: customer?.name || 'Kunde',
      } : null)
    } catch (error) {
      console.error('Error accepting criteria:', error)
      alert('Fehler beim Bestätigen der Kriterien')
    } finally {
      setIsAccepting(false)
    }
  }

  const handleReject = async () => {
    if (!rejectComment.trim()) {
      alert('Bitte geben Sie einen Kommentar ein, warum Sie die Kriterien ablehnen.')
      return
    }

    setIsRejecting(true)
    try {
      // Update module acceptance status
      await fetch(`/api/modules/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acceptanceStatus: 'abgelehnt',
        }),
      })

      // Send rejection message to admin
      if (customer?.id) {
        await fetch(`/api/customers/${customer.id}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: `Akzeptanzkriterien abgelehnt: ${project.name}`,
            content: `Der Kunde hat die Akzeptanzkriterien für das Modul "${project.name}" abgelehnt.\n\nBegründung:\n${rejectComment}`,
            from: customer.name,
          }),
        })

        // Mark acceptance_required notifications as done
        const notificationsRes = await fetch(`/api/customers/${customer.id}/notifications`)
        const notifications = await notificationsRes.json()
        const acceptanceNotification = notifications.find(
          (n: { type: string; relatedProjectId: string; actionRequired: boolean }) =>
            n.type === 'acceptance_required' && n.relatedProjectId === projectId && n.actionRequired
        )
        if (acceptanceNotification) {
          await fetch(`/api/customers/${customer.id}/notifications/${acceptanceNotification.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ actionRequired: false }),
          })
        }
      }

      // Update local state
      setProject(prev => prev ? { ...prev, acceptanceStatus: 'abgelehnt' } : null)
      setShowRejectModal(false)
      setRejectComment('')
    } catch (error) {
      console.error('Error rejecting criteria:', error)
      alert('Fehler beim Ablehnen der Kriterien')
    } finally {
      setIsRejecting(false)
    }
  }

  const handleSubmitFeedback = async () => {
    if (!newFeedback.trim()) return
    setIsSubmittingFeedback(true)
    try {
      const response = await fetch(`/api/modules/${projectId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: newFeedback }),
      })

      if (response.ok) {
        const savedFeedback = await response.json()
        setTestFeedback([...testFeedback, savedFeedback])
        setNewFeedback('')
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  const handleCompleteTest = async () => {
    setIsCompletingTest(true)
    try {
      // Update module test status
      await fetch(`/api/modules/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testCompletedAt: new Date().toISOString(),
          testCompletedBy: customer?.name || 'Kunde',
        }),
      })

      // Mark test_required notifications as done
      if (customer?.id) {
        const notificationsRes = await fetch(`/api/customers/${customer.id}/notifications`)
        const notifications = await notificationsRes.json()
        const testNotification = notifications.find(
          (n: { type: string; relatedProjectId: string; actionRequired: boolean }) =>
            n.type === 'test_required' && n.relatedProjectId === projectId && n.actionRequired
        )
        if (testNotification) {
          await fetch(`/api/customers/${customer.id}/notifications/${testNotification.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ actionRequired: false }),
          })
        }
      }

      setTestCompleted(true)
    } catch (error) {
      console.error('Error completing test:', error)
      alert('Fehler beim Abschließen des Tests')
    } finally {
      setIsCompletingTest(false)
    }
  }

  const generatePDF = () => {
    const content = `
AI EMPOWERMENT PROGRAMM - PROJEKTSPEZIFIKATION
===============================================

Kunde: ${customer?.companyName || 'Unbekannt'}
Erstellt: ${formatDate(new Date().toISOString())}

PROJEKT: ${project.name}
--------------------------
${project.description}

Status: ${statusConfig[project.status].label}
Priorität: ${priorityConfig[project.priority].label}
${project.startDate ? `Startdatum: ${formatDate(project.startDate)}` : ''}
${project.targetDate ? `Zieldatum: ${formatDate(project.targetDate)}` : ''}

AKZEPTANZKRITERIEN:
${project.acceptanceCriteria?.map((c: AcceptanceCriterion, i: number) => `
${i + 1}. ${c.description}
`).join('') || 'Keine Kriterien definiert'}

AKZEPTANZSTATUS: ${project.acceptanceStatus || 'Nicht festgelegt'}
${project.acceptedAt ? `Akzeptiert am: ${formatDate(project.acceptedAt)}` : ''}
${project.acceptedBy ? `Akzeptiert von: ${project.acceptedBy}` : ''}

${testFeedback.length > 0 ? `
TEST-FEEDBACK:
${testFeedback.map((tf: TestFeedback, i: number) => `
${i + 1}. ${formatDate(tf.date)}: ${tf.feedback} ${tf.resolved ? '[Erledigt]' : '[Offen]'}
`).join('')}
` : ''}
    `.trim()

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Projekt_${project.name.replace(/\s+/g, '_')}_Spezifikation.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const currentAcceptanceStatus = project.acceptanceStatus || 'ausstehend'
  const acceptanceInfo = acceptanceConfig[currentAcceptanceStatus as keyof typeof acceptanceConfig] || acceptanceConfig.ausstehend
  const AcceptanceIcon = acceptanceInfo.icon

  const isInTest = project.status === 'im_test'
  const hasUnresolvedFeedback = testFeedback.some((f: TestFeedback) => !f.resolved)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title={project.name}
        subtitle="Projektdetails und Akzeptanzkriterien"
      />

      <div className="p-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push(fromModules ? '/modules' : '/roadmap')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {fromModules ? 'Zurück zur Modulübersicht' : 'Zurück zur Roadmap'}
        </Button>

        {/* Alert for pending acceptance */}
        {currentAcceptanceStatus === 'ausstehend' && project.acceptanceCriteria && project.acceptanceCriteria.length > 0 && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">Ihre Bestätigung ist erforderlich</p>
              <p className="mt-1 text-sm text-yellow-700">
                Bitte überprüfen Sie die Akzeptanzkriterien und bestätigen oder verwerfen Sie diese.
              </p>
            </div>
          </div>
        )}

        {/* Alert for rejected */}
        {currentAcceptanceStatus === 'abgelehnt' && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <X className="h-5 w-5 shrink-0 text-red-600" />
            <div>
              <p className="font-medium text-red-800">Akzeptanzkriterien abgelehnt</p>
              <p className="mt-1 text-sm text-red-700">
                Sie haben die Akzeptanzkriterien abgelehnt. Wir werden uns mit Ihnen in Verbindung setzen.
              </p>
            </div>
          </div>
        )}

        {/* Alert for testing phase */}
        {isInTest && !testCompleted && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-purple-200 bg-purple-50 p-4">
            <FlaskConical className="h-5 w-5 shrink-0 text-purple-600" />
            <div className="flex-1">
              <p className="font-medium text-purple-800">Dieses Projekt befindet sich im Test</p>
              <p className="mt-1 text-sm text-purple-700">
                Bitte testen Sie die Funktionalität und geben Sie Feedback, wenn etwas nicht passt.
                Wenn alles funktioniert, klicken Sie auf &quot;Test abgeschlossen&quot;.
              </p>
              {project.softwareUrl && (
                <a
                  href={project.softwareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Software zum Testen öffnen
                </a>
              )}
            </div>
          </div>
        )}

        {/* Test Completed Alert */}
        {testCompleted && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
            <CheckCheck className="h-5 w-5 shrink-0 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Test erfolgreich abgeschlossen</p>
              <p className="mt-1 text-sm text-green-700">
                Vielen Dank für Ihre Rückmeldung. Das Projekt wird nun abgeschlossen.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Project Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle>Projektübersicht</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant={statusConfig[project.status].variant}>
                      {statusConfig[project.status].label}
                    </Badge>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityConfig[project.priority].color}`}>
                      {priorityConfig[project.priority].label}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-6 text-gray-600">{project.description}</p>

                <div className="grid gap-4 md:grid-cols-2">
                  {project.startDate && (
                    <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Startdatum</p>
                        <p className="font-medium">{formatDate(project.startDate)}</p>
                      </div>
                    </div>
                  )}
                  {project.targetDate && (
                    <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                      <Target className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Zieldatum</p>
                        <p className="font-medium">{formatDate(project.targetDate)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {project.status !== 'geplant' && (
                  <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-gray-500">Fortschritt</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} size="lg" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Test Feedback Section - Only shown when in test */}
            {isInTest && (
              <Card className="border-purple-200">
                <CardHeader className="bg-purple-50">
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <FlaskConical className="h-5 w-5" />
                    Test-Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {/* Existing Feedback */}
                  {testFeedback.length > 0 && (
                    <div className="mb-6 space-y-3">
                      {testFeedback.map((feedback: TestFeedback) => (
                        <div
                          key={feedback.id}
                          className={`rounded-lg border p-4 ${
                            feedback.resolved
                              ? 'border-green-200 bg-green-50'
                              : 'border-yellow-200 bg-yellow-50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className={`text-sm ${feedback.resolved ? 'text-green-800' : 'text-yellow-800'}`}>
                                {feedback.feedback}
                              </p>
                              <p className="mt-2 text-xs text-gray-500">
                                {formatDate(feedback.date)}
                              </p>
                            </div>
                            <Badge variant={feedback.resolved ? 'success' : 'warning'}>
                              {feedback.resolved ? 'Erledigt' : 'Offen'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Feedback Form */}
                  {!testCompleted && (
                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Was passt nicht? Was sollen wir verbessern?
                        </label>
                        <textarea
                          value={newFeedback}
                          onChange={(e) => setNewFeedback(e.target.value)}
                          placeholder="Beschreiben Sie hier, was nicht funktioniert oder verbessert werden soll..."
                          className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          rows={4}
                        />
                      </div>
                      <Button
                        onClick={handleSubmitFeedback}
                        disabled={!newFeedback.trim() || isSubmittingFeedback}
                        variant="outline"
                      >
                        {isSubmittingFeedback ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Wird gesendet...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Feedback senden
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Complete Test Button */}
                  {!testCompleted && (
                    <div className="mt-6 rounded-lg border-2 border-dashed border-purple-300 bg-purple-50 p-6">
                      <div className="text-center">
                        <h3 className="font-semibold text-gray-900">Alles funktioniert?</h3>
                        <p className="mt-1 text-sm text-gray-600">
                          Wenn alles wie gewünscht funktioniert, schließen Sie den Test ab.
                          {hasUnresolvedFeedback && (
                            <span className="mt-1 block text-yellow-600">
                              Hinweis: Es gibt noch offenes Feedback.
                            </span>
                          )}
                        </p>
                        <Button
                          onClick={handleCompleteTest}
                          disabled={isCompletingTest}
                          className="mt-4 bg-purple-600 hover:bg-purple-700"
                          size="lg"
                        >
                          {isCompletingTest ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Wird abgeschlossen...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Test abgeschlossen
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Acceptance Criteria */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-400" />
                  Akzeptanzkriterien
                </CardTitle>
              </CardHeader>
              <CardContent>
                {project.acceptanceCriteria && project.acceptanceCriteria.length > 0 ? (
                  <div className="space-y-3">
                    {project.acceptanceCriteria.map((criterion: AcceptanceCriterion, index: number) => (
                      <div
                        key={criterion.id}
                        className={`flex items-start gap-3 rounded-lg border p-4 ${
                          currentAcceptanceStatus === 'akzeptiert'
                            ? 'border-green-200 bg-green-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                            currentAcceptanceStatus === 'akzeptiert'
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {currentAcceptanceStatus === 'akzeptiert' ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <span className="text-xs font-medium">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm ${currentAcceptanceStatus === 'akzeptiert' ? 'text-green-800' : 'text-gray-900'}`}>
                            {criterion.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Keine Akzeptanzkriterien definiert.</p>
                )}

                {/* Accept/Reject Buttons */}
                {currentAcceptanceStatus === 'ausstehend' && project.acceptanceCriteria && project.acceptanceCriteria.length > 0 && (
                  <div className="mt-6 rounded-lg border-2 border-dashed border-yellow-300 bg-yellow-50 p-6">
                    <div className="text-center">
                      <h3 className="font-semibold text-gray-900">
                        Akzeptanzkriterien prüfen
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        Bitte bestätigen oder verwerfen Sie die Akzeptanzkriterien.
                      </p>
                      <div className="mt-4 flex justify-center gap-3">
                        <Button
                          onClick={handleAccept}
                          disabled={isAccepting}
                          size="lg"
                        >
                          {isAccepting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Wird verarbeitet...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Akzeptieren
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => setShowRejectModal(true)}
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          size="lg"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Verwerfen
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Accepted Confirmation */}
                {currentAcceptanceStatus === 'akzeptiert' && (
                  <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">Akzeptanzkriterien bestätigt</p>
                        <p className="text-sm text-green-600">
                          {project.acceptedAt && `Am ${formatDate(project.acceptedAt)}`}
                          {project.acceptedBy && ` von ${project.acceptedBy}`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Test Status - Only shown when in test */}
            {isInTest && (
              <Card className="border-purple-200">
                <CardHeader className="bg-purple-50">
                  <CardTitle className="text-purple-800">Test-Status</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className={`flex items-center gap-3 rounded-lg p-4 ${
                    testCompleted
                      ? 'bg-green-100 text-green-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {testCompleted ? (
                      <CheckCheck className="h-6 w-6" />
                    ) : (
                      <FlaskConical className="h-6 w-6" />
                    )}
                    <div>
                      <p className="font-semibold">
                        {testCompleted ? 'Abgeschlossen' : 'Wartet auf Ihre Tests'}
                      </p>
                      <p className="text-sm opacity-80">
                        {testFeedback.length} Feedback-Einträge
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Projekt-Info Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Projekt-Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Software Link */}
                {project.softwareUrl && (
                  <a
                    href={project.softwareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg border border-primary-200 bg-primary-50 p-3 hover:bg-primary-100 transition-colors"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
                      <ExternalLink className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary-900">Projekt öffnen</p>
                      <p className="text-xs text-primary-700">Software im Browser starten</p>
                    </div>
                  </a>
                )}

                {/* Progress - Only show if not completed and not planned */}
                {project.status !== 'abgeschlossen' && project.status !== 'geplant' && (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Fortschritt</span>
                      <span className="font-semibold text-gray-900">{project.progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary-500 transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Maintenance Points */}
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100">
                      <Settings className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">
                        {project.status === 'abgeschlossen' ? 'Wartung/Monat' : 'Voraussichtliche Wartung'}
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {project.monthlyMaintenancePoints || 0} Punkte
                      </p>
                    </div>
                  </div>
                </div>

                {/* Internal Contact */}
                {project.assignee && (
                  <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Ihr Ansprechpartner</p>
                      <p className="text-sm font-medium text-gray-900">{project.assignee.name}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Video & Dokumentation - Only show if any exists */}
            {(project.videoUrl || project.manualUrl || project.instructions) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Medien & Anleitungen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Video Thumbnail */}
                  {project.videoUrl && (
                    <a
                      href={project.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg overflow-hidden border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all group"
                    >
                      <div className="relative aspect-video bg-gray-100">
                        <img
                          src={project.videoThumbnail || '/images/video-thumbnail.jpg'}
                          alt="Erklärvideo"
                          className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/video-placeholder.jpg'
                          }}
                        />
                      </div>
                      <div className="p-3 bg-gray-50">
                        <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          <PlayCircle className="h-4 w-4 text-primary-600" />
                          Erklärvideo ansehen
                        </p>
                      </div>
                    </a>
                  )}

                  {/* Manual Download */}
                  {project.manualUrl && (
                    <a
                      href={project.manualUrl}
                      download={project.manualFilename || 'Handbuch.pdf'}
                      className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 hover:border-primary-300 hover:bg-gray-50 transition-all"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                        <BookOpen className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">Handbuch</p>
                        <p className="text-xs text-gray-500 truncate">
                          {project.manualFilename || 'PDF herunterladen'}
                        </p>
                      </div>
                      <Download className="h-4 w-4 text-gray-400" />
                    </a>
                  )}

                  {/* Text Instructions - Collapsed by default */}
                  {project.instructions && (
                    <details className="rounded-lg border border-gray-200 overflow-hidden">
                      <summary className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Kurzanleitung</p>
                          <p className="text-xs text-gray-500">Klicken zum Anzeigen</p>
                        </div>
                      </summary>
                      <div className="p-3 pt-0 border-t border-gray-100 bg-gray-50">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {project.instructions}
                        </p>
                      </div>
                    </details>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Acceptance Status */}
            <Card>
              <CardHeader>
                <CardTitle>Akzeptanzstatus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`flex items-center gap-3 rounded-lg p-4 ${acceptanceInfo.color}`}>
                  <AcceptanceIcon className="h-6 w-6" />
                  <div>
                    <p className="font-semibold">{acceptanceInfo.label}</p>
                    {currentAcceptanceStatus === 'akzeptiert' && project.acceptedAt && (
                      <p className="text-sm opacity-80">
                        {formatDate(project.acceptedAt)}
                      </p>
                    )}
                  </div>
                </div>

                {project.acceptedBy && currentAcceptanceStatus === 'akzeptiert' && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>Bestätigt von {project.acceptedBy}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Ihr Verantwortlicher
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditingContact ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={customerContactName}
                      onChange={(e) => setCustomerContactName(e.target.value)}
                      placeholder="Name eingeben..."
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={isSavingContact || !customerContactName.trim()}
                        onClick={async () => {
                          setIsSavingContact(true)
                          try {
                            await fetch(`/api/modules/${projectId}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ customerContactName: customerContactName.trim() }),
                            })
                            setProject(prev => prev ? { ...prev, customerContactName: customerContactName.trim() } : null)
                            setIsEditingContact(false)
                          } catch (error) {
                            console.error('Error saving contact:', error)
                            alert('Fehler beim Speichern')
                          } finally {
                            setIsSavingContact(false)
                          }
                        }}
                      >
                        {isSavingContact ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Speichern'
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setCustomerContactName(project?.customerContactName || '')
                          setIsEditingContact(false)
                        }}
                      >
                        Abbrechen
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {project?.customerContactName ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600 font-semibold text-sm">
                            {project.customerContactName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{project.customerContactName}</span>
                        </div>
                        <button
                          onClick={() => setIsEditingContact(true)}
                          className="text-xs text-primary-600 hover:text-primary-700"
                        >
                          Ändern
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <p className="text-sm text-gray-500 mb-2">Noch nicht festgelegt</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsEditingContact(true)}
                        >
                          <User className="mr-2 h-4 w-4" />
                          Verantwortlichen festlegen
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                <p className="mt-3 text-xs text-gray-500">
                  Der Verantwortliche auf Ihrer Seite für dieses Projekt.
                </p>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Akzeptanzkriterien verwerfen</h3>
            <p className="mt-2 text-sm text-gray-600">
              Bitte geben Sie einen Kommentar ein, warum Sie die Kriterien ablehnen.
            </p>
            <textarea
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="Ihr Kommentar ist erforderlich..."
              className="mt-4 w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              rows={4}
            />
            <div className="mt-4 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectComment('')
                }}
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleReject}
                disabled={!rejectComment.trim() || isRejecting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isRejecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wird verarbeitet...
                  </>
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Verwerfen
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
