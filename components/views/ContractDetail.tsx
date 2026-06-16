'use client'

import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import {
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Info,
  Calendar, RefreshCw, ArrowRight
} from 'lucide-react'
import mockContracts from '@/lib/mockContracts'
import { Clause, KeyDate, RecurringObligation } from '@/lib/types'

interface ContractDetailProps {
  contractId: string
  onBack?: () => void
}

function riskColor(score: number): string {
  if (score >= 70) return '#EF4444'
  if (score >= 40) return '#F59E0B'
  return '#10B981'
}

function clauseRiskColor(risk: string): { color: string; bg: string; label: string; Icon: React.ElementType } {
  switch (risk) {
    case 'critical':
      return { color: '#EF4444', bg: 'bg-crimson-dim/40', label: 'Critical', Icon: AlertTriangle }
    case 'medium':
      return { color: '#F59E0B', bg: 'bg-amber-dim/40', label: 'Medium', Icon: Info }
    default:
      return { color: '#10B981', bg: 'bg-emerald-dim/40', label: 'Low', Icon: CheckCircle }
  }
}

function urgencyColor(urgency: string): string {
  if (urgency === 'critical') return '#EF4444'
  if (urgency === 'warning') return '#F59E0B'
  return '#10B981'
}

function leverageLabel(leverage?: string): string {
  if (leverage === 'high') return 'High leverage'
  if (leverage === 'medium') return 'Medium leverage'
  if (leverage === 'low') return 'Low leverage'
  return ''
}

function leverageColor(leverage?: string): string {
  if (leverage === 'high') return 'text-emerald'
  if (leverage === 'medium') return 'text-amber'
  return 'text-slate-light'
}

function RiskGauge({ score }: { score: number }) {
  const color = riskColor(score)
  const radius = 54
  const cx = 70
  const cy = 70
  const startAngle = 220
  const endAngle = -40
  const totalArc = startAngle - endAngle
  const scoreArc = (score / 100) * totalArc
  const valueAngle = startAngle - scoreArc

  const toRad = (deg: number) => (deg * Math.PI) / 180
  const endX = cx + radius * Math.cos(toRad(valueAngle))
  const endY = cy - radius * Math.sin(toRad(valueAngle))
  const bgEndX = cx + radius * Math.cos(toRad(endAngle))
  const bgEndY = cy - radius * Math.sin(toRad(endAngle))
  const bgStartX = cx + radius * Math.cos(toRad(startAngle))
  const bgStartY = cy - radius * Math.sin(toRad(startAngle))
  const scoreEndX = cx + radius * Math.cos(toRad(valueAngle))
  const scoreEndY = cy - radius * Math.sin(toRad(valueAngle))
  const scoreStartX = cx + radius * Math.cos(toRad(startAngle))
  const scoreStartY = cy - radius * Math.sin(toRad(startAngle))
  const largeArcBg = totalArc > 180 ? 1 : 0
  const largeArcScore = scoreArc > 180 ? 1 : 0

  void endX; void endY; void bgEndX; void bgEndY

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="100" viewBox="0 0 140 100">
        {/* Background arc */}
        <path
          d={`M ${bgStartX} ${bgStartY} A ${radius} ${radius} 0 ${largeArcBg} 0 ${cx + radius * Math.cos(toRad(endAngle))} ${cy - radius * Math.sin(toRad(endAngle))}`}
          fill="none"
          stroke="#334155"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Score arc */}
        {score > 0 && (
          <path
            d={`M ${scoreStartX} ${scoreStartY} A ${radius} ${radius} 0 ${largeArcScore} 0 ${scoreEndX} ${scoreEndY}`}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
          />
        )}
        {/* Score text */}
        <text x="70" y="68" textAnchor="middle" fill={color} fontSize="22" fontWeight="700" fontFamily="var(--font-mono)">
          {score}
        </text>
        <text x="70" y="82" textAnchor="middle" fill="#94A3B8" fontSize="9" fontFamily="var(--font-mono)">
          RISK SCORE
        </text>
      </svg>
    </div>
  )
}

