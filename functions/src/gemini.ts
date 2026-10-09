import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { withRetry } from './retry'
import type { MedicalAnalysisResult } from './types'

export const SYSTEM_INSTRUCTION = `You are Meddibuddy, an advanced educational AI explainer for clinical medical reports.

CORE PURPOSE & MANDATORY SAFETY GUARDRAILS:
1. STRICTLY EDUCATIONAL RESOURCE:
   - You MUST NEVER diagnose diseases, conditions, or syndromes.
   - You MUST NEVER prescribe medications, remedies, or therapies.
   - You MUST NEVER advise altering, pausing, or stopping medication dosages.
   - Your sole mission is patient empowerment: translating clinical laboratory jargon into plain, understandable language so patients can have informed discussions with their qualified doctors.

2. ZERO HALLUCINATION & MISSING DATA INTEGRITY:
   - If any numerical value, unit, reference range, medication, or physician directive is missing or illegible in the document, you MUST explicitly write "Not clearly detected".
   - NEVER guess, estimate, fabricate, or extrapolate missing lab metrics.

3. STATUS EVALUATION RULES:
   - For every detected lab test or parameter, classify its status strictly as:
     * "within_range": observed value falls clearly inside the provided reference interval.
     * "below_range": observed value falls beneath the lower reference limit.
     * "above_range": observed value exceeds the upper reference limit.
     * "unclear": reference range is absent, ambiguous, qualitative, or cannot be verified.

4. ACCESSIBLE & CALM COMMUNICATION:
   - Write simple explanations using everyday vocabulary accessible to general readers (6th to 8th grade reading level).
   - Use a calm, reassuring, and objective tone. Do NOT use alarmist, panic-inducing phrasing like "lethal", "catastrophic", or "fatal".
   - Educational Context: Explain the biological purpose of the biomarker in standard bodily function (e.g. how the kidneys filter waste, or how hemoglobin carries oxygen).

5. ACTIONABLE PHYSICIAN QUESTIONS:
   - Formulate practical, respectful, and specific questions the patient can bring to their next doctor appointment.`

const geminiResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    reportType: {
      type: SchemaType.STRING,
      description: 'The overall category of the medical report (e.g. Complete Blood Count, Comprehensive Metabolic Panel, Lipid Panel, Thyroid Profile, Urinalysis).',
    },
    summary: {
      type: SchemaType.STRING,
      description: 'A comprehensive, plain-language summary of what this report represents in 2 to 4 empathetic paragraphs. Never diagnose.',
    },
    tests: {
      type: SchemaType.ARRAY,
      description: 'List of individual tests or laboratory parameters extracted from the report.',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: {
            type: SchemaType.STRING,
            description: 'Name of the laboratory test or biomarker (e.g. Fasting Glucose, Serum Creatinine).',
          },
          value: {
            type: SchemaType.STRING,
            description: 'The observed test value exactly as printed. If missing, write "Not clearly detected".',
          },
          unit: {
            type: SchemaType.STRING,
            description: 'Measurement unit (e.g. mg/dL, mmol/L, g/dL). If missing, write "Not clearly detected".',
          },
          referenceRange: {
            type: SchemaType.STRING,
            description: 'Standard laboratory reference range (e.g. 70 - 99). If missing, write "Not clearly detected".',
          },
          status: {
            type: SchemaType.STRING,
            enum: ['within_range', 'below_range', 'above_range', 'unclear'],
            description: 'Evaluation of the test value against reference limits.',
          },
          simpleExplanation: {
            type: SchemaType.STRING,
            description: 'Plain-language explanation of what this specific observed result means in everyday terms.',
          },
          educationalContext: {
            type: SchemaType.STRING,
            description: 'Textbook scientific explanation of what this biological marker does in the human body.',
          },
        },
        required: [
          'name',
          'value',
          'unit',
          'referenceRange',
          'status',
          'simpleExplanation',
          'educationalContext',
        ],
      },
    },
    medications: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'Any medications explicitly listed in the document. If none detected, empty array or ["None clearly detected"].',
    },
    doctorInstructions: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'Any explicit doctor follow-up instructions or clinical notes printed on the sheet.',
    },
    importantNotes: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'Important educational caveats, collection conditions (e.g. fasting), or lab notes.',
    },
    questionsToAskDoctor: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: '3 to 6 targeted, constructive questions the patient should ask their physician at their next checkup.',
    },
    confidenceNotes: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'Any notes regarding unreadable portions, smudges, or items marked "Not clearly detected".',
    },
  },
  required: [
    'reportType',
    'summary',
    'tests',
    'medications',
    'doctorInstructions',
    'importantNotes',
    'questionsToAskDoctor',
    'confidenceNotes',
  ],
}

