import { en } from './locales/en'
import { hi } from './locales/hi'
import { kn } from './locales/kn'
import { ta } from './locales/ta'
import { te } from './locales/te'

export type LanguageCode = 'en' | 'hi' | 'kn' | 'ta' | 'te'

export interface LanguageMeta {
  code: LanguageCode
  label: string
  englishLabel: string
  flag: string
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'en', label: 'English', englishLabel: 'English', flag: '🇺🇸' },
  { code: 'hi', label: 'हिन्दी', englishLabel: 'Hindi', flag: '🇮🇳' },
  { code: 'kn', label: 'ಕನ್ನಡ', englishLabel: 'Kannada', flag: '🇮🇳' },
  { code: 'ta', label: 'தமிழ்', englishLabel: 'Tamil', flag: '🇮🇳' },
  { code: 'te', label: 'తెలుగు', englishLabel: 'Telugu', flag: '🇮🇳' },
]

export const translations: Record<LanguageCode, typeof en> = {
  en,
  hi,
  kn,
  ta,
  te,
}

/**
 * Resolves a dot-delimited key path (e.g. "nav.dashboard") in the given language.
 * Falls back to English, then to defaultText if not found.
 */
export function translate(
  lang: LanguageCode,
  key: string,
  params?: Record<string, string | number>,
  defaultText?: string
): string {
  const dict = translations[lang] || translations.en
  const parts = key.split('.')

  let current: any = dict
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part]
    } else {
      current = undefined
      break
    }
  }

  // Fallback to English if not found
  if (current === undefined && lang !== 'en') {
    let fallbackCurrent: any = translations.en
    for (const part of parts) {
      if (fallbackCurrent && typeof fallbackCurrent === 'object' && part in fallbackCurrent) {
        fallbackCurrent = fallbackCurrent[part]
      } else {
        fallbackCurrent = undefined
        break
      }
    }
    current = fallbackCurrent
  }

  let text: string = typeof current === 'string' ? current : defaultText || key

  if (params) {
    Object.entries(params).forEach(([paramKey, val]) => {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val))
    })
  }

  return text
}
