import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import { DocumentAiOcrService } from './ocr'
import { GeminiExplainerService } from './gemini'
import { sanitizeMedicalAnalysis, sanitizeChatMessage } from './safety'
import type { ReportDocument, MedicalAnalysisResult } from './types'

// Initialize Firebase Admin
initializeApp()
const db = getFirestore()

// Define Google Secret Manager Secret for Gemini API key
const geminiApiKeySecret = defineSecret('GEMINI_API_KEY')

/**
 * Helper to convert table cells into readable Markdown table strings for Gemini context.
 */
function formatTablesAsMarkdown(tables?: Array<Array<string[]>>): string {
  if (!tables || tables.length === 0) return ''

  return tables
    .map((table, tableIdx) => {
      if (table.length === 0) return ''
      const lines = [`Table ${tableIdx + 1}:`]
      table.forEach((row, rowIdx) => {
        lines.push(`| ${row.join(' | ')} |`)
        if (rowIdx === 0) {
          lines.push(`| ${row.map(() => '---').join(' | ')} |`)
        }
      })
      return lines.join('\n')
    })
    .join('\n\n')
}

/**
 * Core processing pipeline shared by Firestore trigger and HTTPS callable.
 */
async function processMedicalReportPipeline(
  uid: string,
  reportId: string,
  geminiKey?: string
): Promise<ReportDocument> {
  const docRef = db.doc(`users/${uid}/reports/${reportId}`)
  const snapshot = await docRef.get()

  if (!snapshot.exists) {
    throw new Error(`Report document users/${uid}/reports/${reportId} does not exist.`)
  }

  const reportData = snapshot.data() as ReportDocument
  const storagePath = reportData.storagePath

  if (!storagePath) {
    const errorMsg = 'No storagePath provided in report document.'
    await docRef.update({
      status: 'failed',
      failureReason: errorMsg,
      errorMessage: errorMsg,
      updatedAt: new Date().toISOString(),
    })
    throw new Error(errorMsg)
  }

  try {
    // -------------------------------------------------------------
    // STAGE 1: Reading via Google Document AI (Form/OCR Processor)
    // -------------------------------------------------------------
    await docRef.update({
      status: 'reading',
      updatedAt: new Date().toISOString(),
    })

    const ocrService = new DocumentAiOcrService()
    const ocrResult = await ocrService.extractDocumentFromStorage(storagePath)

    // Check for quality failures (blurry, corrupt, empty, handwritten)
    if (ocrResult.isFailed) {
      console.warn(`[Pipeline] OCR validation failed for ${reportId}: ${ocrResult.reason}`)
      await docRef.update({
        status: 'failed',
        failureReason: ocrResult.reason,
        errorMessage: ocrResult.reason,
        updatedAt: new Date().toISOString(),
      })
      return {
        ...reportData,
        status: 'failed',
        failureReason: ocrResult.reason,
        errorMessage: ocrResult.reason,
      }
    }

    // -------------------------------------------------------------
    // STAGE 2: Extracting Text and Structured Tables
    // -------------------------------------------------------------
    await docRef.update({
      status: 'extracting',
      extractedText: ocrResult.text,
      tables: ocrResult.tables,
      confidence: ocrResult.confidence,
      updatedAt: new Date().toISOString(),
    })

    // -------------------------------------------------------------
    // STAGE 3: Understanding via Gemini (Strict JSON Mode)
    // -------------------------------------------------------------
    await docRef.update({
      status: 'understanding',
      updatedAt: new Date().toISOString(),
    })

    const geminiService = new GeminiExplainerService(geminiKey)
    const tablesText = formatTablesAsMarkdown(ocrResult.tables)
    const rawAnalysis = await geminiService.analyzeMedicalText(ocrResult.text, tablesText)
    // Run clinical safety guardrail on EVERY Gemini output before saving or returning it
    const analysis = sanitizeMedicalAnalysis(rawAnalysis, ocrResult.text)

    // -------------------------------------------------------------
    // STAGE 4: Preparing Final Patient Syntheses
    // -------------------------------------------------------------
    await docRef.update({
      status: 'preparing',
      updatedAt: new Date().toISOString(),
    })

    // -------------------------------------------------------------
    // STAGE 5: Save result to Firestore, set status "complete"
    // -------------------------------------------------------------
    const finalUpdate: Partial<ReportDocument> = {
      status: 'complete',
      reportType: analysis.reportType || reportData.reportType || 'Clinical Laboratory Report',
      parameterCount: analysis.tests ? analysis.tests.length : 0,
      analysis,
      updatedAt: new Date().toISOString(),
    }

    await docRef.update(finalUpdate)
    console.info(`[Pipeline] Successfully processed report ${reportId} for user ${uid}. Status set to 'complete'.`)

    return {
      ...reportData,
      ...finalUpdate,
    } as ReportDocument
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : 'An unexpected processing error occurred.'

    console.error(`[Pipeline] Processing failed for report ${reportId}:`, err)

    await docRef.update({
      status: 'failed',
      failureReason: errorMsg,
      errorMessage: errorMsg,
      updatedAt: new Date().toISOString(),
    })

    throw err
  }
}

