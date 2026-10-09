import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import type { Variants } from 'framer-motion'
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Activity,
  ChevronLeft,
  MessageSquare,
  Pill,
  Stethoscope,
  ChevronDown,
  Sparkles,
  ClipboardList,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { firebaseService } from '@/services/firebase'
import type { MedicalReport } from '@/types'
import { TestResultCard } from '@/components/app/TestResultCard'
import { SafetyNotice } from '@/components/app/SafetyNotice'
import { LanguageSelector } from '@/components/app/LanguageSelector'

// ─── Types ───────────────────────────────────────────────────────────────────

type TestStatus = 'within_range' | 'below_range' | 'above_range' | 'unclear'

interface AnalysisTest {
  name: string
  value: string
  unit: string
  referenceRange: string
  status: TestStatus
  simpleExplanation: string
  educationalContext: string
}

interface MedicalAnalysis {
  reportType?: string
  summary?: string
  tests?: AnalysisTest[]
  medications?: string[]
  doctorInstructions?: string[]
  importantNotes?: string[]
  questionsToAskDoctor?: string[]
  confidenceNotes?: string[]
}

// ─── Demo Data ────────────────────────────────────────────────────────────────

const DEMO_ANALYSIS: MedicalAnalysis = {
  reportType: 'Complete Blood Count (CBC)',
  summary:
    'The report shows a Complete Blood Count panel with 12 parameters measured. The report shows most markers within standard reference intervals. Hemoglobin is slightly below the stated reference range for this report, which may be associated with factors related to red blood cell production or iron availability. Please discuss this with a healthcare professional for personalized guidance.',
  tests: [
    {
      name: 'Hemoglobin',
      value: '10.2',
      unit: 'g/dL',
      referenceRange: '12 - 15',
      status: 'below_range',
      simpleExplanation:
        'The report shows a hemoglobin level of 10.2 g/dL, which is below the stated reference range of 12–15 g/dL. Hemoglobin is the protein in red blood cells that carries oxygen to your body\'s tissues.',
      educationalContext:
        'Hemoglobin (Hb) is an iron-containing metalloprotein in red blood cells responsible for transporting oxygen from the lungs to the rest of the body and returning carbon dioxide to the lungs for exhalation. It consists of four protein subunits, each containing a heme group with an iron atom that reversibly binds oxygen.',
    },
    {
      name: 'Red Blood Cell Count (RBC)',
      value: '3.8',
      unit: 'million/µL',
      referenceRange: '4.2 - 5.4',
      status: 'below_range',
      simpleExplanation:
        'The report shows an RBC count of 3.8 million per microliter, which is below the stated reference range. Red blood cells are responsible for carrying oxygen throughout the body.',
      educationalContext:
        'Red blood cells (erythrocytes) are produced in the bone marrow and contain hemoglobin. Their primary function is gas exchange — delivering oxygen to tissues and transporting carbon dioxide back to the lungs. A lower-than-reference count may be associated with a variety of factors including nutritional status, hydration, or bone marrow function.',
    },
    {
      name: 'White Blood Cell Count (WBC)',
      value: '7.2',
      unit: 'thousand/µL',
      referenceRange: '4.5 - 11.0',
      status: 'within_range',
      simpleExplanation:
        'The report shows a white blood cell count within the standard reference range. White blood cells are a key part of the immune system.',
      educationalContext:
        'White blood cells (leukocytes) are immune system cells that protect the body against infectious disease and foreign invaders. They are produced in bone marrow and circulate through the bloodstream and lymphatic system.',
    },
    {
      name: 'Platelet Count',
      value: '285',
      unit: 'thousand/µL',
      referenceRange: '150 - 400',
      status: 'within_range',
      simpleExplanation:
        'The report shows a platelet count comfortably within the standard reference interval. Platelets are essential for proper blood clotting.',
      educationalContext:
        'Platelets (thrombocytes) are small, colorless cell fragments produced in bone marrow. They are activated during blood vessel injury and aggregate to form a clot (primary hemostasis), stopping blood loss. Normal platelet counts support efficient wound healing.',
    },
    {
      name: 'Hematocrit (HCT)',
      value: '31.5',
      unit: '%',
      referenceRange: '37 - 47',
      status: 'below_range',
      simpleExplanation:
        'The report shows a hematocrit of 31.5%, which is below the stated reference range of 37–47%. This reflects the proportion of red blood cells in your total blood volume.',
      educationalContext:
        'Hematocrit is the percentage of whole blood volume composed of red blood cells. It is closely related to hemoglobin levels. Variations may be associated with hydration status, altitude, altitude of residence, and red blood cell production factors.',
    },
    {
      name: 'Mean Corpuscular Volume (MCV)',
      value: '82',
      unit: 'fL',
      referenceRange: '80 - 100',
      status: 'within_range',
      simpleExplanation:
        'The report shows MCV within the standard reference range. This indicates that the average size of your red blood cells is typical.',
      educationalContext:
        'Mean Corpuscular Volume measures the average size of red blood cells. Unusually small (microcytic) or large (macrocytic) red blood cells may be associated with different underlying factors including nutritional status and bone marrow activity.',
    },
    {
      name: 'Neutrophils',
      value: '62',
      unit: '%',
      referenceRange: '50 - 70',
      status: 'within_range',
      simpleExplanation:
        'Neutrophils are the most common white blood cells and serve as the first line of defense against bacterial infections. Your level is within the standard reference range.',
      educationalContext:
        'Neutrophils are the most abundant type of granulocytes and the first cells recruited to sites of infection. They engulf and destroy bacteria and fungi through a process called phagocytosis.',
    },
    {
      name: 'Lymphocytes',
      value: '29',
      unit: '%',
      referenceRange: '20 - 40',
      status: 'within_range',
      simpleExplanation:
        'The report shows lymphocytes within the standard reference range. Lymphocytes are a key part of the adaptive immune system.',
      educationalContext:
        'Lymphocytes include T-cells, B-cells, and natural killer cells. They are fundamental to adaptive immunity, responsible for recognizing specific pathogens, generating antibodies, and maintaining immunological memory.',
    },
    {
      name: 'Monocytes',
      value: '6',
      unit: '%',
      referenceRange: '2 - 8',
      status: 'within_range',
      simpleExplanation:
        'Monocytes are within the standard reference range. These cells play a role in cleaning up cellular debris and pathogens.',
      educationalContext:
        'Monocytes are large white blood cells that can differentiate into macrophages or dendritic cells. They play important roles in innate immunity, phagocytosis, antigen presentation, and inflammatory response regulation.',
    },
    {
      name: 'Eosinophils',
      value: '2',
      unit: '%',
      referenceRange: '1 - 4',
      status: 'within_range',
      simpleExplanation:
        'The report shows eosinophils within the standard reference range.',
      educationalContext:
        'Eosinophils are white blood cells involved in the response to parasitic infections and allergic reactions. They release specialized proteins that can target parasites and modulate inflammatory responses.',
    },
    {
      name: 'Basophils',
      value: '0.5',
      unit: '%',
      referenceRange: '0.5 - 1',
      status: 'within_range',
      simpleExplanation:
        'The report shows basophils at the lower boundary of the stated reference range.',
      educationalContext:
        'Basophils are the least common type of granulocyte. They release histamine and heparin during inflammatory reactions and play a role in the hypersensitivity response. They also contribute to antiparasitic defense.',
    },
    {
      name: 'ESR (Erythrocyte Sedimentation Rate)',
      value: '22',
      unit: 'mm/hr',
      referenceRange: '0 - 20',
      status: 'above_range',
      simpleExplanation:
        'The report shows an ESR of 22 mm/hr, slightly above the stated reference range of 0–20 mm/hr. ESR is a general marker that may be associated with inflammation in the body.',
      educationalContext:
        'The Erythrocyte Sedimentation Rate measures how quickly red blood cells fall to the bottom of a test tube. A mildly elevated ESR may be associated with inflammatory processes. It is a non-specific marker, meaning many conditions and even normal physiological states can influence it.',
    },
  ],
  medications: [],
  doctorInstructions: [
    'Repeat CBC in 4–6 weeks.',
    'Consider iron studies if clinically indicated.',
  ],
  importantNotes: [
    'This is a synthetic example report for educational demonstration purposes.',
    'Reference intervals may vary between laboratories.',
  ],
  questionsToAskDoctor: [
    'What could be causing my hemoglobin and hematocrit to be below the reference range?',
    'Should I have iron studies or a reticulocyte count as a follow-up?',
    'Are there dietary changes that may support red blood cell production?',
    'How do these CBC values compare to my baseline from previous tests?',
    'At what point would you consider further investigation for the ESR elevation?',
    'Is there any concern with my results that requires urgent follow-up?',
  ],
  confidenceNotes: [
    'All primary CBC parameters were clearly detected from the scanned document.',
    'This is a synthetic example report. All values are illustrative.',
  ],
}

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

