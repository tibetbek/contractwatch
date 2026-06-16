'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from '@/components/Sidebar'
import Dashboard from '@/components/views/Dashboard'
import ContractList from '@/components/views/ContractList'
import CalendarView from '@/components/views/CalendarView'
import CompareView from '@/components/views/CompareView'

type View = 'dashboard' | 'contracts' | 'calendar' | 'compare'

export default function Home() {
  const [activeView, setActiveView] = useState<View>('dashboard')
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null)

  const handleNavigate = (view: string) => {
    setActiveView(view as View)
    if (view !== 'contracts') setSelectedContractId(null)
  }

  const handleSelectContract = (id: string) => {
    setSelectedContractId(id)
    setActiveView('contracts')
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-navy">
      {/* Disclaimer banner */}
      <div className="w-full bg-amber-dim/60 border-b border-amber/30 px-4 py-2 flex items-center gap-2 shrink-0 z-50">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <p className="text-xs text-amber leading-tight">
          <span className="font-semibold">Portfolio demo only.</span>{' '}
          All contracts, companies, and clause data are entirely fictional. This tool does not provide legal advice and must not be used to analyze real contracts.{' '}
          <span className="font-semibold">Consult a licensed attorney for actual legal matters.</span>
        </p>
      </div>

      {/* App layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar activeView={activeView} onNavigate={handleNavigate} />

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
            {activeView === 'dashboard' && (
              <Dashboard onSelectContract={handleSelectContract} />
            )}
            {activeView === 'contracts' && (
              <ContractList
                onSelectContract={handleSelectContract}
                selectedContractId={selectedContractId}
              />
            )}
            {activeView === 'calendar' && (
              <CalendarView onSelectContract={handleSelectContract} />
            )}
            {activeView === 'compare' && (
              <CompareView />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
      </div>
    </div>
  )
}
