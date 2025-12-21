import { Customer, Module, PointTransaction, TeamMember, Schulung, CustomerRoadmap, ModuleTemplate, SchulungSerie, CustomerSchulungAssignment } from '@/types'

// Mehrere Kunden für Admin-Ansicht
export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Max Mustermann',
    companyName: 'TechCorp GmbH',
    email: 'max@techcorp.de',
    customerCode: '4721',
    membership: {
      id: 'm1',
      tier: 'M',
      monthlyPoints: 200,
      usedPoints: 142,
      remainingPoints: 58,
      monthlyPrice: 4900,
      contractStart: '2024-07-01',
      periodStart: '2024-12-01',
      periodEnd: '2024-12-31',
      carriedOverPoints: {
        month1: 15,
        month2: 28,
        month3: 0,
      },
    },
    advisor: {
      id: 'adv1',
      name: 'Kamil Gawlik',
      role: 'Customer Success Manager',
      email: 'kamil@digirift.com',
      phone: '+49 89 123 456 78',
      calendlyUrl: 'https://calendly.com/kamil-gawlik',
    },
  },
  {
    id: '2',
    name: 'Anna Schmidt',
    companyName: 'InnovateTech AG',
    email: 'anna@innovatetech.de',
    customerCode: '8392',
    membership: {
      id: 'm2',
      tier: 'L',
      monthlyPoints: 400,
      usedPoints: 280,
      remainingPoints: 120,
      monthlyPrice: 8900,
      contractStart: '2024-05-01',
      periodStart: '2024-12-01',
      periodEnd: '2024-12-31',
      carriedOverPoints: {
        month1: 0,
        month2: 45,
        month3: 0,
      },
    },
    advisor: {
      id: 'adv1',
      name: 'Kamil Gawlik',
      role: 'Customer Success Manager',
      email: 'kamil@digirift.com',
      phone: '+49 89 123 456 78',
      calendlyUrl: 'https://calendly.com/kamil-gawlik',
    },
  },
  {
    id: '3',
    name: 'Peter Weber',
    companyName: 'DataFlow Solutions',
    email: 'peter@dataflow.de',
    customerCode: '5547',
    membership: {
      id: 'm3',
      tier: 'S',
      monthlyPoints: 100,
      usedPoints: 75,
      remainingPoints: 25,
      monthlyPrice: 2900,
      contractStart: '2024-10-01',
      periodStart: '2024-12-01',
      periodEnd: '2024-12-31',
    },
    advisor: {
      id: 'adv1',
      name: 'Kamil Gawlik',
      role: 'Customer Success Manager',
      email: 'kamil@digirift.com',
      phone: '+49 89 123 456 78',
      calendlyUrl: 'https://calendly.com/kamil-gawlik',
    },
  },
  {
    id: '4',
    name: 'Lisa Müller',
    companyName: 'SmartRetail GmbH',
    email: 'lisa@smartretail.de',
    customerCode: '3198',
    membership: {
      id: 'm4',
      tier: 'M',
      monthlyPoints: 200,
      usedPoints: 50,
      remainingPoints: 150,
      monthlyPrice: 4900,
      contractStart: '2024-11-01',
      periodStart: '2024-12-01',
      periodEnd: '2024-12-31',
    },
    advisor: {
      id: 'adv1',
      name: 'Kamil Gawlik',
      role: 'Customer Success Manager',
      email: 'kamil@digirift.com',
      phone: '+49 89 123 456 78',
      calendlyUrl: 'https://calendly.com/kamil-gawlik',
    },
  },
]

