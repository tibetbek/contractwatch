'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Upload, HelpCircle, X } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import Dashboard from '@/components/views/Dashboard'
import ContractList from '@/components/views/ContractList'
import CalendarView from '@/components/views/CalendarView'
import CompareView from '@/components/views/CompareView'
import NotificationCenter from '@/components/NotificationCenter'
import UploadModal from '@/components/UploadModal'

type View = 'dashboard' | 'contracts' | 'calendar' | 'compare'

const VIEW_KEYS: Record<string, View> = {
  '1': 'dashboard',
  '2': 'contracts',
  '3': 'calendar',
  '4': 'compare',
}

const SHORTCUTS = [
  { keys: ['1'], label: 'Dashboard' },
  { keys: ['2'], label: 'Contracts' },
  { keys: ['3'], label: 'Calendar' },
  { keys: ['4'], label: 'Compare' },
  { keys: ['U'], label: 'Upload contract' },
  { keys: ['?'], label: 'Show shortcuts' },
  { keys: ['Esc'], label: 'Close modal / dialog' },
]

export default function Home() {
  const [activeView, setActiveView] = useState<View>('dashboard')
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)

  const handleNavigate = useCallback((view: string) => {
    setActiveView(view as View)
    if (view !== 'contracts') setSelectedContractId(null)
  }, [])

  const handleSelectContract = useCallback((id: string) => {
    setSelectedContractId(id)
    setActiveView('contracts')
  }, [])

  // Global keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      if (e.key === 'Escape') {
        setShowUpload(false)
        setShowShortcuts(false)
        return
      }
      if (e.key === '?') {
        setShowShortcuts((v) => !v)
        return
      }
      if ((e.key === 'u' || e.key === 'U') && !showUpload && !showShortcuts) {
        setShowUpload(true)
        return
      }
      const view = VIEW_KEYS[e.key]
      if (view && !showUpload && !showShortcuts) {
        handleNavigate(view)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleNavigate, showUpload, showShortcuts])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-navy">
      {/* Disclaimer banner */}
      <div className="w-full bg-amber-dim/60 border-b border-amber/30 px-4 py-2 flex items-center gap-2 shrink-0 z-50">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <p className="text-xs text-amber leading-tight">
          <span className="font-semibold">Portfolio demo only.</span>{' '}
          All contracts, companies, and clause data are entirely fictional.{' '}
          <span className="font-semibold">Consult a licensed attorney for actual legal matters.</span>
        </p>
        <span className="ml-auto flex items-center gap-1.5 text-[10px] text-cool-muted font-mono border border-slate-mid/40 rounded px-2 py-0.5 hidden sm:flex">
          Press <kbd className="text-electric">?</kbd> for shortcuts
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with notification + upload */}
        <div className="hidden md:flex flex-col w-60 min-h-0 bg-slate-dark border-r border-slate-mid/30 shrink-0">
          {/* Logo row with notifications */}
          <div className="flex items-center gap-2 px-4 py-4 border-b border-slate-mid/30">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-electric/20 border border-electric/30 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-electric" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-cool-white font-semibold text-sm tracking-wide">ContractWatch</span>
              <div className="text-cool-muted text-[10px] font-[family-name:var(--font-mono)] mt-0.5">AI INTELLIGENCE</div>
            </div>
            <NotificationCenter />
          </div>

          {/* Upload button */}
          <div className="px-3 pt-3 pb-1">
            <button
              onClick={() => setShowUpload(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-electric/10 border border-electric/20 text-electric text-sm font-medium hover:bg-electric/15 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Upload Contract
              <kbd className="ml-auto text-[9px] font-mono bg-electric/10 border border-electric/20 rounded px-1.5 py-0.5">U</kbd>
            </button>
          </div>

          {/* Pass through to existing Sidebar nav — we use the internal nav directly */}
          <SidebarNav activeView={activeView} onNavigate={handleNavigate} />

          {/* Shortcuts hint + AI badge */}
          <div className="px-5 py-4 border-t border-slate-mid/30 space-y-3">
            <button
              onClick={() => setShowShortcuts(true)}
              className="flex items-center gap-2 text-slate-light hover:text-cool-muted transition-colors text-xs cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Keyboard shortcuts
            </button>
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-electric" />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-electric animate-ping opacity-75" />
              </div>
              <div>
                <div className="text-[11px] text-cool-muted font-medium">AI-powered analysis</div>
                <div className="text-[10px] text-slate-light font-[family-name:var(--font-mono)]">12 contracts monitored</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile bottom nav */}
        <MobileNav activeView={activeView} onNavigate={handleNavigate} onUpload={() => setShowUpload(true)} />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="min-h-full"
            >
              {activeView === 'dashboard' && <Dashboard onSelectContract={handleSelectContract} />}
              {activeView === 'contracts' && (
                <ContractList onSelectContract={handleSelectContract} selectedContractId={selectedContractId} />
              )}
              {activeView === 'calendar' && <CalendarView onSelectContract={handleSelectContract} />}
              {activeView === 'compare' && <CompareView />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Upload modal */}
      <AnimatePresence>
        {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
      </AnimatePresence>

      {/* Shortcuts modal */}
      <AnimatePresence>
        {showShortcuts && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowShortcuts(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-slate-dark border border-slate-mid/40 rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-mid/30">
                <h3 className="text-sm font-semibold text-cool-white">Keyboard Shortcuts</h3>
                <button onClick={() => setShowShortcuts(false)} className="text-cool-muted hover:text-cool-white transition-colors cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="px-5 py-4 space-y-2.5">
                {SHORTCUTS.map(({ keys, label }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm text-cool-muted">{label}</span>
                    <div className="flex gap-1">
                      {keys.map((k) => (
                        <kbd key={k} className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-mid/40 border border-slate-mid/60 text-cool-white">
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// Inline nav items (replaces the full Sidebar component on desktop)
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'contracts', label: 'Contracts', icon: 'FileText' },
  { id: 'calendar', label: 'Calendar', icon: 'Calendar' },
  { id: 'compare', label: 'Compare', icon: 'Columns2' },
]

function NavIcon({ name }: { name: string }) {
  if (name === 'LayoutDashboard') return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
  )
  if (name === 'FileText') return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>
  )
  if (name === 'Calendar') return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  )
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="8" height="18"/><rect x="13" y="3" width="8" height="18"/></svg>
  )
}

function SidebarNav({ activeView, onNavigate }: { activeView: string; onNavigate: (v: string) => void }) {
  return (
    <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
      {NAV_ITEMS.map(({ id, label, icon }, i) => {
        const isActive = activeView === id
        return (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer text-left ${
              isActive
                ? 'bg-electric/10 text-electric border-l-2 border-electric pl-[10px]'
                : 'text-cool-muted hover:text-cool-white hover:bg-slate-mid/30'
            }`}
          >
            <NavIcon name={icon} />
            {label}
            <kbd className="ml-auto text-[9px] font-mono text-slate-light">{i + 1}</kbd>
          </button>
        )
      })}
    </nav>
  )
}

function MobileNav({ activeView, onNavigate, onUpload }: { activeView: string; onNavigate: (v: string) => void; onUpload: () => void }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-dark border-t border-slate-mid/30 flex">
      {NAV_ITEMS.map(({ id, label, icon }) => {
        const isActive = activeView === id
        return (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs cursor-pointer transition-colors duration-150 ${isActive ? 'text-electric' : 'text-cool-muted hover:text-cool-white'}`}
          >
            <NavIcon name={icon} />
            {label}
          </button>
        )
      })}
      <button
        onClick={onUpload}
        className="flex-1 flex flex-col items-center gap-1 py-3 text-xs cursor-pointer transition-colors text-cool-muted hover:text-cool-white"
      >
        <Upload className="w-5 h-5" />
        Upload
      </button>
    </nav>
  )
}
