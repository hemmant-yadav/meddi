import React from 'react'
import { motion } from 'framer-motion'
import { Lock, Trash2, ShieldCheck, Stethoscope } from 'lucide-react'
import { PrivacyBadge } from './PrivacyBadge'

const PRIVACY_PILLARS = [
  {
    icon: Lock,
    title: 'Private Reports',
    badgeText: 'Client-Isolated',
    badgeVariant: 'blue' as const,
    desc: 'Uploaded documents are encrypted in transit and at rest in secure Firebase Storage with strict per-user Security Rules.',
  },
  {
    icon: ShieldCheck,
    title: 'User-Only Access',
    badgeText: 'Zero Third-Party Resale',
    badgeVariant: 'emerald' as const,
    desc: 'Only you have access to your personal files. Your medical data is never sold, brokered, or used to train public AI models.',
  },
  {
    icon: Trash2,
    title: 'Delete Anytime',
    badgeText: 'Instant Permanent Purge',
    badgeVariant: 'amber' as const,
    desc: 'Want to delete your records? One single click permanently purges your PDF files, extracted OCR blocks, and synthesized summaries.',
  },
  {
    icon: Stethoscope,
    title: 'AI Explains, Never Diagnoses',
    badgeText: 'Educational Guardrail',
    badgeVariant: 'purple' as const,
    desc: 'We strictly define textbook terminology and clinical metrics. We never diagnose illnesses, prescribe medications, or alter therapy plans.',
  },
]

export const DataPrivacySection: React.FC = () => {
  return (
    <section
      id="privacy-section"
      className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10"
      aria-labelledby="privacy-heading"
    >
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          <PrivacyBadge
            icon={ShieldCheck}
            label="Privacy First"
            sublabel="Zero Compromises"
            variant="emerald"
          />
        </div>
        <h2
          id="privacy-heading"
          className="font-headline text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4"
        >
          Your Health Data Stays Under Your Control
        </h2>
        <p className="text-hero-sub text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Medical records are profoundly personal. We architected Meddibuddy with non-negotiable boundaries on data ownership, retention, and clinical safety.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {PRIVACY_PILLARS.map((pillar, idx) => {
          const Icon = pillar.icon
          return (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="liquid-glass rounded-2xl p-7 sm:p-8 border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all duration-300 group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="size-11 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                    <Icon className="size-5 text-indigo-400" aria-hidden="true" />
                  </div>
                  <PrivacyBadge
                    label={pillar.badgeText}
                    variant={pillar.badgeVariant}
                  />
                </div>

                <h3 className="font-headline text-xl font-bold text-white mb-2.5">
                  {pillar.title}
                </h3>
                <p className="text-hero-sub text-sm leading-relaxed">
                  {pillar.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-[11px] text-hero-sub/60">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                <span>Verified by automated security policies</span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

export default DataPrivacySection