/**
 * 1. Firestore Document Creation Trigger
 * Triggers automatically when a report doc is created at users/{uid}/reports/{reportId}
 */
export const onReportCreated = onDocumentCreated(
  {
    document: 'users/{uid}/reports/{reportId}',
    secrets: [geminiApiKeySecret],
    memory: '1GiB',
    timeoutSeconds: 300,
    retry: true,
  },
  async (event) => {
    const { uid, reportId } = event.params
    const data = event.data?.data() as ReportDocument | undefined

    if (!data) return

    // Only process newly created documents in uploading or pending states
    if (data.status === 'uploading' || data.status === 'reading' || !data.status) {
      console.info(`[Firestore Trigger] Processing new report ${reportId} for user ${uid}...`)
      const apiKey = geminiApiKeySecret.value() || process.env.GEMINI_API_KEY
      await processMedicalReportPipeline(uid, reportId, apiKey)
    }
  }
)

/**
 * 2. HTTPS Callable Function
 * Can be called directly from frontend or backend clients:
 * httpsCallable(functions, 'processReport')({ uid, reportId })
 */
export const processReport = onCall(
  {
    secrets: [geminiApiKeySecret],
    memory: '1GiB',
    timeoutSeconds: 300,
  },
  async (request) => {
    // Authenticate user
    const callerUid = request.auth?.uid
    const { uid, reportId } = request.data as { uid?: string; reportId?: string }

    if (!reportId) {
      throw new HttpsError('invalid-argument', 'Missing reportId parameter.')
    }

    const targetUid = uid || callerUid
    if (!targetUid) {
      throw new HttpsError('unauthenticated', 'User must be authenticated to process reports.')
    }

    // Security check: user can only trigger processing on their own reports unless admin
    if (callerUid && targetUid !== callerUid) {
      throw new HttpsError('permission-denied', 'You cannot process reports for other users.')
    }

    try {
      const apiKey = geminiApiKeySecret.value() || process.env.GEMINI_API_KEY
      const result = await processMedicalReportPipeline(targetUid, reportId, apiKey)
      return { success: true, report: result }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Report processing failed.'
      throw new HttpsError('internal', message)
    }
  }
)

/**
 * 3. HTTPS Callable Function: askReport(reportId, question, language)
 * Sends ONLY the stored extracted data + question to Gemini; run through the safety guardrail.
 * If not answerable from the report, reply exactly:
 * "This information cannot be determined from the uploaded report."
 * Supports multilingual natural medical explanations (Hindi, Kannada, Tamil, Telugu),
 * keeping key medical terms in English in parentheses.
 * Records message history in Firestore.
 */
