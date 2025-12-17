import {
  Customer,
  Module,
  ModuleHistoryEntry,
  PointTransaction,
  ExternalCost,
  RoadmapItem,
  Workshop,
  TeamMember,
  Decision,
  Meeting,
  MonthlySummary,
  DashboardStats,
  Notification,
  AdminMessage,
} from '@/types'

export const mockCustomer: Customer = {
  id: '1',
  name: 'Max Mustermann',
  companyName: 'TechCorp GmbH',
  email: 'max@techcorp.de',
  membership: {
    id: 'm1',
    tier: 'M',
    monthlyPoints: 200,
    usedPoints: 142,
    remainingPoints: 58,
    periodStart: '2024-12-01',
    periodEnd: '2024-12-31',
  },
}

export const mockModules: Module[] = [
  {
    id: 'mod1',
    name: 'Kundenservice Chatbot',
    description: 'KI-gestützter Chatbot für den Kundenservice mit FAQ-Integration',
    status: 'live',
    monthlyMaintenancePoints: 8,
    createdAt: '2024-08-15',
    updatedAt: '2024-12-10',
  },
  {
    id: 'mod2',
    name: 'Dokumenten-Analyse',
    description: 'Automatische Analyse und Kategorisierung eingehender Dokumente',
    status: 'live',
    monthlyMaintenancePoints: 12,
    createdAt: '2024-09-20',
    updatedAt: '2024-12-05',
  },
  {
    id: 'mod3',
    name: 'E-Mail Klassifikation',
    description: 'Automatische Sortierung und Priorisierung von E-Mails',
    status: 'optimierung',
    monthlyMaintenancePoints: 6,
    createdAt: '2024-11-01',
    updatedAt: '2024-12-12',
  },
  {
    id: 'mod4',
    name: 'Vertriebsprognose',
    description: 'KI-basierte Vorhersage von Verkaufschancen',
    status: 'setup',
    monthlyMaintenancePoints: 0,
    createdAt: '2024-12-01',
    updatedAt: '2024-12-15',
  },
]

export const mockModuleHistory: ModuleHistoryEntry[] = [
  {
    id: 'mh1',
    moduleId: 'mod1',
    date: '2024-12-10',
    action: 'Update',
    description: 'FAQ-Datenbank erweitert um 50 neue Einträge',
    pointsUsed: 4,
  },
  {
    id: 'mh2',
    moduleId: 'mod2',
    date: '2024-12-05',
    action: 'Optimierung',
    description: 'Erkennungsgenauigkeit verbessert auf 94%',
    pointsUsed: 8,
  },
  {
    id: 'mh3',
    moduleId: 'mod3',
    date: '2024-12-12',
    action: 'Feature',
    description: 'Neue Kategorie "Dringend" hinzugefügt',
    pointsUsed: 6,
  },
  {
    id: 'mh4',
    moduleId: 'mod4',
    date: '2024-12-15',
    action: 'Setup',
    description: 'Initiale Datenbankanbindung konfiguriert',
    pointsUsed: 12,
  },
]

export const mockPointTransactions: PointTransaction[] = [
  { id: 'pt1', date: '2024-12-15', description: 'Vertriebsprognose - Setup Phase 1', points: 12, category: 'entwicklung', moduleId: 'mod4' },
  { id: 'pt2', date: '2024-12-14', description: 'Team-Workshop: KI-Grundlagen', points: 8, category: 'schulung' },
  { id: 'pt3', date: '2024-12-12', description: 'E-Mail Klassifikation - Neue Kategorie', points: 6, category: 'entwicklung', moduleId: 'mod3' },
  { id: 'pt4', date: '2024-12-10', description: 'Chatbot - FAQ Update', points: 4, category: 'wartung', moduleId: 'mod1' },
  { id: 'pt5', date: '2024-12-08', description: 'Dokumenten-Analyse - Performance-Tuning', points: 8, category: 'entwicklung', moduleId: 'mod2' },
  { id: 'pt6', date: '2024-12-05', description: 'Monatliche Wartung alle Module', points: 26, category: 'wartung' },
  { id: 'pt7', date: '2024-12-03', description: 'Chatbot - Neue Integrationen', points: 15, category: 'entwicklung', moduleId: 'mod1' },
  { id: 'pt8', date: '2024-12-01', description: 'Strategiemeeting & Roadmap Review', points: 4, category: 'schulung' },
  { id: 'pt9', date: '2024-11-28', description: 'Dokumenten-Analyse - OCR Verbesserung', points: 18, category: 'entwicklung', moduleId: 'mod2' },
  { id: 'pt10', date: '2024-11-25', description: 'E-Mail Klassifikation - Go-Live Vorbereitung', points: 10, category: 'entwicklung', moduleId: 'mod3' },
]

