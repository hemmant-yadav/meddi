import React from 'react'
import { AlertCircle } from 'lucide-react'

type TestStatus = 'within_range' | 'below_range' | 'above_range' | 'unclear'

interface RangeIndicatorProps {
  status: TestStatus
  value: string
  unit?: string
  referenceRange?: string
  testName: string
  className?: string
}

function parseRange(range?: string): { low?: number; high?: number } | null {
  if (!range) return null
  // Try formats like "70 - 99", "70-99", "< 5.6", "> 60", "< 200", "70–99"
  const dashMatch = range.match(/^([\d.]+)\s*[-–]\s*([\d.]+)/)
  if (dashMatch) {
    return { low: parseFloat(dashMatch[1]), high: parseFloat(dashMatch[2]) }
  }
  const ltMatch = range.match(/^<\s*([\d.]+)/)
  if (ltMatch) {
    return { high: parseFloat(ltMatch[1]) }
  }
  const gtMatch = range.match(/^>\s*([\d.]+)/)
  if (gtMatch) {
    return { low: parseFloat(gtMatch[1]) }
  }
  return null
}

function computeMarkerPercent(
  value: number,
  parsed: { low?: number; high?: number }
): number {
  const { low, high } = parsed
  if (low !== undefined && high !== undefined) {
    const range = high - low
    const buf = range * 0.5 // 50% padding on each side
    const min = low - buf
    const max = high + buf
    const clamped = Math.min(Math.max(value, min), max)
    return ((clamped - min) / (max - min)) * 100
  }
  if (high !== undefined) {
    const max = high * 1.5
    const clamped = Math.min(Math.max(value, 0), max)
    return (clamped / max) * 100
  }
  if (low !== undefined) {
    const max = low * 2
    const clamped = Math.min(Math.max(value, 0), max)
    return (clamped / max) * 100
  }
  return 50
}

const STATUS_CONFIG: Record<
  TestStatus,
  {
    label: string
    markerColor: string
    markerBorder: string
    rangeLabel: string
    textColor: string
    pattern: string
  }
> = {
  within_range: {
    label: 'Within Range',
    markerColor: 'bg-emerald-500',
    markerBorder: 'ring-2 ring-emerald-200',
    rangeLabel: 'NORMAL',
    textColor: 'text-emerald-700',
    pattern: '',
  },
  below_range: {
    label: 'Below Range',
    markerColor: 'bg-sky-500',
    markerBorder: 'ring-2 ring-sky-200',
    rangeLabel: 'LOW',
    textColor: 'text-sky-700',
    pattern: 'bg-sky-50',
  },
  above_range: {
    label: 'Above Range',
    markerColor: 'bg-amber-500',
    markerBorder: 'ring-2 ring-amber-200',
    rangeLabel: 'HIGH',
    textColor: 'text-amber-700',
    pattern: 'bg-amber-50',
  },
  unclear: {
    label: 'Unclear',
    markerColor: 'bg-slate-400',
    markerBorder: 'ring-2 ring-slate-200',
    rangeLabel: '—',
    textColor: 'text-slate-500',
    pattern: '',
  },
}

export const RangeIndicator: React.FC<RangeIndicatorProps> = ({
  status,
  value,
  unit,
  referenceRange,
  testName,
  className = '',
}) => {
  const config = STATUS_CONFIG[status]
  const numericValue = parseFloat(value)
  const parsedRange = parseRange(referenceRange)
  const hasValidBar =
    !isNaN(numericValue) && parsedRange !== null && status !== 'unclear'

  const markerPercent = hasValidBar
    ? computeMarkerPercent(numericValue, parsedRange!)
    : status === 'below_range'
    ? 15
    : status === 'above_range'
    ? 85
    : 50

  // Compose accessible ARIA label
  const ariaLabel = (() => {
    const base = `${testName}: ${value}${unit ? ' ' + unit : ''}`
    if (status === 'within_range') return `${base}, within the stated reference range ${referenceRange || ''}`
    if (status === 'below_range') return `${base}, below the stated range ${referenceRange || ''}`
    if (status === 'above_range') return `${base}, above the stated range ${referenceRange || ''}`
    return `${base}, reference range unclear or not detected`
  })()

  if (status === 'unclear' || !referenceRange || referenceRange === 'Not clearly detected') {
    return (
      <div className={`flex items-center gap-2 ${className}`} aria-label={ariaLabel}>
        <AlertCircle className="size-3.5 text-slate-400 shrink-0" aria-hidden="true" />
        <span className="text-xs text-slate-400 italic">
          Reference range not clearly detected in this report
        </span>
      </div>
    )
  }

  return (
    <div className={`space-y-1.5 ${className}`} role="img" aria-label={ariaLabel}>
      {/* Bar */}
      <div className="relative h-4 flex items-center">
        {/* Track background split into LOW | NORMAL | HIGH */}
        <div className="absolute inset-0 flex rounded-full overflow-hidden">
          <div className="flex-1 bg-sky-100" />
          <div className="flex-[2] bg-emerald-100" />
          <div className="flex-1 bg-amber-100" />
        </div>

        {/* Marker dot */}
        <div
          className={`absolute -translate-x-1/2 size-4 rounded-full shadow-md ${config.markerColor} ${config.markerBorder} z-10 transition-all duration-700 ease-out`}
          style={{ left: `${markerPercent}%` }}
          aria-hidden="true"
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-[10px] font-medium tracking-wide select-none">
        <span className={`${status === 'below_range' ? 'text-sky-600 font-bold' : 'text-slate-400'}`}>
          LOW
        </span>
        <span className={`${status === 'within_range' ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
          NORMAL
        </span>
        <span className={`${status === 'above_range' ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
          HIGH
        </span>
      </div>

      {/* Range text */}
      {referenceRange && (
        <p className="text-[10px] text-slate-400 text-center">
          Reference: {referenceRange}{unit ? ` ${unit}` : ''}
        </p>
      )}
    </div>
  )
}
