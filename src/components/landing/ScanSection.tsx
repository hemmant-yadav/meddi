import React, { Suspense, lazy, useEffect, useState, useRef } from 'react'
import { Sparkles, Scan, FileCheck } from 'lucide-react'

// Lazy-load the Three.js Canvas
const Scan3DCanvas = lazy(() => import('./Scan3DCanvas'))

export const ScanSection: React.FC = () => {
  const [isInView, setIsInView] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true)
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="scan-section"
      ref={containerRef}
      className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10"
      aria-labelledby="scan-heading"
    >
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 font-medium mb-4 select-none">
          <Scan className="size-3.5" aria-hidden="true" />
          <span>Section 1 • Scan</span>
        </div>
        <h2
          id="scan-heading"
          className="font-headline text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4"
        >
          Watch Your Report Lift Into Focus
        </h2>
        <p className="text-hero-sub text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Google Document AI optical scanning sweeps across dense laboratory records, lifting isolated biomarkers and critical reference parameters into clean, verifiable digital values.
        </p>
      </div>

      {/* Accessible Screen Reader Alternative */}
      <div className="sr-only">
        Interactive 3D visualization showing a laboratory blood report being scanned. Extracted synthetic examples include Hemoglobin measuring 10.2 grams per deciliter (slightly below reference), Fasting Blood Glucose at 92 milligrams per deciliter (optimal), and Platelet count at 240,000 per microliter (normal).
      </div>

      {/* 3D Canvas or Accessible CSS Fallback */}
      <div className="relative rounded-3xl overflow-hidden liquid-glass border border-white/10 p-2 sm:p-6 shadow-2xl">
        {/* Soft background ambient gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-slate-950/40 to-black/80 pointer-events-none" />

        {prefersReducedMotion ? (
          /* Static CSS Fallback for Reduced-Motion & Low-End */
          <div className="py-16 px-6 text-center max-w-xl mx-auto space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-sm font-semibold text-white">Complete Blood Count (CBC)</span>
                <span className="text-xs text-blue-400 font-mono">Verified OCR</span>
              </div>
              <div className="space-y-2 text-left">
                <div className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-white/5">
                  <span className="text-slate-200">Hemoglobin (Hb)</span>
                  <span className="font-mono text-amber-400 font-semibold">10.2 g/dL (Below Range)</span>
                </div>
                <div className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-white/5">
                  <span className="text-slate-200">Fasting Glucose</span>
                  <span className="font-mono text-emerald-400 font-semibold">92 mg/dL (Optimal)</span>
                </div>
                <div className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-white/5">
                  <span className="text-slate-200">Platelets</span>
                  <span className="font-mono text-emerald-400 font-semibold">240,000 /µL (Normal)</span>
                </div>
              </div>
              <p className="text-[11px] text-hero-sub/70">[Synthetic demonstration data]</p>
            </div>
          </div>
        ) : (
          /* Dynamic 3D Experience (Lazy Loaded & In-View Only) */
          isInView && (
            <Suspense
              fallback={
                <div className="h-[520px] sm:h-[600px] flex items-center justify-center text-hero-sub text-sm">
                  <Sparkles className="size-5 animate-spin mr-2 text-blue-400" />
                  Loading interactive 3D scanner...
                </div>
              }
            >
              <Scan3DCanvas />
            </Suspense>
          )
        )}

        <div className="absolute bottom-4 left-6 right-6 flex flex-col sm:flex-row items-center justify-between text-xs text-hero-sub/60 border-t border-white/5 pt-3 pointer-events-none">
          <div className="flex items-center gap-1.5">
            <FileCheck className="size-3.5 text-blue-400" />
            <span>Interactive 3D extraction • Drag or move cursor to inspect sheet parallax</span>
          </div>
          <span className="font-mono text-[10px] text-hero-sub/40 mt-1 sm:mt-0">
            ALL VALUES ARE SYNTHETIC EXAMPLES
          </span>
        </div>
      </div>
    </section>
  )
}

export default ScanSection