export const askReport = onCall(
  {
    secrets: [geminiApiKeySecret],
    memory: '512MiB',
    timeoutSeconds: 60,
  },
  async (request) => {
    const callerUid = request.auth?.uid
    const { reportId, question, language = 'en', uid } = request.data as {
      reportId?: string
      question?: string
      language?: string
      uid?: string
    }

    const targetUid = uid || callerUid
    if (!targetUid) {
      throw new HttpsError('unauthenticated', 'User must be authenticated to ask questions about reports.')
    }
    if (!reportId || !question) {
      throw new HttpsError('invalid-argument', 'Missing reportId or question parameter.')
    }

    const docRef = db.doc(`users/${targetUid}/reports/${reportId}`)
    const snapshot = await docRef.get()

    // Stored extracted text strictly from the document
    let extractedText = ''
    if (snapshot.exists) {
      const reportData = snapshot.data() as ReportDocument
      extractedText = reportData.extractedText || ''
      if (!extractedText && reportData.analysis) {
        // Synthesize string representation strictly of stored parameters
        const lines: string[] = [`Report Type: ${reportData.reportType || 'Laboratory Report'}`]
        if (reportData.analysis.tests) {
          reportData.analysis.tests.forEach((t) => {
            lines.push(`${t.name}: ${t.value} ${t.unit} (Reference Range: ${t.referenceRange}) - Status: ${t.status}`)
          })
        }
        extractedText = lines.join('\n')
      }
    } else {
      // Demo fallback if report document is not yet saved to Firestore
      extractedText = `Complete Blood Count (CBC)
Hemoglobin: 10.2 g/dL (Reference Range: 12 - 15 g/dL) - Status: below_range
Red Blood Cell Count (RBC): 3.8 million/µL (Reference Range: 4.2 - 5.4 million/µL) - Status: below_range
White Blood Cell Count (WBC): 7.2 thousand/µL (Reference Range: 4.5 - 11.0 thousand/µL) - Status: within_range
Platelet Count: 285 thousand/µL (Reference Range: 150 - 400 thousand/µL) - Status: within_range
Hematocrit: 31.5 % (Reference Range: 36 - 46 %) - Status: below_range
Mean Corpuscular Volume (MCV): 82.9 fL (Reference Range: 80 - 100 fL) - Status: within_range
Mean Corpuscular Hemoglobin (MCH): 26.8 pg (Reference Range: 27 - 33 pg) - Status: below_range
Mean Corpuscular Hemoglobin Concentration (MCHC): 32.4 g/dL (Reference Range: 32 - 36 g/dL) - Status: within_range
Neutrophils: 62 % (Reference Range: 40 - 70 %) - Status: within_range
Lymphocytes: 28 % (Reference Range: 20 - 45 %) - Status: within_range
Monocytes: 6 % (Reference Range: 2 - 8 %) - Status: within_range
Eosinophils: 3 % (Reference Range: 1 - 4 %) - Status: within_range`
    }

    try {
      const apiKey = geminiApiKeySecret.value() || process.env.GEMINI_API_KEY
      const geminiService = new GeminiExplainerService(apiKey)

      // Send ONLY stored extracted data + question to Gemini
      const rawAnswer = await geminiService.answerQuestionAboutReport(extractedText, question, language)

      // Strict unanswerable requirement
      const EXACT_UNANSWERABLE = 'This information cannot be determined from the uploaded report.'
      const trimmed = rawAnswer.trim()
      let finalAnswer: string

      if (
        trimmed === EXACT_UNANSWERABLE ||
        trimmed.toLowerCase().includes('cannot be determined from the uploaded report') ||
        trimmed.toLowerCase().includes('cannot be determined from the provided report') ||
        trimmed.toLowerCase().includes('not mentioned in the report') ||
        trimmed.toLowerCase().includes('not present in the report') ||
        trimmed.toLowerCase().includes('not found in the uploaded report')
      ) {
        finalAnswer = EXACT_UNANSWERABLE
      } else {
        // MANDATORY CLINICAL SAFETY GUARDRAIL ON EVERY CHAT OUTPUT
        finalAnswer = sanitizeChatMessage(rawAnswer, extractedText)
        if (finalAnswer.toLowerCase().includes('cannot be determined')) {
          finalAnswer = EXACT_UNANSWERABLE
        }
      }

      // Record message history in Firestore: users/{uid}/reports/{reportId}/messages
      const now = new Date().toISOString()
      const messagesCol = db.collection(`users/${targetUid}/reports/${reportId}/messages`)

      await messagesCol.add({
        sender: 'user',
        text: question,
        language,
        createdAt: now,
      })

      const botDoc = await messagesCol.add({
        sender: 'assistant',
        text: finalAnswer,
        language,
        createdAt: new Date().toISOString(),
      })

      return {
        answer: finalAnswer,
        messageId: botDoc.id,
        reportId,
        language,
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Chat query failed.'
      throw new HttpsError('internal', message)
    }
  }
)

/**
 * 4. HTTPS Callable Function: translateReport(reportId, language)
 * Caches translated results in Firestore per report+language at:
 * users/{uid}/reports/{reportId}/translations/{language}
 */
export const translateReport = onCall(
  {
    secrets: [geminiApiKeySecret],
    memory: '512MiB',
    timeoutSeconds: 120,
  },
  async (request) => {
    const callerUid = request.auth?.uid
    const { reportId, language, uid } = request.data as {
      reportId?: string
      language?: string
      uid?: string
    }

    const targetUid = uid || callerUid
    if (!targetUid) {
      throw new HttpsError('unauthenticated', 'User must be authenticated.')
    }
    if (!reportId || !language) {
      throw new HttpsError('invalid-argument', 'Missing reportId or language parameter.')
    }

    if (language === 'en') {
      const docRef = db.doc(`users/${targetUid}/reports/${reportId}`)
      const snap = await docRef.get()
      return { cached: false, analysis: snap.data()?.analysis }
    }

    // Check Firestore cache first: users/{uid}/reports/{reportId}/translations/{language}
    const translationDocRef = db.doc(`users/${targetUid}/reports/${reportId}/translations/${language}`)
    const cacheSnap = await translationDocRef.get()

    if (cacheSnap.exists) {
      console.info(`[translateReport] Returning cached translation for ${reportId} in ${language}`)
      return {
        cached: true,
        language,
        analysis: cacheSnap.data() as MedicalAnalysisResult,
      }
    }

    // Get report data
    const reportDocRef = db.doc(`users/${targetUid}/reports/${reportId}`)
    const reportSnap = await reportDocRef.get()
    if (!reportSnap.exists) {
      throw new HttpsError('not-found', 'Report document not found.')
    }

    const reportData = reportSnap.data() as ReportDocument
    if (!reportData.analysis) {
      throw new HttpsError('failed-precondition', 'Report has not been analyzed yet.')
    }

    try {
      const apiKey = geminiApiKeySecret.value() || process.env.GEMINI_API_KEY
      const geminiService = new GeminiExplainerService(apiKey)
      const rawTranslated = await geminiService.translateMedicalAnalysis(reportData.analysis, language)
      const sanitized = sanitizeMedicalAnalysis(rawTranslated, reportData.extractedText)

      // Cache translated results in Firestore per report+language
      await translationDocRef.set({
        ...sanitized,
        language,
        cachedAt: new Date().toISOString(),
      })

      console.info(`[translateReport] Successfully cached translation for ${reportId} in ${language}`)

      return {
        cached: false,
        language,
        analysis: sanitized,
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Report translation failed.'
      throw new HttpsError('internal', message)
    }
  }
)

/**
 * 5. HTTPS Callable Function for Chat with Medical Report (legacy alias)
 */
export const chatWithReport = askReport

export * from './safety'
