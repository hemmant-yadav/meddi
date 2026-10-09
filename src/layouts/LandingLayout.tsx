import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ShieldCheck, Activity, ArrowRight } from 'lucide-react'

export const LandingLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Skip to Content for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 px-4 py-2 bg-blue-600 text-white rounded-md font-medium"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
            aria-label="Meddibuddy Home"
          >
            <div className="size-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Activity className="size-5" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-bold text-lg tracking-tight text-white">
                Meddibuddy
              </span>
              <span className="text-[10px] tracking-widest uppercase text-hero-sub font-mono -mt-1">
                Scan. Understand. Act.
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-hero-sub" aria-label="Main Navigation">
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#safety" className="hover:text-white transition-colors">
              Safety & Ethics
            </a>
            <Link to="/dashboard" className="hover:text-white transition-colors">
              Demo Preview
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-sm text-hero-sub hover:text-white">
                Log in
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="heroSecondary" size="sm" className="px-4">
                Launch App
                <ArrowRight className="size-3.5 ml-1" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      {/* Educational Disclaimer Banner & Footer */}
      <footer className="border-t border-white/10 bg-black/40 text-hero-sub text-xs py-8" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-start gap-3">
            <ShieldCheck className="size-5 text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-left space-y-1">
              <span className="font-semibold text-white tracking-wide block">
                IMPORTANT MEDICAL DISCLAIMER
              </span>
              <p className="text-hero-sub leading-relaxed">
                Meddibuddy is an educational tool designed exclusively to explain laboratory nomenclature and clinical terminology.
                It does <strong>NOT</strong> provide medical diagnoses, treatment decisions, or advice on changing prescription dosages.
                Always consult a certified physician or licensed healthcare provider regarding your health concerns and test results.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-white/5">
            <p>© {new Date().getFullYear()} Meddibuddy. Making medical information easier for everyone.</p>
            <div className="flex gap-6">
              <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#ethics" className="hover:text-white transition-colors">AI Safety Guidelines</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