// Unified Module pro Kunde (combines old Module + RoadmapItem)
export const mockCustomerModules: Record<string, Module[]> = {
  '1': [
    {
      id: 'mod1',
      name: 'Kundenservice Chatbot',
      description: 'KI-gestützter Chatbot für den Kundenservice mit FAQ-Integration',
      status: 'abgeschlossen',
      priority: 'hoch',
      progress: 100,
      monthlyMaintenancePoints: 8,
      assigneeId: 'tm2',
      softwareUrl: 'https://chatbot.techcorp.de',
      acceptanceStatus: 'akzeptiert',
      acceptedAt: '2024-08-10',
      acceptedBy: 'Max Mustermann',
      acceptanceCriteria: [
        { id: 'ac-mod1-1', description: 'FAQ-Integration mit >100 Fragen', accepted: true },
        { id: 'ac-mod1-2', description: 'Antwortzeit unter 3 Sekunden', accepted: true },
      ],
      createdAt: '2024-07-15',
      updatedAt: '2024-12-10',
      showInRoadmap: true,
      roadmapOrder: 1,
    },
    {
      id: 'mod2',
      name: 'Dokumenten-Analyse',
      description: 'Automatische Analyse und Kategorisierung eingehender Dokumente',
      status: 'abgeschlossen',
      priority: 'mittel',
      progress: 100,
      monthlyMaintenancePoints: 12,
      assigneeId: 'tm5',
      softwareUrl: 'https://docs.techcorp.de/analyse',
      acceptanceStatus: 'akzeptiert',
      acceptedAt: '2024-09-15',
      acceptedBy: 'Max Mustermann',
      acceptanceCriteria: [
        { id: 'ac-mod2-1', description: 'PDF, Word und Excel Unterstützung', accepted: true },
        { id: 'ac-mod2-2', description: 'Automatische Kategorisierung in 5+ Kategorien', accepted: true },
      ],
      createdAt: '2024-08-20',
      updatedAt: '2024-12-05',
      showInRoadmap: true,
      roadmapOrder: 2,
    },
    {
      id: 'mod3',
      name: 'E-Mail Klassifikation',
      description: 'Automatische Sortierung und Priorisierung von E-Mails',
      status: 'im_test',
      priority: 'mittel',
      progress: 90,
      monthlyMaintenancePoints: 6,
      assigneeId: 'tm4',
      acceptanceStatus: 'akzeptiert',
      acceptedAt: '2024-11-20',
      acceptedBy: 'Max Mustermann',
      acceptanceCriteria: [
        { id: 'ac-mod3-1', description: '5 Kategorien: Dringend, Anfrage, Beschwerde, Info, Spam', accepted: true },
        { id: 'ac-mod3-2', description: 'Klassifikationsgenauigkeit >90%', accepted: true },
      ],
      testFeedback: [
        { id: 'tf1', date: '2024-12-14', feedback: 'Spam-Erkennung funktioniert gut', resolved: true },
      ],
      createdAt: '2024-10-01',
      updatedAt: '2024-12-12',
      showInRoadmap: true,
      roadmapOrder: 3,
    },
    {
      id: 'mod4',
      name: 'Vertriebsprognose System',
      description: 'KI-basierte Vorhersage von Verkaufschancen und Lead-Scoring',
      status: 'in_arbeit',
      priority: 'hoch',
      progress: 35,
      monthlyMaintenancePoints: 10,
      startDate: '2024-12-01',
      targetDate: '2025-02-28',
      assigneeId: 'tm3',
      acceptanceStatus: 'akzeptiert',
      acceptedAt: '2024-11-25',
      acceptedBy: 'Max Mustermann',
      acceptanceCriteria: [
        { id: 'ac-mod4-1', description: 'Lead-Scoring-Algorithmus mit >80% Genauigkeit', accepted: true },
        { id: 'ac-mod4-2', description: 'Integration mit CRM-System (Salesforce)', accepted: true },
      ],
      createdAt: '2024-11-15',
      updatedAt: '2024-12-15',
      showInRoadmap: true,
      roadmapOrder: 4,
    },
    {
      id: 'mod5',
      name: 'Kundenservice Chatbot 2.0',
      description: 'Erweiterung um Spracheingabe und Sentiment-Analyse',
      status: 'geplant',
      priority: 'hoch',
      progress: 0,
      monthlyMaintenancePoints: 0,
      startDate: '2025-01-15',
      targetDate: '2025-03-31',
      assigneeId: 'tm2',
      acceptanceStatus: 'ausstehend',
      acceptanceCriteria: [
        { id: 'ac-mod5-1', description: 'Spracheingabe funktioniert in deutscher Sprache mit >95% Erkennungsrate' },
        { id: 'ac-mod5-2', description: 'Sentiment-Analyse erkennt positive/negative/neutrale Stimmung' },
        { id: 'ac-mod5-3', description: 'Integration in bestehendes Chatbot-System ohne Downtime' },
      ],
      createdAt: '2024-12-10',
      updatedAt: '2024-12-10',
      showInRoadmap: true,
      roadmapOrder: 5,
    },
  ],
  '2': [
    {
      id: 'mod6',
      name: 'Predictive Analytics',
      description: 'Vorhersagemodelle für Geschäftskennzahlen',
      status: 'abgeschlossen',
      priority: 'hoch',
      progress: 100,
      monthlyMaintenancePoints: 15,
      softwareUrl: 'https://analytics.innovatetech.de',
      acceptanceStatus: 'akzeptiert',
      acceptedAt: '2024-06-20',
      acceptedBy: 'Anna Schmidt',
      acceptanceCriteria: [
        { id: 'ac-mod6-1', description: 'Vorhersagegenauigkeit >85%', accepted: true },
      ],
      createdAt: '2024-05-01',
      updatedAt: '2024-12-01',
      showInRoadmap: true,
      roadmapOrder: 1,
    },
    {
      id: 'mod7',
      name: 'RAG Wissensdatenbank',
      description: 'Unternehmensweite KI-Wissensdatenbank',
      status: 'in_arbeit',
      priority: 'hoch',
      progress: 60,
      monthlyMaintenancePoints: 20,
      softwareUrl: 'https://knowledge.innovatetech.de',
      assigneeId: 'tm2',
      acceptanceStatus: 'akzeptiert',
      acceptedAt: '2024-07-10',
      acceptedBy: 'Anna Schmidt',
      acceptanceCriteria: [
        { id: 'ac-mod7-1', description: 'Antwortzeit unter 2 Sekunden', accepted: true },
      ],
      createdAt: '2024-06-15',
      updatedAt: '2024-12-08',
      showInRoadmap: true,
      roadmapOrder: 2,
    },
  ],
  '3': [
    {
      id: 'mod8',
      name: 'Report Generator',
      description: 'Automatische Erstellung von Geschäftsberichten',
      status: 'geplant',
      priority: 'mittel',
      progress: 0,
      monthlyMaintenancePoints: 5,
      acceptanceStatus: 'ausstehend',
      acceptanceCriteria: [
        { id: 'ac-mod8-1', description: 'PDF-Export funktioniert' },
        { id: 'ac-mod8-2', description: 'Wöchentliche automatische Generierung' },
      ],
      createdAt: '2024-11-15',
      updatedAt: '2024-12-10',
      showInRoadmap: true,
      roadmapOrder: 1,
    },
  ],
  '4': [
    {
      id: 'mod9',
      name: 'Produktempfehlungen',
      description: 'KI-basierte Produktempfehlungen für den Online-Shop',
      status: 'in_arbeit',
      priority: 'hoch',
      progress: 20,
      monthlyMaintenancePoints: 10,
      acceptanceStatus: 'akzeptiert',
      acceptedAt: '2024-12-05',
      acceptedBy: 'Lisa Müller',
      acceptanceCriteria: [
        { id: 'ac-mod9-1', description: 'Integration mit Shop-System', accepted: true },
      ],
      createdAt: '2024-12-01',
      updatedAt: '2024-12-15',
      showInRoadmap: true,
      roadmapOrder: 1,
    },
  ],
}

