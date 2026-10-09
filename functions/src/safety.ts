import type { MedicalAnalysisResult, ParsedTest } from './types'

export type SafetyViolationType =
  | 'DEFINITIVE_DIAGNOSIS'
  | 'PRESCRIPTION_INSTRUCTION'
  | 'DOSE_CHANGE'
  | 'STOP_START_MEDICATION'
  | 'UNSUPPORTED_CLAIM'
  | 'HALLUCINATED_NUMERIC_VALUE'

export interface SafetyViolation {
  type: SafetyViolationType
  matchedText: string
  reason: string
}

export interface CheckSafetyResult {
  isSafe: boolean
  violations: SafetyViolation[]
}

export interface RewriteResult {
  text: string
  violations: SafetyViolation[]
  wasRewritten: boolean
  usedFallback: boolean
}

export const PREFERRED_PHRASINGS = {
  ASSOCIATED_WITH: 'may be associated with…',
  REPORT_SHOWS: 'the report shows…',
  DISCUSS_WITH_HCP: 'discuss this with a healthcare professional',
} as const

export const SAFE_FALLBACK_MESSAGE =
  'The report shows clinical laboratory values. This educational tool does not provide medical diagnoses or prescribe treatments. Please discuss this with a healthcare professional.'

export const SAFE_TEST_EXPLANATION_FALLBACK =
  'The report shows this laboratory marker. Please discuss this with a healthcare professional to understand its clinical context.'

export const SAFE_ANALYSIS_SUMMARY_FALLBACK =
  'The report shows clinical laboratory test results. This educational overview provides objective biomarker information to help you understand your laboratory report. Please discuss this with a healthcare professional for personalized medical guidance.'

/**
 * Idioms or benign phrases containing 'take' or 'have' that do NOT constitute diagnoses or prescriptions.
 */
const SAFE_PHRASE_EXCEPTIONS = [
  /\btake\s+(?:a\s+)?(?:look|test|picture|breath|step|rest|walk|note|notes|caution|into\s+account|sample|blood\s+draw|reading)\b/i,
  /\byou\s+have\s+(?:a\s+)?(?:fasting|blood|level|value|reading|test|panel|sample|report|marker|concentration|measurement|range)\b/i,
  /\byou\s+have\s+(?:normal|optimal|expected|in-range|standard|balanced)\b/i,
  /\byou\s+have\s+(?:completed|submitted|uploaded|received|scheduled)\b/i,
]

/**
 * Specific medical conditions or disease terms for definitive diagnosis detection.
 */
const DISEASE_CONDITION_PATTERN =
  /\b(?:diabetes|anemia|cancer|hypertension|hypotension|kidney\s+disease|kidney\s+failure|renal\s+failure|liver\s+failure|heart\s+attack|stroke|infection|hypothyroidism|hyperthyroidism|hepatitis|cirrhosis|arrhythmia|leukemia|asthma|arthritis|pneumonia|ketoacidosis|sepsis|deficiency|carcinoma|tumor|syndrome|disorder)\b/i

/**
 * Checks a block of text for safety violations against clinical AI guardrails.
 */
