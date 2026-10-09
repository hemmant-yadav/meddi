import React from 'react'
import { cn } from '@/utils/cn'

export interface PrivacyBadgeProps {
  icon?: React.ComponentType<{ className?: string }>
  label: string
  sublabel?: string
  className?: string
  variant?: 'blue' | 'emerald' | 'amber' | 'purple'
}

export const PrivacyBadge: React.FC<PrivacyBadgeProps> = ({
  icon: Icon,
  label,
  sublabel,
  className,
  variant = 'blue',
}) => {
  const variantStyles = {
    blue: 'bg-blue-500/10 border-blue-500/25 text-blue-300',
    emerald: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300',
    amber: 'bg-amber-500/10 border-amber-500/25 text-amber-300',
    purple: 'bg-purple-500/10 border-purple-500/25 text-purple-300',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border backdrop-blur-md text-xs font-medium select-none shadow-sm transition-colors',
        variantStyles[variant],
        className
      )}
    >
      {Icon && <Icon className="size-3.5 shrink-0" />}
      <span className="font-semibold">{label}</span>
      {sublabel && (
        <>
          <span className="opacity-40">•</span>
          <span className="opacity-80 font-normal">{sublabel}</span>
        </>
      )}
    </div>
  )
}

export default PrivacyBadge
