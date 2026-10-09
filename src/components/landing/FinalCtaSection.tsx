import React from 'react'
import { Link } from 'react-router-dom'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react'

export const FinalCtaSection: React.FC = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10">
      <div className="relative liquid-glass rounded-3xl p-8 sm:p-14 border border-white/10 text-center overflow-hidden shadow-2xl">
        {/* Atmospheric radial gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs text-indigo-300 font-medium select-none">
            <Sparkles className="size-3.5 text-indigo-400" />
            <span>Ready for Clearer Health Conversations?</span>
          </div>

          <h2 className="font-headline text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
            Stop Guessing. Start Understanding Your Lab Work.
          </h2>

          <p className="text-hero-sub text-base sm:text-lg leading-relaxed">
            Join thousands of patients taking control of their healthcare consultations with clear summaries, visual metrics, and native language explanations.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="w-full sm:w-auto">
              <ShimmerButton className="w-full sm:w-auto px-[32px] py-[22px] rounded-full text-base font-semibold shadow-xl">
                <span>Analyze My Report</span>
                <ArrowRight className="size-4 ml-1" />
              </ShimmerButton>
            </Link>

            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button
                variant="ghost"
                className="w-full sm:w-auto text-base font-medium px-6 py-3 text-hero-sub hover:text-white"
              >
                Try Demo Report
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4 text-xs text-hero-sub/60">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-indigo-400" />
              <span>Zero Account Required for Demo</span>
            </div>
            <span>•</span>
            <span>No Credit Card</span>
            <span>•</span>
            <span>HIPAA-Aligned Architecture</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FinalCtaSection