export function checkTextSafety(text: string): CheckSafetyResult {
  if (!text || typeof text !== 'string') {
    return { isSafe: true, violations: [] }
  }

  const violations: SafetyViolation[] = []

  // Check exceptions first for the whole text if it's very short
  const hasSafeException = SAFE_PHRASE_EXCEPTIONS.some((regex) => regex.test(text))

  // 1. DEFINITIVE DIAGNOSES ("you have [condition]", "you are suffering from...", etc.)
  const diagnosisPatterns: Array<{ regex: RegExp; reason: string }> = [
    {
      regex: /\b(?:you\s+have|you've\s+got)\s+([a-z0-9\s\-]+?)(?=[.,;!?]|$)/i,
      reason: 'Definitive diagnosis ("you have...") detected without educational nuance.',
    },
    {
      regex: /\b(?:you\s+are\s+suffering\s+from|you\s+suffer\s+from)\s+([a-z0-9\s\-]+?)(?=[.,;!?]|$)/i,
      reason: 'Definitive diagnosis ("you are suffering from...") detected.',
    },
    {
      regex: /\b(?:you\s+are\s+diagnosed\s+with|you've\s+been\s+diagnosed\s+with|diagnosed\s+you\s+with)\s+([a-z0-9\s\-]+?)(?=[.,;!?]|$)/i,
      reason: 'Definitive diagnosis ("diagnosed with...") detected.',
    },
    {
      regex: /\b(?:your\s+diagnosis\s+is|the\s+diagnosis\s+is)\s+([a-z0-9\s\-]+?)(?=[.,;!?]|$)/i,
      reason: 'Definitive diagnosis statement ("your diagnosis is...") detected.',
    },
    {
      regex: /\b(?:this\s+(?:confirms|proves|definitively\s+shows\s+that)\s+you\s+have)\s+([a-z0-9\s\-]+?)(?=[.,;!?]|$)/i,
      reason: 'Overconfident diagnostic confirmation detected.',
    },
    {
      regex: /\b(?:you\s+are\s+definitely\s+(?:diabetic|anemic|hypertensive|sick|ill))\b/i,
      reason: 'Direct diagnostic labeling detected.',
    },
  ]

  for (const { regex, reason } of diagnosisPatterns) {
    const match = text.match(regex)
    if (match) {
      // Validate that it is actually a medical diagnosis and not a benign phrase
      const matchedFragment = match[0]
      const conditionCandidate = match[1] || ''

      const isBenign =
        SAFE_PHRASE_EXCEPTIONS.some((safeRx) => safeRx.test(matchedFragment)) ||
        /\b(?:a\s+)?(?:value|level|reading|result|test|panel|appointment|question)\b/i.test(
          conditionCandidate
        )

      if (!isBenign || DISEASE_CONDITION_PATTERN.test(matchedFragment)) {
        violations.push({
          type: 'DEFINITIVE_DIAGNOSIS',
          matchedText: matchedFragment,
          reason,
        })
      }
    }
  }

  // 2. STOP / START MEDICATION & PRESCRIPTIONS
  const stopStartPatterns: Array<{ regex: RegExp; reason: string }> = [
    {
      regex: /\b(?:stop\s+taking|cease\s+taking|quit\s+taking|discontinue\s+taking|discontinue\s+use\s+of)\s+([a-z0-9\s\-]+?)(?=[.,;!?]|$)/i,
      reason: 'Unsafe instruction to stop or discontinue medication detected.',
    },
    {
      regex: /\b(?:start\s+taking|begin\s+taking)\s+([a-z0-9\s\-]+?)(?=[.,;!?]|$)/i,
      reason: 'Unsafe instruction to start taking medication detected.',
    },
  ]

  for (const { regex, reason } of stopStartPatterns) {
    const match = text.match(regex)
    if (match) {
      violations.push({
        type: 'STOP_START_MEDICATION',
        matchedText: match[0],
        reason,
      })
    }
  }

  // 3. PRESCRIPTION INSTRUCTIONS & MEDICATION DIRECTIVES
  const prescriptionPatterns: Array<{ regex: RegExp; reason: string }> = [
    {
      regex: /\b(?:take)\s+(?!(?:a\s+)?(?:look|test|picture|breath|step|rest|walk|note|notes|caution|into\s+account|sample|reading)\b)(?:\d+\s*(?:mg|ml|mcg|g|tablets?|pills?|capsules?|drops?|units?)\s+(?:of\s+)?)?([a-z0-9\-]+)(?:\s+(?:daily|twice|every|once|at\s+bedtime|in\s+the\s+morning|before\s+meals|after\s+meals))?/i,
      reason: 'Prescription instruction or administration directive ("take [medication]...") detected.',
    },
    {
      regex: /\b(?:i\s+prescribe|you\s+should\s+take|you\s+must\s+take|you\s+need\s+to\s+take)\s+([a-z0-9\s\-]+?)(?=[.,;!?]|$)/i,
      reason: 'Prescription instruction directive detected.',
    },
    {
      regex: /\binject\s+(?:\d+\s*(?:units?|ml|mg)\s+(?:of\s+)?)?([a-z0-9\-]+)/i,
      reason: 'Injection instruction detected.',
    },
  ]

  for (const { regex, reason } of prescriptionPatterns) {
    const match = text.match(regex)
    if (match && !hasSafeException) {
      violations.push({
        type: 'PRESCRIPTION_INSTRUCTION',
        matchedText: match[0],
        reason,
      })
    }
  }

  // 4. DOSE CHANGES
  const doseChangePatterns: Array<{ regex: RegExp; reason: string }> = [
    {
      regex: /\b(?:increase|decrease|lower|raise|reduce|adjust|double|halve|change)\s+(?:your\s+)?(?:dose|dosage|amount)\b/i,
      reason: 'Medication dose change directive detected.',
    },
    {
      regex: /\b(?:take\s+\d+\s*(?:mg|pills?|tablets?)\s+instead\s+of\b)/i,
      reason: 'Medication dose alteration directive detected.',
    },
    {
      regex: /\b(?:switch\s+your\s+dose\s+to\b)/i,
      reason: 'Medication dosage alteration directive detected.',
    },
  ]

  for (const { regex, reason } of doseChangePatterns) {
    const match = text.match(regex)
    if (match) {
      violations.push({
        type: 'DOSE_CHANGE',
        matchedText: match[0],
        reason,
      })
    }
  }

  // 5. UNSUPPORTED CLAIMS & OVERCONFIDENT GUARANTEES
  const unsupportedClaimPatterns: Array<{ regex: RegExp; reason: string }> = [
    {
      regex: /\b(?:will\s+(?:completely\s+)?cure|guaranteed\s+to\s+cure|100%\s+cured|miracle\s+cure)\b/i,
      reason: 'Unsupported medical cure claim detected.',
    },
    {
      regex: /\b(?:you\s+do\s+not\s+need|no\s+need|don't\s+need)\s+(?:to\s+)?(?:see|visit|consult|seek)\s+(?:a\s+)?(?:doctor|physician|healthcare\s+professional|medical\s+attention)\b/i,
      reason: 'Unsafe advice discouraging physician consultation detected.',
    },
    {
      regex: /\b(?:100%\s+guarantees?|definitively\s+rules?\s+out\s+all\s+diseases?|guarantees?\s+that\s+you\s+have\s+no)\b/i,
      reason: 'Unsupported absolute guarantee detected.',
    },
    {
      regex: /\b(?:there\s+is\s+nothing\s+wrong\s+with\s+you\s+at\s+all|completely\s+free\s+of\s+any\s+risk)\b/i,
      reason: 'Unsubstantiated absolute health claim detected.',
    },
  ]

  for (const { regex, reason } of unsupportedClaimPatterns) {
    const match = text.match(regex)
    if (match) {
      violations.push({
        type: 'UNSUPPORTED_CLAIM',
        matchedText: match[0],
        reason,
      })
    }
  }

  return {
    isSafe: violations.length === 0,
    violations,
  }
}

/**
 * Extracts a readable condition or marker from a diagnostic match for educational rewriting.
 */
function extractConditionName(matchedText: string): string {
  const cleaned = matchedText
    .replace(/^you\s+have\s+(?:a\s+|an\s+|severe\s+|mild\s+|acute\s+|chronic\s+)?/i, '')
    .replace(/^you\s+are\s+suffering\s+from\s+(?:a\s+|an\s+)?/i, '')
    .replace(/^you\s+are\s+diagnosed\s+with\s+(?:a\s+|an\s+)?/i, '')
    .replace(/^this\s+confirms\s+(?:that\s+)?you\s+have\s+(?:a\s+|an\s+)?/i, '')
    .replace(/^your\s+diagnosis\s+is\s+(?:a\s+|an\s+)?/i, '')
    .trim()
  return cleaned || 'this health parameter'
}

/**
 * Rewrites a single unsafe sentence into an educational statement using preferred phrasing:
 * - "may be associated with…"
 * - "the report shows…"
 * - "discuss this with a healthcare professional"
 */
function rewriteSentence(sentence: string, violations: SafetyViolation[]): string {
  let rewritten = sentence

  const types = new Set(violations.map((v) => v.type))

  // 1. Rewrite definitive diagnosis
  if (types.has('DEFINITIVE_DIAGNOSIS')) {
    const diagnosisViolation = violations.find((v) => v.type === 'DEFINITIVE_DIAGNOSIS')
    const condition = diagnosisViolation
      ? extractConditionName(diagnosisViolation.matchedText)
      : 'this clinical finding'

    rewritten = `The report shows findings that may be associated with ${condition}; please discuss this with a healthcare professional.`
    return rewritten
  }

  // 2. Rewrite stop medication
  if (
    types.has('STOP_START_MEDICATION') &&
    /\b(?:stop|cease|quit|discontinue)\b/i.test(sentence)
  ) {
    return 'The report shows medication considerations; please discuss this with a healthcare professional before making any changes or discontinuing any medications.'
  }

  // 3. Rewrite start medication / prescription instructions
  if (
    types.has('STOP_START_MEDICATION') ||
    types.has('PRESCRIPTION_INSTRUCTION')
  ) {
    return 'The report shows medication references; please discuss this with a healthcare professional regarding any clinical recommendations or prescriptions.'
  }

  // 4. Rewrite dose changes
  if (types.has('DOSE_CHANGE')) {
    return 'The report shows dosage considerations; please discuss this with a healthcare professional before making any dosage changes.'
  }

  // 5. Rewrite unsupported claims
  if (types.has('UNSUPPORTED_CLAIM')) {
    return 'The report shows laboratory findings; please discuss this with a healthcare professional for clinical evaluation and follow-up.'
  }

  return rewritten
}

/**
 * Splits text into sentences while preserving standard punctuation.
 */
function splitIntoSentences(text: string): string[] {
  const matches = text.match(/[^.!?]+(?:[.!?]+|$)/g)
  return matches ? matches.map((s) => s.trim()).filter((s) => s.length > 0) : [text]
}

/**
 * Guardrail that inspects text, detects violations, and rewrites using preferred phrasing.
 * If rewriting fails or the result remains unsafe, returns safe fallback and logs the event.
 */
export function sanitizeText(
  text: string,
  options?: {
    customFallback?: string
    contextName?: string
  }
): RewriteResult {
  if (!text || typeof text !== 'string') {
    return { text: text || '', violations: [], wasRewritten: false, usedFallback: false }
  }

  const initialCheck = checkTextSafety(text)
  if (initialCheck.isSafe) {
    return { text, violations: [], wasRewritten: false, usedFallback: false }
  }

  const fallback = options?.customFallback || SAFE_FALLBACK_MESSAGE
  const contextName = options?.contextName || 'GeneralText'

  try {
    const sentences = splitIntoSentences(text)
    const rewrittenSentences: string[] = []

    for (const sentence of sentences) {
      const sentenceCheck = checkTextSafety(sentence)
      if (sentenceCheck.isSafe) {
        rewrittenSentences.push(sentence)
      } else {
        const rewritten = rewriteSentence(sentence, sentenceCheck.violations)
        rewrittenSentences.push(rewritten)
      }
    }

    const candidateResult = rewrittenSentences.join(' ')

    // Verify candidate result is now strictly safe
    const postCheck = checkTextSafety(candidateResult)
    if (postCheck.isSafe) {
      console.info(`[SafetyGuardrail:Rewrite] Successfully sanitized unsafe content in ${contextName}:`, {
        violations: initialCheck.violations.map((v) => v.type),
        originalPreview: text.slice(0, 100),
      })
      return {
        text: candidateResult,
        violations: initialCheck.violations,
        wasRewritten: true,
        usedFallback: false,
      }
    }

    // Rewrite failed to clear all violations -> Apply safe fallback
    console.warn(`[SafetyGuardrail:Fallback] Rewrite failed post-validation in ${contextName}. Applying fallback.`, {
      originalText: text,
      violations: postCheck.violations,
    })
    return {
      text: fallback,
      violations: initialCheck.violations,
      wasRewritten: true,
      usedFallback: true,
    }
  } catch (err) {
    console.error(`[SafetyGuardrail:Error] Exception during rewriting in ${contextName}:`, err, {
      originalText: text,
      violations: initialCheck.violations,
    })
    return {
      text: fallback,
      violations: initialCheck.violations,
      wasRewritten: true,
      usedFallback: true,
    }
  }
}

/**
 * Cross-checks numerical values in test metrics against the original OCR text source.
 * Returns true if numbers are grounded in the OCR text, false if hallucinated.
 */
export function verifyNumericValuesAgainstOcr(
  valueStr: string,
  sourceOcrText: string
): boolean {
  if (!sourceOcrText || !valueStr) return true

  // Standard non-numeric or missing markers
  if (
    /not clearly detected|none|trace|negative|positive|normal|optimal|n\/a/i.test(
      valueStr
    )
  ) {
    return true
  }

  const numbers = valueStr.match(/\b\d+(?:\.\d+)?\b/g)
  if (!numbers || numbers.length === 0) return true

  // Normalize OCR text by removing commas from thousands (e.g. 1,000 -> 1000)
  const normalizedOcr = sourceOcrText.replace(/,/g, '')

  for (const num of numbers) {
    // Check if number token exists in OCR text
    const escapedNum = num.replace('.', '\\.')
    const tokenRegex = new RegExp(`(?:^|[^0-9.])${escapedNum}(?:[^0-9.]|$)`)
    const exists = tokenRegex.test(normalizedOcr) || sourceOcrText.includes(num)

    if (!exists) {
      return false
    }
  }

  return true
}

/**
 * Sanitizes a single test item from the Gemini analysis output.
 */
function sanitizeTestItem(
  test: ParsedTest,
  sourceOcrText?: string
): { test: ParsedTest; hallucinationNote?: string } {
  const sanitizedTest: ParsedTest = { ...test }
  let hallucinationNote: string | undefined

  // 1. Cross-check numeric value against source OCR text
  if (sourceOcrText && test.value) {
    const isGrounded = verifyNumericValuesAgainstOcr(test.value, sourceOcrText)
    if (!isGrounded) {
      const origValue = test.value
      sanitizedTest.value = 'Not clearly detected'
      sanitizedTest.simpleExplanation =
        'The report shows this laboratory marker, but the exact numeric value was not clearly detected in the source document. Please discuss this with a healthcare professional.'
      hallucinationNote = `[Safety Guardrail] Test "${test.name}" value "${origValue}" was not present in the scanned document and was updated to "Not clearly detected" for clinical safety.`
    }
  }

  // 2. Sanitize simpleExplanation
  const explanationResult = sanitizeText(sanitizedTest.simpleExplanation, {
    customFallback: SAFE_TEST_EXPLANATION_FALLBACK,
    contextName: `TestExplanation:${test.name}`,
  })
  sanitizedTest.simpleExplanation = explanationResult.text

  // 3. Sanitize educationalContext
  const contextResult = sanitizeText(sanitizedTest.educationalContext, {
    customFallback: SAFE_TEST_EXPLANATION_FALLBACK,
    contextName: `EducationalContext:${test.name}`,
  })
  sanitizedTest.educationalContext = contextResult.text

  return { test: sanitizedTest, hallucinationNote }
}

/**
 * Runs the safety guardrail on EVERY Gemini MedicalAnalysisResult output before saving or returning it.
 *
 * Checks:
 * - summary (rewrites diagnoses, unsupported claims, prescription directives)
 * - tests (cross-checks values against OCR text, sanitizes explanations and context)
 * - medications (sanitizes dosage instructions / prescription directives)
 * - doctorInstructions (ensures reported phrasing rather than AI directives)
 * - importantNotes & questionsToAskDoctor
 */
export function sanitizeMedicalAnalysis(
  analysis: MedicalAnalysisResult,
  sourceOcrText?: string
): MedicalAnalysisResult {
  if (!analysis) return analysis

  const sanitized: MedicalAnalysisResult = {
    reportType: analysis.reportType || 'Clinical Laboratory Report',
    summary: '',
    tests: [],
    medications: [],
    doctorInstructions: [],
    importantNotes: [],
    questionsToAskDoctor: [],
    confidenceNotes: [...(analysis.confidenceNotes || [])],
  }

  // 1. Sanitize summary
  const summaryResult = sanitizeText(analysis.summary, {
    customFallback: SAFE_ANALYSIS_SUMMARY_FALLBACK,
    contextName: 'AnalysisSummary',
  })
  sanitized.summary = summaryResult.text

  // 2. Sanitize tests and cross-check numbers
  if (Array.isArray(analysis.tests)) {
    for (const test of analysis.tests) {
      const { test: cleanTest, hallucinationNote } = sanitizeTestItem(
        test,
        sourceOcrText
      )
      sanitized.tests.push(cleanTest)
      if (hallucinationNote) {
        sanitized.confidenceNotes.push(hallucinationNote)
      }
    }
  }

  // 3. Sanitize medications array
  if (Array.isArray(analysis.medications)) {
    sanitized.medications = analysis.medications.map((med) => {
      const res = sanitizeText(med, {
        customFallback: 'Medication details noted in report; discuss with a healthcare professional.',
        contextName: 'Medications',
      })
      return res.text
    })
  }

  // 4. Sanitize doctorInstructions
  if (Array.isArray(analysis.doctorInstructions)) {
    sanitized.doctorInstructions = analysis.doctorInstructions.map((inst) => {
      const res = sanitizeText(inst, {
        customFallback: 'Follow up with your prescribing clinician for complete instructions.',
        contextName: 'DoctorInstructions',
      })
      return res.text
    })
  }

  // 5. Sanitize importantNotes
  if (Array.isArray(analysis.importantNotes)) {
    sanitized.importantNotes = analysis.importantNotes.map((note) => {
      const res = sanitizeText(note, {
        customFallback: 'Always discuss laboratory results with a qualified healthcare professional.',
        contextName: 'ImportantNotes',
      })
      return res.text
    })
  }

  // 6. Sanitize questionsToAskDoctor
  if (Array.isArray(analysis.questionsToAskDoctor)) {
    sanitized.questionsToAskDoctor = analysis.questionsToAskDoctor.map((q) => {
      const res = sanitizeText(q, {
        customFallback: 'What follow-up evaluations do you recommend for these laboratory findings?',
        contextName: 'QuestionsToAskDoctor',
      })
      return res.text
    })
  }

  return sanitized
}

/**
 * Runs the safety guardrail on EVERY Gemini chat response before returning it to the user.
 */
export function sanitizeChatMessage(
  chatResponse: string,
  sourceOcrText?: string
): string {
  if (!chatResponse || typeof chatResponse !== 'string') {
    return ''
  }

  const result = sanitizeText(chatResponse, {
    customFallback: SAFE_FALLBACK_MESSAGE,
    contextName: 'ChatMessage',
  })

  let text = result.text

  // If source OCR text is supplied, check if the response asserts ungrounded numeric metrics
  if (sourceOcrText) {
    const numericMatches = (chatResponse + ' ' + text).match(
      /\b\d+(?:\.\d+)?\s*(?:mg\/dL|mmol\/L|g\/dL|%|mcg\/mL|U\/L|IU\/L)\b/gi
    )
    if (numericMatches) {
      for (const numToken of numericMatches) {
        const isGrounded = verifyNumericValuesAgainstOcr(numToken, sourceOcrText)
        if (!isGrounded) {
          console.warn('[SafetyGuardrail:Chat] Ungrounded numerical metric detected in chat message:', {
            numToken,
          })
          text += ` (Note: The value "${numToken}" was not clearly verified in the scanned report. Please discuss this with a healthcare professional.)`
          break
        }
      }
    }
  }

  return text
}