export const mockExternalCosts: ExternalCost[] = [
  { id: 'ec1', date: '2024-12-15', type: 'tokens', description: 'OpenAI API Tokens', amount: 234.50, unit: 'EUR' },
  { id: 'ec2', date: '2024-12-15', type: 'server', description: 'Cloud Hosting (AWS)', amount: 89.00, unit: 'EUR' },
  { id: 'ec3', date: '2024-12-10', type: 'tokens', description: 'OpenAI API Tokens', amount: 187.20, unit: 'EUR' },
  { id: 'ec4', date: '2024-12-05', type: 'telefonie', description: 'Voice API Calls', amount: 45.00, unit: 'EUR' },
  { id: 'ec5', date: '2024-12-01', type: 'server', description: 'Cloud Hosting (AWS)', amount: 89.00, unit: 'EUR' },
]

export const mockRoadmapItems: RoadmapItem[] = [
  {
    id: 'ri1',
    title: 'Kundenservice Chatbot 2.0',
    description: 'Erweiterung um Spracheingabe und Sentiment-Analyse',
    status: 'geplant',
    priority: 'hoch',
    progress: 0,
    startDate: '2025-01-15',
    targetDate: '2025-03-31',
    acceptanceStatus: 'ausstehend',
    totalEstimatedPoints: 85,
    acceptanceCriteria: [
      { id: 'ac1-1', description: 'Spracheingabe funktioniert in deutscher Sprache mit >95% Erkennungsrate', estimatedPoints: 25 },
      { id: 'ac1-2', description: 'Sentiment-Analyse erkennt positive/negative/neutrale Stimmung', estimatedPoints: 20 },
      { id: 'ac1-3', description: 'Integration in bestehendes Chatbot-System ohne Downtime', estimatedPoints: 15 },
      { id: 'ac1-4', description: 'Dokumentation und Schulung für Support-Team', estimatedPoints: 10 },
      { id: 'ac1-5', description: 'Performance-Tests bestanden (Antwortzeit <2s)', estimatedPoints: 15 },
    ],
  },
  {
    id: 'ri2',
    title: 'Vertriebsprognose System',
    description: 'KI-basierte Vorhersage von Verkaufschancen und Lead-Scoring',
    status: 'in-arbeit',
    priority: 'hoch',
    progress: 35,
    startDate: '2024-12-01',
    targetDate: '2025-02-28',
    acceptanceStatus: 'akzeptiert',
    acceptedAt: '2024-11-25',
    acceptedBy: 'Max Mustermann',
    totalEstimatedPoints: 120,
    acceptanceCriteria: [
      { id: 'ac2-1', description: 'Lead-Scoring-Algorithmus mit >80% Genauigkeit', estimatedPoints: 35, accepted: true },
      { id: 'ac2-2', description: 'Integration mit CRM-System (Salesforce)', estimatedPoints: 25, accepted: true },
      { id: 'ac2-3', description: 'Dashboard mit Echtzeit-Prognosen', estimatedPoints: 30, accepted: true },
      { id: 'ac2-4', description: 'Wöchentliche automatische Reports per E-Mail', estimatedPoints: 15, accepted: true },
      { id: 'ac2-5', description: 'Schulung für Vertriebsteam (2 Sessions)', estimatedPoints: 15, accepted: true },
    ],
  },
  {
    id: 'ri3',
    title: 'E-Mail Klassifikation',
    description: 'Automatische Sortierung und Priorisierung von E-Mails',
    status: 'in-arbeit',
    priority: 'mittel',
    progress: 80,
    startDate: '2024-11-01',
    targetDate: '2024-12-31',
    acceptanceStatus: 'akzeptiert',
    acceptedAt: '2024-10-20',
    acceptedBy: 'Max Mustermann',
    totalEstimatedPoints: 65,
    acceptanceCriteria: [
      { id: 'ac3-1', description: '5 Kategorien: Dringend, Anfrage, Beschwerde, Info, Spam', estimatedPoints: 20, accepted: true },
      { id: 'ac3-2', description: 'Klassifikationsgenauigkeit >90%', estimatedPoints: 25, accepted: true },
      { id: 'ac3-3', description: 'Automatische Weiterleitung an zuständige Abteilung', estimatedPoints: 15, accepted: true },
      { id: 'ac3-4', description: 'Manuelle Korrekturmöglichkeit mit Lernfunktion', estimatedPoints: 5, accepted: true },
    ],
  },
  {
    id: 'ri4',
    title: 'Dokumenten-Analyse System',
    description: 'Automatische Analyse und Kategorisierung eingehender Dokumente',
    status: 'abgeschlossen',
    priority: 'hoch',
    progress: 100,
    startDate: '2024-09-01',
    targetDate: '2024-11-30',
    completedDate: '2024-11-28',
    acceptanceStatus: 'akzeptiert',
    acceptedAt: '2024-08-25',
    acceptedBy: 'Max Mustermann',
    totalEstimatedPoints: 95,
    acceptanceCriteria: [
      { id: 'ac4-1', description: 'OCR-Erkennung für gescannte Dokumente', estimatedPoints: 30, accepted: true },
      { id: 'ac4-2', description: 'Automatische Kategorisierung in 10 Dokumenttypen', estimatedPoints: 25, accepted: true },
      { id: 'ac4-3', description: 'Extraktion von Schlüsseldaten (Datum, Betrag, etc.)', estimatedPoints: 25, accepted: true },
      { id: 'ac4-4', description: 'Integration mit DMS-System', estimatedPoints: 15, accepted: true },
    ],
  },
  {
    id: 'ri5',
    title: 'Kundenservice Chatbot',
    description: 'Basis-Version mit FAQ-Integration',
    status: 'abgeschlossen',
    priority: 'hoch',
    progress: 100,
    startDate: '2024-07-01',
    targetDate: '2024-09-30',
    completedDate: '2024-09-15',
    acceptanceStatus: 'akzeptiert',
    acceptedAt: '2024-06-20',
    acceptedBy: 'Max Mustermann',
    totalEstimatedPoints: 80,
    acceptanceCriteria: [
      { id: 'ac5-1', description: 'Beantwortung von 100+ FAQ-Fragen', estimatedPoints: 25, accepted: true },
      { id: 'ac5-2', description: 'Eskalation an Mitarbeiter bei komplexen Anfragen', estimatedPoints: 20, accepted: true },
      { id: 'ac5-3', description: '24/7 Verfügbarkeit', estimatedPoints: 15, accepted: true },
      { id: 'ac5-4', description: 'Widget für Website-Integration', estimatedPoints: 20, accepted: true },
    ],
  },
  {
    id: 'ri6',
    title: 'Prozessautomatisierung RPA',
    description: 'Integration von RPA für wiederkehrende Aufgaben',
    status: 'geplant',
    priority: 'niedrig',
    progress: 0,
    startDate: '2025-04-01',
    targetDate: '2025-06-30',
    acceptanceStatus: 'ausstehend',
    totalEstimatedPoints: 110,
    acceptanceCriteria: [
      { id: 'ac6-1', description: 'Automatisierung von 5 identifizierten Prozessen', estimatedPoints: 40 },
      { id: 'ac6-2', description: 'Zeitersparnis von min. 20h/Woche', estimatedPoints: 25 },
      { id: 'ac6-3', description: 'Fehlerrate <1% bei automatisierten Prozessen', estimatedPoints: 25 },
      { id: 'ac6-4', description: 'Monitoring-Dashboard für RPA-Bots', estimatedPoints: 20 },
    ],
  },
]

