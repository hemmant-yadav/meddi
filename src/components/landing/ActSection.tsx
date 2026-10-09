import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageSquare,
  Stethoscope,
  Languages,
  ArrowRight,
  HelpCircle,
  Copy,
  Sparkles,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TiltCardProps {
  children: React.ReactNode
  className?: string
}

const TiltCard: React.FC<TiltCardProps> = ({ children, className = '' }) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [transformStyle, setTransformStyle] = useState<string>('')

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left // x position within element
    const y = e.clientY - rect.top // y position within element

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Max tilt angle (degrees)
    const rotateX = ((y - centerY) / centerY) * -10
    const rotateY = ((x - centerX) / centerX) * 10

    setTransformStyle(
      `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`
    )
  }

  const handleMouseLeave = () => {
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)')
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transformStyle,
        transition: 'transform 0.15s ease-out',
        transformStyle: 'preserve-3d',
      }}
      className={`liquid-glass rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden group ${className}`}
    >
      {/* Subtle shine follower */}
      <div
        className="absolute inset-0 bg-gradient-to-tr from-white/[0.04] via-transparent to-white/[0.08] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        aria-hidden="true"
      />
      <div className="relative z-10 flex flex-col justify-between h-full">{children}</div>
    </div>
  )
}

export const ActSection: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<'kannada' | 'hindi' | 'tamil' | 'telugu'>('kannada')
  const [copiedQuestion, setCopiedQuestion] = useState(false)

  const translations = {
    kannada: {
      lang: 'ಕನ್ನಡ (Kannada)',
      phrase: 'ನಿಮ್ಮ ರಕ್ತ ಪರೀಕ್ಷೆಯ ಫಲಿತಾಂಶ: ಗ್ಲೂಕೋಸ್ ಮಟ್ಟವು ಸಾಮಾನ್ಯಕ್ಕಿಂತ ಸ್ವಲ್ಪ ಹೆಚ್ಚಾಗಿದೆ. ನಿಮ್ಮ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    },
    hindi: {
      lang: 'हिन्दी (Hindi)',
      phrase: 'आपकी रक्त रिपोर्ट: ग्लूकोज का स्तर सामान्य संदर्भ से थोड़ा अधिक है। अपने डॉक्टर से परामर्श करें।',
    },
    tamil: {
      lang: 'தமிழ் (Tamil)',
      phrase: 'உங்கள் இரத்த பரிசோதனை: குளுக்கோஸ் அளவு இயல்பை விட சற்று அதிகமாக உள்ளது. மருத்துவரிடம் ஆலோசிக்கவும்.',
    },
    telugu: {
      lang: 'తెలుగు (Telugu)',
      phrase: 'మీ రక్త పరీక్ష ఫలితం: గ్లూకోజ్ స్థాయి సాధారణ పరిమితి కంటే కొద్దిగా ఎక్కువగా ఉంది. వైద్యుడిని సంప్రదించండి.',
    },
  }

  const handleCopy = () => {
    setCopiedQuestion(true)
    setTimeout(() => setCopiedQuestion(false), 2000)
  }

  return (
    <section id="act-section" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-400 font-medium mb-4 select-none">
          <Sparkles className="size-3.5" aria-hidden="true" />
          <span>Section 3 • Act</span>
        </div>
        <h2 className="font-headline text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
          Turn Clinical Insights Into Confident Action
        </h2>
        <p className="text-hero-sub text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Knowledge is only powerful when you can use it. Meddibuddy arms you with doctor discussion checklists, instant AI inquiries, and regional native language explanations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* CARD 1: Ask questions */}
        <TiltCard>
          <div>
            <div className="size-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 shadow-sm">
              <MessageSquare className="size-6" aria-hidden="true" />
            </div>
            <h3 className="font-headline text-2xl font-bold text-white mb-2">Ask Questions</h3>
            <p className="text-hero-sub text-sm leading-relaxed mb-6">
              Curious about a specific abbreviation or clinical term? Ask questions in plain language without fear of judgment.
            </p>

            {/* Interactive simulation */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3 mb-6">
              <div className="flex items-start gap-2 text-xs text-slate-300">
                <HelpCircle className="size-4 text-blue-400 shrink-0 mt-0.5" />
                <span>"Why is my Creatinine level important if my kidneys feel fine?"</span>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-200 leading-relaxed">
                <span className="font-semibold block text-blue-300 mb-1">Meddibuddy Explainer:</span>
                Creatinine is a waste product from normal muscle wear. Healthy kidneys continuously filter it out. Even without symptoms, monitoring it confirms normal filtration efficiency.
              </div>
            </div>
          </div>

          <Link to="/dashboard">
            <Button variant="heroSecondary" className="w-full text-xs font-semibold py-2.5">
              Launch Interactive Explainer <ArrowRight className="size-3.5 ml-1" />
            </Button>
          </Link>
        </TiltCard>

        {/* CARD 2: Questions for your doctor */}
        <TiltCard>
          <div>
            <div className="size-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 shadow-sm">
              <Stethoscope className="size-6" aria-hidden="true" />
            </div>
            <h3 className="font-headline text-2xl font-bold text-white mb-2">
              Questions For Your Doctor
            </h3>
            <p className="text-hero-sub text-sm leading-relaxed mb-6">
              Don't freeze during your 15-minute consultation. Meddibuddy curates customized, respectful questions for your physician.
            </p>

            {/* Curated questions list */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2 mb-6 text-xs text-slate-300">
              <div className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.03]">
                <span className="text-indigo-400 font-bold">•</span>
                <span>"Do you recommend repeating fasting glucose with an HbA1c test?"</span>
              </div>
              <div className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.03]">
                <span className="text-indigo-400 font-bold">•</span>
                <span>"Are there specific dietary shifts before my next scheduled lab?"</span>
              </div>
              <div className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.03]">
                <span className="text-indigo-400 font-bold">•</span>
                <span>"When should we re-evaluate these markers?"</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleCopy}
            variant="heroSecondary"
            className="w-full text-xs font-semibold py-2.5"
          >
            {copiedQuestion ? (
              <>
                <Check className="size-3.5 text-emerald-400 mr-1" /> Copied Checklist
              </>
            ) : (
              <>
                <Copy className="size-3.5 mr-1" /> Copy Doctor Questions
              </>
            )}
          </Button>
        </TiltCard>

        {/* CARD 3: Explain in Kannada/Hindi/Tamil/Telugu */}
        <TiltCard>
          <div>
            <div className="size-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 shadow-sm">
              <Languages className="size-6" aria-hidden="true" />
            </div>
            <h3 className="font-headline text-2xl font-bold text-white mb-2">
              Explain In Your Language
            </h3>
            <p className="text-hero-sub text-sm leading-relaxed mb-6">
              Healthcare equity starts with native language clarity. Understand results in Kannada, Hindi, Tamil, Telugu, and more.
            </p>

            {/* Interactive Language Selector */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {(['kannada', 'hindi', 'tamil', 'telugu'] as const).map((langKey) => (
                <button
                  key={langKey}
                  type="button"
                  onClick={() => setSelectedLanguage(langKey)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedLanguage === langKey
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {langKey.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Translated Display */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-6 text-xs text-slate-200 min-h-[96px] flex flex-col justify-center">
              <span className="text-[10px] text-purple-400 uppercase tracking-wider font-mono mb-1">
                {translations[selectedLanguage].lang}
              </span>
              <p className="leading-relaxed italic">"{translations[selectedLanguage].phrase}"</p>
            </div>
          </div>

          <Link to="/dashboard/translate">
            <Button variant="heroSecondary" className="w-full text-xs font-semibold py-2.5">
              Open Multilingual Explainer <ArrowRight className="size-3.5 ml-1" />
            </Button>
          </Link>
        </TiltCard>
      </div>
    </section>
  )
}

export default ActSection
