export interface UserProfile {
  uid: string
  email: string | null
  displayName: string | null
  photoURL?: string | null
}

export type ProcessingStage =
  | 'uploading'
  | 'reading'
  | 'extracting'
  | 'understanding'
  | 'preparing'

export type ReportStatus = ProcessingStage | 'processing' | 'ready' | 'failed'

export interface MedicalFinding {
  parameter: string
  value: string
  standardRange?: string
  status: 'normal' | 'attention' | 'critical'
  simpleExplanation: string
  questionsForDoctor: string[]
}

export interface ReportExplanation {
  summary: string
  findings: MedicalFinding[]
  keyTakeaways: string[]
  recommendedQuestions: string[]
  disclaimer: string
}

export interface MedicalReport {
  id: string
  userId: string
  fileName: string
  storagePath: string
  createdAt: string
  uploadedAt?: string
  status: ReportStatus
  reportType?: string
  parameterCount?: number
  fileUrl?: string
  extractedText?: string
  explanation?: ReportExplanation
  translatedSummary?: Record<string, string> // language code -> text
  errorMessage?: string
}

export interface OcrResult {
  text: string
  confidence?: number
  rawBlocks?: unknown[]
}

export interface TranslationResult {
  translatedText: string
  sourceLanguage?: string
  targetLanguage: string
}

export interface ChatMessage {
  id: string
  sender: 'user' | 'assistant'
  text: string
  createdAt: string
  language?: string
}

