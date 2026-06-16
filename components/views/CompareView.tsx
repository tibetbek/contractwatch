'use client'

import { useState } from 'react'
import { Columns2 } from 'lucide-react'
import mockContracts from '@/lib/mockContracts'
import { Contract } from '@/lib/types'

function riskColor(score: number): string {
  if (score >= 70) return '#EF4444'
  if (score >= 40) return '#F59E0B'
  return '#10B981'
}

function riskLabel(score: number): string {
  if (score >= 70) return 'Critical'
  if (score >= 40) return 'Medium'
  return 'Low'
}

function statusLabel(status: string): string {
  switch (status) {
    case 'active': return 'Active'
    case 'expiring_soon': return 'Expiring Soon'
    case 'expired': return 'Expired'
    default: return 'Draft'
  }
}

function statusColor(status: string): string {
  switch (status) {
    case 'active': return 'text-emerald'
    case 'expiring_soon': return 'text-amber'
    case 'expired': return 'text-crimson'
    default: return 'text-cool-muted'
  }
}

function getDaysToExpiry(contract: Contract): number {
  const today = new Date('2026-06-16')
  const expiry = new Date(contract.expiryDate)
  return Math.round((expiry.getTime() - today.getTime()) / 86400000)
}

function getTerm(contract: Contract): string {
  const start = new Date(contract.effectiveDate)
  const end = new Date(contract.expiryDate)
  const months = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30))
  if (months >= 24) return `${Math.round(months / 12)} years`
  if (months >= 12) return `${Math.round(months / 12)} year`
  return `${months} months`
}

interface CompareRowProps {
  label: string
  valueA: React.ReactNode
  valueB: React.ReactNode
  highlight?: boolean
}

function CompareRow({ label, valueA, valueB, highlight }: CompareRowProps) {
  return (
    <tr className={`border-b border-slate-mid/20 last:border-0 ${highlight ? 'bg-slate-mid/10' : ''}`}>
      <td className="py-3 pr-4 text-xs font-medium text-slate-light w-40 shrink-0">{label}</td>
      <td className="py-3 pr-4 text-sm text-cool-white">{valueA}</td>
      <td className="py-3 text-sm text-cool-white">{valueB}</td>
    </tr>
  )
}

