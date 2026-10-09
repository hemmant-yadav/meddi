import React, { useEffect } from 'react'
import Lenis from 'lenis'
import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { ScanSection } from '@/components/landing/ScanSection'
import { UnderstandSection } from '@/components/landing/UnderstandSection'
import { ActSection } from '@/components/landing/ActSection'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { LanguageShowcase } from '@/components/landing/LanguageShowcase'
import { DataPrivacySection } from '@/components/landing/DataPrivacySection'
import { SafetyBanner } from '@/components/landing/SafetyBanner'
import { FinalCtaSection } from '@/components/landing/FinalCtaSection'
import { Footer } from '@/components/landing/Footer'

export const Landing: React.FC = () => {
  // Global Lenis smooth scrolling for landing page only
  useEffect(() => {
    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    let rafId: number
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }

    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-indigo-600 selection:text-white overflow-x-hidden">
      {/* Skip to Content for Accessibility */}
      <a
        href="#hero-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 px-4 py-2 bg-indigo-600 text-white rounded-md font-medium"
      >
        Skip to main content
      </a>

      {/* HERO SECTION WRAPPER: min-h-screen flex flex-col, overflow-hidden wrapper */}
      <section
        id="hero-main"
        className="min-h-screen flex flex-col overflow-hidden relative bg-background text-foreground"
      >
        {/* Navbar on top */}
        <Navbar />

        {/* Hero content & pinned marquee */}
        <Hero />
      </section>

      {/* SECTION A — "SCAN" (3D R3F Optical Ingestion Showcase) */}
      <ScanSection />

      {/* SECTION B — "UNDERSTAND" (Scroll-Pinned Interactive Morph) */}
      <UnderstandSection />

      {/* SECTION C — "ACT" (3D Tilt-on-Hover Glass Action Cards) */}
      <ActSection />

      {/* 1. HOW IT WORKS (4 Steps, Animated Connecting Line, Scroll Reveal) */}
      <HowItWorks />

      {/* 2. LANGUAGES (Smooth Swapping Sentence: En, Hi, Kn, Ta, Te) */}
      <LanguageShowcase />

      {/* 3. DATA PRIVACY & CONTROL (PrivacyBadge, Client-Encrypted, Delete Anytime) */}
      <DataPrivacySection />

      {/* 4. SAFETY BANNER (Calm, Visible Educational Guardrail) */}
      <SafetyBanner />

      {/* 5. FINAL CTA ("Analyze My Report" + "Try Demo Report") */}
      <FinalCtaSection />

      {/* 6. FOOTER (Taglines, Privacy, Terms, Clinical Validation Notice) */}
      <Footer />
    </div>
  )
}

export default Landing
