import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UploadCloud,
  Camera,
  FileText,
  AlertCircle,
  FileImage,
  X,
  Sparkles,
  ChevronRight,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useMedicalReport } from '@/hooks/useMedicalReport'
import { CameraCapture } from '@/components/app/CameraCapture'
import { ProcessingAnimation } from '@/components/app/ProcessingAnimation'
import { ErrorState } from '@/components/app/ErrorState'
import {
  validateMedicalReportFile,
  formatFileSize,
  detectReportType,
  MAX_FILE_SIZE_BYTES,
} from '@/utils/fileValidation'
import type { ReportStatus, MedicalReport } from '@/types'

import { SYNTHETIC_DEMO_REPORT } from '@/data/syntheticDemoReport'

export const UploadPage: React.FC = () => {
  const { user } = useAuth()
  const { processReportFlow } = useMedicalReport()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  // Real stage state driven by Firestore document updates
  const [isProcessing, setIsProcessing] = useState(false)
  const [stage, setStage] = useState<ReportStatus>('uploading')
  const [processingError, setProcessingError] = useState<string | null>(null)
  const [completedReport, setCompletedReport] = useState<MedicalReport | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle URL query parameters (e.g. ?camera=1 or ?demo=1)
  useEffect(() => {
    if (searchParams.get('camera') === '1') {
      setIsCameraOpen(true)
      // Clear query param
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('camera')
      setSearchParams(nextParams, { replace: true })
    }

    if (searchParams.get('demo') === '1' && !selectedFile) {
      // Bundled synthetic CBC + Thyroid demo report (Requirement 3)
      const demoBlob = new Blob(
        [SYNTHETIC_DEMO_REPORT.extractedText || 'SYNTHETIC DEMO DATA — NOT A REAL PATIENT'],
        { type: 'application/pdf' }
      )
      const demoFile = new File([demoBlob], 'Synthetic_CBC_and_Thyroid_Panel.pdf', {
        type: 'application/pdf',
      })
      setSelectedFile(demoFile)
      setValidationError(null)
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('demo')
      setSearchParams(nextParams, { replace: true })
    }
  }, [searchParams, setSearchParams, selectedFile])

  // Select and validate file
  const handleFileSelection = useCallback((file: File) => {
    setProcessingError(null)
    setCompletedReport(null)

    // 1. Client-Side Validation (PDF/JPG/JPEG/PNG and <=10MB)
    const result = validateMedicalReportFile(file)
    if (!result.isValid) {
      setValidationError(result.error || 'Invalid file format or size exceeds 10MB.')
      setSelectedFile(null)
      return
    }

    setValidationError(null)
    setSelectedFile(file)
  }, [])

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelection(e.dataTransfer.files[0])
      }
    },
    [handleFileSelection]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0])
    }
  }

  // Camera capture confirmed
  const handleCameraCapture = (file: File) => {
    handleFileSelection(file)
  }

  // Reset file selection
  const handleClearFile = () => {
    setSelectedFile(null)
    setValidationError(null)
    setProcessingError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Start processing through the REAL stage pipeline
  const handleStartAnalysis = async () => {
    if (!selectedFile) return

    const userId = user?.uid || 'default_patient'
    setIsProcessing(true)
    setProcessingError(null)
    setStage('uploading')

    try {
      // The flow executes real steps: uploading -> reading -> extracting -> understanding -> preparing
      // driven by Firestore status updates.
      const result = await processReportFlow(selectedFile, userId, undefined, (newStage) => {
        setStage(newStage)
      })

      setCompletedReport(result)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Analysis failed. Please check the document and retry.'
      setProcessingError(message)
      setStage('failed')
    } finally {
      setIsProcessing(false)
    }
  }

  // Retry action when processing fails
  const handleRetry = () => {
    setProcessingError(null)
    handleStartAnalysis()
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-700 mb-1">
          <Sparkles className="size-3.5" aria-hidden="true" />
          <span>Intelligent Educational Scanner</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-headline text-slate-900 tracking-tight">
          Analyze Medical Report
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload laboratory test sheets, blood panels, or scan documents with your camera for an educational plain-language breakdown.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* State 1: Error State with Retry Action (Requirement 6) */}
        {processingError ? (
          <motion.div
            key="error-view"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-4"
          >
            <ErrorState
              title="Report Analysis Encountered An Issue"
              message={processingError}
              onRetry={handleRetry}
            />
            <div className="text-center">
              <button
                onClick={handleClearFile}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 underline transition-colors"
              >
                Choose or scan a different document instead
              </button>
            </div>
          </motion.div>
        ) : isProcessing ? (
          /* State 2: ProcessingAnimation with REAL stages (Requirement 5) */
          <motion.div
            key="processing-view"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <ProcessingAnimation
              currentStage={stage}
              fileName={selectedFile?.name || 'Medical Document'}
              fileSize={selectedFile ? formatFileSize(selectedFile.size) : undefined}
              reportType={selectedFile ? detectReportType(selectedFile.name) : undefined}
            />
          </motion.div>
        ) : completedReport ? (
          /* State 3: Analysis Complete Success Banner & Direct Action */
          <motion.div
            key="success-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-emerald-200 p-8 shadow-lg shadow-emerald-500/5 text-center space-y-6"
          >
            <div className="size-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Sparkles className="size-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                Synthesis Complete
              </span>
              <h2 className="text-2xl font-bold font-headline text-slate-900">
                Educational Breakdown Ready
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                We've converted your clinical laboratory values into patient-friendly insights and suggested physician questions.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 max-w-md mx-auto text-left flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {completedReport.fileName}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {completedReport.reportType || 'Laboratory Panel'} • {completedReport.parameterCount || 0} biomarkers explained
                </p>
              </div>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                Saved to Vault
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                onClick={() => navigate(`/dashboard/reports/${completedReport.id}`)}
                className="bg-sky-600 hover:bg-sky-700 text-white rounded-xl px-6 py-2.5 font-semibold shadow-md shadow-sky-600/25 flex items-center gap-2"
              >
                <span>View Full Analysis</span>
                <ChevronRight className="size-4" />
              </Button>

              <Button
                variant="outline"
                onClick={handleClearFile}
                className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Upload Another Report
              </Button>
            </div>
          </motion.div>
        ) : (
          /* State 4: Default Upload Form with Drag & Drop + Camera Option */
          <motion.div
            key="upload-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Validation Error Alert Banner */}
            {validationError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-sm flex items-start gap-3"
                role="alert"
              >
                <AlertCircle className="size-5 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1">
                  <p className="font-semibold text-red-800">Invalid Document</p>
                  <p className="text-xs text-red-700 mt-0.5 leading-relaxed">{validationError}</p>
                </div>
                <button
                  onClick={() => setValidationError(null)}
                  className="p-1 rounded-lg hover:bg-red-100 text-red-400 hover:text-red-700 transition-colors"
                  aria-label="Dismiss error"
                >
                  <X className="size-4" />
                </button>
              </motion.div>
            )}

            {/* Main Upload Drop Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !selectedFile && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-200 cursor-pointer overflow-hidden ${
                  dragActive
                    ? 'border-sky-500 bg-sky-50/70 scale-[1.01]'
                    : selectedFile
                    ? 'border-emerald-300 bg-emerald-50/40 cursor-default'
                    : 'border-slate-300 hover:border-sky-400 hover:bg-sky-50/20 bg-slate-50/50'
                }`}
                role="region"
                aria-label="File upload dropzone"
              >
                {selectedFile ? (
                  /* Staged File Card */
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2">
                    <div className="flex items-center gap-4 text-left">
                      <div className="size-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        {selectedFile.type.includes('pdf') ? (
                          <FileText className="size-7" />
                        ) : (
                          <FileImage className="size-7" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900 truncate max-w-xs sm:max-w-sm">
                            {selectedFile.name}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                            Valid
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {formatFileSize(selectedFile.size)} • {detectReportType(selectedFile.name)}
                        </p>
                        {selectedFile.name.includes('Synthetic') && (
                          <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-bold bg-violet-100 text-violet-800 border border-violet-200">
                            <Sparkles className="size-3 text-violet-600" />
                            <span>Synthetic Demo Data — Not a Real Patient</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleClearFile()
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                      aria-label="Remove selected document"
                    >
                      <X className="size-5" />
                    </button>
                  </div>
                ) : (
                  /* Empty Prompt */
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="size-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-1 shadow-sm">
                      <UploadCloud className="size-8" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-900">
                        Drag & drop your medical document here
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        or click to browse from your device
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-mono">
                      <span>PDF, JPG, JPEG, PNG</span>
                      <span>•</span>
                      <span>Max {formatFileSize(MAX_FILE_SIZE_BYTES)}</span>
                    </div>
                  </div>
                )}

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  id="medical-report-file-input"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  className="sr-only"
                  onChange={handleInputChange}
                  tabIndex={-1}
                />
              </div>

              {/* Action Buttons: Choose File, Camera Scanner, Demo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCameraOpen(true)}
                  className="rounded-2xl border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 py-6 font-semibold flex items-center justify-center gap-2 shadow-xs transition-all"
                  aria-label="Scan report using device camera"
                >
                  <Camera className="size-5 text-sky-600" aria-hidden="true" />
                  <span>Scan with Camera</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const demoBlob = new Blob(
                      [SYNTHETIC_DEMO_REPORT.extractedText || 'SYNTHETIC DEMO DATA — NOT A REAL PATIENT'],
                      { type: 'application/pdf' }
                    )
                    const demoFile = new File(
                      [demoBlob],
                      'Synthetic_CBC_and_Thyroid_Panel.pdf',
                      { type: 'application/pdf' }
                    )
                    handleFileSelection(demoFile)
                  }}
                  className="rounded-2xl border-indigo-100 hover:border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50/80 text-indigo-700 py-6 font-semibold flex items-center justify-center gap-2 shadow-xs transition-all"
                  aria-label="Try with synthetic CBC and Thyroid demo report"
                >
                  <Sparkles className="size-5 text-indigo-600" aria-hidden="true" />
                  <span>Try Demo Report (Synthetic CBC + Thyroid)</span>
                </Button>
              </div>

              {/* Start Processing CTA */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Shield className="size-4 text-emerald-600 shrink-0" aria-hidden="true" />
                  <span>Stored securely in private vault with zero public access.</span>
                </div>

                <Button
                  onClick={handleStartAnalysis}
                  disabled={!selectedFile}
                  className="w-full sm:w-auto bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white rounded-2xl px-8 py-6 font-semibold shadow-md shadow-sky-600/25 transition-all disabled:opacity-50 disabled:pointer-events-none"
                  aria-label="Start AI educational analysis"
                >
                  <Sparkles className="size-4 mr-2" aria-hidden="true" />
                  <span>Start AI Analysis</span>
                </Button>
              </div>
            </div>

            {/* Educational Disclaimer Card */}
            <div className="bg-amber-50 rounded-2xl p-4 sm:p-5 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
              <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <strong className="font-semibold text-amber-950 block mb-0.5">
                  Educational Purpose Only
                </strong>
                Meddibuddy explains laboratory markers and values based on medical literature to help prepare questions for your doctor. It does not provide diagnoses, prescribe treatments, or recommend dosage changes.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera Capture Modal (Requirement 4) */}
      <CameraCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  )
}