// Schulungskatalog (gleich für alle Kunden)
export const schulungskatalog: Schulung[] = [
  {
    id: 'sch1',
    title: 'KI-Grundlagen für Entscheider',
    description: 'Einführung in KI-Konzepte, Möglichkeiten und Grenzen für Führungskräfte',
    duration: '2 Stunden',
    points: 8,
    category: 'grundlagen',
    learningGoals: [
      'Grundlegende KI-Konzepte verstehen',
      'Unterschied zwischen ML, Deep Learning und GenAI erkennen',
      'Potenziale und Grenzen von KI einschätzen',
    ],
    outcomes: [
      'Fundierte Entscheidungen über KI-Investitionen treffen',
      'KI-Projekte besser evaluieren und priorisieren',
      'Mit technischen Teams auf Augenhöhe kommunizieren',
    ],
    format: 'live',
    showInRoadmap: true,
  },
  {
    id: 'sch2',
    title: 'Prompt Engineering Basics',
    description: 'Effektive Kommunikation mit KI-Systemen lernen',
    duration: '3 Stunden',
    points: 12,
    category: 'grundlagen',
    learningGoals: [
      'Aufbau effektiver Prompts verstehen',
      'Verschiedene Prompt-Techniken anwenden',
      'Häufige Fehler vermeiden',
    ],
    outcomes: [
      'Bessere Ergebnisse aus KI-Tools erhalten',
      'Zeit bei der Arbeit mit LLMs sparen',
      'Komplexe Aufgaben in Prompts strukturieren',
    ],
    format: 'hybrid',
    showInRoadmap: true,
  },
  {
    id: 'sch3',
    title: 'ChatGPT & Co. im Arbeitsalltag',
    description: 'Praktische Anwendungen von LLMs im Büroalltag',
    duration: '4 Stunden',
    points: 15,
    category: 'grundlagen',
    learningGoals: [
      'Verschiedene KI-Tools kennenlernen',
      'Use Cases für den Büroalltag identifizieren',
      'Datenschutz und Sicherheit beachten',
    ],
    outcomes: [
      'Routineaufgaben automatisieren',
      'E-Mails und Texte schneller erstellen',
      'Recherche und Analyse beschleunigen',
    ],
    format: 'self_learning',
    showInRoadmap: true,
  },
  {
    id: 'sch4',
    title: 'RAG-Systeme verstehen',
    description: 'Wie funktionieren Retrieval Augmented Generation Systeme',
    duration: '2 Stunden',
    points: 10,
    category: 'fortgeschritten',
    learningGoals: [
      'RAG-Architektur verstehen',
      'Vor- und Nachteile von RAG erkennen',
      'Einsatzszenarien identifizieren',
    ],
    outcomes: [
      'RAG-Projekte planen und evaluieren',
      'Anforderungen an Datenquellen definieren',
      'Mit Entwicklern über RAG kommunizieren',
    ],
    format: 'live',
    showInRoadmap: true,
  },
  {
    id: 'sch5',
    title: 'KI-Strategie Workshop',
    description: 'Entwicklung einer KI-Strategie für Ihr Unternehmen',
    duration: '1 Tag',
    points: 30,
    category: 'spezialisiert',
    learningGoals: [
      'Strategische KI-Roadmap entwickeln',
      'Business Cases für KI erstellen',
      'Change Management für KI planen',
    ],
    outcomes: [
      'Klare KI-Vision für das Unternehmen',
      'Priorisierte Maßnahmenliste',
      'Ressourcen- und Zeitplanung',
    ],
    format: 'live',
    showInRoadmap: true,
  },
  {
    id: 'sch6',
    title: 'Chatbot-Training für Support-Teams',
    description: 'Schulung für Support-Mitarbeiter zur Arbeit mit KI-Chatbots',
    duration: '3 Stunden',
    points: 12,
    category: 'spezialisiert',
    learningGoals: [
      'Chatbot-Funktionen verstehen',
      'Eskalationsprozesse kennen',
      'Qualitätskontrolle durchführen',
    ],
    outcomes: [
      'Nahtlose Zusammenarbeit mit KI-Chatbot',
      'Schnellere Problemlösung',
      'Bessere Kundenzufriedenheit',
    ],
    format: 'hybrid',
    showInRoadmap: true,
  },
]

