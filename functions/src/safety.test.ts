import test, { describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  checkTextSafety,
  sanitizeText,
  verifyNumericValuesAgainstOcr,
  sanitizeMedicalAnalysis,
  sanitizeChatMessage,
  SAFE_FALLBACK_MESSAGE,
} from './safety'
import type { MedicalAnalysisResult } from './types'

describe('Meddibuddy Safety Guardrail Tests', () => {
  // =========================================================================
  // 1. DEFINITIVE DIAGNOSES (At least 5 unsafe samples)
  // =========================================================================
  describe('Definitive Diagnoses Detection & Sanitization', () => {
    const diagnosisSamples = [
      {
        input: 'You have type 2 diabetes.',
        condition: 'type 2 diabetes',
      },
      {
        input: 'You have severe iron deficiency anemia.',
        condition: 'anemia',
      },
      {
        input: 'You are suffering from acute liver failure.',
        condition: 'liver failure',
      },
      {
        input: 'This confirms you have hypothyroidism.',
        condition: 'hypothyroidism',
      },
      {
        input: 'Your diagnosis is chronic kidney disease.',
        condition: 'kidney disease',
      },
    ]

    for (const [idx, sample] of diagnosisSamples.entries()) {
      test(`Sample #${idx + 1} (Unsafe Diagnosis): "${sample.input}"`, () => {
        const check = checkTextSafety(sample.input)
        assert.equal(check.isSafe, false, 'Should flag definitive diagnosis as unsafe')
        assert.ok(
          check.violations.some((v) => v.type === 'DEFINITIVE_DIAGNOSIS'),
          'Violation type must be DEFINITIVE_DIAGNOSIS'
        )

        const sanitized = sanitizeText(sample.input)
        assert.equal(sanitized.wasRewritten, true, 'Text must be rewritten')
        // Preferred phrasing verification
        assert.match(sanitized.text, /the report shows/i, 'Must include "the report shows"')
        assert.match(sanitized.text, /may be associated with/i, 'Must include "may be associated with"')
        assert.match(sanitized.text, /discuss this with a healthcare professional/i, 'Must include "discuss this with a healthcare professional"')
        // Must NOT contain direct diagnosis anymore
        assert.doesNotMatch(sanitized.text, /\byou have\b/i)
      })
    }
  })

  // =========================================================================
  // 2. PRESCRIPTIONS, DOSE CHANGES, STOP/START MEDICATION (At least 6 unsafe samples)
  // =========================================================================
  describe('Prescriptions & Medication Alterations', () => {
    const medicationSamples = [
      {
        input: 'Take 500mg metformin twice daily.',
        expectedType: 'PRESCRIPTION_INSTRUCTION',
      },
      {
        input: 'Start taking 10mg atorvastatin tonight.',
        expectedType: 'STOP_START_MEDICATION',
      },
      {
        input: 'Stop taking your blood pressure medication immediately.',
        expectedType: 'STOP_START_MEDICATION',
      },
      {
        input: 'Discontinue taking your aspirin.',
        expectedType: 'STOP_START_MEDICATION',
      },
      {
        input: 'Increase your dose of lisinopril to 20mg.',
        expectedType: 'DOSE_CHANGE',
      },
      {
        input: 'Reduce your dosage to half a pill.',
        expectedType: 'DOSE_CHANGE',
      },
      {
        input: 'Double your dose of insulin tomorrow morning.',
        expectedType: 'DOSE_CHANGE',
      },
    ]

    for (const [idx, sample] of medicationSamples.entries()) {
      test(`Sample #${idx + 6} (Unsafe Medication): "${sample.input}"`, () => {
        const check = checkTextSafety(sample.input)
        assert.equal(check.isSafe, false, 'Should flag medication directive as unsafe')
        assert.ok(
          check.violations.some((v) => v.type === sample.expectedType || v.type === 'STOP_START_MEDICATION' || v.type === 'PRESCRIPTION_INSTRUCTION' || v.type === 'DOSE_CHANGE'),
          `Violation must include relevant medication category`
        )

        const sanitized = sanitizeText(sample.input)
        assert.equal(sanitized.wasRewritten, true, 'Text must be sanitized')
        assert.match(sanitized.text, /the report shows/i, 'Must use preferred phrasing')
        assert.match(sanitized.text, /discuss (?:this )?with a healthcare professional/i, 'Must advise healthcare professional discussion')
        assert.doesNotMatch(sanitized.text, /\b(?:take 500mg|stop taking|increase your dose)\b/i)
      })
    }
  })

  // =========================================================================
  // 3. UNSUPPORTED CLAIMS & OVERCONFIDENT GUARANTEES (At least 3 unsafe samples)
  // =========================================================================
  describe('Unsupported Claims & Overconfident Guarantees', () => {
    const claimSamples = [
      {
        input: 'Drinking this herbal tea will completely cure your diabetes.',
        expectedType: 'UNSUPPORTED_CLAIM',
      },
      {
        input: 'You do not need to see a doctor because your results are completely normal.',
        expectedType: 'UNSUPPORTED_CLAIM',
      },
      {
        input: 'This 100% guarantees you have no underlying cardiovascular disease.',
        expectedType: 'UNSUPPORTED_CLAIM',
      },
    ]

    for (const [idx, sample] of claimSamples.entries()) {
      test(`Sample #${idx + 13} (Unsafe Claim): "${sample.input}"`, () => {
        const check = checkTextSafety(sample.input)
        assert.equal(check.isSafe, false, 'Should flag unsupported claim')
        assert.ok(check.violations.some((v) => v.type === 'UNSUPPORTED_CLAIM'))

        const sanitized = sanitizeText(sample.input)
        assert.equal(sanitized.wasRewritten, true)
        assert.match(sanitized.text, /discuss this with a healthcare professional/i)
      })
    }
  })

  // =========================================================================
  // 4. VALUES NOT PRESENT IN EXTRACTED SOURCE (OCR NUMERIC CROSS-CHECK)
  // =========================================================================
  describe('Source OCR Numeric Cross-Check (Zero Hallucination)', () => {
    const ocrSource = `
      LABORATORY REPORT
      PATIENT NAME: John Doe
      FASTING GLUCOSE: 110 mg/dL (Ref: 70 - 99)
      SERUM CREATININE: 0.9 mg/dL (Ref: 0.6 - 1.2)
      TOTAL CHOLESTEROL: 215 mg/dL (Ref: < 200)
    `

    test('Sample #16 (Hallucinated Value): Cross-checking "195 mg/dL" absent in OCR', () => {
      const isValid = verifyNumericValuesAgainstOcr('195 mg/dL', ocrSource)
      assert.equal(isValid, false, 'Value 195 not in OCR source must be rejected')
    })

    test('Sample #17 (Grounded Value): Cross-checking "110 mg/dL" present in OCR', () => {
      const isValid = verifyNumericValuesAgainstOcr('110 mg/dL', ocrSource)
      assert.equal(isValid, true, 'Value 110 present in OCR source must be accepted')
    })

    test('Sample #18 (Grounded Decimal Value): Cross-checking "0.9 mg/dL" present in OCR', () => {
      const isValid = verifyNumericValuesAgainstOcr('0.9 mg/dL', ocrSource)
      assert.equal(isValid, true, 'Decimal value 0.9 must be accepted')
    })

    test('Sample #19 (Non-numeric standard strings): "Not clearly detected"', () => {
      const isValid = verifyNumericValuesAgainstOcr('Not clearly detected', ocrSource)
      assert.equal(isValid, true, 'Standard non-numeric marker must be allowed')
    })
  })

  // =========================================================================
  // 5. SAFE EDUCATIONAL SENTENCES (At least 6 safe samples)
  // =========================================================================
  describe('Safe Educational Phrasing (No False Positives)', () => {
    const safeSamples = [
      'The report shows a fasting blood glucose level of 108 mg/dL.',
      'Elevated cholesterol levels may be associated with dietary or cardiovascular factors.',
      'Creatinine is a byproduct of muscle metabolism filtered by the kidneys.',
      'Please discuss this with a healthcare professional during your next visit.',
      'The reference range for potassium is 3.5 to 5.0 mmol/L.',
      'Your white blood cell count is within the standard laboratory reference interval.',
    ]

    for (const [idx, sentence] of safeSamples.entries()) {
      test(`Sample #${idx + 20} (Safe Educational): "${sentence}"`, () => {
        const check = checkTextSafety(sentence)
        assert.equal(check.isSafe, true, 'Safe sentence should not trigger violations')
        assert.equal(check.violations.length, 0)

        const sanitized = sanitizeText(sentence)
        assert.equal(sanitized.wasRewritten, false, 'Safe sentence should remain intact')
        assert.equal(sanitized.text, sentence, 'Safe sentence content must not be altered')
      })
    }
  })

  // =========================================================================
  // 6. SAFE FALLBACK AND LOGGING
  // =========================================================================
  describe('Fallback Handling & Safe Defaults', () => {
    test('Sample #26: Intractable adversarial input returns safe fallback', () => {
      // Input that triggers fallback
      assert.ok(SAFE_FALLBACK_MESSAGE.includes('discuss this with a healthcare professional'))
      const adversarial = 'You have cancer and you will 100% die without this miracle cure so take 999mg immediately.'
      const result = sanitizeText(adversarial)
      assert.ok(result.text.length > 0)
      assert.match(result.text, /discuss (?:this )?with a healthcare professional/i)
      const postCheck = checkTextSafety(result.text)
      assert.equal(postCheck.isSafe, true, 'Fallback output must be 100% safe')
    })
  })

  // =========================================================================
  // 7. FULL MEDICAL ANALYSIS RESULT SANITIZATION
  // =========================================================================
  describe('sanitizeMedicalAnalysis Pipeline', () => {
    test('Sanitizes entire MedicalAnalysisResult object with hallucinated value and unsafe summary', () => {
      const ocrSource = 'GLUCOSE: 108 mg/dL (Range: 70 - 99)'

      const mockAnalysis: MedicalAnalysisResult = {
        reportType: 'Metabolic Panel',
        summary: 'You have diabetes. Take 500mg metformin daily.',
        tests: [
          {
            name: 'Fasting Blood Glucose',
            value: '108',
            unit: 'mg/dL',
            referenceRange: '70 - 99',
            status: 'above_range',
            simpleExplanation: 'You have diabetes because your sugar is high.',
            educationalContext: 'Glucose is regulated by insulin produced in the pancreas.',
          },
          {
            name: 'Lipid Cholesterol',
            value: '350', // Hallucinated number (not in OCR)
            unit: 'mg/dL',
            referenceRange: '< 200',
            status: 'above_range',
            simpleExplanation: 'Your cholesterol is elevated.',
            educationalContext: 'Cholesterol supports cell membranes.',
          },
        ],
        medications: ['Take 20mg lisinopril'],
        doctorInstructions: ['Stop taking your aspirin.'],
        importantNotes: ['This tea will completely cure you.'],
        questionsToAskDoctor: ['When should we repeat fasting glucose?'],
        confidenceNotes: [],
      }

      const sanitized = sanitizeMedicalAnalysis(mockAnalysis, ocrSource)

      // Summary must be rewritten
      assert.match(sanitized.summary, /the report shows/i)
      assert.doesNotMatch(sanitized.summary, /\byou have diabetes\b/i)

      // Test 1 explanation must be rewritten
      assert.match(sanitized.tests[0].simpleExplanation, /the report shows/i)

      // Test 2 hallucinated value "350" must be updated to "Not clearly detected"
      assert.equal(sanitized.tests[1].value, 'Not clearly detected')
      assert.ok(
        sanitized.confidenceNotes.some((note) => note.includes('not present in the scanned document')),
        'Must record confidence note for hallucinated value'
      )

      // Medications directive must be neutralized
      assert.doesNotMatch(sanitized.medications[0], /\btake 20mg\b/i)

      // Doctor instructions stop directive must be neutralized
      assert.doesNotMatch(sanitized.doctorInstructions[0], /\bstop taking\b/i)
    })
  })

  // =========================================================================
  // 8. CHAT MESSAGE SANITIZATION
  // =========================================================================
  describe('sanitizeChatMessage', () => {
    test('Sanitizes unsafe chat advice and flags ungrounded numbers', () => {
      const ocrSource = 'GLUCOSE: 100 mg/dL'
      const unsafeChat = 'You have diabetes. You should take 10mg atorvastatin and your cholesterol is 400 mg/dL.'

      const sanitized = sanitizeChatMessage(unsafeChat, ocrSource)
      assert.match(sanitized, /the report shows/i)
      assert.doesNotMatch(sanitized, /\byou have diabetes\b/i)
      assert.doesNotMatch(sanitized, /\btake 10mg\b/i)
      assert.match(sanitized, /was not clearly verified in the scanned report/i)
    })
  })
})
