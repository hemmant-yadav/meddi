import React from 'react'
import { ShieldCheck, Info } from 'lucide-react'

export const SafetyBanner: React.FC = () => {
  return (
    <aside
      className="max-w-4xl mx-auto px-4 sm:px-6 my-12"
      role="region"
      aria-label="Medical Educational Notice"
    >
      <div className="liquid-glass rounded-2xl p-5 sm:p-6 border border-indigo-500/20 bg-indigo-950/20 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="size-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </div>

        <div className="flex-1 text-left space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-indigo-300 font-mono">
              Educational & Informational Standard
            </span>
            <span className="size-1 rounded-full bg-indigo-400" />
            <span className="text-[11px] text-hero-sub/60 hidden sm:inline">Physician First</span>
          </div>

          <p className="text-hero-sub text-xs sm:text-sm leading-relaxed">
            Meddibuddy provides educational explanations of information contained in medical documents.
            It does not diagnose diseases, prescribe treatments, or replace professional medical advice.
          </p>
        </div>

        <div className="shrink-0 self-end sm:self-center">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] text-[11px] text-hero-sub/80 border border-white/5 font-medium">
            <Info className="size-3 text-indigo-400" />
            Educational Only
          </span>
        </div>
      </div>
    </aside>
  )
}

export default SafetyBanner
