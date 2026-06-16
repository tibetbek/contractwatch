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
    <div className="flex h-screen overflow-hidden bg-navy">
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
  )
}
