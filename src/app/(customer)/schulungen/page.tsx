'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
} from 'lucide-react'

const schulungsKategorien = [
  {
    id: 'A',
    title: 'KI-Grundlagen & Orientierung',
    icon: Brain,
    themen: [
      'Was ist Künstliche Intelligenz?',
      'Wie KI „denkt" – Grundlagen verständlich erklärt',
      'Machine Learning vs. Deep Learning',
      'Generative KI: Funktionsweise & Einsatzmöglichkeiten',
      'Überblick: KI-Modelle & Modelltypen',
      'Welche KI für welche Aufgabe?',
      'KI-Mythen & realistische Erwartungen',
    ],
  },
  {
    id: 'B',
    title: 'KI sicher, rechtlich & verantwortungsvoll einsetzen',
    icon: Shield,
    themen: [
      'Datenschutz & DSGVO im KI-Einsatz',
      'Umgang mit sensiblen & vertraulichen Daten',
      'Risiken, Halluzinationen & Fehlentscheidungen',
      'Bias, Fairness & Verantwortung in KI-Systemen',
      'KI-Governance & interne Richtlinien',
      'Mensch-in-der-Schleife: Kontrolle behalten',
    ],
  },
  {
    id: 'C',
    title: 'Arbeiten mit KI im Unternehmensalltag',
    icon: Briefcase,
    themen: [
      'Grundlagen der KI-Nutzung im Arbeitsalltag',
      'KI als Assistenz, nicht als Ersatz',
      'Prompting-Grundlagen für Business-Anwender',
      'Fortgeschrittenes Prompting & Iteration',
      'KI-Ergebnisse prüfen, bewerten & verbessern',
      'Effizientes Arbeiten mit mehreren KI-Anfragen',
    ],
  },
  {
    id: 'D',
    title: 'Inhalte & Wissen mit KI erstellen',
    icon: FileText,
    themen: [
      'Texterstellung mit KI für Business-Zwecke',
      'Konzepte, Berichte & Zusammenfassungen erstellen',
      'Präsentationen mit KI entwickeln',
      'Storytelling & Struktur mit KI',
      'Bilder, Grafiken & Visuals mit KI erzeugen',
      'Qualitätssicherung bei KI-generierten Inhalten',
    ],
  },
  {
    id: 'E',
    title: 'Analysen & Entscheidungsunterstützung',
    icon: BarChart3,
    themen: [
      'Dokumente & Wissensbestände analysieren',
      'Vergleiche, Bewertungen & Entscheidungsgrundlagen',
      'Dateninterpretation mit KI (ohne Data Science)',
      'Grenzen von KI-Analysen verstehen',
    ],
  },
  {
    id: 'F',
    title: 'KI im Marketing, Vertrieb & Fachbereichen',
    icon: Megaphone,
    themen: [
      'KI im Marketing: Content, Kampagnen & Ideen',
      'KI im Vertrieb: Vorbereitung & Nachbereitung',
      'KI für Kundenservice & Support',
      'KI in HR & Recruiting',
      'KI in Operations & internen Prozessen',
    ],
  },
  {
    id: 'G',
    title: 'No-Code, Automatisierung & Workflows',
    icon: Workflow,
    themen: [
      'No-Code & Low-Code mit KI verstehen',
      'Workflows mit KI automatisieren',
      'Prozessanalyse für KI-Automatisierung',
      'Qualität & Stabilität von Automationen sichern',
    ],
  },
  {
    id: 'H',
    title: 'Arbeiten mit Unternehmenswissen (RAG)',
    icon: Database,
    themen: [
      'Grundlagen von Retrieval-Augmented Generation (RAG)',
      'Warum RAG für Unternehmen entscheidend ist',
      'Euer RAG-System: Aufbau & Architektur',
      'RAG im Arbeitsalltag effektiv nutzen',
      'Gute Fragen stellen im RAG-System',
      'Datenqualität & Wissenspflege für RAG',
      'Grenzen & Fehlerquellen von RAG-Systemen',
    ],
  },
  {
    id: 'I',
    title: 'KI-Lösungen entwickeln & skalieren',
    icon: Rocket,
    themen: [
      'KI-Use-Cases systematisch identifizieren',
      'Von der Idee zum KI-Pilotprojekt',
      'Erfolgreiche Einführung von KI im Unternehmen',
      'Change Management & Akzeptanz bei KI',
      'KI langfristig skalieren & weiterentwickeln',
    ],
  },
  {
    id: 'J',
    title: 'Zukunft & strategische Perspektive',
    icon: TrendingUp,
    themen: [
      'KI-Trends & technologische Entwicklungen',
      'KI-Kompetenzen der Zukunft',
      'Innovation & Wettbewerbsvorteile durch KI',
    ],
  },
]

