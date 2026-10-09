import React, { createContext, useContext, useState, useCallback } from 'react'
import {
  type LanguageCode,
  type LanguageMeta,
  SUPPORTED_LANGUAGES,
  translate,
} from '@/i18n'
import { firebaseService } from '@/services/firebase'

interface LanguageContextType {
  language: LanguageCode
  currentLanguageMeta: LanguageMeta
  supportedLanguages: LanguageMeta[]
  setLanguage: (lang: LanguageCode) => void
  t: (key: string, params?: Record<string, string | number>, defaultText?: string) => string
  getOrFetchReportTranslation: (reportId: string, targetLang?: LanguageCode) => Promise<any | null>
  isTranslatingReport: boolean
}

const STORAGE_KEY = 'meddibuddy_preferred_language'

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as LanguageCode | null
    if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
      return saved
    }
    return 'en'
  })

  const [isTranslatingReport, setIsTranslatingReport] = useState(false)

  const setLanguage = useCallback((newLang: LanguageCode) => {
    setLanguageState(newLang)
    try {
      localStorage.setItem(STORAGE_KEY, newLang)
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  const currentLanguageMeta =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0]

  const t = useCallback(
    (key: string, params?: Record<string, string | number>, defaultText?: string) => {
      return translate(language, key, params, defaultText)
    },
    [language]
  )

  /**
   * Fetches or retrieves cached translated report explanation in the active language.
   * Caches in Firestore per report+language.
   */
  const getOrFetchReportTranslation = useCallback(
    async (reportId: string, targetLang?: LanguageCode): Promise<any | null> => {
      const lang = targetLang || language
      if (lang === 'en') return null

      setIsTranslatingReport(true)
      try {
        const result = await firebaseService.getReportTranslation(reportId, lang)
        return result
      } catch (err) {
        console.warn(`[LanguageContext] Failed to get report translation for ${reportId} in ${lang}:`, err)
        return null
      } finally {
        setIsTranslatingReport(false)
      }
    },
    [language]
  )

  return (
    <LanguageContext.Provider
      value={{
        language,
        currentLanguageMeta,
        supportedLanguages: SUPPORTED_LANGUAGES,
        setLanguage,
        t,
        getOrFetchReportTranslation,
        isTranslatingReport,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return ctx
}