// Backward compatibility: mockCustomerRoadmap with 'title' field for old pages
// Maps mockCustomerModules to old RoadmapItem format
export const mockCustomerRoadmap: Record<string, Array<{
  id: string
  title: string
  description: string
  status: 'geplant' | 'in_arbeit' | 'im_test' | 'abgeschlossen'
  priority: 'hoch' | 'mittel' | 'niedrig'
  progress: number
  assigneeId?: string
  targetDate?: string
  acceptanceStatus?: 'ausstehend' | 'akzeptiert' | 'abgelehnt'
  acceptanceCriteria?: Array<{ id: string; description: string; accepted?: boolean }>
  acceptedAt?: string
  acceptedBy?: string
}>> = Object.fromEntries(
  Object.entries(mockCustomerModules).map(([customerId, modules]) => [
    customerId,
    modules.map(m => ({
      id: m.id,
      title: m.name, // Map name to title for backward compatibility
      description: m.description,
      status: m.status,
      priority: m.priority,
      progress: m.progress,
      assigneeId: m.assigneeId,
      targetDate: m.targetDate,
      acceptanceStatus: m.acceptanceStatus,
      acceptanceCriteria: m.acceptanceCriteria,
      acceptedAt: m.acceptedAt,
      acceptedBy: m.acceptedBy,
    }))
  ])
)

