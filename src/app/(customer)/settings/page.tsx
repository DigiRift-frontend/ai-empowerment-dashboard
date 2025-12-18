'use client'

import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { mockCustomer } from '@/lib/mock-data'
import { formatDate } from '@/lib/utils'
import {
  User,
  Building,
  Mail,
  Phone,
  Bell,
  Shield,
  Download,
  CreditCard,
} from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Einstellungen"
        subtitle="Konto und Benachrichtigungen verwalten"
      />

      <div className="p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-400" />
                Kontoinformationen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                      <User className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{mockCustomer.name}</p>
                      <p className="text-sm text-gray-500">Administrator</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Bearbeiten</Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Unternehmen</p>
                      <p className="font-medium">{mockCustomer.companyName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">E-Mail</p>
                      <p className="font-medium">{mockCustomer.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Membership */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-gray-400" />
                Mitgliedschaft
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-80">AI Empowerment Programm</p>
                    <p className="text-2xl font-bold">Paket {mockCustomer.membership.tier}</p>
                    <p className="mt-1 text-sm opacity-80">
                      {mockCustomer.membership.monthlyPoints} Punkte / Monat
                    </p>
                  </div>
                  <Badge className="bg-white/20 text-white">Aktiv</Badge>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Aktueller Zeitraum</p>
                  <p className="font-medium">
                    {formatDate(mockCustomer.membership.periodStart)} - {formatDate(mockCustomer.membership.periodEnd)}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Verbleibende Punkte</p>
                  <p className="font-medium">{mockCustomer.membership.remainingPoints} Punkte</p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline">Paket upgraden</Button>
                <Button variant="ghost">Rechnungen anzeigen</Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-gray-400" />
                Benachrichtigungen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'E-Mail bei niedrigem Punktestand', description: 'Benachrichtigung wenn unter 20% verbleiben', enabled: true },
                  { label: 'Wöchentlicher Statusbericht', description: 'Zusammenfassung jeden Montag', enabled: true },
                  { label: 'Modul-Updates', description: 'Bei Änderungen an aktiven Modulen', enabled: false },
                  { label: 'Roadmap-Meilensteine', description: 'Bei erreichten Meilensteinen', enabled: true },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <button
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        item.enabled ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          item.enabled ? 'left-[22px]' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-gray-400" />
                Sicherheit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Passwort ändern</p>
                    <p className="text-sm text-gray-500">Zuletzt geändert vor 30 Tagen</p>
                  </div>
                  <Button variant="outline" size="sm">Ändern</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Zwei-Faktor-Authentifizierung</p>
                    <p className="text-sm text-gray-500">Zusätzliche Sicherheit für Ihr Konto</p>
                  </div>
                  <Badge variant="secondary">Nicht aktiviert</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Export */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-gray-400" />
                Datenexport
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-gray-600">
                Exportieren Sie Ihre Daten für Ihre Unterlagen oder zur Weiterverarbeitung.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Punktehistorie (CSV)
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Monatsbericht (PDF)
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Alle Daten (JSON)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
