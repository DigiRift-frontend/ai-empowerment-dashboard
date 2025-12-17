// Mitgliedschaft & Pakete
export type MembershipTier = 'S' | 'M' | 'L'

export interface Membership {
  id: string
  tier: MembershipTier
  monthlyPoints: number
  usedPoints: number
  remainingPoints: number
  monthlyPrice: number // Preis in EUR
  contractStart: string // Vertragsstart
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
  membership: Membership
  advisor: CustomerAdvisor
}

// Punkte & Transaktionen
export type PointCategory = 'entwicklung' | 'wartung' | 'schulung'

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

// Module
export type ModuleStatus = 'setup' | 'live' | 'optimierung'

export interface Module {
  id: string
  name: string
  description: string
  status: ModuleStatus
  monthlyMaintenancePoints: number
  assigneeId?: string
  softwareUrl?: string // Optionaler Link zur Software
  createdAt: string
  updatedAt: string
}

export interface ModuleHistoryEntry {
  id: string
  moduleId: string
  date: string
  action: string
  description: string
  pointsUsed?: number
}

// Roadmap & Projekte
export type RoadmapStatus = 'geplant' | 'in-arbeit' | 'im-test' | 'abgeschlossen'

// Test Feedback
export interface TestFeedback {
  id: string
  date: string
  feedback: string
  resolved: boolean
}
export type RoadmapPriority = 'hoch' | 'mittel' | 'niedrig'
export type AcceptanceStatus = 'ausstehend' | 'akzeptiert' | 'abgelehnt'

export interface AcceptanceCriterion {
  id: string
  description: string
  accepted?: boolean
}

export interface RoadmapItem {
  id: string
  title: string
  description: string
  status: RoadmapStatus
  priority: RoadmapPriority
  progress: number // 0-100
  startDate?: string
  targetDate?: string
  completedDate?: string
  useCaseId?: string
  // Zugewiesene Person
  assigneeId?: string
  // Akzeptanzkriterien
  acceptanceCriteria?: AcceptanceCriterion[]
  acceptanceStatus?: AcceptanceStatus
  acceptedAt?: string
  acceptedBy?: string
  // Test-Phase
  testFeedback?: TestFeedback[]
  testCompletedAt?: string
  testCompletedBy?: string
}

export interface Milestone {
  id: string
  title: string
  date: string
  completed: boolean
  roadmapItemId: string
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

export interface AdminMessage {
  id: string
  subject: string
  content: string
  createdAt: string
  read: boolean
  from: string
}