// Kunden-Roadmaps (was der Kunde sieht)
export const mockCustomerRoadmaps: Record<string, CustomerRoadmap> = {
  '1': {
    id: 'cr1',
    customerId: '1',
    items: [
      { id: 'cri1', type: 'schulung', schulungId: 'sch1', order: 1, targetDate: '2024-07-10' },
      { id: 'cri2', type: 'modul', moduleId: 'mod1', order: 2, targetDate: '2024-08-15' },
      { id: 'cri3', type: 'schulung', schulungId: 'sch2', order: 3, targetDate: '2024-08-20' },
      { id: 'cri4', type: 'modul', moduleId: 'mod2', order: 4, targetDate: '2024-09-20' },
      { id: 'cri5', type: 'modul', moduleId: 'mod3', order: 5, targetDate: '2024-12-15' },
      { id: 'cri6', type: 'modul', moduleId: 'mod4', order: 6, targetDate: '2025-02-28' },
      { id: 'cri7', type: 'schulung', schulungId: 'sch5', order: 7, targetDate: '2025-03-01' },
      { id: 'cri8', type: 'modul', moduleId: 'mod5', order: 8, targetDate: '2025-03-31' },
    ],
    updatedAt: '2024-12-15',
  },
  '2': {
    id: 'cr2',
    customerId: '2',
    items: [
      { id: 'cri10', type: 'schulung', schulungId: 'sch1', order: 1, targetDate: '2024-05-15' },
      { id: 'cri11', type: 'modul', moduleId: 'mod6', order: 2, targetDate: '2024-06-30' },
      { id: 'cri12', type: 'modul', moduleId: 'mod7', order: 3, targetDate: '2025-01-15' },
    ],
    updatedAt: '2024-12-10',
  },
  '3': {
    id: 'cr3',
    customerId: '3',
    items: [
      { id: 'cri20', type: 'schulung', schulungId: 'sch3', order: 1, targetDate: '2024-10-20' },
      { id: 'cri21', type: 'modul', moduleId: 'mod8', order: 2, targetDate: '2025-01-31' },
    ],
    updatedAt: '2024-12-05',
  },
  '4': {
    id: 'cr4',
    customerId: '4',
    items: [
      { id: 'cri30', type: 'schulung', schulungId: 'sch1', order: 1, targetDate: '2024-11-15' },
      { id: 'cri31', type: 'modul', moduleId: 'mod9', order: 2, targetDate: '2025-01-15' },
    ],
    updatedAt: '2024-12-10',
  },
}

