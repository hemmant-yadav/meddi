import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Sparkles,
  ArrowRight,
  ScanLine,
  FileSearch,
  MessageSquareCheck,
  Languages,
  Shield,
  AlertCircle,
  FileCheck2,
} from 'lucide-react'

export const LandingPage: React.FC = () => {
  const marqueeItems = [
    'Blood Glucose (CMP)',
    'Complete Blood Count (CBC)',
    'Lipid Profile (Cholesterol)',
    'Thyroid Stimulating Hormone (TSH)',
    'Liver Function (ALT/AST)',
    'Kidney Biomarkers (eGFR/Creatinine)',
    'HbA1c Glycemic Index',
    'Vitamin D & B12 Levels',
  ]

  return (
    <div className="relative overflow-hidden">
      {/* Background Cinematic Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-700/20 via-violet-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 text-center max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass text-xs font-medium text-white mb-8"
        >
          <Sparkles className="size-3.5 text-blue-400" aria-hidden="true" />
          <span>Making medical information easier for everyone</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-headline text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.08] mb-6"
        >
          Scan. Understand.{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            Act.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg md:text-xl text-hero-sub max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Demystify complex lab results, blood panels, and clinical documents in seconds.
          Meddibuddy turns cryptic medical jargon into clear, digestible knowledge and targeted questions for your doctor.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/dashboard">
            <Button variant="heroPrimary" size="xl" className="w-full sm:w-auto text-base">
              Explore Demo Dashboard
              <ArrowRight className="size-4 ml-2" aria-hidden="true" />
            </Button>
          </Link>
          <Link to="/dashboard/upload">
            <Button variant="heroSecondary" size="xl" className="w-full sm:w-auto text-base px-8">
              Upload Sample Report
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Marquee Section */}
      <section className="py-8 border-y border-white/10 bg-white/[0.01] overflow-hidden" aria-label="Supported medical panels">
        <div className="flex w-[200%] animate-marquee">
          <div className="flex shrink-0 items-center gap-8 px-4 justify-around w-1/2">
            {marqueeItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-hero-sub font-medium">
                <FileCheck2 className="size-4 text-blue-400" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-8 px-4 justify-around w-1/2">
            {marqueeItems.map((item, idx) => (
              <div key={`dup-${idx}`} className="flex items-center gap-2 text-sm text-hero-sub font-medium">
                <FileCheck2 className="size-4 text-blue-400" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-headline text-3xl sm:text-4xl font-bold text-white mb-4">
            Designed for Clarity & Patient Empowerment
          </h2>
          <p className="text-hero-sub text-base">
            Never leave a clinic feeling uncertain about your laboratory paperwork again.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl liquid-glass border border-white/10 flex flex-col items-start text-left">
            <div className="size-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
              <ScanLine className="size-6" aria-hidden="true" />
            </div>
            <h3 className="font-headline text-xl font-semibold text-white mb-2">1. Rapid Optical Ingestion</h3>
            <p className="text-hero-sub text-sm leading-relaxed">
              Powered by Document AI to recognize standard clinical tables, reference ranges, and diagnostic metrics accurately.
            </p>
          </div>

          <div className="p-8 rounded-2xl liquid-glass border border-white/10 flex flex-col items-start text-left">
            <div className="size-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
              <FileSearch className="size-6" aria-hidden="true" />
            </div>
            <h3 className="font-headline text-xl font-semibold text-white mb-2">2. Plain-Language Summaries</h3>
            <p className="text-hero-sub text-sm leading-relaxed">
              Gemini translates medical acronyms into straightforward context without scary clinical speculation.
            </p>
          </div>

          <div className="p-8 rounded-2xl liquid-glass border border-white/10 flex flex-col items-start text-left">
            <div className="size-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-6">
              <MessageSquareCheck className="size-6" aria-hidden="true" />
            </div>
            <h3 className="font-headline text-xl font-semibold text-white mb-2">3. Doctor Discussion Points</h3>
            <p className="text-hero-sub text-sm leading-relaxed">
              Generates relevant, tailored questions so you can make the most out of every minute with your physician.
            </p>
          </div>
        </div>
      </section>

      {/* Safety & Compliance Section */}
      <section id="safety" className="py-20 border-t border-white/10 bg-white/[0.01]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center justify-center size-12 rounded-full bg-blue-500/10 text-blue-400 mb-6">
            <Shield className="size-6" aria-hidden="true" />
          </div>
          <h2 className="font-headline text-3xl font-bold text-white mb-4">
            Strict Ethical Guardrails
          </h2>
          <p className="text-hero-sub leading-relaxed mb-8">
            Meddibuddy is built with rigorous educational safety principles. We never replace the doctor-patient relationship:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
              <div className="flex items-center gap-2 text-white font-semibold text-sm mb-1">
                <AlertCircle className="size-4 text-amber-400" aria-hidden="true" />
                No Diagnoses
              </div>
              <p className="text-xs text-hero-sub">We explain what metrics measure, not what condition you have.</p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
              <div className="flex items-center gap-2 text-white font-semibold text-sm mb-1">
                <AlertCircle className="size-4 text-amber-400" aria-hidden="true" />
                No Prescriptions
              </div>
              <p className="text-xs text-hero-sub">We never recommend, modify, or suggest changing drug regimens.</p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
              <div className="flex items-center gap-2 text-white font-semibold text-sm mb-1">
                <Languages className="size-4 text-blue-400" aria-hidden="true" />
                Multilingual Equity
              </div>
              <p className="text-xs text-hero-sub">Making reports clear across multiple languages and cultural contexts.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
