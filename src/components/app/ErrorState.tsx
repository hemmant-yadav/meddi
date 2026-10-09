import React from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an unexpected error. Please try again.',
  onRetry,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center text-center px-6 py-16 bg-white rounded-2xl border border-red-100"
      role="alert"
      aria-live="assertive"
    >
      <div className="size-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
        <AlertCircle className="size-7 text-red-400" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-500 max-w-xs leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Try Again
        </button>
      )}
    </motion.div>
  )
}
