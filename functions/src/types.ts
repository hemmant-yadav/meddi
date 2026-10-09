export type TestStatus = 'within_range' | 'below_range' | 'above_range' | 'unclear'

export interface ParsedTest {
  name: string
  value: string
  unit: string
  referenceRange: string
  status: TestStatus
  simpleExplanation: string
  educationalContext: string
}

export interface MedicalAnalysisResult {
  reportType: string
  summary: string
  tests: ParsedTest[]
  medications: string[]
  doctorInstructions: string[]
  importantNotes: string[]
  questionsToAskDoctor: string[]
  confidenceNotes: string[]
}

export type ProcessingStatus =
  | 'uploading'
  | 'reading'
  | 'extracting'
  | 'understanding'
  | 'preparing'
  | 'complete'
  | 'ready'
  | 'failed'

export interface ReportDocument {
  id?: string
  userId: string
  fileName: string
  storagePath: string
  createdAt: string
  updatedAt?: string
  status: ProcessingStatus
  reportType?: string
  parameterCount?: number
  extractedText?: string
  tables?: Array<Array<string[]>>
  analysis?: MedicalAnalysisResult
  failureReason?: string
  errorMessage?: string
}

export interface OcrExtractionResult {
  text: string
  tables: Array<Array<string[]>>
  confidence: number
  isHandwritten: boolean
  pageCount: number
}
