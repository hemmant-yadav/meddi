import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ArrowDown,
  ArrowUp,
  HelpCircle,
  MessageSquare,
  Info,
  BookOpen,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { RangeIndicator } from './RangeIndicator'
import { useNavigate } from 'react-router-dom'

type TestStatus = 'within_range' | 'below_range' | 'above_range' | 'unclear'

export interface TestResultCardData {
  name: string
  value: string
  unit: string
  referenceRange: string
  status: TestStatus
  simpleExplanation: string
  educationalContext: string
}

interface TestResultCardProps {
  test: TestResultCardData
  reportId?: string
  index?: number
}

const STATUS_META: Record<
  TestStatus,
  {
    label: string
    icon: LucideIcon
    bg: string
    iconColor: string
    labelColor: string
    border: string
    badgeBg: string
  }
> = {
  within_range: {
    label: 'Within Range',
    icon: CheckCircle2,
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    labelColor: 'text-emerald-700',
    border: 'border-emerald-100',
    badgeBg: 'bg-emerald-100 text-emerald-800',
  },
  below_range: {
    label: 'Below Range',
    icon: ArrowDown,
    bg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    labelColor: 'text-sky-700',
    border: 'border-sky-100',
    badgeBg: 'bg-sky-100 text-sky-800',
  },
  above_range: {
    label: 'Above Range',
    icon: ArrowUp,
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    labelColor: 'text-amber-700',
    border: 'border-amber-100',
    badgeBg: 'bg-amber-100 text-amber-800',
  },
  unclear: {
    label: 'Unclear',
    icon: HelpCircle,
    bg: 'bg-slate-50',
    iconColor: 'text-slate-400',
    labelColor: 'text-slate-500',
    border: 'border-slate-100',
    badgeBg: 'bg-slate-100 text-slate-600',
  },
}

export const TestResultCard: React.FC<TestResultCardProps> = ({ test, reportId, index = 0 }) => {
  const [expanded, setExpanded] = useState(false)
  const navigate = useNavigate()
  const cardRef = useRef<HTMLDivElement>(null)
  const meta = STATUS_META[test.status]
  const StatusIcon = meta.icon
  const isOutsideRange = test.status === 'below_range' || test.status === 'above_range'

  const handleExplainFurther = () => {
    const prefilledMessage = `Can you explain more about my ${test.name} result of ${test.value} ${test.unit}?`
    const params = new URLSearchParams({
      reportId: reportId || '',
      q: prefilledMessage,
    })
    navigate(`/dashboard/ask?${params.toString()}`)
  }

  return (
    <motion.article
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94], delay: index * 0.05 }}
      className={`bg-white rounded-2xl border ${meta.border} shadow-sm overflow-hidden`}
      aria-label={`Test result for ${test.name}: ${test.value} ${test.unit}, ${meta.label}`}
    >
      {/* Card Header */}
      <div className={`${isOutsideRange ? meta.bg : 'bg-white'} px-5 py-4`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* Status icon */}
            <div className={`mt-0.5 shrink-0 p-1.5 rounded-lg ${meta.bg} border ${meta.border}`}>
              <StatusIcon
                className={`size-4 ${meta.iconColor}`}
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 text-sm leading-snug">{test.name}</h3>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-bold text-slate-900 tabular-nums">
                  {test.value}
                </span>
                {test.unit && test.unit !== 'Not clearly detected' && (
                  <span className="text-sm text-slate-500 font-medium">{test.unit}</span>
                )}
              </div>
            </div>
          </div>

          {/* Status badge */}
          <span
            className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${meta.badgeBg}`}
            aria-label={`Status: ${meta.label}`}
          >
            <StatusIcon className="size-3" aria-hidden="true" />
            {meta.label}
          </span>
        </div>

        {/* Range Indicator */}
        <div className="mt-4">
          <RangeIndicator
            status={test.status}
            value={test.value}
            unit={test.unit !== 'Not clearly detected' ? test.unit : undefined}
            referenceRange={
              test.referenceRange !== 'Not clearly detected' ? test.referenceRange : undefined
            }
            testName={test.name}
          />
        </div>
      </div>

      {/* What is X? / What does my report show? */}
      <div className="px-5 py-4 border-t border-slate-100 space-y-3">
        {/* What does my report show? */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1.5">
            <BookOpen className="size-3.5 text-sky-500" aria-hidden="true" />
            What does my report show?
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">{test.simpleExplanation}</p>
        </div>

        {/* What is X? — expandable */}
        <div>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-2 text-xs font-semibold text-sky-600 hover:text-sky-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-1 rounded"
            aria-expanded={expanded}
            aria-controls={`educational-context-${test.name.replace(/\s+/g, '-').toLowerCase()}`}
          >
            <HelpCircle className="size-3.5" aria-hidden="true" />
            What is {test.name}?
            {expanded ? (
              <ChevronUp className="size-3.5" aria-hidden="true" />
            ) : (
              <ChevronDown className="size-3.5" aria-hidden="true" />
            )}
          </button>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                id={`educational-context-${test.name.replace(/\s+/g, '-').toLowerCase()}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="mt-2 bg-sky-50 rounded-xl px-4 py-3 text-sm text-slate-700 leading-relaxed border border-sky-100">
                  {test.educationalContext}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Important notice for out-of-range */}
      {isOutsideRange && (
        <div className="mx-5 mb-4 flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          <Info className="size-4 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong className="font-semibold">Important: </strong>
            A value outside a reference range does not by itself establish a diagnosis. Reference
            intervals can vary between laboratories, patient age, sex, and clinical context.
            Discuss this result with your healthcare professional.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="px-5 pb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={handleExplainFurther}
          className="flex items-center gap-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] px-4 py-2 rounded-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 shadow-sm"
          aria-label={`Ask more about ${test.name} in chat`}
        >
          <MessageSquare className="size-3.5" aria-hidden="true" />
          Explain Further
        </button>
        <span className="text-xs text-slate-400 italic">Opens chat pre-filled</span>
      </div>
    </motion.article>
  )
}
