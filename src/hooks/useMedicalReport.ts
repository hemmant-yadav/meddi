import { useState, useCallback } from 'react'
import type { MedicalReport, ReportStatus } from '@/types'
import { firebaseService, generateReportId } from '@/services/firebase'
import { ocrService } from '@/services/ocr'
import { geminiService } from '@/services/gemini'
import {
  validateMedicalReportFile,
  detectReportType,
  getFileExtension,
} from '@/utils/fileValidation'

export function useMedicalReport() {
  const [reports, setReports] = useState<MedicalReport[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStage, setCurrentStage] = useState<ReportStatus>('uploading')

  const fetchReports = useCallback(async (userId: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await firebaseService.getReports(userId)
      setReports(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reports')
    } finally {
      setLoading(false)
    }
  }, [])

  const processReportFlow = useCallback(
    async (
      file: File,
      userId: string,
      existingReportId?: string,
      onStageChange?: (stage: ReportStatus) => void
    ): Promise<MedicalReport> => {
      setLoading(true)
      setError(null)

      // 1. Client-Side File Validation
      const validation = validateMedicalReportFile(file)
      if (!validation.isValid) {
        const errorMsg = validation.error || 'Invalid file format or size exceeds 10MB.'
        setError(errorMsg)
        setLoading(false)
        throw new Error(errorMsg)
      }

      const reportId = existingReportId || generateReportId()
      const ext = getFileExtension(file.name) || (file.type === 'application/pdf' ? 'pdf' : 'jpg')
      const storagePath = `users/${userId}/reports/${reportId}/original.${ext}`
      const reportType = detectReportType(file.name)
      const createdAt = new Date().toISOString()

      const notifyStage = (stage: ReportStatus) => {
        setCurrentStage(stage)
        onStageChange?.(stage)
      }

      try {
        // Stage 1: Uploading
        // Create Firestore doc at users/{uid}/reports/{reportId} with initial status
        notifyStage('uploading')
        await firebaseService.createReportDoc(userId, reportId, {
          status: 'uploading',
          fileName: file.name,
          storagePath,
          createdAt,
          uploadedAt: createdAt,
          reportType,
          parameterCount: 0,
        })

        // Upload to Firebase Storage at users/{uid}/reports/{reportId}/original.* (strictly no public URLs)
        await firebaseService.uploadReportFileToStorage(file, userId, reportId)

        // Stage 2: Reading
        notifyStage('reading')
        await firebaseService.updateReportDoc(userId, reportId, { status: 'reading' })
        const ocrResult = await ocrService.processDocument(file)

        // Stage 3: Extracting
        notifyStage('extracting')
        await firebaseService.updateReportDoc(userId, reportId, {
          status: 'extracting',
          extractedText: ocrResult.text,
        })

        // Stage 4: Understanding
        notifyStage('understanding')
        await firebaseService.updateReportDoc(userId, reportId, { status: 'understanding' })
        const explanation = await geminiService.explainReportText(ocrResult.text)

        // Stage 5: Preparing
        notifyStage('preparing')
        const parameterCount = explanation.findings ? explanation.findings.length : 0
        await firebaseService.updateReportDoc(userId, reportId, {
          status: 'preparing',
          parameterCount,
        })

        // Completion: Ready
        const finalizedReport: MedicalReport = {
          id: reportId,
          userId,
          fileName: file.name,
          storagePath,
          createdAt,
          uploadedAt: createdAt,
          status: 'ready',
          reportType,
          parameterCount,
          extractedText: ocrResult.text,
          explanation,
        }

        await firebaseService.updateReportDoc(userId, reportId, {
          status: 'ready',
          explanation,
          parameterCount,
        })

        notifyStage('ready')
        setReports((prev) => [finalizedReport, ...prev.filter((r) => r.id !== reportId)])
        return finalizedReport
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred while analyzing the document.'

        notifyStage('failed')
        setError(errorMsg)

        // Update Firestore doc to failed state with error message
        try {
          await firebaseService.updateReportDoc(userId, reportId, {
            status: 'failed',
            errorMessage: errorMsg,
          })
        } catch {
          // Ignore secondary firestore update error
        }

        throw new Error(errorMsg)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // Legacy wrapper for existing callers
  const processNewReport = useCallback(
    async (file: File, userId: string) => {
      return processReportFlow(file, userId)
    },
    [processReportFlow]
  )

  return {
    reports,
    loading,
    error,
    currentStage,
    fetchReports,
    processNewReport,
    processReportFlow,
  }
}
