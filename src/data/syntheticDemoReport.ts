import type { MedicalReport } from '@/types'

export const SYNTHETIC_DEMO_REPORT: MedicalReport = {
  id: 'rep_demo_cbc_thyroid',
  userId: 'default_user',
  fileName: 'Synthetic_CBC_and_Thyroid_Panel.pdf',
  storagePath: 'demo/synthetic_cbc_thyroid.pdf',
  createdAt: new Date().toISOString(),
  uploadedAt: new Date().toISOString(),
  reportType: 'Complete Blood Count & Thyroid Profile',
  parameterCount: 15,
  status: 'ready',
  fileUrl: '#',
  extractedText: `COMPREHENSIVE LABORATORY REPORT
SYNTHETIC DEMO DATA — NOT A REAL PATIENT
Specimen: Venous Blood Draw
Date Collected: 2026-10-09

--- COMPLETE BLOOD COUNT (CBC) ---
Hemoglobin: 10.2 g/dL (Reference Range: 12.0 - 15.5 g/dL) [LOW]
Red Blood Cell Count (RBC): 3.8 million/µL (Reference Range: 4.2 - 5.4 million/µL) [LOW]
White Blood Cell Count (WBC): 7.2 thousand/µL (Reference Range: 4.5 - 11.0 thousand/µL) [NORMAL]
Platelet Count: 285 thousand/µL (Reference Range: 150 - 450 thousand/µL) [NORMAL]
Hematocrit: 31.5 % (Reference Range: 36.0 - 46.0 %) [LOW]
Mean Corpuscular Volume (MCV): 82.9 fL (Reference Range: 80.0 - 100.0 fL) [NORMAL]
Mean Corpuscular Hemoglobin (MCH): 26.8 pg (Reference Range: 27.0 - 33.0 pg) [LOW]
Mean Corpuscular Hemoglobin Concentration (MCHC): 32.4 g/dL (Reference Range: 32.0 - 36.0 g/dL) [NORMAL]
Neutrophils: 62 % (Reference Range: 40 - 70 %) [NORMAL]
Lymphocytes: 28 % (Reference Range: 20 - 45 %) [NORMAL]
Monocytes: 6 % (Reference Range: 2 - 8 %) [NORMAL]
Eosinophils: 3 % (Reference Range: 1 - 4 %) [NORMAL]

--- THYROID FUNCTION PROFILE ---
TSH (Thyroid Stimulating Hormone): 4.8 mIU/L (Reference Range: 0.4 - 4.0 mIU/L) [HIGH]
Free T4: 1.1 ng/dL (Reference Range: 0.8 - 1.8 ng/dL) [NORMAL]
Free T3: 3.0 pg/mL (Reference Range: 2.3 - 4.2 pg/mL) [NORMAL]

Notes: Fasting blood draw. Verified against internal laboratory controls.`,
  explanation: {
    summary:
      'The report shows a combined Complete Blood Count (CBC) and Thyroid Function Panel comprising 15 parameters. Synthetic Demo Data — Not a Real Patient. The report shows that white blood cells, platelets, and free thyroid hormones are in healthy reference ranges. Hemoglobin (10.2 g/dL), RBC count (3.8 million/µL), and Hematocrit (31.5%) are below the laboratory reference intervals, and TSH (4.8 mIU/L) is slightly above the reference range. Please discuss these findings with a qualified healthcare professional.',
    findings: [
      {
        parameter: 'Hemoglobin',
        value: '10.2 g/dL',
        standardRange: '12.0 - 15.5 g/dL',
        status: 'attention',
        simpleExplanation:
          'Below the reference interval. Hemoglobin is the protein in red blood cells that transports oxygen from the lungs to your organs.',
        questionsForDoctor: [
          'Does this result suggest checking serum ferritin or total iron binding capacity?',
          'Do you recommend dietary adjustments or nutritional follow-up?',
        ],
      },
      {
        parameter: 'TSH (Thyroid Stimulating Hormone)',
        value: '4.8 mIU/L',
        standardRange: '0.4 - 4.0 mIU/L',
        status: 'attention',
        simpleExplanation:
          'Slightly above the standard laboratory reference interval. TSH is released by the pituitary gland to regulate thyroid activity.',
        questionsForDoctor: [
          'Given normal Free T4 and Free T3, is routine repeat testing of TSH recommended in a few months?',
          'Could temporary stress, recovery from illness, or circadian timing explain mild TSH elevation?',
        ],
      },
      {
        parameter: 'Platelet Count',
        value: '285 thousand/µL',
        standardRange: '150 - 450 thousand/µL',
        status: 'normal',
        simpleExplanation:
          'Within optimal reference bounds. Platelets are essential for blood clotting and normal vascular healing.',
        questionsForDoctor: ['Are my platelet counts stable across past checkups?'],
      },
      {
        parameter: 'White Blood Cell Count (WBC)',
        value: '7.2 thousand/µL',
        standardRange: '4.5 - 11.0 thousand/µL',
        status: 'normal',
        simpleExplanation:
          'Within standard reference intervals, reflecting normal immune defense cell levels.',
        questionsForDoctor: ['Do these values indicate a healthy baseline immune count?'],
      },
    ],
    keyTakeaways: [
      'Synthetic Demo Data — Not a Real Patient.',
      'Immune markers and clotting cell counts are within standard reference ranges.',
      'Hemoglobin and red cell indices are slightly below standard reference intervals.',
      'TSH is mildly elevated while active thyroid hormones (Free T4 and Free T3) remain balanced.',
      'Always review all laboratory findings with your doctor.',
    ],
    recommendedQuestions: [
      'Would you recommend repeating this CBC and TSH test in 6 to 8 weeks?',
      'Do you suggest evaluating iron stores or thyroid antibodies?',
      'Are there specific lifestyle or dietary recommendations to support optimal energy levels?',
    ],
    disclaimer:
      'DISCLAIMER: Synthetic Demo Data — Not a Real Patient. Meddibuddy is strictly an educational tool. It does not provide medical diagnoses or treatment directives. Always consult your healthcare provider.',
  },
}