export default function CompareView() {
  const [contractAId, setContractAId] = useState<string>('')
  const [contractBId, setContractBId] = useState<string>('')

  const contractA = mockContracts.find(c => c.id === contractAId)
  const contractB = mockContracts.find(c => c.id === contractBId)

  const selectClass = "w-full bg-navy border border-slate-mid/50 rounded-lg px-3 py-2 text-sm text-cool-white focus:outline-none focus:border-electric/50 cursor-pointer"

  // Get all clause categories from both contracts
  const allCategories = new Set<string>()
  if (contractA) contractA.clauses.forEach(c => allCategories.add(c.category))
  if (contractB) contractB.clauses.forEach(c => allCategories.add(c.category))

  const hasValue = (contract: Contract) => contract.value > 0

  return (
    <div className="p-6 pb-20 md:pb-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-cool-white">Compare Contracts</h1>
        <p className="text-cool-muted text-sm mt-0.5">Side-by-side analysis of two contracts</p>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-dark border border-slate-mid/30 rounded-xl p-4">
          <div className="text-xs font-semibold text-electric mb-2 uppercase tracking-wide">Contract A</div>
          <select
            value={contractAId}
            onChange={e => setContractAId(e.target.value)}
            className={selectClass}
          >
            <option value="">Select a contract…</option>
            {mockContracts
              .filter(c => c.id !== contractBId)
              .map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
          </select>
          {contractA && (
            <div className="mt-2 text-xs text-cool-muted">{contractA.counterparty}</div>
          )}
        </div>

        <div className="bg-slate-dark border border-slate-mid/30 rounded-xl p-4">
          <div className="text-xs font-semibold text-amber mb-2 uppercase tracking-wide">Contract B</div>
          <select
            value={contractBId}
            onChange={e => setContractBId(e.target.value)}
            className={selectClass}
          >
            <option value="">Select a contract…</option>
            {mockContracts
              .filter(c => c.id !== contractAId)
              .map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
          </select>
          {contractB && (
            <div className="mt-2 text-xs text-cool-muted">{contractB.counterparty}</div>
          )}
        </div>
      </div>

      {/* Placeholder state */}
      {(!contractA || !contractB) && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-dark border border-slate-mid/30 flex items-center justify-center mb-4">
            <Columns2 className="w-7 h-7 text-slate-light" />
          </div>
          <h3 className="text-cool-white font-medium mb-2">Select two contracts to compare</h3>
          <p className="text-cool-muted text-sm max-w-xs">
            Choose contracts from both dropdowns above to see a detailed side-by-side comparison.
          </p>
        </div>
      )}

      {/* Comparison table */}
      {contractA && contractB && (
        <div className="space-y-4">
          {/* Overview table */}
          <div className="bg-slate-dark border border-slate-mid/30 rounded-xl overflow-hidden">
            <div className="grid grid-cols-[160px_1fr_1fr] border-b border-slate-mid/30">
              <div className="p-4 bg-slate-mid/10"></div>
              <div className="p-4 border-l border-slate-mid/20">
                <div className="text-xs font-bold text-electric mb-1 uppercase tracking-wide">Contract A</div>
                <div className="text-sm font-semibold text-cool-white">{contractA.name}</div>
                <div className="text-xs text-cool-muted">{contractA.counterparty}</div>
              </div>
              <div className="p-4 border-l border-slate-mid/20">
                <div className="text-xs font-bold text-amber mb-1 uppercase tracking-wide">Contract B</div>
                <div className="text-sm font-semibold text-cool-white">{contractB.name}</div>
                <div className="text-xs text-cool-muted">{contractB.counterparty}</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody>
                  <CompareRow
                    label="Contract Value"
                    valueA={
                      hasValue(contractA)
                        ? <span className="font-[family-name:var(--font-mono)]">€{contractA.value.toLocaleString()}/yr</span>
                        : <span className="text-slate-light">—</span>
                    }
                    valueB={
                      hasValue(contractB)
                        ? <span className="font-[family-name:var(--font-mono)]">€{contractB.value.toLocaleString()}/yr</span>
                        : <span className="text-slate-light">—</span>
                    }
                    highlight={contractA.value !== contractB.value}
                  />
                  <CompareRow
                    label="Contract Type"
                    valueA={contractA.type}
                    valueB={contractB.type}
                    highlight={contractA.type !== contractB.type}
                  />
                  <CompareRow
                    label="Term Length"
                    valueA={<span className="font-[family-name:var(--font-mono)]">{getTerm(contractA)}</span>}
                    valueB={<span className="font-[family-name:var(--font-mono)]">{getTerm(contractB)}</span>}
                  />
                  <CompareRow
                    label="Risk Score"
                    valueA={
                      <span className="font-bold font-[family-name:var(--font-mono)]" style={{ color: riskColor(contractA.riskScore) }}>
                        {contractA.riskScore} / 100 — {riskLabel(contractA.riskScore)}
                      </span>
                    }
                    valueB={
                      <span className="font-bold font-[family-name:var(--font-mono)]" style={{ color: riskColor(contractB.riskScore) }}>
                        {contractB.riskScore} / 100 — {riskLabel(contractB.riskScore)}
                      </span>
                    }
                    highlight={contractA.riskScore !== contractB.riskScore}
                  />
                  <CompareRow
                    label="Expiry Date"
                    valueA={
                      <div>
                        <span className="font-[family-name:var(--font-mono)] text-cool-white">{contractA.expiryDate}</span>
                        <span
                          className="ml-2 text-xs font-[family-name:var(--font-mono)]"
                          style={{ color: getDaysToExpiry(contractA) <= 30 ? '#EF4444' : getDaysToExpiry(contractA) <= 90 ? '#F59E0B' : '#94A3B8' }}
                        >
                          ({getDaysToExpiry(contractA)}d)
                        </span>
                      </div>
                    }
                    valueB={
                      <div>
                        <span className="font-[family-name:var(--font-mono)] text-cool-white">{contractB.expiryDate}</span>
                        <span
                          className="ml-2 text-xs font-[family-name:var(--font-mono)]"
                          style={{ color: getDaysToExpiry(contractB) <= 30 ? '#EF4444' : getDaysToExpiry(contractB) <= 90 ? '#F59E0B' : '#94A3B8' }}
                        >
                          ({getDaysToExpiry(contractB)}d)
                        </span>
                      </div>
                    }
                    highlight={contractA.expiryDate !== contractB.expiryDate}
                  />
                  <CompareRow
                    label="Status"
                    valueA={<span className={`font-medium ${statusColor(contractA.status)}`}>{statusLabel(contractA.status)}</span>}
                    valueB={<span className={`font-medium ${statusColor(contractB.status)}`}>{statusLabel(contractB.status)}</span>}
                    highlight={contractA.status !== contractB.status}
                  />
                  <CompareRow
                    label="Critical Clauses"
                    valueA={
                      <span className={contractA.clauses.filter(c => c.risk === 'critical').length > 0 ? 'text-crimson font-bold' : 'text-emerald'}>
                        {contractA.clauses.filter(c => c.risk === 'critical').length}
                      </span>
                    }
                    valueB={
                      <span className={contractB.clauses.filter(c => c.risk === 'critical').length > 0 ? 'text-crimson font-bold' : 'text-emerald'}>
                        {contractB.clauses.filter(c => c.risk === 'critical').length}
                      </span>
                    }
                    highlight={
                      contractA.clauses.filter(c => c.risk === 'critical').length !==
                      contractB.clauses.filter(c => c.risk === 'critical').length
                    }
                  />
                </tbody>
              </table>
            </div>
          </div>

          {/* Clause comparison */}
          {allCategories.size > 0 && (
            <div className="bg-slate-dark border border-slate-mid/30 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-mid/30">
                <h3 className="text-sm font-semibold text-cool-white">Clause Comparison</h3>
                <p className="text-xs text-cool-muted mt-0.5">Side-by-side view of matching clause categories</p>
              </div>
              <div className="divide-y divide-slate-mid/20">
                {Array.from(allCategories).map(category => {
                  const clauseA = contractA.clauses.find(c => c.category === category)
                  const clauseB = contractB.clauses.find(c => c.category === category)

                  const hasBoth = clauseA && clauseB
                  const hasDiff = hasBoth && clauseA.risk !== clauseB.risk

                  return (
                    <div key={category} className={`p-4 ${hasDiff ? 'bg-amber-dim/10' : ''}`}>
                      <div className="text-xs font-semibold text-slate-light mb-3 uppercase tracking-wide flex items-center gap-2">
                        {category}
                        {hasDiff && (
                          <span className="text-amber text-[10px] normal-case font-normal px-1.5 py-0.5 bg-amber-dim/30 rounded">
                            Different risk levels
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          {clauseA ? (
                            <div>
                              <div className="flex items-center gap-2 mb-1.5">
                                <span
                                  className="text-xs font-bold"
                                  style={{
                                    color: clauseA.risk === 'critical' ? '#EF4444' :
                                           clauseA.risk === 'medium' ? '#F59E0B' : '#10B981'
                                  }}
                                >
                                  {clauseA.risk.charAt(0).toUpperCase() + clauseA.risk.slice(1)}
                                </span>
                                <span className="text-[10px] text-electric">Contract A</span>
                              </div>
                              <p className="text-xs text-cool-muted leading-relaxed line-clamp-3">
                                {clauseA.text}
                              </p>
                            </div>
                          ) : (
                            <div className="text-xs text-slate-light italic">Not present in Contract A</div>
                          )}
                        </div>
                        <div>
                          {clauseB ? (
                            <div>
                              <div className="flex items-center gap-2 mb-1.5">
                                <span
                                  className="text-xs font-bold"
                                  style={{
                                    color: clauseB.risk === 'critical' ? '#EF4444' :
                                           clauseB.risk === 'medium' ? '#F59E0B' : '#10B981'
                                  }}
                                >
                                  {clauseB.risk.charAt(0).toUpperCase() + clauseB.risk.slice(1)}
                                </span>
                                <span className="text-[10px] text-amber">Contract B</span>
                              </div>
                              <p className="text-xs text-cool-muted leading-relaxed line-clamp-3">
                                {clauseB.text}
                              </p>
                            </div>
                          ) : (
                            <div className="text-xs text-slate-light italic">Not present in Contract B</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Obligations comparison */}
          {(contractA.recurringObligations.length > 0 || contractB.recurringObligations.length > 0) && (
            <div className="bg-slate-dark border border-slate-mid/30 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-mid/30">
                <h3 className="text-sm font-semibold text-cool-white">Recurring Obligations</h3>
              </div>
              <div className="grid grid-cols-2 divide-x divide-slate-mid/20">
                <div className="p-4">
                  <div className="text-xs font-bold text-electric mb-3 uppercase tracking-wide">Contract A</div>
                  {contractA.recurringObligations.length === 0 ? (
                    <div className="text-xs text-slate-light">None</div>
                  ) : (
                    <div className="space-y-2">
                      {contractA.recurringObligations.map(obl => (
                        <div key={obl.id} className="text-xs">
                          <div className="font-medium text-cool-white">{obl.label}</div>
                          <div className="text-cool-muted capitalize">{obl.frequency} — next: <span className="font-[family-name:var(--font-mono)]">{obl.nextDue}</span></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="text-xs font-bold text-amber mb-3 uppercase tracking-wide">Contract B</div>
                  {contractB.recurringObligations.length === 0 ? (
                    <div className="text-xs text-slate-light">None</div>
                  ) : (
                    <div className="space-y-2">
                      {contractB.recurringObligations.map(obl => (
                        <div key={obl.id} className="text-xs">
                          <div className="font-medium text-cool-white">{obl.label}</div>
                          <div className="text-cool-muted capitalize">{obl.frequency} — next: <span className="font-[family-name:var(--font-mono)]">{obl.nextDue}</span></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
