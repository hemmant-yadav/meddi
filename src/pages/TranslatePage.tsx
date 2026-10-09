import React, { useState } from 'react'
import { Languages, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { translationService } from '@/services/translation'

export const TranslatePage: React.FC = () => {
  const languages = translationService.getSupportedLanguages()
  const [sourceText, setSourceText] = useState(
    'Your Fasting Glucose level is 108 mg/dL. This is slightly above standard fasting reference limits. Your Kidney function markers, including Creatinine (0.9 mg/dL), remain in healthy reference intervals.'
  )
  const [targetLang, setTargetLang] = useState('es')
  const [translatedText, setTranslatedText] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)

  const handleTranslate = async () => {
    setIsTranslating(true)
    try {
      const res = await translationService.translateText(sourceText, targetLang)
      setTranslatedText(res.translatedText)
    } finally {
      setIsTranslating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-headline text-slate-900 tracking-tight">
          Multilingual Medical Explainer
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Make complex clinical conclusions accessible in your native language.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source Box */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Original English Summary
            </span>
          </div>
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            rows={8}
            className="w-full text-sm text-slate-800 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            aria-label="Source text to translate"
          />
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">Powered by Cloud Translation</span>
          </div>
        </div>

        {/* Target Box */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Target Language
            </span>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="text-xs bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              aria-label="Select Target Language"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <div className="min-h-[200px] text-sm text-slate-800 p-4 bg-sky-50/40 border border-sky-100 rounded-xl whitespace-pre-wrap">
            {translatedText ? (
              translatedText
            ) : (
              <span className="text-slate-400 italic">
                Select target language and click "Translate Summary" to see results...
              </span>
            )}
          </div>

          <Button
            onClick={handleTranslate}
            disabled={isTranslating}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-xl"
          >
            {isTranslating ? (
              <Sparkles className="size-4 animate-spin mr-2" aria-hidden="true" />
            ) : (
              <Languages className="size-4 mr-2" aria-hidden="true" />
            )}
            Translate Summary
          </Button>
        </div>
      </div>
    </div>
  )
}
