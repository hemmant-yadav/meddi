import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface AnimatedGradientTextProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode
  className?: string
}

export function AnimatedGradientText({
  children,
  className,
  ...props
}: AnimatedGradientTextProps) {
  return (
    <div
      className={cn(
        'group relative mx-auto flex max-w-fit flex-row items-center justify-center rounded-full px-4 py-1.5 text-xs font-medium backdrop-blur-md transition-shadow duration-500 ease-out select-none',
        'bg-white/[0.03] text-foreground/90 border border-white/10 hover:border-white/20 shadow-[0_0_15px_-3px_rgba(99,102,241,0.15)]',
        className
      )}
      {...props}
    >
      {/* Subtle moving beam background */}
      <div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-amber-500/10 opacity-70 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        aria-hidden="true"
      />
      <div className="relative z-10 flex items-center gap-2">{children}</div>
    </div>
  )
}

export default AnimatedGradientText
