import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, Globe2 } from 'lucide-react'

interface LanguageItem {
  id: string
  name: string
  nativeName: string
  script: string
  sentence: string
  note: string
}

const LANGUAGES: LanguageItem[] = [
  {
    id: 'en',
    name: 'English',
    nativeName: 'English',
    script: 'Latin',
    sentence:
      'Your hemoglobin is 10.2 g/dL, slightly below the reference interval, which you can discuss with your doctor.',
    note: 'Standard clinical reference interval: 12.0 - 15.5 g/dL',
  },
  {
    id: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    script: 'Devanagari',
    sentence:
      'आपका हीमोग्लोबिन 10.2 g/dL है, जो संदर्भ सीमा से थोड़ा कम है, जिस पर आप अपने डॉक्टर से चर्चा कर सकते हैं।',
    note: 'मानक नैदानिक संदर्भ सीमा: 12.0 - 15.5 g/dL',
  },
  {
    id: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    script: 'Kannada',
    sentence:
      'ನಿಮ್ಮ ಹಿಮೋಗ್ಲೋಬಿನ್ 10.2 g/dL ಆಗಿದೆ, ಇದು ಸಾಮಾನ್ಯ ಉಲ್ಲೇಖ ಮಟ್ಟಕ್ಕಿಂತ ಸ್ವಲ್ಪ ಕಡಿಮೆಯಾಗಿದೆ, ಇದನ್ನು ನಿಮ್ಮ ವೈದ್ಯರೊಂದಿಗೆ ಚರ್ಚಿಸಬಹುದು.',
    note: 'ಪ್ರಮಾಣಿತ ಉಲ್ಲೇಖ ಮಿತಿ: 12.0 - 15.5 g/dL',
  },
  {
    id: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    script: 'Tamil',
    sentence:
      'உங்கள் ஹீமோகுளோபின் 10.2 g/dL ஆகும், இது நிலையான குறிப்பு அளவை விட சற்று குறைவாக உள்ளது, இதை உங்கள் மருத்துவரிடம் ஆலோசிக்கலாம்.',
    note: 'நிலையான மருத்துவ குறிப்பு வரம்பு: 12.0 - 15.5 g/dL',
  },
  {
    id: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    script: 'Telugu',
    sentence:
      'మీ హిమోగ్లోబిన్ 10.2 g/dL, ఇది సూచిక పరిమితి కంటే కొద్దిగా తక్కువగా ఉంది, దీనిని మీ వైద్యుడితో చర్చించవచ్చు.',
    note: 'ప్రామాణిక వైద్య సూచిక పరిమితి: 12.0 - 15.5 g/dL',
  },
]

export const LanguageShowcase: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Auto-cycle every 4 seconds unless user pauses / interacts
  useEffect(() => {
    if (isPaused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % LANGUAGES.length)
    }, 4200)

    return () => clearInterval(timer)
  }, [isPaused])

  const active = LANGUAGES[currentIndex]

  return (
    <section
      id="languages"
      className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10"
      aria-labelledby="languages-heading"
    >
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs text-purple-400 font-medium mb-4 select-none">
          <Globe2 className="size-3.5" aria-hidden="true" />
          <span>Multilingual Healthcare Equity</span>
        </div>
        <h2
          id="languages-heading"
          className="font-headline text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4"
        >
          Medical Reports in Your Mother Tongue
        </h2>
        <p className="text-hero-sub text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Critical health information should never be lost in translation. Meddibuddy fluently articulates diagnostic findings in major Indian and world languages.
        </p>
      </div>

      <div
        className="max-w-4xl mx-auto liquid-glass rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl relative overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Language Tabs */}
        <div
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8"
          role="tablist"
          aria-label="Select report explanation language"
        >
          {LANGUAGES.map((lang, idx) => {
            const isSelected = idx === currentIndex
            return (
              <button
                key={lang.id}
                role="tab"
                aria-selected={isSelected}
                onClick={() => {
                  setCurrentIndex(idx)
                  setIsPaused(true)
                }}
                className={`relative px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 flex items-center gap-2 select-none ${
                  isSelected
                    ? 'text-white bg-purple-600 shadow-lg shadow-purple-600/30'
                    : 'text-hero-sub hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5'
                }`}
              >
                <span>{lang.nativeName}</span>
                <span className="text-[11px] opacity-70 font-sans hidden sm:inline">({lang.name})</span>
              </button>
            )
          })}
        </div>

        {/* Swapping Sentence Box with AnimatePresence */}
        <div className="relative min-h-[160px] sm:min-h-[140px] flex items-center justify-center p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/10">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="text-center w-full"
            >
              <p className="text-xl sm:text-2xl md:text-3xl text-white font-medium leading-relaxed sm:leading-snug tracking-tight">
                "{active.sentence}"
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-hero-sub/70">
                <span className="font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  {active.name} ({active.script} Script)
                </span>
                <span>•</span>
                <span>{active.note}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer info bar */}
        <div className="mt-6 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-hero-sub/60 gap-3">
          <div className="flex items-center gap-2">
            <Volume2 className="size-4 text-purple-400" aria-hidden="true" />
            <span>Voice synthesis and phonetic pronunciation assistance supported</span>
          </div>
          <span className="text-[11px] text-hero-sub/40 font-mono">
            Powered by Google Cloud Translation
          </span>
        </div>
      </div>
    </section>
  )
}

export default LanguageShowcase