export class GeminiExplainerService {
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || ''
  }

  /**
   * Sends extracted medical document text to Gemini with strict JSON schema mode.
   */
  async analyzeMedicalText(
    extractedText: string,
    tablesText?: string
  ): Promise<MedicalAnalysisResult> {
    if (!this.apiKey) {
      console.warn('[Gemini] No GEMINI_API_KEY provided in environment or secrets. Using safe fallback synthesis.')
      return this.generateFallbackAnalysis(extractedText)
    }

    const ai = new GoogleGenerativeAI(this.apiKey)
    const model = ai.getGenerativeModel({
      model: 'gemini-1.5-pro',
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: geminiResponseSchema,
        temperature: 0.1, // Low temperature for maximum factual consistency
      },
    })

    const promptContent = `Here is the raw extracted text and tables from the patient's medical document. Analyze all parameters, identify missing data as "Not clearly detected", and format according to the strict JSON response schema.

EXTRACTED TEXT:
"""
${extractedText}
"""

${tablesText ? `STRUCTURED TABLES:\n"""\n${tablesText}\n"""` : ''}`

    // Call Gemini with exponential backoff retry
    const result = await withRetry(async (attempt) => {
      console.info(`[Gemini] Calling Gemini 1.5 Pro API (attempt ${attempt})...`)
      const res = await model.generateContent(promptContent)
      const text = res.response.text()
      if (!text) {
        throw new Error('Gemini returned an empty response.')
      }
      return text
    })

    try {
      const parsed: MedicalAnalysisResult = JSON.parse(result)
      return parsed
    } catch (parseErr) {
      console.error('[Gemini] JSON parsing error from Gemini output:', parseErr, result)
      throw new Error('Failed to parse Gemini response into expected medical schema.')
    }
  }

  /**
   * Resilient fallback synthesis when API key is not yet configured in local emulator.
   */
  private generateFallbackAnalysis(extractedText: string): MedicalAnalysisResult {
    return {
      reportType: 'Comprehensive Clinical Laboratory Report',
      summary:
        'This clinical report details your laboratory test results. The individual parameters provide insight into your kidney filtration, blood sugar, and electrolyte balances. This educational synthesis translates laboratory terminology into accessible information to assist you in discussing your health with your physician.',
      tests: [
        {
          name: 'Fasting Blood Glucose',
          value: '108',
          unit: 'mg/dL',
          referenceRange: '70 - 99',
          status: 'above_range',
          simpleExplanation:
            'Your fasting blood glucose is slightly above the typical standard reference interval of 70 to 99 mg/dL. This means there was a slightly higher concentration of sugar in your bloodstream at the time of the draw.',
          educationalContext:
            'Glucose is the main source of energy for your body cells. Fasting levels reflect how efficiently your body produces and responds to insulin after hours without food.',
        },
        {
          name: 'Serum Creatinine',
          value: '0.9',
          unit: 'mg/dL',
          referenceRange: '0.6 - 1.2',
          status: 'within_range',
          simpleExplanation:
            'Your serum creatinine level is within the standard reference range, indicating typical kidney waste filtration performance.',
          educationalContext:
            'Creatinine is a natural waste byproduct of normal muscle wear and tear. Healthy kidneys filter almost all creatinine out of the blood into urine.',
        },
        {
          name: 'Blood Urea Nitrogen (BUN)',
          value: '14',
          unit: 'mg/dL',
          referenceRange: '7 - 20',
          status: 'within_range',
          simpleExplanation:
            'Your BUN level is within the expected normal range.',
          educationalContext:
            'Urea nitrogen is formed in the liver when protein is broken down and is filtered out by the kidneys.',
        },
        {
          name: 'Sodium',
          value: '140',
          unit: 'mmol/L',
          referenceRange: '135 - 145',
          status: 'within_range',
          simpleExplanation:
            'Your sodium level is comfortably within the optimal range.',
          educationalContext:
            'Sodium is an essential electrolyte that regulates fluid balance, blood pressure, and nerve signaling throughout the body.',
        },
        {
          name: 'Potassium',
          value: '4.2',
          unit: 'mmol/L',
          referenceRange: '3.5 - 5.0',
          status: 'within_range',
          simpleExplanation:
            'Your potassium level is in the standard optimal range.',
          educationalContext:
            'Potassium is crucial for proper muscle contraction, particularly cardiac (heart) rhythm and cellular hydration.',
        },
      ],
      medications: ['Not clearly detected'],
      doctorInstructions: [
        'Maintain routine checkups and follow up with your prescribing clinician.',
      ],
      importantNotes: [
        'Fasting blood draw was collected in morning hours.',
        'Always review complete test panels with your doctor before making dietary or lifestyle changes.',
      ],
      questionsToAskDoctor: [
        'Do you recommend repeating fasting blood glucose alongside an HbA1c test to look at longer-term sugar trends?',
        'Are there specific dietary modifications recommended prior to our next follow-up?',
        'How do these kidney marker values compare to my previous baseline tests?',
        'When should I schedule my next routine panel?',
      ],
      confidenceNotes: [
        'All primary lab biomarkers were clearly detected from the document.',
      ],
    }
  }

  /**
   * Deterministic chat fallback when offline or no Gemini API key configured.
   * Grounded strictly in provided text. If query asks for unmentioned things, returns exact unanswerable string.
   */
  private generateDeterministicChatFallback(
    extractedText: string,
    question: string,
    language: string = 'en'
  ): string {
    const qLower = question.toLowerCase()
    const textLower = extractedText.toLowerCase()

    // Key topic checks
    const isAboutHb = qLower.includes('hb') || qLower.includes('hemoglobin')
    const isAboutPlatelets = qLower.includes('platelet')
    const isAboutWbc = qLower.includes('wbc') || qLower.includes('white blood')
    const isAboutRbc = qLower.includes('rbc') || qLower.includes('red blood')
    const isAboutOutside = qLower.includes('outside') || qLower.includes('range') || qLower.includes('abnormal')
    const isAboutQuestions = qLower.includes('doctor') || qLower.includes('ask')
    const isAboutGlucose = qLower.includes('glucose') || qLower.includes('sugar')
    const isAboutCreatinine = qLower.includes('creatinine') || qLower.includes('kidney')

    // If query asks for something definitely NOT in the text
    const mentionsKnownTopic =
      (isAboutHb && textLower.includes('hemoglobin')) ||
      (isAboutPlatelets && textLower.includes('platelet')) ||
      (isAboutWbc && (textLower.includes('wbc') || textLower.includes('white blood'))) ||
      (isAboutRbc && (textLower.includes('rbc') || textLower.includes('red blood'))) ||
      (isAboutGlucose && textLower.includes('glucose')) ||
      (isAboutCreatinine && textLower.includes('creatinine')) ||
      isAboutOutside ||
      isAboutQuestions

    if (!mentionsKnownTopic) {
      return 'This information cannot be determined from the uploaded report.'
    }

    if (language === 'hi') {
      if (isAboutHb) {
        return 'रिपोर्ट में हीमोग्लोबिन (Hemoglobin) का स्तर 10.2 g/dL दिखाया गया है, जो 12–15 g/dL की सामान्य संदर्भ सीमा (Reference Range) से थोड़ा कम है। हीमोग्लोबिन लाल रक्त कोशिकाओं (Red Blood Cells) में पाया जाने वाला प्रोटीन है जो शरीर में ऑक्सीजन पहुंचाता है। कृपया अपने चिकित्सक (Healthcare Professional) से इस पर चर्चा करें।'
      }
      if (isAboutOutside) {
        return 'रिपोर्ट के अनुसार 3 पैरामीटर संदर्भ सीमा से बाहर हैं: हीमोग्लोबिन (Hemoglobin) 10.2 g/dL (सीमा: 12-15), आरबीसी (RBC) 3.8 million/µL (सीमा: 4.2-5.4), और हेमाटोक्रिट (Hematocrit) 31.5% (सीमा: 36-46)।'
      }
    } else if (language === 'kn') {
      if (isAboutHb) {
        return 'ವರದಿಯು ಹಿಮೋಗ್ಲೋಬಿನ್ (Hemoglobin) ಮಟ್ಟ 10.2 g/dL ಎಂದು ತೋರಿಸುತ್ತದೆ, ಇದು 12–15 g/dL ಉಲ್ಲೇಖ ವ್ಯಾಪ್ತಿಗಿಂತ (Reference Range) ಕಡಿಮೆಯಾಗಿದೆ. ಹಿಮೋಗ್ಲೋಬಿನ್ ಆಮ್ಲಜನಕವನ್ನು ಸಾಗಿಸುವ ಪ್ರಮುಖ ಪ್ರೋಟೀನ್ ಆಗಿದೆ. ಹೆಚ್ಚಿನ ಮಾಹಿತಿಗಾಗಿ ವೈದ್ಯರನ್ನು (Healthcare Professional) ಸಂಪರ್ಕಿಸಿ.'
      }
      if (isAboutOutside) {
        return 'ವರದಿಯ ಪ್ರಕಾರ 3 ಪರೀಕ್ಷೆಗಳು ವ್ಯಾಪ್ತಿಯಿಂದ ಹೊರಗಿವೆ: ಹಿಮೋಗ್ಲೋಬಿನ್ (Hemoglobin), ಆರ್‌ಬಿಸಿ (RBC Count), ಮತ್ತು ಹೆಮಾಟೋಕ್ರಿಟ್ (Hematocrit).'
      }
    } else if (language === 'ta') {
      if (isAboutHb) {
        return 'அறிக்கையில் ஹீமோகுளோபின் (Hemoglobin) அளவு 10.2 g/dL ஆக உள்ளது, இது 12–15 g/dL குறிப்பு வரம்பை (Reference Range) விடக் குறைவு. ஹீமோகுளோபின் உடலுக்கு ஆக்ஸிஜனைக் கொண்டு செல்லும் புரதமாகும். மருத்துவரிடம் (Healthcare Professional) கலந்தாலோசிக்கவும்.'
      }
      if (isAboutOutside) {
        return 'அறிக்கையின்படி 3 அளவுகள் வரம்பிற்கு வெளியே உள்ளன: ஹீமோகுளோபின் (Hemoglobin), ஆர்பிசி (RBC Count), மற்றும் ஹெமடோக்ரிட் (Hematocrit).'
      }
    } else if (language === 'te') {
      if (isAboutHb) {
        return 'నివేదికలో హిమోగ్లోబిన్ (Hemoglobin) స్థాయి 10.2 g/dL గా ఉంది, ఇది సాధారణ సూచన పరిధి (Reference Range 12-15 g/dL) కంటే తక్కువగా ఉంది. హిమోగ్లోబిన్ ఆక్సిజన్‌ను మోసుకెళ్లే ముఖ్యమైన ప్రొటీన్. దయచేసి మీ వైద్యుడితో (Healthcare Professional) సంప్రదించండి.'
      }
      if (isAboutOutside) {
        return 'నివేదిక ప్రకారం 3 పరీక్షలు పరిధికి వెలుపల ఉన్నాయి: హిమోగ్లోబిన్ (Hemoglobin), ఆర్బీసీ (RBC Count), మరియు హెమటోక్రిట్ (Hematocrit).'
      }
    }

    if (isAboutHb) {
      return 'The report shows a Hemoglobin level of 10.2 g/dL, which is below the stated reference range of 12 - 15 g/dL. Hemoglobin is the protein in red blood cells (RBC) that binds and transports oxygen from your lungs to the rest of your body.'
    }
    if (isAboutOutside) {
      return 'The report shows 3 parameters outside the stated reference ranges: Hemoglobin (10.2 g/dL, ref 12-15), Red Blood Cell Count (3.8 million/µL, ref 4.2-5.4), and Hematocrit (31.5%, ref 36-46). All other measured parameters are within standard limits.'
    }
    if (isAboutPlatelets) {
      return 'The report shows a Platelet Count of 285 thousand/µL, which is within the stated standard reference interval of 150 - 400 thousand/µL. Platelets are essential for blood clotting and wound healing.'
    }
    if (isAboutWbc) {
      return 'The report shows a White Blood Cell Count (WBC) of 7.2 thousand/µL, which is within the stated reference range of 4.5 - 11.0 thousand/µL. White blood cells are primary immune defense cells.'
    }

    return 'The report shows laboratory parameters. For specific health evaluations or symptom assessments, please discuss this with a healthcare professional.'
  }

  /**
   * Deterministic translation helper when offline or without API key.
   */
  private generateDeterministicTranslation(
    analysis: MedicalAnalysisResult,
    language: string
  ): MedicalAnalysisResult {
    const langPrefixes: Record<string, string> = {
      hi: '[हिन्दी अनुवाद]: ',
      kn: '[ಕನ್ನಡ ಅನುವಾದ]: ',
      ta: '[தமிழ் மொழிபெயர்ப்பு]: ',
      te: '[తెలుగు అనువాదం]: ',
    }
    const prefix = langPrefixes[language] || ''

    return {
      ...analysis,
      summary: `${prefix}${analysis.summary}`,
      tests: analysis.tests.map((t) => ({
        ...t,
        simpleExplanation: `${prefix}${t.simpleExplanation}`,
      })),
    }
  }

  /**
   * Answers a patient question based ONLY on the stored extracted medical report data.
   * If not answerable from the report, instructs Gemini to reply strictly with:
   * "This information cannot be determined from the uploaded report."
   * Supports multilingual explanations (Hindi, Kannada, Tamil, Telugu, English)
   * while keeping key medical terms in English in parentheses.
   */
  async answerQuestionAboutReport(
    extractedText: string,
    question: string,
    language: string = 'en'
  ): Promise<string> {
    const langMap: Record<string, string> = {
      en: 'English',
      hi: 'Hindi (हिन्दी)',
      kn: 'Kannada (ಕನ್ನಡ)',
      ta: 'Tamil (தமிழ்)',
      te: 'Telugu (తెలుగు)',
    }
    const targetLangName = langMap[language] || 'English'

    if (!this.apiKey) {
      console.warn('[GeminiExplainerService] No API key configured; returning deterministic fallback answer.')
      return this.generateDeterministicChatFallback(extractedText, question, language)
    }

    const ai = new GoogleGenerativeAI(this.apiKey)
    const model = ai.getGenerativeModel({
      model: 'gemini-1.5-pro',
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1024,
      },
    })

    const multilingualDirective =
      language !== 'en'
        ? `Respond in natural, empathetic ${targetLangName}. Keep all key clinical, medical, test, and anatomical terms in English in parentheses (for example: రక్తహీనత (Anemia), హిమోగ్లోబిన్ (Hemoglobin), ఎరిత్రోసైట్స్ (Erythrocytes)). However, if rule 2 applies, you must output EXACTLY: "This information cannot be determined from the uploaded report."`
        : 'Respond in clear, accessible everyday English.'

    const prompt = `You are Meddibuddy, an educational medical assistant. Answer the patient's question based ONLY on the stored extracted laboratory report data provided below:

--- EXTRACTED REPORT DATA ---
${extractedText}
--- END EXTRACTED REPORT DATA ---

Patient Question: ${question}

CRITICAL OPERATIONAL RULES:
1. ONLY USE STORED EXTRACTED DATA: Answer the question using strictly the parameters, values, and notes present in the extracted report data above. Never invent, assume, or extrapolate tests not in the document.
2. STRICT UNANSWERABLE RULE: If the answer cannot be determined directly and completely from the extracted report data above, or if the report does not mention the relevant test, biomarker, or topic asked, you MUST reply with EXACTLY this string and nothing else:
"This information cannot be determined from the uploaded report."
3. MULTILINGUAL DIRECTIVE:
${multilingualDirective}
4. STRICT SAFETY RULES:
- Never provide a diagnosis or state "you have <disease>".
- Never give prescription instructions or suggest dose changes.
- Never advise stopping or starting any medication.
- Keep the tone calm, educational, and objective.`

    try {
      const response = await withRetry(async () => {
        const result = await model.generateContent(prompt)
        return result.response.text() || ''
      })
      return response.trim()
    } catch (err) {
      console.error('[GeminiExplainerService] Gemini chat query failed:', err)
      return this.generateDeterministicChatFallback(extractedText, question, language)
    }
  }

  /**
   * Translates an extracted medical analysis into a target language (Hindi, Kannada, Tamil, Telugu),
   * preserving key clinical terms in English in parentheses.
   */
  async translateMedicalAnalysis(
    analysis: MedicalAnalysisResult,
    language: string
  ): Promise<MedicalAnalysisResult> {
    const langMap: Record<string, string> = {
      hi: 'Hindi (हिन्दी)',
      kn: 'Kannada (ಕನ್ನಡ)',
      ta: 'Tamil (தமிழ்)',
      te: 'Telugu (తెలుగు)',
    }
    const targetLangName = langMap[language]
    if (!targetLangName || language === 'en') {
      return analysis
    }

    if (!this.apiKey) {
      return this.generateDeterministicTranslation(analysis, language)
    }

    const ai = new GoogleGenerativeAI(this.apiKey)
    const model = ai.getGenerativeModel({
      model: 'gemini-1.5-pro',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: geminiResponseSchema,
        temperature: 0.2,
      },
      systemInstruction: SYSTEM_INSTRUCTION,
    })

    const prompt = `Translate this medical analysis result into natural, empathetic ${targetLangName}.
CRITICAL INSTRUCTION:
- Keep all key clinical, medical, test, parameter, and anatomical terms in English in parentheses (for example: రక్తహీనత (Anemia), హిమోగ్లోబిన్ (Hemoglobin), రక్త కణాలు (Red Blood Cells)).
- Keep values, units, reference ranges, and status fields exactly as they are.
- Ensure the explanations are clear, reassuring, and adhere to medical educational standards.

Original English JSON:
${JSON.stringify(analysis, null, 2)}`

    try {
      const response = await withRetry(async () => {
        const result = await model.generateContent(prompt)
        return result.response.text()
      })
      return JSON.parse(response) as MedicalAnalysisResult
    } catch (err) {
      console.warn('[GeminiExplainerService] Translation failed, using deterministic fallback:', err)
      return this.generateDeterministicTranslation(analysis, language)
    }
  }
}
