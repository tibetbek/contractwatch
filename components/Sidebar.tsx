'use client'

import { LayoutDashboard, FileText, Calendar, Columns2, Shield, Zap } from 'lucide-react'

interface SidebarProps {
  activeView: string
  onNavigate: (view: string) => void
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'contracts', label: 'Contracts', icon: FileText },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'compare', label: 'Compare', icon: Columns2 },
]

export default function Sidebar({ activeView, onNavigate }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 min-h-screen bg-slate-dark border-r border-slate-mid/30 shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-mid/30">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-electric/20 border border-electric/30">
            <Shield className="w-4 h-4 text-electric" />
          </div>
          <div>
            <span className="text-cool-white font-semibold text-sm tracking-wide">ContractWatch</span>
            <div className="text-cool-muted text-[10px] font-[family-name:var(--font-mono)] mt-0.5">AI INTELLIGENCE</div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeView === id
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-150 cursor-pointer text-left
                  ${isActive
                    ? 'bg-electric/10 text-electric border-l-2 border-electric pl-[10px]'
                    : 'text-cool-muted hover:text-cool-white hover:bg-slate-mid/30'
                  }
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            )
          })}
        </nav>

        {/* AI badge at bottom */}
        <div className="px-5 py-4 border-t border-slate-mid/30">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-electric"></div>
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-electric animate-ping opacity-75"></div>
            </div>
            <div>
              <div className="text-[11px] text-cool-muted font-medium">AI-powered analysis</div>
              <div className="text-[10px] text-slate-light font-[family-name:var(--font-mono)]">12 contracts monitored</div>
            </div>
            <Zap className="w-3 h-3 text-electric ml-auto" />
          </div>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-dark border-t border-slate-mid/30 flex">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = activeView === id
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs cursor-pointer transition-colors duration-150
                ${isActive ? 'text-electric' : 'text-cool-muted hover:text-cool-white'}
              `}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          )
        })}
      </nav>
    </>
  )
}
