import React from 'react'
import { motion } from 'framer-motion'
import {
  UploadCloud,
  FileSearch,
  Binary,
  Brain,
  FileCheck2,
  Check,
  Loader2,
  ShieldCheck,
  FileText,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ProcessingStage, ReportStatus } from '@/types'

interface ProcessingAnimationProps {
  currentStage: ReportStatus
  fileName: string
  fileSize?: string
  reportType?: string
}

interface StageConfig {
  key: ProcessingStage
  title: string
  label: string
  description: string
  icon: LucideIcon
}

const STAGES: StageConfig[] = [
  {
    key: 'uploading',
    title: 'Uploading Securely',
    label: 'Upload',
    description: 'Encrypting and saving original file to your private storage vault.',
    icon: UploadCloud,
  },
  {
    key: 'reading',
    title: 'Scanning Document Layers',
    label: 'Scan & Read',
    description: 'Detecting text coordinates and reading high-fidelity clinical layers.',
    icon: FileSearch,
  },
  {
    key: 'extracting',
    title: 'Extracting Clinical Data',
    label: 'Extract Data',
    description: 'Parsing biomarkers, numerical test values, and standard laboratory ranges.',
    icon: Binary,
  },
  {
    key: 'understanding',
    title: 'Synthesizing with Medical AI',
    label: 'AI Explainer',
    description: 'Translating complex medical terminology into clear, accessible plain English.',
    icon: Brain,
  },
  {
    key: 'preparing',
    title: 'Finalizing Patient Insights',
    label: 'Summary & Qs',
    description: 'Compiling suggested physician discussion questions and educational takeaways.',
    icon: FileCheck2,
  },
]

const STAGE_ORDER: ProcessingStage[] = [
  'uploading',
  'reading',
  'extracting',
  'understanding',
  'preparing',
]

export const ProcessingAnimation: React.FC<ProcessingAnimationProps> = ({
  currentStage,
  fileName,
  fileSize,
  reportType,
}) => {
  // Determine index of current stage
  const currentIndex = STAGE_ORDER.indexOf(currentStage as ProcessingStage)
  const isCompleted = currentStage === 'ready'
  const isFailed = currentStage === 'failed'

  const activeStageConfig =
    STAGES.find((s) => s.key === currentStage) || STAGES[STAGES.length - 1]

  const ActiveIcon = activeStageConfig.icon

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-lg shadow-sky-500/5 p-6 sm:p-8 space-y-8">
      {/* File Header pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
            <FileText className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{fileName}</p>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              {fileSize && <span>{fileSize}</span>}
              {reportType && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="font-medium text-sky-700">{reportType}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-100">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          <span>Private & Protected</span>
        </div>
      </div>

      {/* Main Focus Radar Area for Current Active Real Stage */}
      <div className="text-center space-y-4 py-2">
        <div className="relative inline-flex items-center justify-center">
          {/* Pulsating glow rings */}
          <motion.div
            animate={{ scale: [1, 1.35, 1], opacity: [0.35, 0.1, 0.35] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute size-24 rounded-full bg-sky-400 blur-md pointer-events-none"
          />
          <div className="relative size-20 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-sky-500/30">
            <ActiveIcon className="size-9 animate-pulse" aria-hidden="true" />
          </div>
        </div>

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-xs font-medium mb-2">
            <Loader2 className="size-3 animate-spin text-sky-600" aria-hidden="true" />
            <span>Active Real-Time Stage</span>
          </div>

          <h3 className="text-xl font-bold font-headline text-slate-900 tracking-tight">
            {activeStageConfig.title}
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
            {activeStageConfig.description}
          </p>
        </div>
      </div>

      {/* Progress Stepper with 5 Real Stages (No Fake Percentages) */}
      <div className="space-y-3 pt-2 border-t border-slate-100" role="list" aria-label="Processing stages">
        {STAGES.map((stage, idx) => {
          const isDone = isCompleted || (currentIndex !== -1 && idx < currentIndex)
          const isCurrent = !isCompleted && !isFailed && idx === currentIndex
          const isUpcoming = !isCompleted && !isDone && !isCurrent
          const StageIcon = stage.icon

          return (
            <div
              key={stage.key}
              role="listitem"
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-300 ${
                isCurrent
                  ? 'bg-sky-50/70 border-sky-200 shadow-xs'
                  : isDone
                  ? 'bg-white border-slate-200/60'
                  : 'bg-slate-50/40 border-slate-100 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3.5">
                {/* Step indicator avatar */}
                <div
                  className={`size-8 rounded-lg flex items-center justify-center transition-colors ${
                    isDone
                      ? 'bg-emerald-100 text-emerald-700'
                      : isCurrent
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isDone ? (
                    <Check className="size-4 stroke-[2.5]" aria-hidden="true" />
                  ) : isCurrent ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <StageIcon className="size-4" aria-hidden="true" />
                  )}
                </div>

                <div>
                  <span
                    className={`text-sm font-semibold ${
                      isCurrent
                        ? 'text-sky-900'
                        : isDone
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {stage.label}
                  </span>
                  <p className="text-xs text-slate-500 hidden sm:block mt-0.5">
                    {stage.description}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="text-right">
                {isDone && (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    Completed
                  </span>
                )}
                {isCurrent && (
                  <span className="text-xs font-semibold text-sky-700 bg-sky-100/70 px-2.5 py-1 rounded-full animate-pulse">
                    In Progress
                  </span>
                )}
                {isUpcoming && (
                  <span className="text-xs text-slate-400">Waiting</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Educational Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs leading-relaxed flex items-start gap-2.5">
        <span className="font-bold text-amber-800 shrink-0">Educational Safety Note:</span>
        <span>
          Meddibuddy processes laboratory parameters strictly to explain their textbook scientific function.
          This system never formulates medical diagnoses, writes prescriptions, or advises changing doses.
        </span>
      </div>
    </div>
  )
}
