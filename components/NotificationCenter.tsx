'use client'

import { useState } from 'react'
import { Bell, X, AlertTriangle, Clock, CheckCircle, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const notifications = [
  {
    id: 1,
    type: 'critical' as const,
    title: 'CloudStorage Pro renewal in 12 days',
    body: 'Notice period closes Jun 30. Action required to avoid auto-renewal.',
    time: '2h ago',
    unread: true,
  },
  {
    id: 2,
    type: 'warning' as const,
    title: 'High-risk clause detected',
    body: 'DesignCo Retainer Agreement has a unilateral termination clause with no notice period.',
    time: '5h ago',
    unread: true,
  },
  {
    id: 3,
    type: 'warning' as const,
    title: 'Payment due in 7 days',
    body: 'Manufacturing Supply Agreement — Q2 milestone payment of €45,000.',
    time: '1d ago',
    unread: true,
  },
  {
    id: 4,
    type: 'info' as const,
    title: 'NDA with AlphaVentures expires soon',
    body: 'This NDA expires in 45 days. Consider renewal if partnership is ongoing.',
    time: '2d ago',
    unread: false,
  },
  {
    id: 5,
    type: 'success' as const,
    title: 'Office Lease renewed successfully',
    body: 'Contract updated to reflect the new 3-year term effective Jul 1, 2026.',
    time: '3d ago',
    unread: false,
  },
]

const iconMap = {
  critical: AlertTriangle,
  warning: Clock,
  info: FileText,
  success: CheckCircle,
}

const colorMap = {
  critical: 'text-crimson bg-crimson-dim/40',
  warning: 'text-amber bg-amber-dim/40',
  info: 'text-electric bg-electric-dim/30',
  success: 'text-emerald bg-emerald-dim/30',
}

export default function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState(notifications)

  const unreadCount = items.filter((n) => n.unread).length

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  function dismiss(id: number) {
    setItems((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        className="relative p-1.5 rounded-lg text-cool-muted hover:text-cool-white hover:bg-slate-mid/30 transition-colors cursor-pointer"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-crimson text-[9px] font-bold text-white flex items-center justify-center leading-none">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute left-0 top-8 z-50 w-80 bg-slate-dark border border-slate-mid/40 rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-mid/30">
                <h3 className="text-sm font-semibold text-cool-white">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] text-electric hover:text-electric/80 transition-colors cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                  <button onClick={() => setOpen(false)} className="text-cool-muted hover:text-cool-white transition-colors cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto max-h-80 divide-y divide-slate-mid/20">
                {items.length === 0 ? (
                  <div className="py-10 text-center text-cool-muted text-sm">All caught up.</div>
                ) : (
                  items.map((n) => {
                    const Icon = iconMap[n.type]
                    return (
                      <div
                        key={n.id}
                        className={`px-4 py-3 flex gap-3 hover:bg-slate-mid/20 transition-colors ${n.unread ? 'bg-slate-mid/10' : ''}`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 ${colorMap[n.type]}`}>
                          <Icon className="w-3 h-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-xs font-medium leading-tight ${n.unread ? 'text-cool-white' : 'text-cool-muted'}`}>
                              {n.title}
                            </p>
                            {n.unread && (
                              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-electric mt-1" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-light mt-1 leading-relaxed">{n.body}</p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[10px] text-slate-light font-[family-name:var(--font-mono)]">{n.time}</span>
                            <button
                              onClick={() => dismiss(n.id)}
                              className="text-[10px] text-slate-light hover:text-cool-muted transition-colors cursor-pointer"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
