'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, FileText, CheckCircle, Loader2 } from 'lucide-react'

type Stage = 'idle' | 'dragging' | 'uploading' | 'done'

interface UploadModalProps {
  onClose: () => void
}

export default function UploadModal({ onClose }: UploadModalProps) {
  const [stage, setStage] = useState<Stage>('idle')
  const [fileName, setFileName] = useState<string | null>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file) return
    processFile(file)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    processFile(file)
  }, [])

  function processFile(file: File) {
    setFileName(file.name)
    setStage('uploading')
    // Simulate analysis
    setTimeout(() => setStage('done'), 2200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-lg bg-slate-dark border border-slate-mid/40 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-mid/30">
          <div>
            <h2 className="text-base font-semibold text-cool-white">Upload Contract</h2>
            <p className="text-xs text-cool-muted mt-0.5">PDF, DOCX, or TXT — AI analyzes in seconds</p>
          </div>
          <button onClick={onClose} className="text-cool-muted hover:text-cool-white transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {stage === 'idle' || stage === 'dragging' ? (
              <motion.div
                key="drop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <label
                  htmlFor="file-input"
                  onDragOver={(e) => { e.preventDefault(); setStage('dragging') }}
                  onDragLeave={() => setStage('idle')}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center gap-4 border-2 border-dashed rounded-xl p-10 cursor-pointer transition-all duration-200 ${
                    stage === 'dragging'
                      ? 'border-electric bg-electric/5 scale-[1.01]'
                      : 'border-slate-mid/40 hover:border-electric/50 hover:bg-slate-mid/10'
                  }`}
                >
                  <div className={`p-4 rounded-full transition-colors ${stage === 'dragging' ? 'bg-electric/15' : 'bg-slate-mid/20'}`}>
                    <Upload className={`w-7 h-7 transition-colors ${stage === 'dragging' ? 'text-electric' : 'text-cool-muted'}`} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-cool-white">
                      {stage === 'dragging' ? 'Drop to upload' : 'Drag & drop your contract here'}
                    </p>
                    <p className="text-xs text-cool-muted mt-1">
                      or <span className="text-electric underline">browse files</span>
                    </p>
                  </div>
                  <input
                    id="file-input"
                    type="file"
                    accept=".pdf,.docx,.txt"
                    className="sr-only"
                    onChange={handleFileInput}
                  />
                </label>

                {/* Supported formats */}
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {['PDF', 'DOCX', 'TXT'].map((fmt) => (
                    <span key={fmt} className="px-2.5 py-1 rounded-md bg-slate-mid/30 text-[10px] font-mono text-cool-muted">
                      .{fmt.toLowerCase()}
                    </span>
                  ))}
                </div>

                {/* AI features */}
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    { label: 'Clause detection', icon: '🔍' },
                    { label: 'Risk scoring', icon: '⚡' },
                    { label: 'Key date extraction', icon: '📅' },
                  ].map(({ label, icon }) => (
                    <div key={label} className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-slate-mid/15 text-center">
                      <span className="text-lg">{icon}</span>
                      <span className="text-[10px] text-cool-muted">{label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : stage === 'uploading' ? (
              <motion.div
                key="uploading"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex flex-col items-center gap-6 py-8"
              >
                <div className="relative">
                  <div className="p-5 rounded-full bg-electric/10 border border-electric/20">
                    <FileText className="w-8 h-8 text-electric" />
                  </div>
                  <div className="absolute -right-1 -bottom-1">
                    <Loader2 className="w-5 h-5 text-electric animate-spin" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-cool-white">Analyzing contract…</p>
                  <p className="text-xs text-cool-muted mt-1 font-mono">{fileName}</p>
                </div>
                <div className="w-full space-y-3 max-w-xs">
                  {[
                    { label: 'Extracting clauses', done: true },
                    { label: 'Scoring risk factors', done: true },
                    { label: 'Identifying key dates', done: false },
                  ].map(({ label, done }, i) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.3 }}
                      className="flex items-center gap-2.5"
                    >
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${done ? 'bg-emerald' : 'bg-slate-mid/40'}`}>
                        {done && <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 fill-none stroke-navy" strokeWidth="2.5"><path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </div>
                      <span className={`text-xs ${done ? 'text-emerald' : 'text-cool-muted'}`}>{label}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-4 py-8 text-center"
              >
                <div className="p-4 rounded-full bg-emerald/10 border border-emerald/20">
                  <CheckCircle className="w-8 h-8 text-emerald" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-cool-white">Analysis complete!</p>
                  <p className="text-xs text-cool-muted mt-1">{fileName} — 14 clauses found, risk score: 58</p>
                </div>
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg bg-electric text-white text-sm font-medium hover:bg-electric/85 transition-colors cursor-pointer"
                  >
                    View contract
                  </button>
                  <button
                    onClick={() => { setStage('idle'); setFileName(null) }}
                    className="px-4 py-2 rounded-lg border border-slate-mid/40 text-cool-muted text-sm hover:text-cool-white hover:border-slate-mid transition-colors cursor-pointer"
                  >
                    Upload another
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