const lernpfade = [
  {
    title: 'KI-Basisprogramm',
    description: 'Für alle Mitarbeitenden',
    zielgruppe: 'Alle',
  },
  {
    title: 'KI-Advanced',
    description: 'Für Fachbereiche',
    zielgruppe: 'Fachbereiche',
  },
  {
    title: 'RAG-Spezialtraining',
    description: 'Für Wissensarbeit',
    zielgruppe: 'Wissensarbeiter',
  },
  {
    title: 'KI-Strategie & Governance',
    description: 'Für Führungskräfte',
    zielgruppe: 'Management',
  },
]

export default function SchulungenPage() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('A')
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    themen: '',
    nachricht: '',
  })

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="KI-Schulungen"
        subtitle="Wissen für Ihr Team"
      />

      <div className="p-6">
        <div className="mx-auto max-w-4xl">
          {/* Hero Section */}
          <Card className="mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8 text-white">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-white/20 p-3">
                  <Sparkles className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">
                    Alle Schulungen individuell auf Ihr Unternehmen zugeschnitten
                  </h2>
                  <p className="text-primary-100 text-sm leading-relaxed">
                    Jede Schulung wird speziell für Ihre Anforderungen, Ihre Branche und Ihre
                    Mitarbeitenden angepasst. Wählen Sie aus unserem umfangreichen Themenkatalog
                    oder lassen Sie sich ein individuelles Programm zusammenstellen.
                  </p>
                </div>
              </div>
            </div>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4" />
                    {schulungsKategorien.length} Themenbereiche
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" />
                    {schulungsKategorien.reduce((acc, cat) => acc + cat.themen.length, 0)}+ Einzelthemen
                  </span>
                </div>
                <Button onClick={() => setShowRequestForm(true)}>
                  <Building2 className="mr-2 h-4 w-4" />
                  Individuelle Schulung anfragen
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lernpfade */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-base font-medium">Empfohlene Lernpfade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {lernpfade.map((pfad) => (
                  <div
                    key={pfad.title}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setShowRequestForm(true)}
                  >
                    <div>
                      <p className="font-medium text-gray-900">{pfad.title}</p>
                      <p className="text-sm text-gray-500">{pfad.description}</p>
                    </div>
                    <Badge variant="secondary">{pfad.zielgruppe}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Schulungskatalog */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Vollständiger Themenkatalog</CardTitle>
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
                              onClick={() => setShowRequestForm(true)}
                            >
                              Schulung zu diesem Thema anfragen
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
          <div className="mt-8 rounded-xl border-2 border-dashed border-gray-300 bg-white p-8 text-center">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 font-semibold text-gray-900">
              Sie haben spezielle Anforderungen?
            </h3>
            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
              Wir entwickeln maßgeschneiderte Schulungsprogramme für Ihr Unternehmen –
              abgestimmt auf Ihre Branche, Ihre Tools und Ihre Ziele.
            </p>
            <Button className="mt-4" onClick={() => setShowRequestForm(true)}>
              Individuelle Anfrage stellen
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
                    <h3 className="font-semibold text-gray-900">Individuelle Schulung anfragen</h3>
                    <p className="text-sm text-gray-500">Wir erstellen ein maßgeschneidertes Angebot</p>
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
                      Gewünschte Themen / Schwerpunkte
                    </label>
                    <input
                      type="text"
                      value={formData.themen}
                      onChange={(e) => setFormData({ ...formData, themen: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="z.B. Prompting, KI im Marketing, RAG"
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
                      placeholder="Beschreiben Sie Ihre spezifischen Anforderungen, Vorkenntnisse des Teams, gewünschtes Format (Online/Präsenz), etc."
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
                      Anfrage senden
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
