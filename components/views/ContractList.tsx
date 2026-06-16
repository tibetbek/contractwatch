'use client'

import { useState, useMemo } from 'react'
import { Search, FileText } from 'lucide-react'
import mockContracts from '@/lib/mockContracts'
import { Contract } from '@/lib/types'
import ContractDetail from './ContractDetail'

interface ContractListProps {
  onSelectContract: (id: string) => void
  selectedContractId: string | null
}

type FilterType = 'all' | 'critical' | 'expiring' | 'active'
type SortType = 'risk' | 'deadline' | 'value' | 'date'

function riskColor(score: number): string {
  if (score >= 70) return '#EF4444'
  if (score >= 40) return '#F59E0B'
  return '#10B981'
}

function statusDotColor(status: string): string {
  switch (status) {
    case 'active': return '#10B981'
    case 'expiring_soon': return '#F59E0B'
    case 'expired': return '#EF4444'
    default: return '#475569'
  }
}

function typeBadge(type: string): string {
  const map: Record<string, string> = {
    'Vendor Agreement': 'bg-purple-900/40 text-purple-300',
    'Lease': 'bg-blue-900/40 text-blue-300',
    'SaaS Subscription': 'bg-cyan-900/40 text-cyan-300',
    'NDA': 'bg-gray-700/40 text-gray-300',
    'Service Contract': 'bg-indigo-900/40 text-indigo-300',
    'Employment': 'bg-rose-900/40 text-rose-300',
    'Licensing': 'bg-orange-900/40 text-orange-300',
    'Insurance': 'bg-teal-900/40 text-teal-300',
    'Retainer': 'bg-violet-900/40 text-violet-300',
  }
  return map[type] || 'bg-slate-700/40 text-slate-300'
}

export default function ContractList({ onSelectContract, selectedContractId }: ContractListProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [sort, setSort] = useState<SortType>('risk')

  const today = new Date('2026-06-16')

  const filtered = useMemo(() => {
    let contracts = [...mockContracts]

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      contracts = contracts.filter(
        c => c.name.toLowerCase().includes(q) || c.counterparty.toLowerCase().includes(q)
      )
    }

    // Filter
    switch (filter) {
      case 'critical':
        contracts = contracts.filter(c => c.riskScore >= 70)
        break
      case 'expiring':
        contracts = contracts.filter(c => c.status === 'expiring_soon')
        break
      case 'active':
        contracts = contracts.filter(c => c.status === 'active')
        break
    }

    // Sort
    switch (sort) {
      case 'risk':
        contracts.sort((a, b) => b.riskScore - a.riskScore)
        break
      case 'deadline':
        contracts.sort((a, b) => {
          const aExpiry = new Date(a.expiryDate).getTime()
          const bExpiry = new Date(b.expiryDate).getTime()
          return aExpiry - bExpiry
        })
        break
      case 'value':
        contracts.sort((a, b) => b.value - a.value)
        break
      case 'date':
        contracts.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
        break
    }

    return contracts
  }, [search, filter, sort])

  const getDaysToExpiry = (c: Contract) => {
    const expiry = new Date(c.expiryDate)
    return Math.round((expiry.getTime() - today.getTime()) / 86400000)
  }

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'critical', label: 'Critical Risk' },
    { id: 'expiring', label: 'Expiring Soon' },
    { id: 'active', label: 'Active' },
  ]

  const sorts: { id: SortType; label: string }[] = [
    { id: 'risk', label: 'Risk Score' },
    { id: 'deadline', label: 'Deadline' },
    { id: 'value', label: 'Value' },
    { id: 'date', label: 'Upload Date' },
  ]

  return (
    <div className="flex h-full min-h-screen">
      {/* Left list panel */}
      <div className="w-80 shrink-0 border-r border-slate-mid/30 bg-slate-dark/50 flex flex-col h-full">
        {/* Search */}
        <div className="p-4 border-b border-slate-mid/30 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-light" />
            <input
              type="text"
              placeholder="Search contracts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-navy border border-slate-mid/50 rounded-lg pl-9 pr-3 py-2 text-sm text-cool-white placeholder-slate-light focus:outline-none focus:border-electric/50 transition-colors"
            />
          </div>

          {/* Filter pills */}
          <div className="flex gap-1.5 flex-wrap">
            {filters.map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all duration-150
                  ${filter === f.id
                    ? 'bg-electric text-white'
                    : 'bg-slate-mid/30 text-cool-muted hover:text-cool-white hover:bg-slate-mid/50'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortType)}
            className="w-full bg-navy border border-slate-mid/50 rounded-lg px-3 py-2 text-sm text-cool-muted focus:outline-none focus:border-electric/50 cursor-pointer"
          >
            {sorts.map(s => (
              <option key={s.id} value={s.id}>Sort: {s.label}</option>
            ))}
          </select>
        </div>

        {/* Contract list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-cool-muted text-sm">No contracts found</div>
          ) : (
            filtered.map(contract => {
              const isSelected = selectedContractId === contract.id
              const daysLeft = getDaysToExpiry(contract)
              const rc = riskColor(contract.riskScore)
              return (
                <button
                  key={contract.id}
                  onClick={() => onSelectContract(contract.id)}
                  className={`w-full text-left p-4 border-b border-slate-mid/20 cursor-pointer transition-all duration-150
                    ${isSelected ? 'bg-electric/10 border-l-2 border-l-electric' : 'hover:bg-slate-mid/20'}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-sm font-medium text-cool-white leading-tight line-clamp-2">
                      {contract.name}
                    </span>
                    <div
                      className="shrink-0 w-9 h-7 rounded text-xs font-bold font-[family-name:var(--font-mono)] flex items-center justify-center"
                      style={{ color: rc, backgroundColor: `${rc}20` }}
                    >
                      {contract.riskScore}
                    </div>
                  </div>

                  <div className="text-xs text-cool-muted mb-2">{contract.counterparty}</div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${typeBadge(contract.type)}`}>
                      {contract.type}
                    </span>
                    <div className="flex items-center gap-1 ml-auto">
                      <div
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: statusDotColor(contract.status) }}
                      ></div>
                      <span
                        className="text-[10px] font-[family-name:var(--font-mono)]"
                        style={{ color: daysLeft <= 30 ? '#EF4444' : daysLeft <= 90 ? '#F59E0B' : '#94A3B8' }}
                      >
                        {daysLeft < 0 ? 'Expired' : `${daysLeft}d`}
                      </span>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Right detail panel */}
      <div className="flex-1 overflow-y-auto">
        {selectedContractId ? (
          <ContractDetail contractId={selectedContractId} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-96 text-center px-8">
            <div className="w-16 h-16 rounded-2xl bg-slate-dark border border-slate-mid/30 flex items-center justify-center mb-4">
              <FileText className="w-7 h-7 text-slate-light" />
            </div>
            <h3 className="text-cool-white font-medium mb-2">Select a contract</h3>
            <p className="text-cool-muted text-sm max-w-xs">
              Choose a contract from the list to view its full details, risk analysis, and key dates.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