// Transaktionen pro Kunde
export const mockCustomerTransactions: Record<string, PointTransaction[]> = {
  '1': [
    { id: 'pt1', date: '2024-12-15', description: 'Vertriebsprognose - Setup Phase 1', points: 12, category: 'entwicklung', moduleId: 'mod4' },
    { id: 'pt2', date: '2024-12-14', description: 'Team-Workshop: KI-Grundlagen', points: 8, category: 'schulung' },
    { id: 'pt3', date: '2024-12-13', description: 'Anforderungsanalyse: CRM-Integration', points: 3, category: 'analyse' },
    { id: 'pt4', date: '2024-12-12', description: 'E-Mail Klassifikation - Neue Kategorie', points: 6, category: 'entwicklung', moduleId: 'mod3' },
    { id: 'pt5', date: '2024-12-11', description: 'Strategieberatung: KI-Roadmap 2025', points: 5, category: 'beratung' },
  ],
  '2': [
    { id: 'pt10', date: '2024-12-15', description: 'RAG Optimierung - Phase 2', points: 25, category: 'entwicklung', moduleId: 'mod7' },
    { id: 'pt11', date: '2024-12-10', description: 'Monatliche Wartung', points: 35, category: 'wartung' },
  ],
  '3': [
    { id: 'pt20', date: '2024-12-12', description: 'Report Generator - Anforderungsanalyse', points: 15, category: 'analyse', moduleId: 'mod8' },
  ],
  '4': [
    { id: 'pt30', date: '2024-12-14', description: 'Produktempfehlungen - Setup', points: 20, category: 'entwicklung', moduleId: 'mod9' },
    { id: 'pt31', date: '2024-12-10', description: 'Kick-off Meeting', points: 5, category: 'beratung' },
  ],
}

// Team Members (interne digirift Mitarbeiter)
export const mockAdminTeamMembers: TeamMember[] = [
  { id: 'tm1', name: 'Kamil Gawlik', role: 'Customer Success Manager', department: 'Customer Success' },
  { id: 'tm2', name: 'Sarah Chen', role: 'AI Engineer', department: 'Engineering' },
  { id: 'tm3', name: 'Michael Berg', role: 'Data Scientist', department: 'Data Science' },
  { id: 'tm4', name: 'Laura Klein', role: 'ML Engineer', department: 'Engineering' },
  { id: 'tm5', name: 'Thomas Meier', role: 'Solutions Architect', department: 'Architecture' },
]

// Admin Message Type
export interface AdminMessage {
  id: string
  subject: string
  content: string
  sentAt: string
  sentBy: string
  actionRequired: boolean
  read: boolean
  customerRead?: boolean
  direction?: 'incoming' | 'outgoing'
  messageType?: 'normal' | 'status_update'
}

// Messages pro Kunde
export const mockCustomerMessages: Record<string, AdminMessage[]> = {
  '1': [
    {
      id: 'msg1',
      subject: 'Willkommen im AI Empowerment Programm',
      content: 'Herzlich willkommen bei digirift! Wir freuen uns, Sie als neuen Kunden begrüßen zu dürfen. In den nächsten Tagen werden wir gemeinsam Ihre ersten KI-Module planen.',
      sentAt: '2024-07-02T10:00:00',
      sentBy: 'Kamil Gawlik',
      actionRequired: false,
      read: true,
    },
    {
      id: 'msg2',
      subject: 'Chatbot ist live!',
      content: 'Ihr Kundenservice Chatbot ist jetzt live und einsatzbereit. Sie können ihn unter https://chatbot.techcorp.de erreichen. Bei Fragen stehe ich Ihnen jederzeit zur Verfügung.',
      sentAt: '2024-08-16T14:30:00',
      sentBy: 'Kamil Gawlik',
      actionRequired: false,
      read: true,
    },
    {
      id: 'msg3',
      subject: 'Akzeptanzkriterien für Vertriebsprognose',
      content: 'Die Akzeptanzkriterien für das Vertriebsprognose-System wurden definiert. Bitte prüfen und bestätigen Sie diese in Ihrem Dashboard.',
      sentAt: '2024-11-25T09:15:00',
      sentBy: 'Kamil Gawlik',
      actionRequired: true,
      read: true,
    },
    {
      id: 'msg4',
      subject: 'E-Mail Klassifikation bereit zum Testen',
      content: 'Die E-Mail Klassifikation ist jetzt in der Testphase. Bitte testen Sie die Funktionalität und geben Sie uns Feedback über das Dashboard.',
      sentAt: '2024-12-12T11:00:00',
      sentBy: 'Laura Klein',
      actionRequired: true,
      read: false,
    },
  ],
  '2': [
    {
      id: 'msg10',
      subject: 'RAG System Update',
      content: 'Wir haben die Performance des RAG Systems verbessert. Die Antwortzeit liegt jetzt unter 2 Sekunden.',
      sentAt: '2024-12-08T16:00:00',
      sentBy: 'Sarah Chen',
      actionRequired: false,
      read: true,
    },
  ],
  '3': [
    {
      id: 'msg20',
      subject: 'Kick-off Report Generator',
      content: 'Vielen Dank für das Kick-off Meeting. Wir starten jetzt mit der Anforderungsanalyse für Ihren Report Generator.',
      sentAt: '2024-11-16T10:00:00',
      sentBy: 'Kamil Gawlik',
      actionRequired: false,
      read: true,
    },
  ],
  '4': [
    {
      id: 'msg30',
      subject: 'Willkommen bei digirift',
      content: 'Herzlich willkommen! Wir freuen uns auf die Zusammenarbeit und werden in Kürze mit dem Setup der Produktempfehlungen beginnen.',
      sentAt: '2024-12-02T09:00:00',
      sentBy: 'Kamil Gawlik',
      actionRequired: false,
      read: true,
    },
  ],
}