function ClauseCard({ clause }: { clause: Clause }) {
  const [expanded, setExpanded] = useState(false)
  const [showRedline, setShowRedline] = useState(false)
  const { color, bg, label, Icon } = clauseRiskColor(clause.risk)

  return (
    <div className={`border rounded-xl overflow-hidden transition-all duration-200 ${
      clause.risk === 'critical' ? 'border-crimson/30' :
      clause.risk === 'medium' ? 'border-amber/30' : 'border-slate-mid/30'
    }`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-4 text-left cursor-pointer hover:bg-slate-mid/10 transition-colors"
      >
        <div className={`p-1.5 rounded-lg ${bg} shrink-0 mt-0.5`}>
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold" style={{ color }}>{label}</span>
            <span className="text-xs text-slate-light">{clause.category}</span>
            {clause.negotiationLeverage && (
              <span className={`text-[10px] ml-auto font-[family-name:var(--font-mono)] ${leverageColor(clause.negotiationLeverage)}`}>
                {leverageLabel(clause.negotiationLeverage)}
              </span>
            )}
          </div>
          <p className="text-xs text-cool-muted line-clamp-2">{clause.text}</p>
        </div>
        <div className="shrink-0 ml-2">
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-slate-light" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-light" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <div className="bg-navy/50 rounded-lg p-3">
            <p className="text-xs text-cool-muted leading-relaxed">{clause.text}</p>
          </div>

          {clause.explanation && (
            <div>
              <div className="text-xs font-semibold text-cool-muted mb-1.5">AI Analysis</div>
              <p className="text-xs text-cool-white leading-relaxed">{clause.explanation}</p>
            </div>
          )}

          {clause.suggestedRedline && (
            <div>
              <button
                onClick={() => setShowRedline(!showRedline)}
                className="text-xs text-electric hover:text-electric/80 font-medium cursor-pointer transition-colors flex items-center gap-1"
              >
                {showRedline ? 'Hide' : 'Show'} Suggested Redline
                <ArrowRight className="w-3 h-3" />
              </button>
              {showRedline && (
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div className="bg-crimson-dim/20 border border-crimson/20 rounded-lg p-3">
                    <div className="text-[10px] font-bold text-crimson mb-1.5 font-[family-name:var(--font-mono)]">ORIGINAL</div>
                    <p className="text-xs text-cool-muted leading-relaxed">{clause.text}</p>
                  </div>
                  <div className="bg-emerald-dim/20 border border-emerald/20 rounded-lg p-3">
                    <div className="text-[10px] font-bold text-emerald mb-1.5 font-[family-name:var(--font-mono)]">SUGGESTED</div>
                    <p className="text-xs text-cool-muted leading-relaxed">{clause.suggestedRedline}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function KeyDateItem({ keyDate }: { keyDate: KeyDate }) {
  const color = urgencyColor(keyDate.urgency)
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-mid/20 last:border-0">
      <div className="flex flex-col items-center gap-1 shrink-0">
        <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: color, backgroundColor: `${color}30` }}></div>
        <div className="w-px h-6 bg-slate-mid/30"></div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-cool-white font-medium">{keyDate.label}</div>
        {keyDate.noticeRequired && (
          <div className="text-xs text-cool-muted">
            {keyDate.noticeRequired}-day notice required
            {keyDate.actionDeadline && ` — Act by ${keyDate.actionDeadline}`}
          </div>
        )}
      </div>
      <div className="text-right shrink-0">
        <div className="text-xs font-bold font-[family-name:var(--font-mono)]" style={{ color }}>
          {keyDate.daysRemaining < 0 ? 'Overdue' : `${keyDate.daysRemaining}d`}
        </div>
        <div className="text-[10px] text-slate-light font-[family-name:var(--font-mono)]">{keyDate.date}</div>
      </div>
    </div>
  )
}

function ObligationRow({ obl }: { obl: RecurringObligation }) {
  const freqColor: Record<string, string> = {
    monthly: 'text-electric',
    quarterly: 'text-amber',
    annual: 'text-emerald',
    'bi-annual': 'text-purple-400',
  }
  return (
    <tr className="border-b border-slate-mid/20 last:border-0">
      <td className="py-3 pr-4 text-sm text-cool-white">{obl.label}</td>
      <td className="py-3 pr-4">
        <span className={`text-xs font-[family-name:var(--font-mono)] font-medium capitalize ${freqColor[obl.frequency] || 'text-cool-muted'}`}>
          {obl.frequency}
        </span>
      </td>
      <td className="py-3 pr-4 text-xs font-[family-name:var(--font-mono)] text-cool-muted">{obl.nextDue}</td>
      <td className="py-3 text-xs text-slate-light">{obl.description}</td>
    </tr>
  )
}

export default function ContractDetail({ contractId }: ContractDetailProps) {
  const contract = mockContracts.find(c => c.id === contractId)

  if (!contract) {
    return (
      <div className="flex items-center justify-center h-64 text-cool-muted">
        Contract not found.
      </div>
    )
  }

  const rc = riskColor(contract.riskScore)
  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    active: { label: 'Active', color: 'text-emerald', bg: 'bg-emerald-dim/30' },
    expiring_soon: { label: 'Expiring Soon', color: 'text-amber', bg: 'bg-amber-dim/30' },
    expired: { label: 'Expired', color: 'text-crimson', bg: 'bg-crimson-dim/30' },
    draft: { label: 'Draft', color: 'text-cool-muted', bg: 'bg-slate-mid/30' },
  }
  const statusCfg = statusConfig[contract.status]

  const breakdownColors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6']

  return (
    <div className="p-6 space-y-6 pb-20 md:pb-6 max-w-4xl">
      {/* Header */}
      <div className="bg-slate-dark border border-slate-mid/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-cool-white mb-1">{contract.name}</h1>
            <div className="text-cool-muted text-sm mb-3">{contract.counterparty}</div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-electric/15 text-electric border border-electric/20 font-medium">
                {contract.type}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusCfg.bg} ${statusCfg.color}`}>
                {statusCfg.label}
              </span>
              {contract.value > 0 && (
                <span className="text-xs font-[family-name:var(--font-mono)] text-cool-muted">
                  €{contract.value.toLocaleString()}/yr
                </span>
              )}
            </div>
          </div>
          <RiskGauge score={contract.riskScore} />
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-xs font-[family-name:var(--font-mono)] text-cool-muted border-t border-slate-mid/30 pt-4">
          <div>
            <span className="text-slate-light">Effective</span>{' '}
            <span className="text-cool-white">{contract.effectiveDate}</span>
          </div>
          <ArrowRight className="w-3 h-3 self-center text-slate-light" />
          <div>
            <span className="text-slate-light">Expires</span>{' '}
            <span className="text-cool-white">{contract.expiryDate}</span>
          </div>
          <div className="ml-auto">
            <span className="text-slate-light">Uploaded</span>{' '}
            <span className="text-cool-white">{contract.uploadDate}</span>
          </div>
        </div>
      </div>

      {/* Risk Breakdown Chart */}
      <div className="bg-slate-dark border border-slate-mid/30 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-cool-white mb-4">Risk Breakdown</h2>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart
            data={contract.riskBreakdown}
            layout="vertical"
            margin={{ left: 0, right: 16, top: 0, bottom: 0 }}
          >
            <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 11 }} domain={[0, 'dataMax']} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="category"
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              width={120}
            />
            <Tooltip
              contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8 }}
              labelStyle={{ color: '#F1F5F9' }}
              itemStyle={{ color: '#94A3B8' }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} isAnimationActive={false}>
              {contract.riskBreakdown.map((entry, i) => {
                const c = entry.severity === 'high' ? '#EF4444' : entry.severity === 'medium' ? '#F59E0B' : '#10B981'
                void breakdownColors
                return <Cell key={i} fill={c} />
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* AI Summary */}
      <div className="bg-slate-dark border border-slate-mid/30 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 rounded bg-electric/20 flex items-center justify-center">
            <span className="text-[9px] font-bold text-electric">AI</span>
          </div>
          <h2 className="text-sm font-semibold text-cool-white">AI Summary</h2>
        </div>
        <p className="text-sm text-cool-muted leading-relaxed mb-4">{contract.summary.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-light mb-2 uppercase tracking-wide">Term Length</div>
            <div className="text-xs text-cool-white font-[family-name:var(--font-mono)]">{contract.summary.termLength}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-light mb-2 uppercase tracking-wide">Key Obligations</div>
            <ul className="space-y-1">
              {contract.summary.keyObligations.map((obl, i) => (
                <li key={i} className="text-xs text-cool-muted flex items-start gap-2">
                  <span className="text-electric mt-0.5 shrink-0">•</span>
                  {obl}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-mid/30 pt-4">
          <div>
            <div className="text-xs font-semibold text-crimson mb-2 uppercase tracking-wide">Biggest Risk</div>
            <p className="text-xs text-cool-muted leading-relaxed">{contract.summary.biggestRisk}</p>
          </div>
          <div>
            <div className="text-xs font-semibold text-emerald mb-2 uppercase tracking-wide">Recommended Action</div>
            <p className="text-xs text-cool-muted leading-relaxed">{contract.summary.recommendedAction}</p>
          </div>
        </div>
      </div>

      {/* Key Dates */}
      <div className="bg-slate-dark border border-slate-mid/30 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-electric" />
          <h2 className="text-sm font-semibold text-cool-white">Key Dates</h2>
        </div>
        <div className="divide-y divide-slate-mid/20">
          {contract.keyDates.map((kd, i) => (
            <KeyDateItem key={i} keyDate={kd} />
          ))}
        </div>
      </div>

      {/* Clauses */}
      <div className="bg-slate-dark border border-slate-mid/30 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4" style={{ color: rc }} />
          <h2 className="text-sm font-semibold text-cool-white">Clauses ({contract.clauses.length})</h2>
          <div className="ml-auto flex gap-3 text-xs text-cool-muted">
            <span className="text-crimson font-medium">
              {contract.clauses.filter(c => c.risk === 'critical').length} critical
            </span>
            <span className="text-amber font-medium">
              {contract.clauses.filter(c => c.risk === 'medium').length} medium
            </span>
          </div>
        </div>
        <div className="space-y-3">
          {contract.clauses
            .sort((a, b) => {
              const order = { critical: 0, medium: 1, low: 2 }
              return order[a.risk] - order[b.risk]
            })
            .map(clause => (
              <ClauseCard key={clause.id} clause={clause} />
            ))}
        </div>
      </div>

      {/* Recurring Obligations */}
      {contract.recurringObligations.length > 0 && (
        <div className="bg-slate-dark border border-slate-mid/30 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <RefreshCw className="w-4 h-4 text-electric" />
            <h2 className="text-sm font-semibold text-cool-white">Recurring Obligations</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-mid/30">
                  <th className="text-left py-2 pr-4 text-xs text-slate-light font-medium">Obligation</th>
                  <th className="text-left py-2 pr-4 text-xs text-slate-light font-medium">Frequency</th>
                  <th className="text-left py-2 pr-4 text-xs text-slate-light font-medium">Next Due</th>
                  <th className="text-left py-2 text-xs text-slate-light font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {contract.recurringObligations.map(obl => (
                  <ObligationRow key={obl.id} obl={obl} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
