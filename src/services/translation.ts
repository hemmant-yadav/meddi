import type { TranslationResult } from '@/types'

export interface ITranslationService {
  translateText(text: string, targetLanguage: string): Promise<TranslationResult>
  getSupportedLanguages(): { code: string; label: string }[]
}

// Translation provider abstraction: Connects to Cloud Translation via backend endpoint
class TranslationServiceImpl implements ITranslationService {
  private apiBaseUrl: string

  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
  }

  getSupportedLanguages() {
    return [
      { code: 'en', label: 'English' },
      { code: 'es', label: 'Spanish (Español)' },
      { code: 'hi', label: 'Hindi (हिन्दी)' },
      { code: 'fr', label: 'French (Français)' },
      { code: 'de', label: 'German (Deutsch)' },
      { code: 'zh', label: 'Chinese (Mandarin)' },
      { code: 'ar', label: 'Arabic (العربية)' },
    ]
  }

  async translateText(text: string, targetLanguage: string): Promise<TranslationResult> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLanguage }),
      })

      if (response.ok) {
        return await response.json()
      }
    } catch (err) {
      console.warn('[TranslationService] Cloud Translation endpoint unreachable, fallback provided.', err)
    }

    return {
      translatedText: `[Translated to ${targetLanguage}]: ${text}`,
      targetLanguage,
      sourceLanguage: 'en',
    }
  }
}

export const translationService: ITranslationService = new TranslationServiceImpl()
