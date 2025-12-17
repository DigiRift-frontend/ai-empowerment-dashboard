// Mitgliedschaft & Pakete
export type MembershipTier = 'S' | 'M' | 'L'

export interface Membership {
  id: string
  tier: MembershipTier
  monthlyPoints: number
  usedPoints: number
  remainingPoints: number
  periodStart: string
  periodEnd: string
}

export interface Customer {
  id: string
  name: string
  companyName: string
  email: string
  membership: Membership
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
export type RoadmapStatus = 'geplant' | 'in-arbeit' | 'abgeschlossen'
export type RoadmapPriority = 'hoch' | 'mittel' | 'niedrig'
export type AcceptanceStatus = 'ausstehend' | 'akzeptiert' | 'abgelehnt'

export interface AcceptanceCriterion {
  id: string
  description: string
  estimatedPoints: number
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
  // Akzeptanzkriterien
  acceptanceCriteria?: AcceptanceCriterion[]
  acceptanceStatus?: AcceptanceStatus
  acceptedAt?: string
  acceptedBy?: string
  totalEstimatedPoints?: number
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
