import React from 'react'
import { motion } from 'framer-motion'
import { Upload, ScanText, Sparkles, MessageCircleQuestion } from 'lucide-react'

const STEPS = [
  {
    step: '01',
    title: 'Upload / Scan',
    subtitle: 'Paper or Digital',
    desc: 'Snap a picture of a paper lab sheet or drag-and-drop a multi-page PDF directly from your patient portal.',
    icon: Upload,
    color: 'from-blue-500 to-indigo-500',
    iconColor: 'text-blue-400',
    badge: 'Step 1',
  },
  {
    step: '02',
    title: 'Extract',
    subtitle: 'Google Document AI',
    desc: 'Optical models parse complex tables, biomarker names, numerical units, and reference intervals with high fidelity.',
    icon: ScanText,
    color: 'from-indigo-500 to-purple-500',
    iconColor: 'text-indigo-400',
    badge: 'Step 2',
  },
  {
    step: '03',
    title: 'Explain Simply',
    subtitle: 'Gemini AI Synthesis',
    desc: 'Converts clinical jargon into plain, patient-friendly explanations with intuitive LOW/NORMAL/HIGH range bars.',
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500',
    iconColor: 'text-purple-400',
    badge: 'Step 3',
  },
  {
    step: '04',
    title: 'Ask Questions',
    subtitle: 'Doctor Prep & Follow-ups',
    desc: 'Generate targeted doctor discussion checklists and ask follow-up questions in your preferred native language.',
    icon: MessageCircleQuestion,
    color: 'from-amber-500 to-orange-500',
    iconColor: 'text-amber-400',
    badge: 'Step 4',
  },
]

export const HowItWorks: React.FC = () => {
  return (
    <section
      id="how-it-works"
      className="py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10"
      aria-labelledby="how-it-works-heading"
    >
      <div className="text-center max-w-3xl mx-auto mb-20">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 font-medium mb-4 select-none">
          <span>Seamless 4-Step Journey</span>
        </div>
        <h2
          id="how-it-works-heading"
          className="font-headline text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4"
        >
          How Meddibuddy Works
        </h2>
        <p className="text-hero-sub text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          From unreadable laboratory documents to empowered doctor consultations in four automated, secure steps.
        </p>
      </div>

      <div className="relative">
        {/* Animated Connecting Line (Desktop) */}
        <div className="hidden lg:block absolute top-1/2 left-[5%] right-[5%] -translate-y-8 h-[2px] z-0 pointer-events-none">
          <div className="w-full h-full bg-white/10 relative overflow-hidden rounded-full">
            <motion.div
              initial={{ x: '-100%' }}
              whileInView={{ x: '100%' }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="w-1/3 h-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
            />
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {STEPS.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                className="liquid-glass rounded-2xl p-6 sm:p-7 border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all duration-300 group hover:-translate-y-1"
              >
                <div>
                  {/* Top Bar with Icon and Step Number */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="size-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                      <Icon className={`size-6 ${item.iconColor}`} aria-hidden="true" />
                    </div>
                    <span className="font-mono text-xl font-bold text-white/30 group-hover:text-white/60 transition-colors">
                      {item.step}
                    </span>
                  </div>

                  {/* Step Badge */}
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-hero-sub/70 font-mono block mb-1">
                    {item.subtitle}
                  </span>

                  {/* Title */}
                  <h3 className="font-headline text-xl font-bold text-white mb-3">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-hero-sub text-xs sm:text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                {/* Subtle bottom indicator */}
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-hero-sub/50">
                  <span>{item.badge}</span>
                  <span className="text-white/20 group-hover:text-indigo-400 transition-colors">→</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
