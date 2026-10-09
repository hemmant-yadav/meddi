import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

interface SafetyNoticeProps {
  onDismiss?: () => void
  compact?: boolean
}

export const SafetyNotice: React.FC<SafetyNoticeProps> = ({ onDismiss, compact = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-900 ${
        compact ? 'px-4 py-2.5 text-xs' : 'px-4 py-3 text-sm'
      }`}
      role="note"
      aria-label="Educational notice"
    >
      <AlertTriangle
        className={`shrink-0 mt-px text-amber-500 ${compact ? 'size-3.5' : 'size-4'}`}
        aria-hidden="true"
      />
      <p className="flex-1 leading-relaxed">
        <strong className="font-semibold">Educational only: </strong>
        Meddibuddy explains medical information for awareness. It does not diagnose diseases,
        prescribe treatments, or replace professional medical advice.
      </p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 p-0.5 rounded hover:bg-amber-200 transition-colors"
          aria-label="Dismiss notice"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      )}
    </motion.div>
  )
}
