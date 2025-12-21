// Mitgliedschaft & Pakete
export type MembershipTier = 'S' | 'M' | 'L'

export interface Membership {
  id: string
  tier: MembershipTier
  monthlyPoints: number
  usedPoints: number
  remainingPoints: number
  bonusPoints?: number // Extra-Punkte gutgeschrieben
  monthlyPrice: number // Preis in EUR
  discountPercent?: number // Rabatt in Prozent (z.B. 10 = 10%)
  contractStart: string // Vertragsstart
  contractEnd?: string // Vertragsende (optional)
  periodStart: string // Aktueller Abrechnungszeitraum Start
  periodEnd: string // Aktueller Abrechnungszeitraum Ende (nächste Abbuchung)
  // Übertragene Punkte (max 3 Monate)
  carriedOverPoints?: {
    month1: number // Älteste - verfallen als nächstes
    month2: number
    month3: number // Neueste
  }
}

export interface CustomerAdvisor {
  id: string
  name: string
  role: string
  email: string
  phone: string
  avatarUrl?: string
  calendlyUrl?: string
}

export interface Customer {
  id: string
  name: string
  companyName: string
  email: string
  customerCode: string // 4-stelliger Code für Anrufe
  password?: string // Generiertes Passwort
  membership: Membership
  advisor: CustomerAdvisor
}

// Punkte & Transaktionen
export type PointCategory = 'entwicklung' | 'wartung' | 'schulung' | 'beratung' | 'analyse'

export interface PointTransaction {
  id: string
  date: string
  description: string
  points: number
  category: PointCategory
  moduleId?: string
}

// Externe Kosten
export type ExternalCostType = 'tokens' | 'server' | 'telefonie' | 'sonstige'

export interface ExternalCost {
  id: string
  date: string
  type: ExternalCostType
  description: string
  amount: number
  unit: string
}

// Module Status (Kanban-Spalten) - matches DB enum with underscores
export type ModuleStatus = 'geplant' | 'in_arbeit' | 'im_test' | 'abgeschlossen'
export type ModulePriority = 'hoch' | 'mittel' | 'niedrig'
export type AcceptanceStatus = 'ausstehend' | 'akzeptiert' | 'abgelehnt'
export type AbnahmeStatus = 'ausstehend' | 'abgenommen' | 'abgelehnt'
export type LiveStatus = 'aktiv' | 'pausiert' | 'deaktiviert'

// Test Feedback
export interface TestFeedback {
  id: string
  date: string
  feedback: string
  resolved: boolean
}

export interface AcceptanceCriterion {
  id: string
  description: string
  accepted?: boolean
}

// Assignee (internes Teammitglied)
export interface ModuleAssignee {
  id: string
  name: string
  role?: string
  email?: string
  calendlyUrl?: string
}

// Unified Module (combines old Module + RoadmapItem)
export interface Module {
  id: string
  name: string
  description: string
  // Kanban Status
  status: ModuleStatus
  priority: ModulePriority
  progress: number // 0-100
  // Termine
  startDate?: string
  targetDate?: string
  completedDate?: string
  // Wartung & Kosten
  monthlyMaintenancePoints: number
  softwareUrl?: string // Link zur laufenden Software (wenn live)
  // Anleitungen & Dokumentation
  videoUrl?: string // Link zu Anleitungsvideo
  videoThumbnail?: string // Thumbnail für Video
  instructions?: string // Textanleitung für Nutzung/Test
  manualUrl?: string // Link/Pfad zu Handbuch/PDF
  manualFilename?: string // Originaler Dateiname des Handbuchs
  // Zugewiesene Person (intern)
  assigneeId?: string
  assignee?: ModuleAssignee // Aufgelöstes Teammitglied
  // Kunden-Verantwortlicher
  customerContactId?: string
  customerContactName?: string
  // Akzeptanzkriterien
  acceptanceCriteria?: AcceptanceCriterion[]
  acceptanceStatus?: AcceptanceStatus
  acceptedAt?: string
  acceptedBy?: string
  // Test-Phase
  testFeedback?: TestFeedback[]
  testCompletedAt?: string
  testCompletedBy?: string
  // Abnahme (nach Fertigstellung - löst Wartungskosten aus)
  abnahmeStatus?: AbnahmeStatus
  abnahmeAt?: string
  abnahmeBy?: string
  // Live-Status (unabhängig vom Kanban-Status)
  liveStatus?: LiveStatus
  // Meta
  createdAt: string
  updatedAt: string
  // Sichtbar in Kunden-Roadmap?
  showInRoadmap: boolean
  roadmapOrder?: number // Reihenfolge in der Roadmap
}

// Legacy alias for backward compatibility
export type RoadmapItem = Module
export type RoadmapStatus = ModuleStatus
export type RoadmapPriority = ModulePriority

export interface ModuleHistoryEntry {
  id: string
  moduleId: string
  date: string
  action: string
  description: string
  pointsUsed?: number
}

// Schulungsformat
export type SchulungFormat = 'live' | 'self_learning' | 'hybrid'

// Schulungskatalog
export interface Schulung {
  id: string
  title: string
  description: string
  duration: string // z.B. "2 Stunden", "1 Tag"
  points: number // Punktekosten
  category: 'grundlagen' | 'fortgeschritten' | 'spezialisiert'
  isCustom?: boolean // Selbst definierte Schulung

