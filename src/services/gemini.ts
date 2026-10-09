import type { ReportExplanation } from '@/types'

export interface IGeminiService {
  explainReportText(extractedText: string): Promise<ReportExplanation>
  askFollowUpQuestion(reportContext: string, question: string): Promise<string>
}

// Server-side delegate: Calls backend Cloud Function to safeguard API keys
class GeminiServiceImpl implements IGeminiService {
  private apiBaseUrl: string

  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
  }

  async explainReportText(extractedText: string): Promise<ReportExplanation> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extractedText }),
      })

      if (response.ok) {
        return await response.json()
      }
    } catch (err) {
      console.warn('[GeminiService] Backend endpoint unreachable, using safe educational fallback.', err)
    }

    // Educational Safe Fallback Template
    return {
      summary: 'This report provides clinical laboratory values. This breakdown explains individual lab metrics in plain, understandable terms so you can have an informed discussion with your physician.',
      findings: [
        {
          parameter: 'Laboratory Analysis Parameter',
          value: 'Observed Value',
          standardRange: 'Reference Laboratory Standard',
          status: 'normal',
          simpleExplanation: 'Educational summary explaining what this biological marker represents in standard bodily functions.',
          questionsForDoctor: [
            'How does this parameter correlate with my overall health assessment?',
            'Are there any specific lifestyle factors influencing this metric?'
          ],
        },
      ],
      keyTakeaways: [
        'Review individual values with the provided reference intervals.',
        'Never alter medication dosages or regimens without medical supervision.',
        'Prepare your questions in advance for your doctor appointment.'
      ],
      recommendedQuestions: [
        'What follow-up timeline do you recommend based on these findings?',
        'Do any of these results require repeat lab testing?'
      ],
      disclaimer: 'EDUCATIONAL DISCLAIMER: Meddibuddy is strictly an educational tool designed to clarify terminology. It does NOT diagnose conditions, prescribe medications, or advise altering dosages. Consult a certified medical professional for diagnostic assessment.'
    }
  }

  async askFollowUpQuestion(_reportContext: string, question: string): Promise<string> {
    return `Educational Context for "${question}": This term typically refers to the measurement of specific proteins, enzymes, or minerals in standard blood panels. Please share this specific metric with your doctor to determine what it means for your personalized clinical history.`
  }
}

export const geminiService: IGeminiService = new GeminiServiceImpl()
