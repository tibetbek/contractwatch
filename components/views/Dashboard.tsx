'use client'

import { useMemo } from 'react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts'
import { AlertTriangle, FileText, TrendingUp, Clock, ChevronRight } from 'lucide-react'
import mockContracts from '@/lib/mockContracts'
import { calculatePortfolioRisk } from '@/lib/analyzer'
import { Contract } from '@/lib/types'

interface DashboardProps {
  onSelectContract: (id: string) => void
}

function formatEuro(value: number): string {
  if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `€${(value / 1000).toFixed(0)}K`
  return `€${value.toLocaleString()}`
}

function riskColor(score: number): string {
  if (score >= 70) return '#EF4444'
  if (score >= 40) return '#F59E0B'
  return '#10B981'
}

function urgencyColor(urgency: string): string {
  if (urgency === 'critical') return '#EF4444'
  if (urgency === 'warning') return '#F59E0B'
  return '#10B981'
}

function RiskBadge({ score }: { score: number }) {
  const color = riskColor(score)
  const bg = score >= 70 ? 'bg-crimson-dim' : score >= 40 ? 'bg-amber-dim' : 'bg-emerald-dim'
  return (
    <span
      className={`inline-flex items-center justify-center w-10 h-6 rounded text-xs font-bold font-[family-name:var(--font-mono)] ${bg}`}
      style={{ color }}
    >
      {score}
    </span>
  )
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-dark border border-slate-mid/50 rounded-lg px-3 py-2 text-xs text-cool-white">
        <div className="font-medium">{label}</div>
        <div className="text-cool-muted">{payload[0].value} contracts</div>
      </div>
    )
  }
  return null
}