export const mockWorkshops: Workshop[] = [
  { id: 'ws1', title: 'KI-Grundlagen für das Team', date: '2024-12-14', duration: '2h', participants: 8, pointsUsed: 8, status: 'abgeschlossen' },
  { id: 'ws2', title: 'Chatbot Nutzung & Best Practices', date: '2024-11-20', duration: '1.5h', participants: 12, pointsUsed: 6, status: 'abgeschlossen' },
  { id: 'ws3', title: 'Dokumenten-Analyse Training', date: '2024-11-05', duration: '2h', participants: 6, pointsUsed: 8, status: 'abgeschlossen' },
  { id: 'ws4', title: 'Vertriebsprognose Einführung', date: '2025-01-15', duration: '2h', participants: 10, pointsUsed: 8, status: 'geplant' },
]

export const mockTeamMembers: TeamMember[] = [
  { id: 'tm1', name: 'Max Mustermann', role: 'Projektleiter', department: 'IT' },
  { id: 'tm2', name: 'Anna Schmidt', role: 'KI Champion', department: 'Kundenservice' },
  { id: 'tm3', name: 'Peter Weber', role: 'Fachanwender', department: 'Vertrieb' },
  { id: 'tm4', name: 'Lisa Müller', role: 'Admin', department: 'IT' },
  { id: 'tm5', name: 'Thomas Klein', role: 'Fachanwender', department: 'Dokumentenmanagement' },
]