// Helper Functions
export function getCustomerById(id: string): Customer | undefined {
  return mockCustomers.find(c => c.id === id)
}

export function getCustomerModules(customerId: string): Module[] {
  return mockCustomerModules[customerId] || []
}

export function getCustomerTransactions(customerId: string): PointTransaction[] {
  return mockCustomerTransactions[customerId] || []
}

export function getCustomerMessages(customerId: string): AdminMessage[] {
  return mockCustomerMessages[customerId] || []
}

// Returns old format with 'title' for backward compatibility
export function getCustomerRoadmap(customerId: string) {
  return mockCustomerRoadmap[customerId] || []
}

export function getSchulungById(id: string): Schulung | undefined {
  return schulungskatalog.find(s => s.id === id)
}

export function getModuleById(customerId: string, moduleId: string): Module | undefined {
  return mockCustomerModules[customerId]?.find(m => m.id === moduleId)
}

export function getAdminStats() {
  const totalCustomers = mockCustomers.length
  const totalMonthlyRevenue = mockCustomers.reduce((sum, c) => sum + c.membership.monthlyPrice, 0)
  const totalPointsUsed = mockCustomers.reduce((sum, c) => sum + c.membership.usedPoints, 0)
  const activeModules = Object.values(mockCustomerModules)
    .flat()
    .filter(m => m.status === 'in_arbeit' || m.status === 'im_test').length
  const pendingAcceptance = Object.values(mockCustomerModules)
    .flat()
    .filter(m => m.acceptanceStatus === 'ausstehend').length

  return {
    totalCustomers,
    totalMonthlyRevenue,
    totalPointsUsed,
    activeModules,
    pendingAcceptance,
  }
}