export default function Dashboard({ onSelectContract }: DashboardProps) {
  const metrics = useMemo(() => calculatePortfolioRisk(mockContracts), [])

  const today = new Date('2026-06-16')
  const formattedDate = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  const kpiCards = [
    {
      label: 'Total Portfolio Value',
      value: formatEuro(metrics.totalValue),
      icon: TrendingUp,
      color: 'text-electric',
      bg: 'bg-electric-dim/30',
    },
    {
      label: 'Active Contracts',
      value: metrics.totalContracts,
      icon: FileText,
      color: 'text-emerald',
      bg: 'bg-emerald-dim/30',
    },
    {
      label: 'Avg Risk Score',
      value: metrics.avgRiskScore,
      icon: AlertTriangle,
      color: metrics.avgRiskScore >= 70 ? 'text-crimson' : metrics.avgRiskScore >= 40 ? 'text-amber' : 'text-emerald',
      bg: metrics.avgRiskScore >= 70 ? 'bg-crimson-dim/30' : metrics.avgRiskScore >= 40 ? 'bg-amber-dim/30' : 'bg-emerald-dim/30',
    },
    {
      label: 'Needing Attention',
      value: metrics.contractsNeedingAttention.length,
      icon: Clock,
      color: 'text-amber',
      bg: 'bg-amber-dim/30',
    },
  ]

  return (
    <div className="p-6 space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-cool-white">Portfolio Overview</h1>
          <p className="text-cool-muted text-sm font-[family-name:var(--font-mono)] mt-0.5">{formattedDate}</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-electric/10 border border-electric/20 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-electric animate-pulse"></div>
          <span className="text-electric text-xs font-medium">Live monitoring</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-slate-dark border border-slate-mid/30 rounded-xl p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${bg}`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <div className={`text-2xl font-bold ${color} font-[family-name:var(--font-mono)]`}>
              {value}
            </div>
            <div className="text-cool-muted text-xs mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Risk Distribution Donut */}
        <div className="bg-slate-dark border border-slate-mid/30 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-cool-white mb-4">Risk Distribution</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={metrics.riskDistribution}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="count"
                nameKey="level"
                isAnimationActive={false}
              >
                {metrics.riskDistribution.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#F1F5F9' }}
                itemStyle={{ color: '#94A3B8' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {metrics.riskDistribution.map(({ level, count, color }) => (
              <div key={level} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
                <span className="text-xs text-cool-muted">{level} ({count})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contracts by Type */}
        <div className="bg-slate-dark border border-slate-mid/30 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-cool-white mb-4">Contracts by Type</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={metrics.contractsByType}
              layout="vertical"
              margin={{ left: 0, right: 16, top: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="type"
                tick={{ fill: '#94A3B8', fontSize: 10 }}
                width={90}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Renewal Timeline */}
        <div className="bg-slate-dark border border-slate-mid/30 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-cool-white mb-4">Renewal Timeline</h2>
          <div className="space-y-2 overflow-y-auto max-h-52">
            {mockContracts
              .filter(c => c.status !== 'expired')
              .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
              .map(contract => {
                const today2 = new Date('2026-06-16')
                const expiry = new Date(contract.expiryDate)
                const start = new Date(contract.effectiveDate)
                const totalMs = expiry.getTime() - start.getTime()
                const elapsedMs = today2.getTime() - start.getTime()
                const progress = Math.max(0, Math.min(100, (elapsedMs / totalMs) * 100))
                const daysLeft = Math.round((expiry.getTime() - today2.getTime()) / 86400000)
                const color = daysLeft <= 30 ? '#EF4444' : daysLeft <= 90 ? '#F59E0B' : '#10B981'
                return (
                  <div key={contract.id} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-cool-muted truncate max-w-[140px]">{contract.name}</span>
                      <span
                        className="text-[10px] font-[family-name:var(--font-mono)] shrink-0"
                        style={{ color }}
                      >
                        {daysLeft}d
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-mid/50 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${progress}%`, backgroundColor: color }}
                      ></div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </div>

      {/* Bottom two-column row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Contracts Needing Attention */}
        <div className="bg-slate-dark border border-slate-mid/30 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-cool-white mb-4">Contracts Needing Attention</h2>
          <div className="space-y-3">
            {metrics.contractsNeedingAttention.map((contract: Contract) => {
              const soonest = contract.keyDates.reduce((min, kd) =>
                kd.daysRemaining >= 0 && kd.daysRemaining < min ? kd.daysRemaining : min,
                9999
              )
              return (
                <button
                  key={contract.id}
                  onClick={() => onSelectContract(contract.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-mid/20 transition-colors cursor-pointer text-left group"
                >
                  <RiskBadge score={contract.riskScore} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-cool-white font-medium truncate">{contract.name}</div>
                    <div className="text-xs text-cool-muted truncate">{contract.counterparty}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div
                      className="text-xs font-[family-name:var(--font-mono)] font-medium"
                      style={{ color: riskColor(contract.riskScore) }}
                    >
                      {soonest < 9999 ? `${soonest}d` : '—'}
                    </div>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-light group-hover:text-cool-muted transition-colors" />
                </button>
              )
            })}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-slate-dark border border-slate-mid/30 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-cool-white mb-4">Upcoming Deadlines (30 days)</h2>
          {metrics.upcomingDeadlines.length === 0 ? (
            <div className="text-cool-muted text-sm text-center py-8">No deadlines in the next 30 days</div>
          ) : (
            <div className="space-y-3">
              {metrics.upcomingDeadlines.map((deadline, i) => (
                <button
                  key={i}
                  onClick={() => onSelectContract(deadline.contractId)}
                  className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-slate-mid/20 transition-colors cursor-pointer text-left group"
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                    style={{ backgroundColor: urgencyColor(deadline.urgency) }}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-cool-white font-medium truncate">{deadline.label}</div>
                    <div className="text-xs text-cool-muted truncate">{deadline.contractName}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div
                      className="text-xs font-bold font-[family-name:var(--font-mono)]"
                      style={{ color: urgencyColor(deadline.urgency) }}
                    >
                      {deadline.daysRemaining}d
                    </div>
                    <div className="text-[10px] text-slate-light font-[family-name:var(--font-mono)]">
                      {deadline.date}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
