export type ContractType =
  | 'Vendor Agreement'
  | 'Lease'
  | 'SaaS Subscription'
  | 'NDA'
  | 'Service Contract'
  | 'Employment'
  | 'Licensing'
  | 'Insurance'
  | 'Retainer'

export type RiskLevel = 'critical' | 'medium' | 'low'
export type ContractStatus = 'active' | 'expiring_soon' | 'expired' | 'draft'
export type UrgencyLevel = 'critical' | 'warning' | 'normal'

export interface RiskBreakdownItem {
  category: string
  count: number
  severity: 'high' | 'medium' | 'low'
}

export interface Clause {
  id: string
  text: string
  risk: RiskLevel
  category: string
  explanation: string
  suggestedRedline?: string
  negotiationLeverage?: 'high' | 'medium' | 'low'
}

export interface KeyDate {
  label: string
  date: string
  daysRemaining: number
  urgency: UrgencyLevel
  noticeRequired?: number
  actionDeadline?: string
  type: 'renewal' | 'expiry' | 'payment' | 'milestone' | 'cancellation' | 'notice'
}

export interface ContractSummary {
  description: string
  termLength: string
  keyObligations: string[]
  biggestRisk: string
  recommendedAction: string
}

export interface RecurringObligation {
  id: string
  label: string
  frequency: 'monthly' | 'quarterly' | 'annual' | 'bi-annual'
  nextDue: string
  description: string
}

export interface Contract {
  id: string
  name: string
  counterparty: string
  type: ContractType
  status: ContractStatus
  value: number
  uploadDate: string
  effectiveDate: string
  expiryDate: string
  riskScore: number
  riskBreakdown: RiskBreakdownItem[]
  clauses: Clause[]
  keyDates: KeyDate[]
  summary: ContractSummary
  recurringObligations: RecurringObligation[]
}

export interface PortfolioMetrics {
  totalValue: number
  totalContracts: number
  avgRiskScore: number
  contractsByType: { type: string; count: number }[]
  riskDistribution: { level: string; count: number; color: string }[]
  contractsNeedingAttention: Contract[]
  upcomingDeadlines: (KeyDate & { contractId: string; contractName: string })[]
}
