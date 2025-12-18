'use client'

import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  HelpCircle,
  Book,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  ExternalLink,
  ChevronRight,
} from 'lucide-react'

const faqs = [
  {
    question: 'Was bedeutet mein Punktebudget?',
    answer: 'Ihr monatliches Punktebudget repräsentiert die verfügbare Kapazität für Entwicklung, Wartung und Schulungen. Jede Aktivität verbraucht eine bestimmte Anzahl von Punkten, die in Ihrem Dashboard transparent aufgeschlüsselt werden.',
  },
  {
    question: 'Wie werden externe Kosten abgerechnet?',
    answer: 'Externe Kosten wie API-Tokens, Serverkosten oder Telefonie werden separat von Ihrem Punktebudget erfasst und monatlich abgerechnet. Sie finden eine detaillierte Aufschlüsselung im Bereich "Kosten".',
  },
  {
    question: 'Was passiert, wenn mein Punktebudget aufgebraucht ist?',
    answer: 'Wenn Ihr monatliches Budget erschöpft ist, werden laufende Wartungsarbeiten priorisiert. Neue Entwicklungen können dann im Folgemonat fortgeführt oder ein Paket-Upgrade vereinbart werden.',
  },
  {
    question: 'Wie kann ich ein Modul anpassen lassen?',
    answer: 'Wenden Sie sich einfach über den Kontaktbereich an Ihr Projektteam. Beschreiben Sie die gewünschten Anpassungen und wir schätzen den Punkteaufwand für Sie.',
  },
  {
    question: 'Was ist der Unterschied zwischen Entwicklung und Wartung?',
    answer: 'Entwicklung umfasst neue Features, Module oder größere Anpassungen. Wartung beinhaltet den laufenden Betrieb, kleine Bugfixes, Updates und die Sicherstellung der Verfügbarkeit.',
  },
]

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Hilfe & Support"
        subtitle="Häufige Fragen und Kontaktmöglichkeiten"
      />

      <div className="p-6">
        <div className="mx-auto max-w-4xl">
          {/* Quick Actions */}
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <Card className="cursor-pointer transition-all hover:shadow-md">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="rounded-lg bg-primary-100 p-3">
                  <MessageCircle className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Live Chat</h3>
                  <p className="text-sm text-gray-500">Sofortige Hilfe</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer transition-all hover:shadow-md">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="rounded-lg bg-green-100 p-3">
                  <Phone className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Anrufen</h3>
                  <p className="text-sm text-gray-500">+49 123 456789</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer transition-all hover:shadow-md">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="rounded-lg bg-blue-100 p-3">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">E-Mail</h3>
                  <p className="text-sm text-gray-500">support@example.com</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-gray-400" />
                Häufig gestellte Fragen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-gray-100">
                {faqs.map((faq, index) => (
                  <details key={index} className="group py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-gray-900">
                      {faq.question}
                      <ChevronRight className="h-5 w-5 text-gray-400 transition-transform group-open:rotate-90" />
                    </summary>
                    <p className="mt-3 text-sm text-gray-600">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resources */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5 text-gray-400" />
                  Dokumentation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-gray-600">
                  Ausführliche Anleitungen und Best Practices für das AI Empowerment Programm.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-between">
                    Dashboard Anleitung
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    Punktesystem erklärt
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    Modul-Übersicht
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-400" />
                  Vertragsunterlagen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-gray-600">
                  Ihre Vertragsdetails und wichtige Dokumente.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-between">
                    Rahmenvertrag
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    Leistungsbeschreibung
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    AGB
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form Placeholder */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Kontaktformular</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Betreff</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    placeholder="Worum geht es?"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Nachricht</label>
                  <textarea
                    rows={4}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    placeholder="Beschreiben Sie Ihr Anliegen..."
                  />
                </div>
                <Button className="w-full md:w-auto">Nachricht senden</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