  // Lernziele & Outcomes
  learningGoals: string[] // Was Sie lernen werden
  outcomes: string[] // Wozu befähigen wir Ihr Team

  // Format
  format: SchulungFormat

  // Media
  videoUrl?: string
  videoThumbnail?: string

  // Trainer
  trainerId?: string
  trainer?: {
    id: string
    name: string
    role: string
    avatarUrl?: string
    calendlyUrl?: string
  }

  // Materialien
  materials?: SchulungMaterial[]

  // Roadmap
  showInRoadmap: boolean
  roadmapOrder?: number
}

// Schulungsmaterial
export interface SchulungMaterial {
  id: string
  title: string
  fileUrl: string
  fileType: string // pdf, pptx, docx, etc.
  createdAt: string
}

// Kunden-Roadmap (was der Kunde sieht)
export interface CustomerRoadmapItem {
  id: string
  type: 'modul' | 'schulung'
  moduleId?: string // Referenz zum Modul
  schulungId?: string // Referenz zur Schulung
  serieId?: string // Referenz zur Serie (wenn Schulung Teil einer Serie ist)
  customTitle?: string // Für custom Schulungen
  order: number // Reihenfolge
  targetDate?: string
}

export interface CustomerRoadmap {
  id: string
  customerId: string
  items: CustomerRoadmapItem[]
  updatedAt: string
}

// Schulung Serie Item (Verknüpfung)
export interface SchulungSerieItem {
  id: string
  order: number
  serieId: string
  schulungId: string
  schulung?: Schulung
}

// Schulung Serie (gruppierte Schulungen)
export interface SchulungSerie {
  id: string
  title: string
  description: string
  schulungIds: string[] // IDs der enthaltenen Schulungen in Reihenfolge
  schulungItems?: SchulungSerieItem[] // Aufgelöste Schulungen mit Reihenfolge
  totalPoints: number // Summe aller Schulungspunkte
  createdAt: string
  updatedAt: string
}

// Schulungs-Zuweisungsstatus
export type SchulungAssignmentStatus = 'geplant' | 'in_vorbereitung' | 'durchgefuehrt' | 'abgeschlossen'

// Kunden-Schulung-Zuweisung
export interface CustomerSchulungAssignment {
  id: string
  customerId: string
  schulungId?: string // Einzelne Schulung
  serieId?: string // Oder Serie
  status: SchulungAssignmentStatus
  scheduledDate?: string
  completedDate?: string
  completedSchulungIds?: string[] // Für Serien: welche Schulungen sind bereits abgeschlossen
  excludedSchulungIds?: string[] // Für Serien: welche Schulungen wurden entfernt/ausgeschlossen

  // Feedback
  rating?: number // 1-5 Sterne
  feedback?: string // Freitext-Feedback
  feedbackDate?: string

  // Teilnehmer
  participants?: string[] // Liste der Teilnehmer-Namen
  participantCount?: number

  // Resolved relations
  schulung?: Schulung
  serie?: SchulungSerie
}

// Modul Template (für den Katalog)
export interface ModuleTemplate {
  id: string
  name: string
  description: string
  category: string
  estimatedPoints: number // Geschätzte Entwicklungspunkte
  estimatedMaintenancePoints: number // Geschätzte monatliche Wartung
  features: string[] // Liste der Features
  createdAt: string
  updatedAt: string
}

export interface Milestone {
  id: string
  title: string
  date: string
  completed: boolean
  moduleId: string
}

// Enablement
export interface Workshop {
  id: string
  title: string
  date: string
  duration: string
  participants: number
  pointsUsed: number
  status: 'geplant' | 'abgeschlossen'
}

export interface TeamMember {
  id: string
  name: string
  role: string
  department: string
}

export interface Decision {
  id: string
  date: string
  title: string
  description: string
  participants: string[]
}

export interface Meeting {
  id: string
  title: string
  date: string
  type: 'abstimmung' | 'workshop' | 'review'
}

// Dashboard Stats
export interface DashboardStats {
  pointsUsed: number
  pointsRemaining: number
  pointsTotal: number
  activeModules: number
  modulesInSetup: number
  roadmapProgress: number
  upcomingMeetings: number
  currentMonthCosts: number
}

// Monthly Summary
export interface MonthlySummary {
  month: string
  entwicklung: number
  wartung: number
  schulung: number
  total: number
}

// Benachrichtigungen & Nachrichten
export type NotificationType =
  | 'acceptance_required'  // Akzeptanzkriterien müssen bestätigt werden
  | 'test_required'        // Projekt ist im Test - Kunde muss testen
  | 'message'              // Nachricht vom Admin
  | 'project_update'       // Projekt-Update
  | 'milestone_reached'    // Meilenstein erreicht
  | 'budget_warning'       // Budget-Warnung

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  createdAt: string
  read: boolean
  actionRequired: boolean
  relatedProjectId?: string
  relatedUrl?: string
}

export type AdminMessageType = 'normal' | 'status_update'

export interface AdminMessage {
  id: string
  subject: string
  content: string
  createdAt: string
  read: boolean
  from: string
  messageType?: AdminMessageType
}
