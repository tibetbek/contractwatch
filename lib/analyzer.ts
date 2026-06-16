// lib/analyzer.ts
// Real LLM/OCR calls would replace mock heuristics below (marked with REPLACE_WITH_LLM)

import { Contract, PortfolioMetrics, RiskLevel } from './types'

// REPLACE_WITH_LLM: call Claude/GPT with clause text, return structured risk analysis
export function analyzeClauseRisk(clauseText: string): { risk: RiskLevel; category: string; explanation: string } {
  const text = clauseText.toLowerCase()

  const criticalPatterns = [
    { pattern: 'automatic renewal', category: 'Auto-Renewal' },
    { pattern: 'automatically renew', category: 'Auto-Renewal' },
    { pattern: 'unlimited liability', category: 'Unlimited Liability' },
    { pattern: 'sole discretion', category: 'Unilateral Control' },
    { pattern: 'non-cancellable', category: 'Termination Restriction' },
    { pattern: 'perpetual', category: 'Perpetual Rights' },
    { pattern: 'irrevocable', category: 'Irrevocable Rights' },
    { pattern: 'non-compete', category: 'Non-Compete' },
    { pattern: 'non compete', category: 'Non-Compete' },
    { pattern: 'indemnif', category: 'Indemnification' },
  ]

  const mediumPatterns = [
    { pattern: 'intellectual property', category: 'IP Ownership' },
    { pattern: 'limitation of liability', category: 'Liability Cap' },
    { pattern: 'governing law', category: 'Governing Law' },
    { pattern: 'liquidated damages', category: 'Penalties' },
    { pattern: 'force majeure', category: 'Force Majeure' },
    { pattern: 'price adjustment', category: 'Price Escalation' },
    { pattern: 'price increase', category: 'Price Escalation' },
  ]

  for (const { pattern, category } of criticalPatterns) {
    if (text.includes(pattern)) {
      return {
        risk: 'critical',
        category,
        explanation: `This clause contains "${pattern}" language which is a high-risk indicator. Review carefully and consider negotiating before signing.`,
      }
    }
  }

  for (const { pattern, category } of mediumPatterns) {
    if (text.includes(pattern)) {
      return {
        risk: 'medium',
        category,
        explanation: `This clause contains "${pattern}" language which warrants attention. Ensure terms are balanced and acceptable.`,
      }
    }
  }

  return {
    risk: 'low',
    category: 'General',
    explanation: 'No high-risk patterns detected. Standard clause language.',
  }
}

// REPLACE_WITH_LLM: call LLM to generate plain-language summary
export function generateSummary(contract: Contract): string {
  const criticalClauses = contract.clauses.filter(c => c.risk === 'critical').length
  const daysToExpiry = Math.round(
    (new Date(contract.expiryDate).getTime() - new Date('2026-06-16').getTime()) / (1000 * 60 * 60 * 24)
  )

  return `${contract.name} is a ${contract.type} with ${contract.counterparty} valued at €${contract.value.toLocaleString()}/year. ` +
    `The contract expires in ${daysToExpiry} days with a risk score of ${contract.riskScore}/100. ` +
    `${criticalClauses} critical clause${criticalClauses !== 1 ? 's' : ''} require immediate attention. ` +
    `${contract.summary.recommendedAction}`
}

// REPLACE_WITH_LLM: call LLM to generate fairer alternative clause text
export function generateRedline(clauseText: string, category: string): string {
  const redlines: Record<string, string> = {
    'Auto-Renewal': 'This Agreement shall terminate at the end of the initial term unless both parties provide written consent to renew at least thirty (30) days prior to expiration.',
    'Unlimited Liability': 'Each party\'s total liability shall be limited to the fees paid in the twelve (12) months preceding the claim. Neither party shall be liable for indirect, incidental, or consequential damages.',
    'Indemnification': 'Each party shall indemnify the other solely for claims arising from that party\'s own negligence, willful misconduct, or material breach of this Agreement.',
    'Non-Compete': 'Employee agrees not to directly compete with Company in the same geographic market for a period of twelve (12) months, provided adequate compensation is paid during this restriction period.',
    'IP Ownership': 'All deliverables created specifically for Client under this Agreement shall be owned exclusively by Client upon full payment.',
  }

  return redlines[category] || `[REPLACE_WITH_LLM: Generate balanced alternative for ${category} clause]: ${clauseText.substring(0, 100)}...`
}