export const mockDecisions: Decision[] = [
  {
    id: 'd1',
    date: '2024-12-10',
    title: 'Vertriebsprognose Scope finalisiert',
    description: 'Fokus auf Lead-Scoring in Phase 1, Pipeline-Analyse in Phase 2',
    participants: ['Max Mustermann', 'Peter Weber'],
  },
  {
    id: 'd2',
    date: '2024-11-28',
    title: 'E-Mail Klassifikation Kategorien definiert',
    description: '5 Hauptkategorien festgelegt: Dringend, Anfrage, Beschwerde, Info, Spam',
    participants: ['Anna Schmidt', 'Lisa Müller'],
  },
  {
    id: 'd3',
    date: '2024-11-15',
    title: 'Chatbot Erweiterung genehmigt',
    description: 'Budget für Spracheingabe-Feature in Q1 2025 genehmigt',
    participants: ['Max Mustermann', 'Anna Schmidt'],
  },
]

export const mockMeetings: Meeting[] = [
  { id: 'mt1', title: 'Monatliches Review', date: '2024-12-20', type: 'review' },
  { id: 'mt2', title: 'Vertriebsprognose Abstimmung', date: '2024-12-22', type: 'abstimmung' },
  { id: 'mt3', title: 'Q1 2025 Planung', date: '2025-01-10', type: 'abstimmung' },
  { id: 'mt4', title: 'Vertriebsprognose Einführung', date: '2025-01-15', type: 'workshop' },
]

export const mockMonthlySummaries: MonthlySummary[] = [
  { month: '2024-07', entwicklung: 85, wartung: 0, schulung: 15, total: 100 },
  { month: '2024-08', entwicklung: 110, wartung: 8, schulung: 12, total: 130 },
  { month: '2024-09', entwicklung: 95, wartung: 16, schulung: 10, total: 121 },
  { month: '2024-10', entwicklung: 75, wartung: 20, schulung: 8, total: 103 },
  { month: '2024-11', entwicklung: 120, wartung: 24, schulung: 14, total: 158 },
  { month: '2024-12', entwicklung: 85, wartung: 30, schulung: 27, total: 142 },
]

export const mockDashboardStats: DashboardStats = {
  pointsUsed: 142,
  pointsRemaining: 58,
  pointsTotal: 200,
  activeModules: 3,
  modulesInSetup: 1,
  roadmapProgress: 65,
  upcomingMeetings: 2,
  currentMonthCosts: 644.70,
}

// Hilfsfunktion für Punkte nach Kategorie im aktuellen Monat
export function getPointsByCategory() {
  return {
    entwicklung: 85,
    wartung: 30,
    schulung: 27,
  }
}

// Hilfsfunktion für externe Kosten nach Typ
export function getExternalCostsByType() {
  return {
    tokens: 421.70,
    server: 178.00,
    telefonie: 45.00,
    sonstige: 0,
  }
}