const questionVariants: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.07, duration: 0.32, ease: 'easeOut' },
  }),
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

const OverviewCard: React.FC<{
  reportType: string
  paramCount: number
  outsideRangeCount: number
  summary: string
}> = ({ reportType, paramCount, outsideRangeCount, summary }) => (
  <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
    {/* Header strip */}
    <div className="px-5 pt-5 pb-4">
      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-indigo-50 rounded-xl border border-indigo-100">
          <FileText className="size-5 text-indigo-600" aria-hidden="true" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900 text-base">{reportType}</h2>
          <p className="text-xs text-slate-500 mt-0.5">Synthetic example · Educational only</p>
        </div>
      </div>
    </div>

    {/* Stats row */}
    <div className="grid grid-cols-2 gap-3 px-5 pb-4">
      <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100">
        <Activity className="size-4 text-indigo-500 shrink-0" aria-hidden="true" />
        <div>
          <p className="text-lg font-bold text-slate-900 tabular-nums">{paramCount}</p>
          <p className="text-[11px] text-slate-500">parameters detected</p>
        </div>
      </div>
      <div
        className={`flex items-center gap-3 rounded-xl p-3 border ${
          outsideRangeCount > 0
            ? 'bg-amber-50 border-amber-100'
            : 'bg-emerald-50 border-emerald-100'
        }`}
      >
        {outsideRangeCount > 0 ? (
          <AlertTriangle className="size-4 text-amber-500 shrink-0" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="size-4 text-emerald-500 shrink-0" aria-hidden="true" />
        )}
        <div>
          <p
            className={`text-lg font-bold tabular-nums ${
              outsideRangeCount > 0 ? 'text-amber-700' : 'text-emerald-700'
            }`}
          >
            {outsideRangeCount}
          </p>
          <p className={`text-[11px] ${outsideRangeCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {outsideRangeCount === 1
              ? 'value outside stated range'
              : 'values outside stated ranges'}
          </p>
        </div>
      </div>
    </div>

    {/* Summary */}
    <div className="px-5 pb-5 border-t border-slate-100 pt-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Summary</p>
      <p className="text-sm text-slate-700 leading-relaxed">{summary}</p>
    </div>
  </motion.div>
)

const MedicineSection: React.FC<{
  medications: string[]
  instructions: string[]
}> = ({ medications, instructions }) => {
  if (medications.length === 0 && instructions.length === 0) return null
  const displayMeds = medications.filter(
    (m) => m && m !== 'None clearly detected' && m !== 'Not clearly detected'
  )
  if (displayMeds.length === 0 && instructions.length === 0) return null

  return (
    <motion.section variants={itemVariants} aria-label="Medication information">
      <h2 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
        <Pill className="size-4.5 text-violet-500" aria-hidden="true" />
        Medication Information
      </h2>

      <div className="bg-white rounded-2xl border border-violet-100 shadow-sm overflow-hidden divide-y divide-slate-100">
        {displayMeds.map((med, i) => (
          <div key={i} className="px-5 py-4 flex items-start gap-3">
            <div className="mt-0.5 p-1.5 bg-violet-50 rounded-lg border border-violet-100 shrink-0">
              <Pill className="size-3.5 text-violet-600" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">{med}</p>
              <p className="text-xs text-slate-500 mt-0.5">Detected in report text</p>
            </div>
          </div>
        ))}

        {instructions.map((inst, i) => (
          <div key={`inst-${i}`} className="px-5 py-3 text-sm text-slate-700 leading-relaxed bg-slate-50">
            <span className="font-medium text-slate-500 text-xs uppercase tracking-wide block mb-1">
              Instruction from report
            </span>
            {inst}
          </div>
        ))}

        {/* Safety notice */}
        <div className="px-5 py-3 flex items-start gap-2.5 bg-violet-50">
          <ShieldCheck className="size-4 text-violet-500 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs text-violet-800 leading-relaxed">
            Confirm medicine-specific decisions with your doctor or pharmacist. Do not start,
            stop, or change any medication based on this educational overview alone.
          </p>
        </div>
      </div>
    </motion.section>
  )
}

const QuestionsSection: React.FC<{
  questions: string[]
  reportId?: string
}> = ({ questions, reportId }) => {
  const navigate = useNavigate()
  const [revealedCount, setRevealedCount] = useState(3)

  const handleAskInChat = (question: string) => {
    const params = new URLSearchParams({ reportId: reportId || '', q: question })
    navigate(`/dashboard/ask?${params.toString()}`)
  }

  const visibleQuestions = questions.slice(0, revealedCount)
  const hasMore = revealedCount < questions.length

  return (
    <motion.section variants={itemVariants} aria-label="Questions to ask your doctor">
      <h2 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
        <Stethoscope className="size-4.5 text-teal-500" aria-hidden="true" />
        Questions to Ask Your Doctor
      </h2>

      <div className="space-y-2.5">
        <AnimatePresence mode="popLayout">
          {visibleQuestions.map((q, i) => (
            <motion.div
              key={q}
              custom={i}
              variants={questionVariants}
              initial="hidden"
              animate="visible"
              layout
              className="bg-white rounded-2xl border border-teal-100 px-5 py-4 flex items-start gap-3 shadow-sm group"
            >
              <div className="shrink-0 mt-0.5 size-6 flex items-center justify-center bg-teal-50 rounded-full border border-teal-100 text-teal-700 text-xs font-bold">
                {i + 1}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed flex-1">{q}</p>
              <button
                type="button"
                onClick={() => handleAskInChat(q)}
                className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
                aria-label={`Ask in chat: ${q}`}
                title="Open in chat"
              >
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {hasMore && (
          <motion.button
            type="button"
            onClick={() => setRevealedCount((c) => Math.min(c + 3, questions.length))}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 py-3 bg-teal-50 hover:bg-teal-100 rounded-xl border border-teal-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <ChevronDown className="size-4" aria-hidden="true" />
            Show more questions ({questions.length - revealedCount} remaining)
          </motion.button>
        )}
      </div>
    </motion.section>
  )
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export const ReportAnalysisPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { language, t, getOrFetchReportTranslation } = useLanguage()
  const [report, setReport] = React.useState<MedicalReport | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [filterStatus, setFilterStatus] = React.useState<'all' | 'outside'>('all')
  const [translatedData, setTranslatedData] = React.useState<{ summary?: string } | null>(null)

  React.useEffect(() => {
    let unsub: (() => void) | null = null

    if (reportId && user?.uid) {
      unsub = firebaseService.subscribeToReport(user.uid, reportId, (r) => {
        setReport(r)
        setLoading(false)
      })
    } else {
      // No reportId — show demo data
      setLoading(false)
    }

    return () => {
      unsub?.()
    }
  }, [reportId, user?.uid])

  // Fetch or retrieve cached report translation when language changes
  React.useEffect(() => {
    if (language === 'en') {
      setTranslatedData(null)
      return
    }
    const targetId = reportId || 'rep_sample_01'
    getOrFetchReportTranslation(targetId, language).then((res) => {
      if (res) {
        setTranslatedData(res)
      }
    })
  }, [language, reportId, getOrFetchReportTranslation])

  // Resolve the analysis object — from Firestore or demo
  const analysis: MedicalAnalysis = React.useMemo(() => {
    if (!report) return DEMO_ANALYSIS
    // Prefer Firestore `analysis` field (from Cloud Functions pipeline)
    const a = (report as unknown as Record<string, unknown>).analysis as MedicalAnalysis | undefined
    if (a?.tests && a.tests.length > 0) return a
    // Fallback to legacy `explanation` field
    const exp = report.explanation
    if (exp?.findings && exp.findings.length > 0) {
      return {
        reportType: report.reportType || 'Clinical Report',
        summary: exp.summary || '',
        tests: exp.findings.map((f) => ({
          name: f.parameter,
          value: f.value,
          unit: '',
          referenceRange: f.standardRange || 'Not clearly detected',
          status: (
            f.status === 'attention' || f.status === 'critical'
              ? 'above_range'
              : f.status === 'normal'
              ? 'within_range'
              : 'unclear'
          ) as TestStatus,
          simpleExplanation: f.simpleExplanation,
          educationalContext: f.simpleExplanation,
        })),
        medications: [],
        doctorInstructions: [],
        importantNotes: exp.keyTakeaways || [],
        questionsToAskDoctor: [
          ...(exp.recommendedQuestions || []),
          ...(exp.findings?.flatMap((f) => f.questionsForDoctor || []) || []),
        ],
        confidenceNotes: [],
      }
    }
    return DEMO_ANALYSIS
  }, [report])

  const tests = analysis.tests || []
  const outsideRangeCount = tests.filter(
    (t) => t.status === 'below_range' || t.status === 'above_range'
  ).length

  const filteredTests = filterStatus === 'outside'
    ? tests.filter((t) => t.status === 'below_range' || t.status === 'above_range')
    : tests

  const hasMedications =
    (analysis.medications || []).some(
      (m) => m && m !== 'None clearly detected' && m !== 'Not clearly detected'
    ) || (analysis.doctorInstructions || []).length > 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="size-10 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading report…</p>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-3xl mx-auto space-y-6 pb-10"
    >
      {/* Page header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            aria-label="Go back"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{t('analysis.title', undefined, 'Report Analysis')}</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {report?.fileName || 'Synthetic example · Educational only'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSelector showBadge />
        </div>
      </motion.div>

      {/* Synthetic Demo Banner when viewing sample / demo data */}
      {(!reportId || reportId === 'rep_sample_01' || reportId.includes('demo') || report?.fileName?.includes('Synthetic')) && (
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-r from-violet-50 via-indigo-50/60 to-violet-50 border border-violet-200 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
              <Sparkles className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-bold text-violet-900 uppercase tracking-wider">
                Synthetic Demo Data — Not a Real Patient
              </p>
              <p className="text-xs text-violet-700 mt-0.5">
                Bundled 15-parameter CBC and Thyroid panel. Demonstrating full AI pipeline without uploading personal data.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-2xs font-semibold bg-violet-200/70 text-violet-900">
            Demo Mode
          </span>
        </motion.div>
      )}

      {/* Safety notice */}
      <motion.div variants={itemVariants}>
        <SafetyNotice />
      </motion.div>

      {/* Overview card */}
      <OverviewCard
        reportType={analysis.reportType || report?.reportType || 'Clinical Report'}
        paramCount={tests.length}
        outsideRangeCount={outsideRangeCount}
        summary={
          translatedData?.summary ||
          analysis.summary ||
          'The report shows clinical laboratory test results. Please discuss with your healthcare professional.'
        }
      />

      {/* Test Results Section */}
      <motion.section variants={itemVariants} aria-label="Individual test results">
        {/* Section header + filter */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <ClipboardList className="size-4.5 text-indigo-500" aria-hidden="true" />
            Test Results
            <span className="text-sm font-normal text-slate-400">
              ({filteredTests.length} shown)
            </span>
          </h2>

          {/* Filter tabs */}
          <div
            role="tablist"
            aria-label="Filter test results"
            className="flex bg-slate-100 rounded-xl p-1 gap-1 text-xs font-semibold"
          >
            <button
              role="tab"
              aria-selected={filterStatus === 'all'}
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                filterStatus === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              All ({tests.length})
            </button>
            <button
              role="tab"
              aria-selected={filterStatus === 'outside'}
              onClick={() => setFilterStatus('outside')}
              className={`px-3 py-1.5 rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                filterStatus === 'outside'
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              disabled={outsideRangeCount === 0}
            >
              Outside Range ({outsideRangeCount})
            </button>
          </div>
        </div>

        {/* Test cards */}
        <AnimatePresence mode="popLayout">
          {filteredTests.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-10 text-slate-400 text-sm bg-white rounded-2xl border border-slate-200"
            >
              <CheckCircle2 className="size-8 text-emerald-400 mx-auto mb-2" aria-hidden="true" />
              <p className="font-medium text-slate-500">All values within reference ranges</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredTests.map((test, i) => (
                <TestResultCard
                  key={test.name}
                  test={test}
                  reportId={reportId || 'demo'}
                  index={i}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Medications Section */}
      {hasMedications && (
        <MedicineSection
          medications={analysis.medications || []}
          instructions={analysis.doctorInstructions || []}
        />
      )}

      {/* Questions Section */}
      {(analysis.questionsToAskDoctor || []).length > 0 && (
        <QuestionsSection
          questions={analysis.questionsToAskDoctor!}
          reportId={reportId}
        />
      )}

      {/* Confidence Notes */}
      {(analysis.confidenceNotes || []).length > 0 && (
        <motion.section
          variants={itemVariants}
          className="bg-slate-50 rounded-2xl border border-slate-200 px-5 py-4"
          aria-label="Analysis confidence notes"
        >
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-slate-400" aria-hidden="true" />
            Analysis Notes
          </h2>
          <ul className="space-y-1.5">
            {analysis.confidenceNotes!.map((note, i) => (
              <li key={i} className="text-xs text-slate-500 leading-relaxed flex items-start gap-2">
                <span className="shrink-0 mt-1 size-1.5 rounded-full bg-slate-300" aria-hidden="true" />
                {note}
              </li>
            ))}
          </ul>
        </motion.section>
      )}

      {/* Global educational disclaimer at bottom */}
      <motion.footer
        variants={itemVariants}
        className="text-center text-xs text-slate-400 leading-relaxed py-2"
        aria-label="Educational disclaimer"
      >
        Meddibuddy provides educational explanations of information in medical documents.
        It does not diagnose diseases, prescribe treatments, or replace professional medical advice.
      </motion.footer>

      {/* Floating chat CTA */}
      <motion.div
        className="fixed bottom-20 lg:bottom-8 right-4 lg:right-8 z-40"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 300, damping: 20 }}
      >
        <button
          type="button"
          onClick={() => {
            const params = new URLSearchParams({ reportId: reportId || 'demo' })
            navigate(`/dashboard/ask?${params.toString()}`)
          }}
          className="flex items-center gap-2.5 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold transition-all active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
          aria-label="Ask a question about this report in chat"
        >
          <MessageSquare className="size-4" aria-hidden="true" />
          Ask a Question
        </button>
      </motion.div>
    </motion.div>
  )
}