export function calculateUrgency(dateStr: string, noticeRequired = 0): 'critical' | 'warning' | 'normal' {
  const today = new Date('2026-06-16')
  const target = new Date(dateStr)
  const daysRemaining = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const effectiveDays = daysRemaining - noticeRequired

  if (effectiveDays <= 30) return 'critical'
  if (effectiveDays <= 90) return 'warning'
  return 'normal'
}

export function calculateLeverageScore(category: string, contractType: string): 'high' | 'medium' | 'low' {
  const highLeverageCategories = ['IP Ownership', 'Auto-Renewal', 'Unlimited Liability', 'Non-Compete', 'Indemnification']
  const mediumLeverageCategories = ['Price Escalation', 'Termination Rights', 'Liability Cap', 'Data Ownership']

  if (highLeverageCategories.includes(category)) {
    // Leverage is lower for smaller contracts with larger vendors
    if (contractType === 'Licensing' || contractType === 'Insurance') return 'low'
    return 'high'
  }
  if (mediumLeverageCategories.includes(category)) return 'medium'
  return 'low'
}

export function calculatePortfolioRisk(contracts: Contract[]): PortfolioMetrics {
  const totalValue = contracts.reduce((sum, c) => sum + c.value, 0)
  const totalContracts = contracts.length
  const avgRiskScore = Math.round(contracts.reduce((sum, c) => sum + c.riskScore, 0) / totalContracts)

  // Contracts by type
  const typeMap: Record<string, number> = {}
  contracts.forEach(c => {
    typeMap[c.type] = (typeMap[c.type] || 0) + 1
  })
  const contractsByType = Object.entries(typeMap).map(([type, count]) => ({ type, count }))

  // Risk distribution
  const critical = contracts.filter(c => c.riskScore >= 70).length
  const medium = contracts.filter(c => c.riskScore >= 40 && c.riskScore < 70).length
  const low = contracts.filter(c => c.riskScore < 40).length
  const riskDistribution = [
    { level: 'Critical', count: critical, color: '#EF4444' },
    { level: 'Medium', count: medium, color: '#F59E0B' },
    { level: 'Low', count: low, color: '#10B981' },
  ]

  // Contracts needing attention (high risk or expiring soon)
  const contractsNeedingAttention = getContractsByUrgency(contracts).slice(0, 5)

  // Upcoming deadlines within 30 days
  const today = new Date('2026-06-16')
  const upcomingDeadlines: (import('./types').KeyDate & { contractId: string; contractName: string })[] = []

  contracts.forEach(contract => {
    contract.keyDates.forEach(keyDate => {
      const target = new Date(keyDate.date)
      const daysAway = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      if (daysAway >= 0 && daysAway <= 30) {
        upcomingDeadlines.push({
          ...keyDate,
          contractId: contract.id,
          contractName: contract.name,
        })
      }
    })
  })

  upcomingDeadlines.sort((a, b) => a.daysRemaining - b.daysRemaining)

  return {
    totalValue,
    totalContracts,
    avgRiskScore,
    contractsByType,
    riskDistribution,
    contractsNeedingAttention,
    upcomingDeadlines,
  }
}

export function getContractsByUrgency(contracts: Contract[]): Contract[] {
  const today = new Date('2026-06-16')

  return [...contracts].sort((a, b) => {
    // Calculate soonest deadline for each contract
    const getSoonestDays = (c: Contract) => {
      const days = c.keyDates.map(kd => {
        const target = new Date(kd.date)
        return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      }).filter(d => d >= 0)
      return days.length > 0 ? Math.min(...days) : 9999
    }

    const aSoonest = getSoonestDays(a)
    const bSoonest = getSoonestDays(b)

    // Combine urgency score: weighted by risk and deadline proximity
    const urgencyScore = (c: Contract, soonestDays: number) => {
      const deadlineUrgency = soonestDays <= 30 ? 100 : soonestDays <= 90 ? 50 : 0
      return c.riskScore * 0.6 + deadlineUrgency * 0.4
    }

    return urgencyScore(b, bSoonest) - urgencyScore(a, aSoonest)
  })
}
