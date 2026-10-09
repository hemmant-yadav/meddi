import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { BookOpen, Sparkles, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'

export const UnderstandSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // Phase 1: Raw Monospace Report (0 to 0.35)
  const rawOpacity = useTransform(scrollYProgress, [0, 0.25, 0.35], [1, 1, 0])
  const rawScale = useTransform(scrollYProgress, [0, 0.35], [1, 0.92])
  const rawY = useTransform(scrollYProgress, [0, 0.35], [0, -30])
  const rawPointerEvents = useTransform(scrollYProgress, (v) => (v < 0.35 ? 'auto' : 'none'))

  // Phase 2: Structured Test Cards (0.3 to 0.7)
  const structOpacity = useTransform(scrollYProgress, [0.3, 0.42, 0.6, 0.7], [0, 1, 1, 0])
  const structScale = useTransform(scrollYProgress, [0.3, 0.45, 0.65, 0.7], [0.92, 1, 1, 0.92])
  const structY = useTransform(scrollYProgress, [0.3, 0.45, 0.65, 0.7], [30, 0, 0, -30])
  const structPointerEvents = useTransform(scrollYProgress, (v) =>
    v >= 0.35 && v < 0.7 ? 'auto' : 'none'
  )

  // Phase 3: Clean Explanation Dashboard with Range Indicators (0.65 to 1.0)
  const cleanOpacity = useTransform(scrollYProgress, [0.65, 0.75, 1], [0, 1, 1])
  const cleanScale = useTransform(scrollYProgress, [0.65, 0.8, 1], [0.92, 1, 1])
  const cleanY = useTransform(scrollYProgress, [0.65, 0.8, 1], [30, 0, 0])
  const cleanPointerEvents = useTransform(scrollYProgress, (v) => (v >= 0.7 ? 'auto' : 'none'))

  // Progress indicator width
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <div ref={containerRef} className="relative h-[280vh] bg-background">
      {/* Scroll-pinned sticky viewport */}
      <div className="sticky top-0 h-screen flex flex-col justify-center items-center overflow-hidden px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Header & Step Progress Bar */}
        <div className="w-full max-w-4xl mx-auto mb-6 text-center select-none">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400 font-medium mb-3">
            <BookOpen className="size-3.5" aria-hidden="true" />
            <span>Section 2 • Understand (Scroll-Driven Morph)</span>
          </div>

          <h2 className="font-headline text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">
            From Cryptic Laboratory Code to Crystal Clarity
          </h2>
          <p className="text-hero-sub text-xs sm:text-sm max-w-xl mx-auto">
            Scroll smoothly down to see Gemini peel back layers of confusing clinical shorthand.
          </p>

          {/* Stepper Breadcrumb indicator */}
          <div className="mt-4 max-w-md mx-auto">
            <div className="flex justify-between text-[11px] font-mono text-hero-sub mb-1.5 px-1">
              <span>1. Raw Cryptic Printout</span>
              <span>2. Structured Extraction</span>
              <span>3. Plain-Language Ranges</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-400"
                style={{ width: progressWidth }}
              />
            </div>
          </div>
        </div>

        {/* Central Card Container where morphing happens */}
        <div className="relative w-full max-w-3xl h-[420px] sm:h-[440px] flex items-center justify-center">
          {/* ======================================================== */}
          {/* PHASE 1: MESSY RAW REPORT */}
          {/* ======================================================== */}
          <motion.div
            style={{
              opacity: rawOpacity,
              scale: rawScale,
              y: rawY,
              pointerEvents: rawPointerEvents,
            }}
            className="absolute inset-0 liquid-glass border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between font-mono text-xs shadow-2xl backdrop-blur-xl"
          >
            <div>
              <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4 text-hero-sub/70">
                <span>LAB_ID: #8921-X992 // SPECIMEN: SERUM</span>
                <span className="text-amber-400/90 font-bold">[RAW CLINICAL PRINTOUT]</span>
              </div>
              <div className="space-y-2 text-hero-sub/90 overflow-hidden leading-relaxed">
                <p className="text-red-400/80">
                  GLUCOSE_FAST: 108.00 mg/dL *FLAG:H [REF_INT: 70.00-99.00] TECH:AUTO_SPEC
                </p>
                <p>CREATININE_SER: 0.90 mg/dL [REF_INT: 0.60-1.20] MET:JAF_KIN</p>
                <p>BUN: 14.0 mg/dL [REF: 7.0-20.0] EGFR_EPI: 94 mL/min/1.73m2</p>
                <p className="text-amber-300/80">
                  HGB_A1C: 5.8 % *ELEVATED_PRED [REF_INT: 4.0-5.6] INTERP:NON_DIAG_SCREEN
                </p>
                <p>NA+: 140 mEq/L [136-145] // K+: 4.2 mEq/L [3.5-5.1] // CL-: 102 mEq/L</p>
                <p className="text-slate-500 text-[10px] pt-2">
                  *** CLINICAL COMMENT: CORRELATE WITH PATIENT SYMPTOMOLOGY AND FASTING PROTOCOL ***
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-center justify-between">
              <span>Patient Reaction: "What does FLAG:H mean? Is this alarming?"</span>
              <span className="text-xs font-sans text-hero-sub">Scroll to decode ↓</span>
            </div>
          </motion.div>

          {/* ======================================================== */}
          {/* PHASE 2: STRUCTURED TEST CARDS */}
          {/* ======================================================== */}
          <motion.div
            style={{
              opacity: structOpacity,
              scale: structScale,
              y: structY,
              pointerEvents: structPointerEvents,
            }}
            className="absolute inset-0 liquid-glass border border-indigo-500/30 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl backdrop-blur-xl"
          >
            <div>
              <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-sm font-semibold text-white">Parsed Biochemical Markers</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                  Document AI Extraction
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-xs text-hero-sub font-medium">Metabolic Glucose</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-bold text-white">108 mg/dL</span>
                    <span className="text-[10px] text-amber-400 font-medium bg-amber-500/10 px-1.5 py-0.5 rounded">
                      Above Reference
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">Reference: 70 - 99 mg/dL</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-xs text-hero-sub font-medium">Serum Creatinine</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-bold text-white">0.9 mg/dL</span>
                    <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      Standard Optimal
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">Reference: 0.6 - 1.2 mg/dL</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-xs text-hero-sub font-medium">Estimated GFR (Kidney)</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-bold text-white">94 mL/min</span>
                    <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      Healthy Filtration
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">Reference: &gt; 60 mL/min</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-xs text-hero-sub font-medium">HbA1c Glycemic Index</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-bold text-white">5.8 %</span>
                    <span className="text-[10px] text-amber-400 font-medium bg-amber-500/10 px-1.5 py-0.5 rounded">
                      Routine Review
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">Standard: 4.0 - 5.6 %</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-indigo-300 pt-2 border-t border-white/10">
              <span className="flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-indigo-400" />
                Raw tokens classified into standard anatomical categories
              </span>
              <span className="text-hero-sub/70">Scroll for visual range indicators →</span>
            </div>
          </motion.div>

          {/* ======================================================== */}
          {/* PHASE 3: CLEAN EXPLANATION DASHBOARD WITH RANGE INDICATOR */}
          {/* ======================================================== */}
          <motion.div
            style={{
              opacity: cleanOpacity,
              scale: cleanScale,
              y: cleanY,
              pointerEvents: cleanPointerEvents,
            }}
            className="absolute inset-0 liquid-glass border border-emerald-500/30 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl backdrop-blur-xl"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-white">
                    Patient Visual Indicator: Fasting Blood Glucose
                  </span>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
                  Gemini Synthesis
                </span>
              </div>

              {/* Range Indicator with Visual Slider Bar (LOW - NORMAL - HIGH) */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-hero-sub font-medium">Observed Value: 108 mg/dL</span>
                  <span className="text-amber-400 font-semibold">Mild Elevation (Post-Test Note)</span>
                </div>

                {/* Range Track */}
                <div className="relative pt-6 pb-2">
                  {/* The bar */}
                  <div className="h-3 w-full rounded-full flex overflow-hidden bg-slate-800">
                    <div className="w-[25%] bg-amber-500/40" title="Low range (< 70)" />
                    <div className="w-[50%] bg-emerald-500/60" title="Normal reference (70 - 99)" />
                    <div className="w-[25%] bg-amber-500/70" title="Elevated reference (> 99)" />
                  </div>

                  {/* Marker Dot for 108 mg/dL (positioned at ~78%) */}
                  <div
                    className="absolute top-2 left-[78%] -translate-x-1/2 flex flex-col items-center group cursor-pointer"
                    aria-label="Your test value: 108 mg/dL (slightly above standard)"
                  >
                    <span className="text-[10px] font-bold text-white bg-indigo-600 px-1.5 py-0.5 rounded shadow-md whitespace-nowrap mb-0.5">
                      You: 108
                    </span>
                    <div className="size-3.5 rounded-full bg-white border-2 border-indigo-600 shadow-lg ring-2 ring-indigo-400/50 animate-ping" />
                  </div>

                  {/* Range Labels */}
                  <div className="flex justify-between text-[10px] font-mono text-hero-sub mt-2">
                    <span className="text-amber-400/80">LOW (&lt;70)</span>
                    <span className="text-emerald-400 font-semibold">NORMAL (70 - 99)</span>
                    <span className="text-amber-400 font-semibold">HIGH (&gt;99)</span>
                  </div>
                </div>
              </div>

              {/* Plain-Language Explanation */}
              <p className="text-xs text-slate-200 leading-relaxed bg-white/[0.03] p-3 rounded-lg border border-white/5">
                <strong>Plain-language context:</strong> Fasting glucose measures the sugar circulation in your bloodstream after fasting. A reading of 108 mg/dL is mildly above standard reference limits, which may be influenced by meal timing, hydration, or metabolic factors.
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-hero-sub border-t border-white/10 pt-2.5">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <AlertCircle className="size-3.5" />
                No medical diagnosis rendered. Use during your next physician check-up.
              </span>
              <span className="text-white font-medium flex items-center gap-1">
                Proceed to Action Steps <ArrowRight className="size-3" />
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default UnderstandSection
