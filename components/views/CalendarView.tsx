'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import mockContracts from '@/lib/mockContracts'
import { KeyDate } from '@/lib/types'

interface CalendarViewProps {
  onSelectContract: (id: string) => void
}

interface DeadlineEntry extends KeyDate {
  contractId: string
  contractName: string
}

function urgencyColor(urgency: string): string {
  if (urgency === 'critical') return '#EF4444'
  if (urgency === 'warning') return '#F59E0B'
  return '#10B981'
}

function urgencyBg(urgency: string): string {
  if (urgency === 'critical') return 'bg-crimson-dim/60 border border-crimson/30'
  if (urgency === 'warning') return 'bg-amber-dim/60 border border-amber/30'
  return 'bg-emerald-dim/60 border border-emerald/30'
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarView({ onSelectContract }: CalendarViewProps) {
  const [currentYear, setCurrentYear] = useState(2026)
  const [currentMonth, setCurrentMonth] = useState(5) // 0-indexed, June = 5
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [popoverOpen, setPopoverOpen] = useState(false)

  // Collect all deadlines across all contracts
  const allDeadlines = useMemo<DeadlineEntry[]>(() => {
    const entries: DeadlineEntry[] = []
    mockContracts.forEach(contract => {
      contract.keyDates.forEach(kd => {
        entries.push({
          ...kd,
          contractId: contract.id,
          contractName: contract.name,
        })
      })
    })
    return entries
  }, [])

  // Group deadlines by date string "YYYY-MM-DD"
  const deadlinesByDate = useMemo(() => {
    const map: Record<string, DeadlineEntry[]> = {}
    allDeadlines.forEach(d => {
      if (!map[d.date]) map[d.date] = []
      map[d.date].push(d)
    })
    return map
  }, [allDeadlines])

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(y => y - 1)
    } else {
      setCurrentMonth(m => m - 1)
    }
    setSelectedDay(null)
    setPopoverOpen(false)
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(y => y + 1)
    } else {
      setCurrentMonth(m => m + 1)
    }
    setSelectedDay(null)
    setPopoverOpen(false)
  }

  // Build calendar grid
  const firstDay = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const cells: (number | null)[] = Array(firstDay).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const getDateKey = (day: number) => {
    const m = String(currentMonth + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    return `${currentYear}-${m}-${d}`
  }

  const selectedDateKey = selectedDay !== null ? getDateKey(selectedDay) : null
  const selectedDeadlines = selectedDateKey ? (deadlinesByDate[selectedDateKey] || []) : []

  const today = new Date('2026-06-16')
  const isToday = (day: number) =>
    today.getFullYear() === currentYear &&
    today.getMonth() === currentMonth &&
    today.getDate() === day

  return (
    <div className="p-6 pb-20 md:pb-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-cool-white">Contract Calendar</h1>
          <p className="text-cool-muted text-sm mt-0.5">All key dates and deadlines</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 text-xs text-cool-muted">
            {[
              { label: 'Critical', color: '#EF4444' },
              { label: 'Warning', color: '#F59E0B' },
              { label: 'Normal', color: '#10B981' },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: color }}></div>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-slate-dark border border-slate-mid/30 rounded-xl overflow-hidden">
        {/* Month navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-mid/30">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg hover:bg-slate-mid/30 text-cool-muted hover:text-cool-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="text-base font-semibold text-cool-white">
            {MONTHS[currentMonth]} {currentYear}
          </h2>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg hover:bg-slate-mid/30 text-cool-muted hover:text-cool-white transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-slate-mid/30">
          {WEEKDAYS.map(d => (
            <div key={d} className="py-2 text-center text-xs font-medium text-slate-light">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} className="min-h-[90px] border-b border-r border-slate-mid/20" />
            }
            const dateKey = getDateKey(day)
            const dayDeadlines = deadlinesByDate[dateKey] || []
            const isSelected = selectedDay === day
            const isTod = isToday(day)
            const maxVisible = 3
            const remaining = dayDeadlines.length - maxVisible

            return (
              <div
                key={day}
                onClick={() => {
                  if (dayDeadlines.length > 0) {
                    setSelectedDay(day)
                    setPopoverOpen(true)
                  } else {
                    setSelectedDay(null)
                    setPopoverOpen(false)
                  }
                }}
                className={`min-h-[90px] border-b border-r border-slate-mid/20 p-1.5 transition-colors
                  ${dayDeadlines.length > 0 ? 'cursor-pointer hover:bg-slate-mid/20' : ''}
                  ${isSelected ? 'bg-electric/10' : ''}
                `}
              >
                <div className={`
                  text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full
                  ${isTod ? 'bg-electric text-white' : 'text-cool-muted'}
                `}>
                  {day}
                </div>
                <div className="space-y-0.5">
                  {dayDeadlines.slice(0, maxVisible).map((dl, idx) => (
                    <div
                      key={idx}
                      className={`text-[10px] px-1 py-0.5 rounded truncate font-medium ${urgencyBg(dl.urgency)}`}
                      style={{ color: urgencyColor(dl.urgency) }}
                    >
                      {dl.contractName.split(' – ')[0].split(' ').slice(0, 3).join(' ')}
                    </div>
                  ))}
                  {remaining > 0 && (
                    <div className="text-[10px] text-slate-light px-1">+{remaining} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Day popover / detail panel */}
      {popoverOpen && selectedDay !== null && selectedDeadlines.length > 0 && (
        <div className="bg-slate-dark border border-slate-mid/30 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-cool-white">
              {MONTHS[currentMonth]} {selectedDay}, {currentYear}
            </h3>
            <button
              onClick={() => { setPopoverOpen(false); setSelectedDay(null) }}
              className="p-1 rounded hover:bg-slate-mid/30 text-cool-muted hover:text-cool-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {selectedDeadlines.map((dl, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-lg ${urgencyBg(dl.urgency)}`}
              >
                <div
                  className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                  style={{ backgroundColor: urgencyColor(dl.urgency) }}
                ></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium" style={{ color: urgencyColor(dl.urgency) }}>
                    {dl.label}
                  </div>
                  <div className="text-xs text-cool-muted">{dl.contractName}</div>
                  {dl.noticeRequired && (
                    <div className="text-xs text-slate-light mt-0.5">
                      {dl.noticeRequired}-day notice required
                    </div>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <div
                    className="text-xs font-bold font-[family-name:var(--font-mono)]"
                    style={{ color: urgencyColor(dl.urgency) }}
                  >
                    {dl.daysRemaining}d
                  </div>
                  <button
                    onClick={() => onSelectContract(dl.contractId)}
                    className="text-[10px] text-electric hover:text-electric/80 cursor-pointer transition-colors"
                  >
                    View contract →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming deadlines list */}
      <div className="bg-slate-dark border border-slate-mid/30 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-cool-white mb-4">All Upcoming Deadlines</h2>
        <div className="space-y-2">
          {allDeadlines
            .filter(d => d.daysRemaining >= 0)
            .sort((a, b) => a.daysRemaining - b.daysRemaining)
            .map((dl, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-2.5 border-b border-slate-mid/20 last:border-0"
              >
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: urgencyColor(dl.urgency) }}
                ></div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-cool-white">{dl.label}</span>
                  <span className="text-xs text-cool-muted ml-2">{dl.contractName}</span>
                </div>
                <div
                  className="text-xs font-bold font-[family-name:var(--font-mono)] shrink-0"
                  style={{ color: urgencyColor(dl.urgency) }}
                >
                  {dl.daysRemaining < 1 ? 'Today' : `${dl.daysRemaining}d`}
                </div>
                <div className="text-[10px] text-slate-light font-[family-name:var(--font-mono)] shrink-0 w-24 text-right">
                  {dl.date}
                </div>
                <button
                  onClick={() => onSelectContract(dl.contractId)}
                  className="text-[10px] text-electric hover:text-electric/80 cursor-pointer transition-colors shrink-0"
                >
                  View →
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