// Modul-Vorlagen Katalog
export const moduleTemplates: ModuleTemplate[] = [
  {
    id: 'tpl1',
    name: 'Kundenservice Chatbot',
    description: 'KI-gestützter Chatbot für den Kundenservice mit FAQ-Integration und Ticketing',
    category: 'kundenservice',
    estimatedPoints: 40,
    estimatedMaintenancePoints: 8,
    features: [
      'FAQ-Integration',
      'Multi-Sprach-Support',
      'Ticket-Erstellung',
      'Analytics Dashboard',
    ],
    createdAt: '2024-01-15',
    updatedAt: '2024-12-01',
  },
  {
    id: 'tpl2',
    name: 'Dokumenten-Analyse',
    description: 'Automatische Analyse und Kategorisierung von Dokumenten mit OCR und NLP',
    category: 'automatisierung',
    estimatedPoints: 50,
    estimatedMaintenancePoints: 12,
    features: [
      'PDF/Word/Excel Unterstützung',
      'OCR für gescannte Dokumente',
      'Automatische Kategorisierung',
      'Datenextraktion',
    ],
    createdAt: '2024-02-20',
    updatedAt: '2024-11-15',
  },
  {
    id: 'tpl3',
    name: 'E-Mail Klassifikation',
    description: 'Automatische Sortierung und Priorisierung eingehender E-Mails',
    category: 'automatisierung',
    estimatedPoints: 30,
    estimatedMaintenancePoints: 6,
    features: [
      'Kategorisierung nach Thema',
      'Sentiment-Analyse',
      'Spam-Erkennung',
      'Auto-Routing',
    ],
    createdAt: '2024-03-10',
    updatedAt: '2024-10-20',
  },
  {
    id: 'tpl4',
    name: 'RAG Wissensdatenbank',
    description: 'Unternehmensweite KI-Wissensdatenbank mit Retrieval Augmented Generation',
    category: 'wissensmanagement',
    estimatedPoints: 60,
    estimatedMaintenancePoints: 20,
    features: [
      'Dokumenten-Upload',
      'Semantische Suche',
      'Chat-Interface',
      'Quellen-Referenzen',
    ],
    createdAt: '2024-04-05',
    updatedAt: '2024-12-10',
  },
  {
    id: 'tpl5',
    name: 'Vertriebsprognose',
    description: 'KI-basierte Vorhersage von Verkaufschancen und Lead-Scoring',
    category: 'analytics',
    estimatedPoints: 55,
    estimatedMaintenancePoints: 10,
    features: [
      'Lead-Scoring',
      'Verkaufsprognosen',
      'Pipeline-Analyse',
      'CRM-Integration',
    ],
    createdAt: '2024-05-15',
    updatedAt: '2024-11-30',
  },
  {
    id: 'tpl6',
    name: 'Produktempfehlungen',
    description: 'Personalisierte Produktempfehlungen für E-Commerce',
    category: 'e-commerce',
    estimatedPoints: 45,
    estimatedMaintenancePoints: 10,
    features: [
      'Collaborative Filtering',
      'Content-Based Filtering',
      'A/B Testing',
      'Shop-Integration',
    ],
    createdAt: '2024-06-01',
    updatedAt: '2024-12-05',
  },
]

// Schulung-Serien
export const schulungSerien: SchulungSerie[] = [
  {
    id: 'ser1',
    title: 'KI-Grundlagen Komplett',
    description: 'Komplette Einführung in KI für alle Mitarbeiter',
    schulungIds: ['sch1', 'sch2', 'sch3'],
    totalPoints: 35,
    createdAt: '2024-06-01',
    updatedAt: '2024-12-01',
  },
  {
    id: 'ser2',
    title: 'Prompt Engineering Masterclass',
    description: 'Von Grundlagen bis Fortgeschritten: Effektive KI-Kommunikation',
    schulungIds: ['sch2', 'sch4'],
    totalPoints: 22,
    createdAt: '2024-08-15',
    updatedAt: '2024-11-20',
  },
]

// Kunden-Schulung-Zuweisungen
export const customerSchulungAssignments: Record<string, CustomerSchulungAssignment[]> = {
  '1': [
    {
      id: 'csa1',
      customerId: '1',
      serieId: 'ser1',
      status: 'durchgefuehrt',
      scheduledDate: '2024-07-01',
      completedSchulungIds: ['sch1', 'sch2'],
    },
    {
      id: 'csa2',
      customerId: '1',
      schulungId: 'sch5',
      status: 'geplant',
      scheduledDate: '2025-03-01',
    },
  ],
  '2': [
    {
      id: 'csa3',
      customerId: '2',
      schulungId: 'sch1',
      status: 'abgeschlossen',
      scheduledDate: '2024-05-15',
      completedDate: '2024-05-15',
    },
  ],
}

export function getModuleTemplates() {
  return moduleTemplates
}

export function getSchulungSerien() {
  return schulungSerien
}

export function getCustomerSchulungAssignments(customerId: string) {
  return customerSchulungAssignments[customerId] || []
}
