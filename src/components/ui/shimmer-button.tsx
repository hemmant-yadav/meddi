import React from 'react'
import { cn } from '@/utils/cn'

export interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string
  shimmerSize?: string
  borderRadius?: string
  shimmerDuration?: string
  children?: React.ReactNode
  className?: string
}

export const ShimmerButton = React.forwardRef<
  HTMLButtonElement,
  ShimmerButtonProps
>(
  (
    {
      shimmerColor = '#ffffff',
      borderRadius = '9999px',
      children,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        style={
          {
            borderRadius,
          } as React.CSSProperties
        }
        className={cn(
          'liquid-glass group relative cursor-pointer overflow-hidden whitespace-nowrap text-foreground transition-all duration-300 active:scale-[0.98] inline-flex items-center justify-center',
          className
        )}
        {...props}
      >
        {/* Subtle moving shimmer highlight */}
        <span
          className="absolute inset-0 block h-full w-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${shimmerColor}20, transparent 70%)`,
          }}
          aria-hidden="true"
        />

        {/* Ambient moving beam line */}
        <span
          className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer-slide_2s_infinite] pointer-events-none"
          aria-hidden="true"
        />

        {/* Content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
      </button>
    )
  }
)

ShimmerButton.displayName = 'ShimmerButton'
export default ShimmerButton
