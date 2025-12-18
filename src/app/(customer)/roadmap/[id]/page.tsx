'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { mockRoadmapItems, mockCustomer } from '@/lib/mock-data'
import { formatDate } from '@/lib/utils'
import {
  ArrowLeft,
  Calendar,
  Target,
  CheckCircle2,
  Clock,
  User,
  Download,
  FileText,
  Check,
  AlertTriangle,
  FlaskConical,
  MessageSquare,
  Send,
  CheckCheck,
} from 'lucide-react'
import { TestFeedback } from '@/types'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const project = mockRoadmapItems.find((item) => item.id === projectId)
  const [isAccepting, setIsAccepting] = useState(false)
  const [accepted, setAccepted] = useState(project?.acceptanceStatus === 'akzeptiert')

  // Test feedback state
  const [testFeedback, setTestFeedback] = useState<TestFeedback[]>(project?.testFeedback || [])
  const [newFeedback, setNewFeedback] = useState('')
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [isCompletingTest, setIsCompletingTest] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)

  if (!project) {
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
    'in-arbeit': { label: 'In Arbeit', variant: 'default' as const, color: 'bg-blue-100 text-blue-600' },
    'im-test': { label: 'Im Test', variant: 'default' as const, color: 'bg-purple-100 text-purple-600' },
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
    abgelehnt: { label: 'Abgelehnt', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
  }

  const handleAccept = () => {
    setIsAccepting(true)
    setTimeout(() => {
      setAccepted(true)
      setIsAccepting(false)
    }, 1500)
  }

  const handleSubmitFeedback = () => {
    if (!newFeedback.trim()) return
    setIsSubmittingFeedback(true)
    setTimeout(() => {
      const feedback: TestFeedback = {
        id: `tf${Date.now()}`,
        date: new Date().toISOString(),
        feedback: newFeedback,
        resolved: false,
      }
      setTestFeedback([...testFeedback, feedback])
      setNewFeedback('')
      setIsSubmittingFeedback(false)
    }, 500)
  }

  const handleCompleteTest = () => {
    setIsCompletingTest(true)
    setTimeout(() => {
      setTestCompleted(true)
      setIsCompletingTest(false)
    }, 1500)
  }

  const generatePDF = () => {
    const content = `
AI EMPOWERMENT PROGRAMM - PROJEKTSPEZIFIKATION
===============================================

Kunde: ${mockCustomer.companyName}
Erstellt: ${formatDate(new Date().toISOString())}

PROJEKT: ${project.name}
--------------------------
${project.description}

Status: ${statusConfig[project.status].label}
Priorität: ${priorityConfig[project.priority].label}
${project.startDate ? `Startdatum: ${formatDate(project.startDate)}` : ''}
${project.targetDate ? `Zieldatum: ${formatDate(project.targetDate)}` : ''}

AKZEPTANZKRITERIEN:
${project.acceptanceCriteria?.map((c, i) => `
${i + 1}. ${c.description}
`).join('') || 'Keine Kriterien definiert'}

AKZEPTANZSTATUS: ${accepted ? 'Akzeptiert' : 'Ausstehend'}
${project.acceptedAt ? `Akzeptiert am: ${formatDate(project.acceptedAt)}` : ''}
${project.acceptedBy ? `Akzeptiert von: ${project.acceptedBy}` : ''}

${testFeedback.length > 0 ? `
TEST-FEEDBACK:
${testFeedback.map((tf, i) => `
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

  const currentAcceptanceStatus = accepted ? 'akzeptiert' : (project.acceptanceStatus || 'ausstehend')
  const acceptanceInfo = acceptanceConfig[currentAcceptanceStatus]
  const AcceptanceIcon = acceptanceInfo.icon

  const isInTest = project.status === 'im-test'
  const hasUnresolvedFeedback = testFeedback.some(f => !f.resolved)

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
          onClick={() => router.push('/roadmap')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zur Roadmap
        </Button>

        {/* Alert for pending acceptance */}
        {currentAcceptanceStatus === 'ausstehend' && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">Ihre Bestätigung ist erforderlich</p>
              <p className="mt-1 text-sm text-yellow-700">
                Bitte überprüfen Sie die Akzeptanzkriterien und bestätigen Sie diese, damit wir mit der Entwicklung beginnen können.
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
                      {testFeedback.map((feedback) => (
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
                            <Clock className="mr-2 h-4 w-4 animate-spin" />
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
                              <Clock className="mr-2 h-4 w-4 animate-spin" />
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
                    {project.acceptanceCriteria.map((criterion, index) => (
                      <div
                        key={criterion.id}
                        className={`flex items-start gap-3 rounded-lg border p-4 ${
                          accepted
                            ? 'border-green-200 bg-green-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                            accepted
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {accepted ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <span className="text-xs font-medium">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm ${accepted ? 'text-green-800' : 'text-gray-900'}`}>
                            {criterion.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Keine Akzeptanzkriterien definiert.</p>
                )}

                {/* Accept Button */}
                {currentAcceptanceStatus === 'ausstehend' && (
                  <div className="mt-6 rounded-lg border-2 border-dashed border-yellow-300 bg-yellow-50 p-6">
                    <div className="text-center">
                      <h3 className="font-semibold text-gray-900">
                        Akzeptanzkriterien bestätigen
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        Mit Ihrer Bestätigung geben Sie grünes Licht für den Start der Entwicklung.
                      </p>
                      <Button
                        onClick={handleAccept}
                        disabled={isAccepting}
                        className="mt-4"
                        size="lg"
                      >
                        {isAccepting ? (
                          <>
                            <Clock className="mr-2 h-4 w-4 animate-spin" />
                            Wird verarbeitet...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Akzeptanzkriterien bestätigen
                          </>
                        )}
                      </Button>
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

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Aktionen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={generatePDF}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Projekt als PDF exportieren
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Änderungshistorie
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