// Benachrichtigungen
export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'acceptance_required',
    title: 'Akzeptanzkriterien bestätigen',
    message: 'Bitte bestätigen Sie die Akzeptanzkriterien für das Projekt "Kundenservice Chatbot 2.0", damit wir mit der Entwicklung beginnen können.',
    createdAt: '2024-12-16T10:30:00',
    read: false,
    actionRequired: true,
    relatedProjectId: 'ri1',
    relatedUrl: '/roadmap/ri1',
  },
  {
    id: 'n2',
    type: 'acceptance_required',
    title: 'Akzeptanzkriterien bestätigen',
    message: 'Das Projekt "Prozessautomatisierung RPA" wartet auf Ihre Freigabe der Akzeptanzkriterien.',
    createdAt: '2024-12-15T14:00:00',
    read: false,
    actionRequired: true,
    relatedProjectId: 'ri6',
    relatedUrl: '/roadmap/ri6',
  },
  {
    id: 'n3',
    type: 'message',
    title: 'Neue Nachricht vom Team',
    message: 'Wir haben eine wichtige Mitteilung bezüglich Ihres Projekts.',
    createdAt: '2024-12-14T09:15:00',
    read: false,
    actionRequired: false,
    relatedUrl: '/messages',
  },
  {
    id: 'n4',
    type: 'milestone_reached',
    title: 'Meilenstein erreicht',
    message: 'Das E-Mail Klassifikation System hat 80% Fortschritt erreicht!',
    createdAt: '2024-12-12T16:45:00',
    read: true,
    actionRequired: false,
    relatedProjectId: 'ri3',
  },
  {
    id: 'n5',
    type: 'project_update',
    title: 'Projekt-Update verfügbar',
    message: 'Neuer Statusbericht für "Vertriebsprognose System" ist verfügbar.',
    createdAt: '2024-12-10T11:00:00',
    read: true,
    actionRequired: false,
    relatedProjectId: 'ri2',
  },
]

// Admin-Nachrichten
export const mockAdminMessages: AdminMessage[] = [
  {
    id: 'msg1',
    subject: 'Wichtig: Abstimmung zu Chatbot 2.0 Features',
    content: `Sehr geehrter Herr Mustermann,

im Rahmen der Planung für das Chatbot 2.0 Projekt möchten wir gerne einige Details mit Ihnen abstimmen:

1. **Spracheingabe**: Soll die Spracheingabe auch auf mobilen Geräten verfügbar sein?
2. **Sentiment-Analyse**: Möchten Sie automatische Eskalation bei negativer Stimmung?
3. **Schulung**: Bevorzugen Sie eine Vor-Ort-Schulung oder Remote?

Bitte geben Sie uns Ihr Feedback bis zum 20.12., damit wir die finalen Akzeptanzkriterien erstellen können.

Mit freundlichen Grüßen,
Ihr AI Empowerment Team`,
    createdAt: '2024-12-14T09:15:00',
    read: false,
    from: 'Sarah Meyer - Projektleiterin',
  },
  {
    id: 'msg2',
    subject: 'Monatlicher Status-Report November 2024',
    content: `Sehr geehrter Herr Mustermann,

anbei Ihr monatlicher Status-Report für November 2024:

**Highlights:**
- E-Mail Klassifikation: 80% Fortschritt erreicht
- Dokumenten-Analyse: Erfolgreich abgeschlossen am 28.11.
- 158 Punkte verbraucht (von 200 verfügbar)

**Nächste Schritte:**
- Go-Live E-Mail Klassifikation: 31.12.2024
- Start Chatbot 2.0: 15.01.2025

Bei Fragen stehen wir Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen,
Ihr AI Empowerment Team`,
    createdAt: '2024-12-01T08:00:00',
    read: true,
    from: 'AI Empowerment Team',
  },
  {
    id: 'msg3',
    subject: 'Einladung: Q1 2025 Planungsmeeting',
    content: `Sehr geehrter Herr Mustermann,

wir möchten Sie herzlich zum Q1 2025 Planungsmeeting einladen:

**Datum:** 10. Januar 2025
**Uhrzeit:** 10:00 - 12:00 Uhr
**Format:** Remote (Teams-Link folgt)

**Agenda:**
1. Rückblick Q4 2024
2. Roadmap-Review und Priorisierung
3. Budget-Planung Q1 2025
4. Neue Use-Case-Ideen

Bitte bestätigen Sie Ihre Teilnahme.

Mit freundlichen Grüßen,
Sarah Meyer`,
    createdAt: '2024-11-25T14:30:00',
    read: true,
    from: 'Sarah Meyer - Projektleiterin',
  },
]

// Hilfsfunktion für ungelesene Benachrichtigungen
export function getUnreadNotificationsCount(): number {
  return mockNotifications.filter((n) => !n.read).length
}

// Hilfsfunktion für ausstehende Akzeptanzen
export function getPendingAcceptanceCount(): number {
  return mockRoadmapItems.filter((item) => item.acceptanceStatus === 'ausstehend').length
}
