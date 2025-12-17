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
